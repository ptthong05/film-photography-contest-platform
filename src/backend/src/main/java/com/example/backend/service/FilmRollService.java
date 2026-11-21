package com.example.backend.service;

import static com.example.backend.enums.Role.PARTICIPANT;

import com.example.backend.dto.*;
import com.example.backend.entity.*;
import com.example.backend.integration.CurrentActor;
import com.example.backend.repository.*;
import com.example.backend.exception.Tv3Exception;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Profile("tv3")
@Transactional
public class FilmRollService {
    private final FilmRollRepository rolls;
    private final FrameRepository frames;
    private final SubmissionRepository submissions;
    private final CurrentActor actors;
    private final jakarta.persistence.EntityManager entityManager;

    public FilmRollService(
            FilmRollRepository r,
            FrameRepository f,
            SubmissionRepository s,
            CurrentActor a,
            jakarta.persistence.EntityManager entityManager) {
        rolls = r;
        frames = f;
        submissions = s;
        actors = a;
        this.entityManager = entityManager;
    }

    FilmRoll owned(String id) {
        String owner = actors.require(PARTICIPANT).id();
        FilmRoll roll =
                rolls.lockById(id)
                        .filter(r -> r.getParticipantId().equals(owner))
                        .orElseThrow(() -> new Tv3Exception(404, "Không tìm thấy cuộn phim"));
        entityManager.refresh(roll);
        return roll;
    }

    private FilmRollResponse response(FilmRoll r) {
        return FilmRollResponse.from(
                r,
                frames.findByFilmRollIdOrderByFrameNumberAsc(r.getId()).stream()
                        .map(Frame::getFrameNumber)
                        .toList());
    }

    public List<FilmRollResponse> list() {
        return rolls.findByParticipantId(actors.require(PARTICIPANT).id()).stream()
                .map(this::response)
                .toList();
    }

    public FilmRollResponse get(String id) {
        return response(owned(id));
    }

    public FilmRollResponse create(FilmRollRequest q) {
        var a = actors.require(PARTICIPANT);
        checkLegacy(q, null);
        FilmRoll r = new FilmRoll();
        r.setParticipantId(a.id());
        apply(r, q);
        return response(rolls.saveAndFlush(r));
    }

    public FilmRollResponse update(String id, FilmRollRequest q) {
        FilmRoll r = owned(id);
        checkLegacy(q, r);
        if (frames.existsByFilmRollIdAndFrameNumberGreaterThan(id, q.totalFrames()))
            throw new Tv3Exception(409, "Tổng số khung hình nhỏ hơn Frame hiện có");
        if (submissions.existsByFrameFilmRollId(id)
                && (!r.getBrand().equals(q.brand().trim())
                        || r.getIso() != q.iso()
                        || !r.getFormat().equals(q.format().trim())
                        || !r.getCameraBody().equals(q.cameraBody().trim())))
            throw new Tv3Exception(
                    409, "Không đổi metadata cuộn phim đang được bài dự thi tham chiếu");
        apply(r, q);
        return response(rolls.saveAndFlush(r));
    }

    public void delete(String id) {
        FilmRoll r = owned(id);
        if (submissions.existsByFrameFilmRollId(id) || frames.existsByFilmRollId(id))
            throw new Tv3Exception(409, "Hãy xóa Frame chưa được sử dụng trước khi xóa cuộn phim");
        rolls.delete(r);
        rolls.flush();
    }

    private void checkLegacy(FilmRollRequest q, FilmRoll r) {
        if (q.usedFrameNumbers() == null) return;
        List<Integer> actual =
                r == null
                        ? List.of()
                        : frames.findByFilmRollIdOrderByFrameNumberAsc(r.getId()).stream()
                                .map(Frame::getFrameNumber)
                                .toList();
        if (!q.usedFrameNumbers().stream().sorted().toList().equals(actual))
            throw new Tv3Exception(400, "usedFrameNumbers chỉ đọc; vui lòng dùng API Frame");
    }

    private static void apply(FilmRoll r, FilmRollRequest q) {
        r.setName(q.name().trim());
        r.setBrand(q.brand().trim());
        r.setIso(q.iso());
        r.setFormat(q.format().trim());
        r.setCameraBody(q.cameraBody().trim());
        r.setTotalFrames(q.totalFrames());
    }
}
