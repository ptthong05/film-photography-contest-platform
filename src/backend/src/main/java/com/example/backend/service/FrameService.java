package com.example.backend.service;

import com.example.backend.dto.*;
import com.example.backend.entity.*;
import com.example.backend.repository.*;
import com.example.backend.exception.Tv3Exception;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Profile("tv3")
@Transactional
public class FrameService {
    private final FilmRollService rolls;
    private final FrameRepository frames;
    private final SubmissionRepository submissions;

    public FrameService(FilmRollService r, FrameRepository f, SubmissionRepository s) {
        rolls = r;
        frames = f;
        submissions = s;
    }

    public List<FrameResponse> list(String rollId) {
        rolls.owned(rollId);
        return frames.findByFilmRollIdOrderByFrameNumberAsc(rollId).stream()
                .map(FrameResponse::from)
                .toList();
    }

    private Frame frame(String rollId, String id) {
        return frames.findById(id)
                .filter(f -> f.getFilmRoll().getId().equals(rollId))
                .orElseThrow(() -> new Tv3Exception(404, "Không tìm thấy Frame"));
    }

    public FrameResponse get(String rollId, String id) {
        rolls.owned(rollId);
        return FrameResponse.from(frame(rollId, id));
    }

    private void validate(FilmRoll r, FrameRequest q, Frame existing) {
        if (q.frameNumber() < 1 || q.frameNumber() > r.getTotalFrames())
            throw new Tv3Exception(400, "Frame ngoài giới hạn cuộn phim");
        if ((existing == null || existing.getFrameNumber() != q.frameNumber())
                && frames.existsByFilmRollIdAndFrameNumber(r.getId(), q.frameNumber()))
            throw new Tv3Exception(409, "Số Frame đã tồn tại");
    }

    public FrameResponse create(String rollId, FrameRequest q) {
        FilmRoll r = rolls.owned(rollId);
        validate(r, q, null);
        Frame f = new Frame();
        f.setFilmRoll(r);
        f.setFrameNumber(q.frameNumber());
        f.setNotes(q.notes());
        return FrameResponse.from(frames.saveAndFlush(f));
    }

    public FrameResponse update(String rollId, String id, FrameRequest q) {
        FilmRoll r = rolls.owned(rollId);
        Frame f = frame(rollId, id);
        unused(id);
        validate(r, q, f);
        f.setFrameNumber(q.frameNumber());
        f.setNotes(q.notes());
        return FrameResponse.from(frames.saveAndFlush(f));
    }

    public void delete(String rollId, String id) {
        rolls.owned(rollId);
        Frame f = frame(rollId, id);
        unused(id);
        frames.delete(f);
        frames.flush();
    }

    private void unused(String id) {
        if (submissions.existsByFrameId(id))
            throw new Tv3Exception(409, "Frame đang được bài dự thi tham chiếu");
    }
}
