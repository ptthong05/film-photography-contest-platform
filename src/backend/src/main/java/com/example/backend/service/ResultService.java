package com.example.backend.service;

import com.example.backend.dto.ContestResultResponse;
import com.example.backend.dto.MyResultResponse;
import com.example.backend.entity.ArchiveEntry;
import com.example.backend.entity.BaseDocument;
import com.example.backend.entity.Contest;
import com.example.backend.entity.Evaluation;
import com.example.backend.entity.Submission;
import com.example.backend.entity.User;
import com.example.backend.entity.embedded.Award;
import com.example.backend.entity.embedded.CriterionScore;
import com.example.backend.entity.embedded.JudgeComment;
import com.example.backend.enums.ContestStatus;
import com.example.backend.enums.EvaluationStatus;
import com.example.backend.enums.NotificationType;
import com.example.backend.enums.PrizeRank;
import com.example.backend.enums.SubmissionStatus;
import com.example.backend.exception.ConflictException;
import com.example.backend.repository.ArchiveEntryRepository;
import com.example.backend.repository.ContestRepository;
import com.example.backend.repository.EvaluationRepository;
import com.example.backend.repository.SubmissionRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.AuthenticatedUser;
import com.example.backend.util.AppDates;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/** Xếp hạng theo điểm trung bình các phiếu FINALIZED, trao giải theo cơ cấu giải của cuộc thi và lưu vào kho số. */
@Service
public class ResultService {

    private final ContestService contestService;
    private final ContestRepository contestRepository;
    private final SubmissionRepository submissionRepository;
    private final EvaluationRepository evaluationRepository;
    private final ArchiveEntryRepository archiveEntryRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ActivityLogService activityLogService;

    public ResultService(
            ContestService contestService,
            ContestRepository contestRepository,
            SubmissionRepository submissionRepository,
            EvaluationRepository evaluationRepository,
            ArchiveEntryRepository archiveEntryRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            ActivityLogService activityLogService) {
        this.contestService = contestService;
        this.contestRepository = contestRepository;
        this.submissionRepository = submissionRepository;
        this.evaluationRepository = evaluationRepository;
        this.archiveEntryRepository = archiveEntryRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.activityLogService = activityLogService;
    }

    /** Công khai: chưa công bố thì rỗng (chủ cuộc thi xem trước qua getManagedResults) */
    public List<ContestResultResponse> getPublishedResults(String contestId) {
        Contest contest = contestService.requireContest(contestId);
        return contest.getResultPublishedAt() == null ? List.of() : rank(contest);
    }

    /** Bảng xếp hạng mọi cuộc thi mà người này quản lý, gồm cả bản xem trước chưa công bố */
    public List<ContestResultResponse> getManagedResults(AuthenticatedUser actor) {
        return contestService.findManagedEntities(actor).stream().flatMap(contest -> rank(contest).stream()).toList();
    }

    public List<ContestResultResponse> getManagedResults(String contestId, AuthenticatedUser actor) {
        return rank(contestService.requireManaged(contestId, actor));
    }

    /** Kết quả các bài của thí sinh ở những cuộc thi đã công bố. Tên giám khảo ẩn nếu cuộc thi chấm ẩn danh. */
    public List<MyResultResponse> getMyResults(String participantId) {
        Map<String, List<Submission>> byContest = submissionRepository.findByParticipantId(participantId).stream()
                .collect(Collectors.groupingBy(Submission::getContestId));
        List<MyResultResponse> results = new ArrayList<>();
        for (Contest contest : contestRepository.findAllById(byContest.keySet())) {
            if (contest.getResultPublishedAt() == null) {
                continue;
            }
            List<ContestResultResponse> ranking = rank(contest);
            List<Evaluation> finalized = evaluationRepository.findByContestId(contest.getId()).stream()
                    .filter(item -> item.getStatus() == EvaluationStatus.FINALIZED)
                    .toList();
            Set<String> judgeIds = finalized.stream().map(Evaluation::getJudgeId).collect(Collectors.toSet());
            Map<String, String> judgeNames = userRepository.findAllById(judgeIds).stream()
                    .collect(Collectors.toMap(BaseDocument::getId, User::getName));
            for (Submission submission : byContest.get(contest.getId())) {
                ranking.stream()
                        .filter(item -> item.submissionId().equals(submission.getId()))
                        .findFirst()
                        .ifPresent(result -> results.add(toMyResult(contest, result, ranking.size(),
                                finalized.stream().filter(item -> item.getSubmissionId().equals(submission.getId())).toList(),
                                judgeNames)));
            }
        }
        return results;
    }

