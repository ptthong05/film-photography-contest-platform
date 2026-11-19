package com.example.backend.tv3.service;

import com.example.backend.enums.Role;
import com.example.backend.tv3.dto.*;
import com.example.backend.tv3.entity.*;
import com.example.backend.tv3.integration.*;
import com.example.backend.tv3.repository.*;
import com.example.backend.tv3.storage.*;
import com.example.backend.tv3.web.Tv3Exception;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

@Service
@Profile("tv3")
@Transactional
public class SubmissionService {
    private final SubmissionRepository submissions;
    private final FrameRepository frames;
    private final FilmRollService rolls;
    private final CurrentActor actors;
    private final IntegrationPorts ports;
    private final ImageValidator validator;
    private final TransactionalImages images;
    private final jakarta.persistence.EntityManager entityManager;

    public SubmissionService(
            SubmissionRepository s,
            FrameRepository f,
            FilmRollService r,
            CurrentActor a,
            IntegrationPorts p,
            ImageValidator v,
            TransactionalImages i,
            jakarta.persistence.EntityManager entityManager) {
        submissions = s;
        frames = f;
        rolls = r;
        actors = a;
        ports = p;
        validator = v;
        images = i;
        this.entityManager = entityManager;
    }

    public SubmissionResponse create(
            SubmissionRequest q, MultipartFile file, MultipartFile negative) {
        Actor a = actors.require(Role.PARTICIPANT);
        int limit =
                ports.contests()
                        .lockParticipation(q.contestId(), a.id(), q.category(), Instant.now());
        if (limit < 1
                || submissions.countByContestIdAndParticipantId(q.contestId(), a.id()) >= limit)
            throw new Tv3Exception(409, "Đã đạt giới hạn bài dự thi");
        Frame frame = linked(q);
        if (frame != null && submissions.existsByFrameId(frame.getId()))
            throw new Tv3Exception(409, "Frame đã được nộp");
        byte[] main = validator.validate(file);
        byte[] neg = negative == null ? null : validator.validate(negative);
        Submission s = new Submission();
        s.setContestId(q.contestId());
        s.setParticipantId(a.id());
        s.setStatus(SubmissionStatus.PENDING);
        apply(s, q, frame);
        setMain(s, images.upload(main));
        if (neg != null) setNegative(s, images.upload(neg));
        return SubmissionResponse.from(submissions.saveAndFlush(s));
    }

    public List<SubmissionResponse> mine() {
        return submissions.findByParticipantId(actors.require(Role.PARTICIPANT).id()).stream()
                .map(SubmissionResponse::from)
                .toList();
    }

    public List<SubmissionResponse> managed(String contestId) {
        Actor a = actors.require(Role.ORGANIZER, Role.ADMIN);
        var ids = ports.contests().managedContestIds(a);
        if (contestId != null) {
            ports.contests().lockManagement(contestId, a);
            ids = java.util.Set.of(contestId);
        }
        return submissions.findByContestIdIn(ids).stream().map(SubmissionResponse::from).toList();
    }

    public SubmissionResponse get(String id) {
        Actor a = actors.require(Role.PARTICIPANT, Role.ORGANIZER, Role.ADMIN);
        Submission s = find(id);
        if (a.role() == Role.PARTICIPANT) owned(s, a);
        else ports.contests().lockManagement(s.getContestId(), a);
        return SubmissionResponse.from(s);
    }

    public SubmissionResponse update(
            String id, SubmissionRequest q, MultipartFile file, MultipartFile negative) {
        Actor a = actors.require(Role.PARTICIPANT);
        Submission initial = find(id);
        owned(initial, a);
        if (!Objects.equals(initial.getContestId(), q.contestId()))
            throw new Tv3Exception(409, "Không được chuyển bài sang cuộc thi khác");
        ports.contests()
                .lockParticipation(initial.getContestId(), a.id(), q.category(), Instant.now());
        Frame frame = linked(q); // lock roll before submission to preserve global lock ordering
        Submission s = locked(id);
        owned(s, a);
        pending(s);
        if (!Objects.equals(
                frame == null ? null : frame.getId(),
                s.getFrame() == null ? null : s.getFrame().getId()))
            throw new Tv3Exception(409, "Không đổi Frame của bài đã nộp");
        byte[] main = file == null ? null : validator.validate(file);
        byte[] neg = negative == null ? null : validator.validate(negative);
        apply(s, q, frame);
        if (main != null) {
            images.deleteAfterCommit(s.getImagePublicId());
            setMain(s, images.upload(main));
        }
        if (neg != null) {
            images.deleteAfterCommit(s.getNegativePublicId());
            setNegative(s, images.upload(neg));
        }
        return SubmissionResponse.from(submissions.saveAndFlush(s));
    }

