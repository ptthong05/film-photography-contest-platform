package com.example.backend.tv3;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.example.backend.enums.Role;
import com.example.backend.tv3.dto.*;
import com.example.backend.tv3.entity.*;
import com.example.backend.tv3.integration.*;
import com.example.backend.tv3.repository.*;
import com.example.backend.tv3.service.*;
import com.example.backend.tv3.storage.*;
import com.example.backend.tv3.web.Tv3Exception;

import jakarta.persistence.EntityManager;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

@ExtendWith(MockitoExtension.class)
class SubmissionServiceTest {
    @Mock SubmissionRepository repo;
    @Mock FrameRepository frames;
    @Mock FilmRollService rolls;
    @Mock CurrentActor actors;
    @Mock IntegrationPorts ports;
    @Mock ContestAccess contests;
    @Mock ImageValidator validator;
    @Mock TransactionalImages images;
    @Mock EntityManager em;
    SubmissionService service;
    Submission s;

    @BeforeEach
    void init() {
        service = new SubmissionService(repo, frames, rolls, actors, ports, validator, images, em);
        s = new Submission();
        s.setParticipantId("owner");
        s.setContestId("contest");
        s.setStatus(SubmissionStatus.PENDING);
        s.setImageUrl("https://cloud/image");
        s.setImagePublicId("old");
        lenient().when(ports.contests()).thenReturn(contests);
        lenient()
                .when(actors.require(Role.PARTICIPANT))
                .thenReturn(new Actor("owner", Role.PARTICIPANT));
        lenient().when(repo.findById(s.getId())).thenReturn(Optional.of(s));
        lenient().when(repo.lockById(s.getId())).thenReturn(Optional.of(s));
        lenient().when(repo.saveAndFlush(any())).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    void submitsPendingAfterUpload() {
        when(contests.lockParticipation(any(), any(), any(), any())).thenReturn(2);
        when(images.upload(any())).thenReturn(new ImageStorage.Asset("https://cloud/new", "new"));
        var result = service.create(MetadataTest.valid(), null, null);
        assertThat(result.status()).isEqualTo(SubmissionStatus.PENDING);
        assertThat(result.participantId()).isEqualTo("owner");
        verify(repo).saveAndFlush(any());
    }

    @Test
    void rejectsUnapprovedRegistrationBeforeUpload() {
        doThrow(new Tv3Exception(409, "Chưa được duyệt đăng ký"))
                .when(contests)
                .lockParticipation(any(), any(), any(), any());
        assertThatThrownBy(() -> service.create(MetadataTest.valid(), null, null))
                .hasMessageContaining("đăng ký");
        verifyNoInteractions(images);
        verify(repo, never()).saveAndFlush(any());
    }

    @Test
    void rejectsClosedContestBeforeUpload() {
        doThrow(new Tv3Exception(409, "Quá hạn"))
                .when(contests)
                .lockParticipation(any(), any(), any(), any());
        assertThatThrownBy(() -> service.create(MetadataTest.valid(), null, null))
                .hasMessageContaining("Quá hạn");
        verifyNoInteractions(images);
    }

    @Test
    void rejectsQuota() {
        when(contests.lockParticipation(any(), any(), any(), any())).thenReturn(1);
        when(repo.countByContestIdAndParticipantId("contest", "owner")).thenReturn(1L);
        assertThatThrownBy(() -> service.create(MetadataTest.valid(), null, null))
                .hasMessageContaining("giới hạn");
        verifyNoInteractions(images);
    }

    @ParameterizedTest
    @EnumSource(
            value = SubmissionStatus.class,
            names = {"VERIFIED", "REJECTED"})
    void finalStatusesCannotBeEditedOrDeleted(SubmissionStatus status) {
        s.setStatus(status);
        assertThatThrownBy(() -> service.update(s.getId(), MetadataTest.valid(), null, null))
                .hasMessageContaining("PENDING");
        assertThatThrownBy(() -> service.delete(s.getId())).hasMessageContaining("PENDING");
        verifyNoInteractions(images);
    }

    @Test
    void blocksOtherParticipant() {
        s.setParticipantId("someone");
        assertThatThrownBy(() -> service.delete(s.getId())).hasMessageContaining("Không tìm");
    }

    void organizer() {
        when(actors.require(Role.ORGANIZER, Role.ADMIN))
                .thenReturn(new Actor("organizer", Role.ORGANIZER));
    }

    @Test
    void reviewVerified() {
        organizer();
        var result =
                service.review(
                        s.getId(), new SubmissionStatusRequest(SubmissionStatus.VERIFIED, null));
        assertThat(result.status()).isEqualTo(SubmissionStatus.VERIFIED);
        assertThat(result.reviewedBy()).isEqualTo("organizer");
    }

    @Test
    void rejectionRequiresReasonAndStoresIt() {
        organizer();
        assertThatThrownBy(
                        () ->
                                service.review(
                                        s.getId(),
                                        new SubmissionStatusRequest(
                                                SubmissionStatus.REJECTED, " ")))
                .hasMessageContaining("lý do");
        assertThat(
                        service.review(
                                        s.getId(),
                                        new SubmissionStatusRequest(
                                                SubmissionStatus.REJECTED, " Lỗi metadata "))
                                .rejectionReason())
                .isEqualTo("Lỗi metadata");
    }

    @Test
    void blocksWrongOrganizer() {
        organizer();
        doThrow(new Tv3Exception(403, "Không quản lý")).when(contests).lockManagement(any(), any());
        assertThatThrownBy(
                        () ->
                                service.review(
                                        s.getId(),
                                        new SubmissionStatusRequest(
                                                SubmissionStatus.VERIFIED, null)))
                .hasMessageContaining("Không quản lý");
        verify(repo, never()).saveAndFlush(any());
    }

    @Test
    void blocksReReviewAndPendingTransition() {
        organizer();
        assertThatThrownBy(
                        () ->
                                service.review(
                                        s.getId(),
                                        new SubmissionStatusRequest(
                                                SubmissionStatus.PENDING, null)))
                .hasMessageContaining("Chỉ duyệt");
        s.setStatus(SubmissionStatus.VERIFIED);
        assertThatThrownBy(
                        () ->
                                service.review(
                                        s.getId(),
                                        new SubmissionStatusRequest(
                                                SubmissionStatus.REJECTED, "bad")))
                .hasMessageContaining("PENDING");
    }

    @Test
    void validatesBothFilesBeforeAnyUpload() {
        when(contests.lockParticipation(any(), any(), any(), any())).thenReturn(2);
        var negative =
                new org.springframework.mock.web.MockMultipartFile("negativeFile", new byte[] {1});
        when(validator.validate(isNull())).thenReturn(new byte[] {1});
        when(validator.validate(negative)).thenThrow(new Tv3Exception(400, "Âm bản lỗi"));
        assertThatThrownBy(() -> service.create(MetadataTest.valid(), null, negative))
                .hasMessageContaining("Âm bản lỗi");
        verifyNoInteractions(images);
    }
}