    private static MyResultResponse toMyResult(Contest contest, ContestResultResponse result, int totalRanked,
                                               List<Evaluation> evaluations, Map<String, String> judgeNames) {
        List<MyResultResponse.JudgeFeedback> feedback = evaluations.stream()
                .filter(item -> item.getComment() != null && !item.getComment().isBlank())
                .map(item -> new MyResultResponse.JudgeFeedback(
                        contest.isAnonymousJudging() ? "Giám khảo" : judgeNames.getOrDefault(item.getJudgeId(), "Giám khảo"),
                        item.getComment()))
                .toList();
        List<MyResultResponse.CriterionAverage> criteria = contest.getCriteria().stream().map(criterion -> {
            double average = evaluations.stream()
                    .flatMap(item -> item.getScores().stream())
                    .filter(score -> criterion.id().equals(score.criterionId()))
                    .mapToDouble(CriterionScore::score)
                    .average()
                    .orElse(0);
            return new MyResultResponse.CriterionAverage(criterion.name(), Math.round(average * 10) / 10.0, criterion.maxScore());
        }).toList();
        return new MyResultResponse(result.submissionId(), contest.getId(), contest.getTitle(), result.submissionTitle(),
                result.imageUrl(), result.category(), result.rank(), totalRanked, result.averageScore(), result.award(),
                result.awardTitle(), result.reward(), contest.getResultPublishedAt(), feedback, criteria);
    }

    public List<ContestResultResponse> publish(String contestId, AuthenticatedUser actor) {
        Contest contest = contestService.requireManaged(contestId, actor);
        if (contest.getResultPublishedAt() != null) {
            throw new ConflictException("Kết quả cuộc thi đã được công bố");
        }
        List<ContestResultResponse> results = rank(contest);
        if (results.isEmpty()) {
            throw new ConflictException("Chưa có bài dự thi nào được chấm xong, chưa thể công bố kết quả");
        }
        contest.setResultPublishedAt(Instant.now());
        contest.setStatus(ContestStatus.ENDED);
        contest.setSubmissionOpen(false);
        contestRepository.save(contest);

        Map<String, ContestResultResponse> resultBySubmission = results.stream()
                .collect(Collectors.toMap(ContestResultResponse::submissionId, item -> item));
        List<Submission> submissions = submissionRepository.findAllById(resultBySubmission.keySet());
        submissions.forEach(item -> item.setPrizeRank(resultBySubmission.get(item.getId()).award()));
        submissionRepository.saveAll(submissions);
        archiveWinners(contest, submissions, resultBySubmission);

        notificationService.sendToAll(
                submissions.stream().map(Submission::getParticipantId).toList(),
                NotificationType.RESULT_PUBLISHED,
                "Đã có kết quả cuộc thi",
                "Cuộc thi \"" + contest.getTitle() + "\" đã công bố kết quả.",
                "results");
        activityLogService.log(actor.id(), actor.role(), "RESULT_PUBLISH", "CONTEST", contestId, contest.getTitle());
        return rank(contest);
    }

    public void unpublish(String contestId, AuthenticatedUser actor) {
        Contest contest = contestService.requireManaged(contestId, actor);
        contest.setResultPublishedAt(null);
        contestRepository.save(contest);
        List<Submission> submissions = submissionRepository.findByContestId(contestId);
        submissions.forEach(item -> item.setPrizeRank(null));
        submissionRepository.saveAll(submissions);
        archiveEntryRepository.deleteByContestId(contestId);
        activityLogService.log(actor.id(), actor.role(), "RESULT_UNPUBLISH", "CONTEST", contestId, contest.getTitle());
    }