    public void delete(String id) {
        Actor a = actors.require(Role.PARTICIPANT);
        Submission initial = find(id);
        owned(initial, a);
        ports.contests().lockEditableContest(initial.getContestId(), a.id(), Instant.now());
        Submission s = locked(id);
        owned(s, a);
        pending(s);
        images.deleteAfterCommit(s.getImagePublicId());
        images.deleteAfterCommit(s.getNegativePublicId());
        submissions.delete(s);
        submissions.flush();
    }

    public SubmissionResponse review(String id, SubmissionStatusRequest q) {
        Actor a = actors.require(Role.ORGANIZER, Role.ADMIN);
        Submission initial = find(id);
        ports.contests().lockManagement(initial.getContestId(), a);
        Submission s = locked(id);
        pending(s);
        if (q.status() == null || q.status() == SubmissionStatus.PENDING)
            throw new Tv3Exception(409, "Chỉ duyệt hoặc từ chối bài đang chờ");
        if (q.status() == SubmissionStatus.REJECTED && (q.reason() == null || q.reason().isBlank()))
            throw new Tv3Exception(400, "Vui lòng nhập lý do từ chối");
        s.setStatus(q.status());
        s.setRejectionReason(q.status() == SubmissionStatus.REJECTED ? q.reason().trim() : null);
        s.setReviewedBy(a.id());
        s.setReviewedAt(Instant.now());
        return SubmissionResponse.from(submissions.saveAndFlush(s));
    }

    private Frame linked(SubmissionRequest q) {
        if (q.frameId() == null || q.frameId().isBlank()) return null;
        Frame f =
                frames.findById(q.frameId())
                        .orElseThrow(() -> new Tv3Exception(404, "Không tìm thấy Frame"));
        FilmRoll r = rolls.owned(f.getFilmRoll().getId());
        // Re-read after acquiring the roll lock; another transaction may have edited the frame.
        f =
                frames.findById(q.frameId())
                        .orElseThrow(() -> new Tv3Exception(404, "Không tìm thấy Frame"));
        entityManager.refresh(f);
        if (f.getFrameNumber() != Integer.parseInt(q.frameNumber())
                || !r.getBrand().equals(q.filmBrand().trim())
                || r.getIso() != q.iso()
                || !r.getFormat().equals(q.format().trim())
                || !r.getCameraBody().equals(q.camera().trim()))
            throw new Tv3Exception(400, "Metadata không khớp FilmRoll/Frame liên kết");
        return f;
    }

    private Submission find(String id) {
        return submissions
                .findById(id)
                .orElseThrow(() -> new Tv3Exception(404, "Không tìm thấy bài dự thi"));
    }

    private Submission locked(String id) {
        Submission submission =
                submissions
                        .lockById(id)
                        .orElseThrow(() -> new Tv3Exception(404, "Không tìm thấy bài dự thi"));
        entityManager.refresh(submission);
        return submission;
    }

    private void owned(Submission s, Actor a) {
        if (!s.getParticipantId().equals(a.id()))
            throw new Tv3Exception(404, "Không tìm thấy bài dự thi");
    }

    private void pending(Submission s) {
        if (s.getStatus() != SubmissionStatus.PENDING)
            throw new Tv3Exception(409, "Chỉ sửa/xóa/duyệt bài PENDING");
    }

    private void apply(Submission s, SubmissionRequest q, Frame frame) {
        s.setTitle(q.title().trim());
        s.setDescription(q.description());
        s.setCategory(q.category());
        s.setFrame(frame);
        s.setMetadata(q.metadata());
    }

    private void setMain(Submission s, ImageStorage.Asset a) {
        s.setImageUrl(a.url());
        s.setImagePublicId(a.publicId());
    }

    private void setNegative(Submission s, ImageStorage.Asset a) {
        s.setNegativeUrl(a.url());
        s.setNegativePublicId(a.publicId());
    }
}
