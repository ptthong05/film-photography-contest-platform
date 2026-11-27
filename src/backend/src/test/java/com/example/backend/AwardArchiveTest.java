package com.example.backend;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyIterable;
import static org.mockito.Mockito.when;

import com.example.backend.dto.AwardArchiveResponse;
import com.example.backend.entity.Contest;
import com.example.backend.entity.ContestResult;
import com.example.backend.entity.Submission;
import com.example.backend.entity.User;
import com.example.backend.enums.PrizeRank;
import com.example.backend.repository.ContestRepository;
import com.example.backend.repository.ContestResultRepository;
import com.example.backend.repository.EvaluationRepository;
import com.example.backend.repository.JudgeAssignmentRepository;
import com.example.backend.repository.RoundRepository;
import com.example.backend.repository.SubmissionRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.ResultService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@ExtendWith(MockitoExtension.class)
class AwardArchiveTest {

    @Mock ContestRepository contests;
    @Mock RoundRepository rounds;
    @Mock SubmissionRepository submissions;
    @Mock EvaluationRepository evaluations;
    @Mock JudgeAssignmentRepository assignments;
    @Mock ContestResultRepository results;
    @Mock UserRepository users;
    ResultService service;

    @BeforeEach
    void init() {
        service = new ResultService(contests, rounds, submissions, evaluations, assignments, results, users);
    }

    @Test
    void emptyWhenNothingPublished() {
        when(results.findByPrizeRankIsNotNull()).thenReturn(List.of());

        assertThat(service.getAwardArchive()).isEmpty();
    }

    @Test
    void listsAwardsNewestYearFirstThenByRankAndSkipsDeletedSubmissions() {
        Contest older = contest(1L, "Film 2025", LocalDateTime.of(2025, 12, 1, 0, 0));
        Contest newer = contest(2L, "Film 2026", LocalDateTime.of(2026, 12, 1, 0, 0));
        Submission first2025 = submission("Hoàng hôn", "u-1");
        Submission second2026 = submission("Sương sớm", "u-2");
        Submission first2026 = submission("Phố cũ", "u-1");
        when(results.findByPrizeRankIsNotNull()).thenReturn(List.of(
                result(1L, first2025, 1, PrizeRank.FIRST),
                result(2L, second2026, 2, PrizeRank.SECOND),
                result(2L, first2026, 1, PrizeRank.FIRST),
                resultFor(2L, "deleted-submission", 3, PrizeRank.THIRD)));
        when(contests.findAllById(anyIterable())).thenReturn(List.of(older, newer));
        when(submissions.findAllById(anyIterable())).thenReturn(List.of(first2025, second2026, first2026));
        when(users.findAllById(anyIterable())).thenReturn(List.of(user("u-1", "Lê Văn A"), user("u-2", "Trần Thị B")));

        List<AwardArchiveResponse> archive = service.getAwardArchive();

        assertThat(archive).extracting(AwardArchiveResponse::title)
                .containsExactly("Phố cũ", "Sương sớm", "Hoàng hôn");
        assertThat(archive.get(0).year()).isEqualTo(2026);
        assertThat(archive.get(0).contestTitle()).isEqualTo("Film 2026");
        assertThat(archive.get(0).authorName()).isEqualTo("Lê Văn A");
        assertThat(archive.get(0).prizeRank()).isEqualTo(PrizeRank.FIRST);
        assertThat(archive.get(2).year()).isEqualTo(2025);
    }

    private static Contest contest(Long id, String title, LocalDateTime endDate) {
        Contest contest = new Contest();
        contest.setId(id);
        contest.setTitle(title);
        contest.setEndDate(endDate);
        return contest;
    }

    private static Submission submission(String title, String participantId) {
        Submission submission = new Submission();
        submission.setTitle(title);
        submission.setParticipantId(participantId);
        submission.setImageUrl("https://example.com/" + title + ".jpg");
        return submission;
    }

    private static ContestResult result(Long contestId, Submission submission, int ranking, PrizeRank prize) {
        return resultFor(contestId, submission.getId(), ranking, prize);
    }

    private static ContestResult resultFor(Long contestId, String submissionId, int ranking, PrizeRank prize) {
        ContestResult result = new ContestResult();
        result.setContestId(contestId);
        result.setSubmissionId(submissionId);
        result.setRanking(ranking);
        result.setAverageScore(9.0 - ranking / 10.0);
        result.setPrizeRank(prize);
        result.setPublishedBy("org-1");
        result.setPublishedAt(Instant.parse("2026-11-20T00:00:00Z"));
        return result;
    }

    private static User user(String id, String name) {
        User user = new User();
        user.setId(id);
        user.setName(name);
        return user;
    }
}
