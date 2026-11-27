package com.example.backend.service;

import com.example.backend.dto.AwardArchiveResponse;
import com.example.backend.dto.ContestResultResponse;
import com.example.backend.dto.ContestScoringResponse;
import com.example.backend.dto.JudgeScoreResponse;
import com.example.backend.dto.PublishResultsRequest;
import com.example.backend.dto.ScoringEntryResponse;
import com.example.backend.dto.SubmissionSummaryResponse;
import com.example.backend.entity.Contest;
import com.example.backend.entity.ContestResult;
import com.example.backend.entity.Evaluation;
import com.example.backend.entity.JudgeAssignment;
import com.example.backend.entity.Round;
import com.example.backend.entity.Submission;
import com.example.backend.entity.User;
import com.example.backend.enums.EvaluationStatus;
import com.example.backend.enums.PrizeRank;
import com.example.backend.enums.SubmissionStatus;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ConflictException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.ContestRepository;
import com.example.backend.repository.ContestResultRepository;
import com.example.backend.repository.EvaluationRepository;
import com.example.backend.repository.JudgeAssignmentRepository;
import com.example.backend.repository.RoundRepository;
import com.example.backend.repository.SubmissionRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.AuthenticatedUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Tổng hợp điểm và công bố kết quả cuộc thi.
 * Điểm của bài = trung bình các phiếu FINALIZED ở vòng muộn nhất có phiếu (vòng trước chỉ dùng để lọc bài).
 */
@Service
public class ResultService {

    /** Giải chỉ trao cho đúng một bài; HONORABLE (khuyến khích) được trao nhiều bài */
    private static final Set<PrizeRank> SINGLE_WINNER_PRIZES = EnumSet.of(PrizeRank.FIRST, PrizeRank.SECOND, PrizeRank.THIRD);

    private final ContestRepository contestRepository;
    private final RoundRepository roundRepository;
    private final SubmissionRepository submissionRepository;
    private final EvaluationRepository evaluationRepository;
    private final JudgeAssignmentRepository assignmentRepository;
    private final ContestResultRepository resultRepository;
    private final UserRepository userRepository;

    public ResultService(
            ContestRepository contestRepository,
            RoundRepository roundRepository,
            SubmissionRepository submissionRepository,
            EvaluationRepository evaluationRepository,
            JudgeAssignmentRepository assignmentRepository,
            ContestResultRepository resultRepository,
            UserRepository userRepository) {
        this.contestRepository = contestRepository;
        this.roundRepository = roundRepository;
        this.submissionRepository = submissionRepository;
        this.evaluationRepository = evaluationRepository;
        this.assignmentRepository = assignmentRepository;
        this.resultRepository = resultRepository;
        this.userRepository = userRepository;
    }

    public boolean isPublished(Long contestId) {
        return resultRepository.existsByContestId(contestId);
    }

    public ContestScoringResponse getScoring(Long contestId) {
        Contest contest = requireContest(contestId);
        List<ContestResult> results = resultRepository.findByContestIdOrderByRankingAsc(contestId);
        Map<String, ContestResult> resultBySubmission = results.stream()
                .collect(Collectors.toMap(ContestResult::getSubmissionId, Function.identity()));
        Comparator<ScoringEntryResponse> order = results.isEmpty()
                ? byScoreDesc()
                : Comparator.comparing(ScoringEntryResponse::ranking, Comparator.nullsLast(Comparator.naturalOrder()));
        List<ScoringEntryResponse> entries = buildEntries(contest, resultBySubmission).stream().sorted(order).toList();
        return new ContestScoringResponse(
                String.valueOf(contest.getId()),
                contest.getTitle(),
                !results.isEmpty(),
                results.isEmpty() ? null : results.get(0).getPublishedAt(),
                entries);
    }

    /** Xếp hạng mọi bài đã có điểm theo điểm giảm dần và lưu lại; giải thưởng do ban tổ chức chọn. */
    @Transactional
    public ContestScoringResponse publish(Long contestId, PublishResultsRequest request, AuthenticatedUser actor) {
        Contest contest = requireContest(contestId);
        if (resultRepository.existsByContestId(contestId)) {
            throw new ConflictException("Kết quả cuộc thi đã được công bố");
        }
        List<ScoringEntryResponse> scored = buildEntries(contest, Map.of()).stream()
                .filter(entry -> entry.averageScore() != null)
                .sorted(byScoreDesc())
                .toList();
        if (scored.isEmpty()) {
            throw new BadRequestException("Chưa có bài nào được chấm xong, chưa thể công bố kết quả");
        }
        Map<String, PrizeRank> prizeBySubmission = validateAwards(request.awards(), scored);

        Instant now = Instant.now();
        List<ContestResult> results = new ArrayList<>();
        for (int index = 0; index < scored.size(); index++) {
            ScoringEntryResponse entry = scored.get(index);
            ContestResult result = new ContestResult();
            result.setContestId(contestId);
            result.setSubmissionId(entry.submission().id());
            result.setRanking(index + 1);
            result.setAverageScore(entry.averageScore());
            result.setPrizeRank(prizeBySubmission.get(entry.submission().id()));
            result.setPublishedBy(actor.id());
            result.setPublishedAt(now);
            results.add(result);
        }
        resultRepository.saveAll(results);
        return getScoring(contestId);
    }

