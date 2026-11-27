package com.example.backend;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.backend.dto.AssignmentRequest;
import com.example.backend.entity.Contest;
import com.example.backend.entity.JudgeAssignment;
import com.example.backend.entity.Notification;
import com.example.backend.entity.Round;
import com.example.backend.entity.Submission;
import com.example.backend.entity.User;
import com.example.backend.enums.NotificationType;
import com.example.backend.enums.Role;
import com.example.backend.enums.SubmissionStatus;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.ContestRepository;
import com.example.backend.repository.EvaluationRepository;
import com.example.backend.repository.JudgeAssignmentRepository;
import com.example.backend.repository.JudgingCriterionRepository;
import com.example.backend.repository.NotificationRepository;
import com.example.backend.repository.RoundRepository;
import com.example.backend.repository.SubmissionRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.AuthenticatedUser;
import com.example.backend.service.AssignmentService;
import com.example.backend.service.NotificationService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock NotificationRepository notifications;
    NotificationService service;

    @BeforeEach
    void init() {
        service = new NotificationService(notifications);
    }

    @Test
    void notifyStoresUnreadNotificationAndTruncatesLongMessage() {
        ArgumentCaptor<Notification> saved = ArgumentCaptor.forClass(Notification.class);
        when(notifications.save(saved.capture())).thenAnswer(call -> call.getArgument(0));

        service.notify("judge-1", NotificationType.ASSIGNMENT, "x".repeat(600));

        assertThat(saved.getValue().getRecipientId()).isEqualTo("judge-1");
        assertThat(saved.getValue().getType()).isEqualTo(NotificationType.ASSIGNMENT);
        assertThat(saved.getValue().getMessage()).hasSize(500).endsWith("…");
        assertThat(saved.getValue().isRead()).isFalse();
    }

    @Test
    void markAllReadOnlyTouchesUnreadOfThatUser() {
        Notification first = unread("judge-1");
        Notification second = unread("judge-1");
        when(notifications.findByRecipientIdAndReadAtIsNull("judge-1")).thenReturn(List.of(first, second));

        service.markAllRead("judge-1");

        assertThat(first.isRead()).isTrue();
        assertThat(second.isRead()).isTrue();
        verify(notifications).saveAll(List.of(first, second));
    }

    @Test
    void markAllReadWithNothingUnreadDoesNotWrite() {
        when(notifications.findByRecipientIdAndReadAtIsNull("judge-1")).thenReturn(List.of());

        service.markAllRead("judge-1");

        verify(notifications, never()).saveAll(anyList());
    }

    @Test
    void markReadOfAnotherUsersNotificationIsNotFound() {
        when(notifications.findByIdAndRecipientId("n-1", "judge-2")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.markRead("judge-2", "n-1"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    private static Notification unread(String recipientId) {
        Notification notification = new Notification();
        notification.setRecipientId(recipientId);
        notification.setType(NotificationType.DEADLINE);
        notification.setMessage("Nhắc hạn");
        return notification;
    }

    /** Phân công và nhắc nhở của ban tổ chức phải sinh thông báo cho đúng giám khảo */
    @Nested
    @ExtendWith(MockitoExtension.class)
    class FromAssignments {
        @Mock JudgeAssignmentRepository assignments;
        @Mock ContestRepository contests;
        @Mock RoundRepository rounds;
        @Mock SubmissionRepository submissions;
        @Mock EvaluationRepository evaluations;
        @Mock UserRepository users;
        @Mock JudgingCriterionRepository criteria;
        NotificationService notifier;
        AssignmentService assignmentService;
        Contest contest;
        Round round;

        @BeforeEach
        void setUp() {
            notifier = mock(NotificationService.class);
            assignmentService = new AssignmentService(
                    assignments, contests, rounds, submissions, evaluations, users, criteria, notifier);

            contest = new Contest();
            contest.setId(1L);
            contest.setTitle("Film 35mm");
            round = new Round();
            round.setId(10L);
            round.setContest(contest);
            round.setName("Vòng sơ khảo");
            round.setRoundOrder(1);
            round.setEndDate(LocalDate.now().plusDays(5).atTime(23, 59));

            User judge = new User();
            judge.setId("judge-1");
            judge.setRole(Role.JUDGE);
            judge.setStatus("ACTIVE");

            when(contests.findById(1L)).thenReturn(Optional.of(contest));
            when(rounds.findById(10L)).thenReturn(Optional.of(round));
            when(users.findById("judge-1")).thenReturn(Optional.of(judge));
            when(assignments.save(any(JudgeAssignment.class))).thenAnswer(call -> call.getArgument(0));
        }

        @Test
        void assigningNewSubmissionsNotifiesJudgeWithCountAndDeadline() {
            stubVerified("s1", "s2");
            when(rounds.findByContestIdOrderByRoundOrderAsc(1L)).thenReturn(List.of(round));

            assignmentService.assign(
                    new AssignmentRequest("1", null, "judge-1", List.of("s1", "s2"), null),
                    new AuthenticatedUser("org-1", "org@gmail.com", Role.ORGANIZER));

            ArgumentCaptor<String> message = ArgumentCaptor.forClass(String.class);
            verify(notifier).notify(eq("judge-1"),
                    eq(NotificationType.ASSIGNMENT), message.capture());
            assertThat(message.getValue()).contains("2 bài", "Film 35mm", "Vòng sơ khảo", "Hạn chấm");
        }

        @Test
        void reassigningSameSubmissionsDoesNotNotifyAgain() {
            stubVerified("s1");
            when(rounds.findByContestIdOrderByRoundOrderAsc(1L)).thenReturn(List.of(round));
            JudgeAssignment existing = assignment(new ArrayList<>(List.of("s1")));
            when(assignments.findByContestIdAndRoundIdAndJudgeId(1L, 10L, "judge-1"))
                    .thenReturn(Optional.of(existing));

            assignmentService.assign(
                    new AssignmentRequest("1", null, "judge-1", List.of("s1"), null),
                    new AuthenticatedUser("org-1", "org@gmail.com", Role.ORGANIZER));

            verify(notifier, never()).notify(any(), any(), any());
        }

        @Test
        void remindSendsDeadlineNotificationWithPendingCount() {
            JudgeAssignment existing = assignment(new ArrayList<>(List.of("s1", "s2", "s3")));
            when(assignments.findById("a-1")).thenReturn(Optional.of(existing));

            assignmentService.remind("a-1");

            ArgumentCaptor<String> message = ArgumentCaptor.forClass(String.class);
            verify(notifier).notify(eq("judge-1"),
                    eq(NotificationType.DEADLINE), message.capture());
            assertThat(message.getValue()).contains("3/3 bài chưa chấm", "Film 35mm");
            assertThat(existing.getRemindersSent()).isEqualTo(1);
        }

        private JudgeAssignment assignment(List<String> submissionIds) {
            JudgeAssignment assignment = new JudgeAssignment();
            assignment.setContestId(1L);
            assignment.setRoundId(10L);
            assignment.setJudgeId("judge-1");
            assignment.setSubmissionIds(submissionIds);
            return assignment;
        }

        private void stubVerified(String... ids) {
            List<Submission> verified = new ArrayList<>();
            for (String id : ids) {
                Submission submission = mock(Submission.class);
                when(submission.getId()).thenReturn(id);
                verified.add(submission);
            }
            when(submissions.findByContestIdAndStatus("1", SubmissionStatus.VERIFIED)).thenReturn(verified);
        }
    }
}