    private List<ContestResultResponse> rank(Contest contest) {
        Map<String, List<Evaluation>> finalizedBySubmission = evaluationRepository.findByContestId(contest.getId()).stream()
                .filter(item -> item.getStatus() == EvaluationStatus.FINALIZED)
                .collect(Collectors.groupingBy(Evaluation::getSubmissionId));
        List<Submission> scored = submissionRepository.findByContestIdAndStatus(contest.getId(), SubmissionStatus.VERIFIED)
                .stream()
                .filter(item -> finalizedBySubmission.containsKey(item.getId()))
                .toList();

        Map<String, Double> averageById = new HashMap<>();
        for (Submission submission : scored) {
            double average = finalizedBySubmission.get(submission.getId()).stream()
                    .mapToDouble(Evaluation::getTotalScore).average().orElse(0);
            averageById.put(submission.getId(), Math.round(average * 10) / 10.0);
        }
        Set<String> authorIds = scored.stream().map(Submission::getParticipantId).collect(Collectors.toSet());
        Map<String, String> authorNames = userRepository.findAllById(authorIds).stream()
                .collect(Collectors.toMap(BaseDocument::getId, User::getName));

        List<Submission> ordered = scored.stream()
                .sorted(Comparator.<Submission>comparingDouble(item -> averageById.get(item.getId())).reversed()
                        .thenComparing(BaseDocument::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
        List<Award> awardSlots = awardSlots(contest);
        boolean isPublished = contest.getResultPublishedAt() != null;

        List<ContestResultResponse> results = new ArrayList<>();
        for (int index = 0; index < ordered.size(); index++) {
            Submission submission = ordered.get(index);
            Award award = index < awardSlots.size() ? awardSlots.get(index) : null;
            results.add(new ContestResultResponse(
                    submission.getId(),
                    index + 1,
                    submission.getId(),
                    submission.getTitle(),
                    authorNames.get(submission.getParticipantId()),
                    averageById.get(submission.getId()),
                    award == null ? null : award.rank(),
                    award == null ? null : award.title(),
                    award == null ? null : award.reward(),
                    contest.getId(),
                    contest.getTitle(),
                    isPublished,
                    submission.getImageUrls().isEmpty() ? null : submission.getImageUrls().get(0),
                    submission.getThumbnailUrls().isEmpty() ? null : submission.getThumbnailUrls().get(0),
                    submission.getCategory()));
        }
        return results;
    }

    private static List<Award> awardSlots(Contest contest) {
        List<Award> slots = new ArrayList<>();
        for (Award award : contest.getAwards()) {
            for (int count = 0; count < Math.max(1, award.quantity()); count++) {
                slots.add(award);
            }
        }
        return slots;
    }

    private void archiveWinners(Contest contest, List<Submission> submissions, Map<String, ContestResultResponse> results) {
        archiveEntryRepository.deleteByContestId(contest.getId());
        Map<String, List<Evaluation>> evaluations = evaluationRepository.findByContestId(contest.getId()).stream()
                .filter(item -> item.getStatus() == EvaluationStatus.FINALIZED)
                .collect(Collectors.groupingBy(Evaluation::getSubmissionId));
        Set<String> judgeIds = new HashSet<>();
        evaluations.values().forEach(list -> list.forEach(item -> judgeIds.add(item.getJudgeId())));
        Map<String, String> judgeNames = userRepository.findAllById(judgeIds).stream()
                .collect(Collectors.toMap(BaseDocument::getId, User::getName));
        int year = AppDates.toDate(contest.getResultPublishedAt()).getYear();

        List<ArchiveEntry> entries = submissions.stream()
                .filter(item -> results.get(item.getId()).award() != null)
                .map(item -> {
                    ContestResultResponse result = results.get(item.getId());
                    PrizeRank rank = result.award();
                    ArchiveEntry entry = new ArchiveEntry();
                    entry.setSubmissionId(item.getId());
                    entry.setContestId(contest.getId());
                    entry.setContestTitle(contest.getTitle());
                    entry.setYear(year);
                    entry.setParticipantId(item.getParticipantId());
                    entry.setAuthorName(result.authorName());
                    entry.setTitle(item.getTitle());
                    entry.setDescription(item.getDescription());
                    entry.setImageUrl(result.imageUrl());
                    entry.setThumbnailUrl(result.thumbnailUrl());
                    entry.setPrizeRank(rank);
                    entry.setTotalScore(result.averageScore());
                    entry.setMetadata(item.getMetadata());
                    entry.setJudgeComments(evaluations.getOrDefault(item.getId(), List.of()).stream()
                            .filter(evaluation -> evaluation.getComment() != null && !evaluation.getComment().isBlank())
                            .map(evaluation -> new JudgeComment(evaluation.getJudgeId(),
                                    judgeNames.get(evaluation.getJudgeId()), evaluation.getComment()))
                            .toList());
                    return entry;
                }).toList();
        archiveEntryRepository.saveAll(entries);
    }
}