    /** Huỷ công bố để chỉnh lại giải; điểm chấm của giám khảo không bị ảnh hưởng */
    @Transactional
    public void unpublish(Long contestId) {
        requireContest(contestId);
        if (!resultRepository.existsByContestId(contestId)) {
            throw new BadRequestException("Cuộc thi chưa công bố kết quả");
        }
        resultRepository.deleteByContestId(contestId);
    }

    /** Kết quả công khai; rỗng khi chưa công bố */
    public List<ContestResultResponse> getPublished(Long contestId) {
        requireContest(contestId);
        List<ContestResult> results = resultRepository.findByContestIdOrderByRankingAsc(contestId);
        if (results.isEmpty()) {
            return List.of();
        }
        Map<String, Submission> submissions = submissionRepository
                .findAllById(results.stream().map(ContestResult::getSubmissionId).toList()).stream()
                .collect(Collectors.toMap(Submission::getId, Function.identity()));
        Map<String, String> authorNames = userNames(submissions.values().stream().map(Submission::getParticipantId));
        return results.stream()
                .filter(result -> submissions.containsKey(result.getSubmissionId()))
                .map(result -> {
                    SubmissionSummaryResponse summary =
                            SubmissionSummaryResponse.fromEntity(submissions.get(result.getSubmissionId()));
                    return new ContestResultResponse(
                            result.getRanking(),
                            summary.id(),
                            summary.code(),
                            summary.title(),
                            authorNames.get(submissions.get(result.getSubmissionId()).getParticipantId()),
                            summary.category(),
                            summary.imageUrl(),
                            result.getAverageScore(),
                            result.getPrizeRank(),
                            result.getPublishedAt());
                })
                .toList();
    }

