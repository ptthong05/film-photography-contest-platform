package com.example.backend.tv3;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.example.backend.enums.Role;
import com.example.backend.tv3.dto.*;
import com.example.backend.tv3.entity.*;
import com.example.backend.tv3.integration.*;
import com.example.backend.tv3.repository.*;
import com.example.backend.tv3.service.*;
import com.example.backend.tv3.web.Tv3Exception;

import jakarta.persistence.EntityManager;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

@ExtendWith(MockitoExtension.class)
class FilmRollFrameTest {
    @Mock FilmRollRepository rolls;
    @Mock FrameRepository frames;
    @Mock SubmissionRepository submissions;
    @Mock CurrentActor actors;
    @Mock EntityManager em;
    FilmRollService service;
    FrameService frameService;
    FilmRoll roll;

    @BeforeEach
    void init() {
        service = new FilmRollService(rolls, frames, submissions, actors, em);
        frameService = new FrameService(service, frames, submissions);
        roll = new FilmRoll();
        roll.setParticipantId("owner");
        roll.setTotalFrames(36);
        lenient()
                .when(actors.require(Role.PARTICIPANT))
                .thenReturn(new Actor("owner", Role.PARTICIPANT));
        lenient().when(rolls.lockById(roll.getId())).thenReturn(Optional.of(roll));
    }

    @Test
    void cannotAccessOtherOwnersRoll() {
        roll.setParticipantId("other");
        assertThatThrownBy(() -> service.get(roll.getId()))
                .isInstanceOf(Tv3Exception.class)
                .hasMessageContaining("Không tìm");
    }

    @Test
    void rejectsDuplicateFrame() {
        when(frames.existsByFilmRollIdAndFrameNumber(roll.getId(), 1)).thenReturn(true);
        assertThatThrownBy(() -> frameService.create(roll.getId(), new FrameRequest(1, null)))
                .hasMessageContaining("đã tồn tại");
    }

    @Test
    void rejectsOutOfRangeFrame() {
        assertThatThrownBy(() -> frameService.create(roll.getId(), new FrameRequest(37, null)))
                .hasMessageContaining("giới hạn");
    }

    @Test
    void validFrameCreate() {
        when(frames.saveAndFlush(any())).thenAnswer(i -> i.getArgument(0));
        assertThat(frameService.create(roll.getId(), new FrameRequest(1, "ghi chú")).frameNumber())
                .isEqualTo(1);
    }

    @Test
    void blocksDeleteReferencedFrame() {
        Frame f = new Frame();
        f.setFilmRoll(roll);
        when(frames.findById(f.getId())).thenReturn(Optional.of(f));
        when(submissions.existsByFrameId(f.getId())).thenReturn(true);
        assertThatThrownBy(() -> frameService.delete(roll.getId(), f.getId()))
                .hasMessageContaining("tham chiếu");
    }

    @Test
    void blocksDeleteReferencedRoll() {
        when(submissions.existsByFrameFilmRollId(roll.getId())).thenReturn(true);
        assertThatThrownBy(() -> service.delete(roll.getId())).hasMessageContaining("xóa Frame");
    }

    @Test
    void blocksShrinkingRollPastExistingFrame() {
        when(frames.existsByFilmRollIdAndFrameNumberGreaterThan(roll.getId(), 12)).thenReturn(true);
        assertThatThrownBy(
                        () ->
                                service.update(
                                        roll.getId(),
                                        new FilmRollRequest(
                                                "r", "Kodak", 200, "35mm", "Canon", 12, null)))
                .hasMessageContaining("nhỏ hơn");
    }

    @Test
    void usedNumbersCannotBeWrittenIndependently() {
        assertThatThrownBy(
                        () ->
                                service.create(
                                        new FilmRollRequest(
                                                "r",
                                                "Kodak",
                                                200,
                                                "35mm",
                                                "Canon",
                                                36,
                                                List.of(1))))
                .hasMessageContaining("chỉ đọc");
    }

    @Test
    void rollCrudUsesAuthenticatedOwner() {
        when(rolls.saveAndFlush(any())).thenAnswer(i -> i.getArgument(0));
        var request = new FilmRollRequest("r", "Kodak", 200, "35mm", "Canon", 36, null);
        assertThat(service.create(request).name()).isEqualTo("r");
        when(rolls.findByParticipantId("owner")).thenReturn(List.of(roll));
        assertThat(service.list()).hasSize(1);
        assertThat(service.get(roll.getId()).id()).isEqualTo(roll.getId());
        assertThat(service.update(roll.getId(), request).brand()).isEqualTo("Kodak");
        service.delete(roll.getId());
        verify(rolls).delete(roll);
    }

    @Test
    void frameReadUpdateDelete() {
        Frame f = new Frame();
        f.setFilmRoll(roll);
        f.setFrameNumber(1);
        when(frames.findById(f.getId())).thenReturn(Optional.of(f));
        when(frames.findByFilmRollIdOrderByFrameNumberAsc(roll.getId())).thenReturn(List.of(f));
        when(frames.saveAndFlush(any())).thenAnswer(i -> i.getArgument(0));
        assertThat(frameService.list(roll.getId())).hasSize(1);
        assertThat(frameService.get(roll.getId(), f.getId()).frameNumber()).isEqualTo(1);
        assertThat(
                        frameService
                                .update(roll.getId(), f.getId(), new FrameRequest(2, null))
                                .frameNumber())
                .isEqualTo(2);
        frameService.delete(roll.getId(), f.getId());
        verify(frames).delete(f);
    }
}