    /**
     * Tác phẩm đạt giải của mọi cuộc thi đã công bố, năm mới nhất trước rồi theo thứ hạng.
     * Bài hoặc cuộc thi đã bị xoá sau khi công bố thì bỏ qua.
     */
    public List<AwardArchiveResponse> getAwardArchive() {
        List<ContestResult> awarded = resultRepository.findByPrizeRankIsNotNull();
        if (awarded.isEmpty()) {
            return List.of();
        }
        Map<Long, Contest> contests = contestRepository
                .findAllById(awarded.stream().map(ContestResult::getContestId).distinct().toList()).stream()
                .collect(Collectors.toMap(Contest::getId, Function.identity()));
        Map<String, Submission> submissions = submissionRepository
                .findAllById(awarded.stream().map(ContestResult::getSubmissionId).toList()).stream()
                .collect(Collectors.toMap(Submission::getId, Function.identity()));
        Map<String, String> authorNames = userNames(submissions.values().stream().map(Submission::getParticipantId));
        return awarded.stream()
                .filter(result -> contests.containsKey(result.getContestId())
                        && submissions.containsKey(result.getSubmissionId()))
                .map(result -> {
                    Contest contest = contests.get(result.getContestId());
                    Submission submission = submissions.get(result.getSubmissionId());
                    SubmissionSummaryResponse summary = SubmissionSummaryResponse.fromEntity(submission);
                    return new AwardArchiveResponse(
                            summary.id(),
                            summary.code(),
                            String.valueOf(contest.getId()),
                            contest.getTitle(),
                            archiveYear(contest, result),
                            result.getRanking(),
                            result.getPrizeRank(),
                            result.getAverageScore(),
                            summary.title(),
                            authorNames.get(submission.getParticipantId()),
                            summary.category(),
                            summary.imageUrl(),
                            submission.getMetadata(),
                            result.getPublishedAt());
                })
                .sorted(Comparator.comparingInt(AwardArchiveResponse::year).reversed()
                        .thenComparing(AwardArchiveResponse::contestTitle, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparingInt(AwardArchiveResponse::ranking))
                .toList();
    }

    private static int archiveYear(Contest contest, ContestResult result) {
        if (contest.getEndDate() != null) {
            return contest.getEndDate().getYear();
        }
        return result.getPublishedAt().atZone(ZoneId.systemDefault()).getYear();
    }

    private List<ScoringEntryResponse> buildEntries(Contest contest, Map<String, ContestResult> resultBySubmission) {
        Long contestId = contest.getId();
        List<Submission> submissions = submissionRepository
                .findByContestIdAndStatus(String.valueOf(contestId), SubmissionStatus.VERIFIED);
        Map<Long, Round> roundById = roundRepository.findByContestIdOrderByRoundOrderAsc(contestId).stream()
                .collect(Collectors.toMap(Round::getId, Function.identity()));
        Round currentRound = roundById.values().stream().max(Comparator.comparingInt(JudgeService::order)).orElse(null);
        Map<String, List<Evaluation>> finalizedBySubmission = evaluationRepository.findByContestId(contestId).stream()
                .filter(item -> item.getStatus() == EvaluationStatus.FINALIZED)
                .collect(Collectors.groupingBy(Evaluation::getSubmissionId));
        List<JudgeAssignment> assignments = assignmentRepository.findByContestId(contestId);
        Map<String, String> names = userNames(Stream.concat(
                submissions.stream().map(Submission::getParticipantId),
                finalizedBySubmission.values().stream().flatMap(List::stream).map(Evaluation::getJudgeId)));

        return submissions.stream().map(submission -> {
            List<Evaluation> finalized = finalizedBySubmission.getOrDefault(submission.getId(), List.of());
            Round scoredRound = finalized.stream()
                    .map(item -> roundById.get(item.getRoundId()))
                    .filter(Objects::nonNull)
                    .max(Comparator.comparingInt(JudgeService::order))
                    .orElse(null);
            // Vòng đã bị xoá thì vẫn dùng mọi phiếu đã chốt thay vì bỏ trắng điểm
            List<Evaluation> counted = scoredRound == null
                    ? finalized
                    : finalized.stream().filter(item -> scoredRound.getId().equals(item.getRoundId())).toList();
            Round targetRound = scoredRound != null ? scoredRound : currentRound;
            Double average = counted.isEmpty() ? null
                    : Math.round(counted.stream().mapToDouble(Evaluation::getTotalScore).average().orElse(0) * 10)
                            / 10.0;
            ContestResult result = resultBySubmission.get(submission.getId());
            return new ScoringEntryResponse(
                    SubmissionSummaryResponse.fromEntity(submission),
                    names.get(submission.getParticipantId()),
                    targetRound == null ? null : String.valueOf(targetRound.getId()),
                    targetRound == null ? null : targetRound.getName(),
                    countAssignedJudges(assignments, submission.getId(), targetRound),
                    counted.size(),
                    average,
                    counted.stream()
                            .map(item -> new JudgeScoreResponse(
                                    item.getJudgeId(),
                                    names.get(item.getJudgeId()),
                                    item.getTotalScore(),
                                    item.getComment(),
                                    item.isRecommendNextRound(),
                                    item.getFinalizedAt()))
                            .toList(),
                    result == null ? null : result.getRanking(),
                    result == null ? null : result.getPrizeRank());
        }).toList();
    }

    private static int countAssignedJudges(List<JudgeAssignment> assignments, String submissionId, Round round) {
        return (int) assignments.stream()
                .filter(item -> round == null || round.getId().equals(item.getRoundId()))
                .filter(item -> item.getSubmissionIds().isEmpty() || item.getSubmissionIds().contains(submissionId))
                .map(JudgeAssignment::getJudgeId)
                .distinct()
                .count();
    }

    private static Map<String, PrizeRank> validateAwards(
            List<PublishResultsRequest.Award> awards, List<ScoringEntryResponse> scored) {
        Set<String> scoredIds = scored.stream().map(entry -> entry.submission().id()).collect(Collectors.toSet());
        Map<String, PrizeRank> prizeBySubmission = new HashMap<>();
        Set<PrizeRank> usedPrizes = new HashSet<>();
        for (PublishResultsRequest.Award award : awards) {
            if (!scoredIds.contains(award.submissionId())) {
                throw new BadRequestException("Chỉ trao giải cho bài đã được chấm xong của cuộc thi này");
            }
            if (prizeBySubmission.putIfAbsent(award.submissionId(), award.prizeRank()) != null) {
                throw new BadRequestException("Mỗi bài chỉ nhận một giải");
            }
            if (SINGLE_WINNER_PRIZES.contains(award.prizeRank()) && !usedPrizes.add(award.prizeRank())) {
                throw new BadRequestException("Giải Nhất, Nhì, Ba mỗi giải chỉ trao cho một bài");
            }
        }
        return prizeBySubmission;
    }

    /** Điểm cao lên trước; bằng điểm thì bài nộp sớm hơn đứng trước; chưa có điểm xuống cuối */
    private static Comparator<ScoringEntryResponse> byScoreDesc() {
        return Comparator.comparing(ScoringEntryResponse::averageScore, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(entry -> entry.submission().submittedAt(),
                        Comparator.nullsLast(Comparator.naturalOrder()));
    }

    private Map<String, String> userNames(Stream<String> ids) {
        Set<String> uniqueIds = ids.filter(Objects::nonNull).collect(Collectors.toSet());
        return userRepository.findAllById(uniqueIds).stream()
                .collect(Collectors.toMap(User::getId, User::getName));
    }

    private Contest requireContest(Long contestId) {
        return contestRepository.findById(contestId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc thi"));
    }
}
