package com.example.backend.service;

import com.example.backend.dto.ReportResponse;
import com.example.backend.dto.ReportResponse.CountItem;
import com.example.backend.entity.BaseDocument;
import com.example.backend.entity.Contest;
import com.example.backend.entity.ContestRegistration;
import com.example.backend.entity.JudgeAssignment;
import com.example.backend.entity.Submission;
import com.example.backend.enums.ContestStatus;
import com.example.backend.enums.Role;
import com.example.backend.enums.SubmissionStatus;
import com.example.backend.repository.ContestRegistrationRepository;
import com.example.backend.repository.JudgeAssignmentRepository;
import com.example.backend.repository.SubmissionRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.AuthenticatedUser;
import com.example.backend.util.AppDates;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Báo cáo trong phạm vi quản lý: Organizer tính trên cuộc thi của mình, Admin tính trên toàn hệ thống. */
@Service
public class ReportService {

    private static final int DAY_WINDOW = 30;
    private static final int MONTH_WINDOW = 6;
    private static final int MAX_DISTRIBUTION_ITEMS = 5;

    private final ContestService contestService;
    private final SubmissionRepository submissionRepository;
    private final ContestRegistrationRepository registrationRepository;
    private final JudgeAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;

    public ReportService(
            ContestService contestService,
            SubmissionRepository submissionRepository,
            ContestRegistrationRepository registrationRepository,
            JudgeAssignmentRepository assignmentRepository,
            UserRepository userRepository) {
        this.contestService = contestService;
        this.submissionRepository = submissionRepository;
        this.registrationRepository = registrationRepository;
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
    }

    /** contestId = null: toàn bộ phạm vi quản lý */
    public ReportResponse getReport(AuthenticatedUser actor, String contestId) {
        List<Contest> contests = contestService.findManagedEntities(actor).stream()
                .filter(contest -> contestId == null || contestId.equals(contest.getId()))
                .toList();
        Instant now = Instant.now();
        List<Submission> submissions = new ArrayList<>();
        Set<String> participants = new HashSet<>();
        Set<String> judges = new HashSet<>();
        for (Contest contest : contests) {
            String id = contest.getId();
            submissions.addAll(submissionRepository.findByContestId(id));
            registrationRepository.findByContestId(id).stream()
                    .map(ContestRegistration::getParticipantId).forEach(participants::add);
            assignmentRepository.findByContestId(id).stream().map(JudgeAssignment::getJudgeId).forEach(judges::add);
            judges.addAll(contest.getJudgeIds());
        }
        submissions.stream().map(Submission::getParticipantId).forEach(participants::add);
        long judgeCount = actor.role() == Role.ADMIN ? userRepository.countByRole(Role.JUDGE) : judges.size();
        long ongoing = contests.stream()
                .filter(contest -> !contest.isArchived())
                .filter(contest -> ContestService.effectiveStatus(contest, now) == ContestStatus.ONGOING
                        || ContestService.effectiveStatus(contest, now) == ContestStatus.JUDGING)
                .count();

        return new ReportResponse(
                ongoing,
                contests.size(),
                participants.size(),
                submissions.size(),
                countStatus(submissions, SubmissionStatus.VERIFIED),
                countStatus(submissions, SubmissionStatus.PENDING),
                countStatus(submissions, SubmissionStatus.REJECTED),
                judgeCount,
                distribution(submissions, Submission::getCategory),
                distribution(submissions, item -> item.getMetadata() == null ? null : item.getMetadata().filmStock()),
                lastDays(submissions),
                lastMonths(submissions),
                thisYear(submissions));
    }

    private static long countStatus(List<Submission> submissions, SubmissionStatus status) {
        return submissions.stream().filter(item -> item.getStatus() == status).count();
    }

    private static List<CountItem> distribution(List<Submission> submissions, Function<Submission, String> classifier) {
        Map<String, Long> counts = submissions.stream()
                .map(classifier)
                .filter(Objects::nonNull)
                .filter(value -> !value.isBlank())
                .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));
        List<CountItem> sorted = counts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder()))
                .map(entry -> new CountItem(entry.getKey(), entry.getValue()))
                .toList();
        if (sorted.size() <= MAX_DISTRIBUTION_ITEMS) {
            return sorted;
        }
        List<CountItem> top = new ArrayList<>(sorted.subList(0, MAX_DISTRIBUTION_ITEMS - 1));
        long others = sorted.subList(MAX_DISTRIBUTION_ITEMS - 1, sorted.size()).stream().mapToLong(CountItem::count).sum();
        top.add(new CountItem("Khác", others));
        return top;
    }

    private static List<LocalDate> submittedDates(List<Submission> submissions) {
        return submissions.stream().map(BaseDocument::getCreatedAt).filter(Objects::nonNull).map(AppDates::toDate).toList();
    }

    private static List<CountItem> lastDays(List<Submission> submissions) {
        LocalDate today = LocalDate.now(AppDates.ZONE);
        Map<LocalDate, Long> counts = new LinkedHashMap<>();
        for (int offset = DAY_WINDOW - 1; offset >= 0; offset--) {
            counts.put(today.minusDays(offset), 0L);
        }
        submittedDates(submissions).forEach(date -> counts.computeIfPresent(date, (key, value) -> value + 1));
        return counts.entrySet().stream()
                .map(entry -> new CountItem(entry.getKey().getDayOfMonth() + "/" + entry.getKey().getMonthValue(), entry.getValue()))
                .toList();
    }

    private static List<CountItem> lastMonths(List<Submission> submissions) {
        YearMonth current = YearMonth.now(AppDates.ZONE);
        List<YearMonth> months = new ArrayList<>();
        for (int offset = MONTH_WINDOW - 1; offset >= 0; offset--) {
            months.add(current.minusMonths(offset));
        }
        return monthlyCounts(submissions, months);
    }

    private static List<CountItem> thisYear(List<Submission> submissions) {
        YearMonth current = YearMonth.now(AppDates.ZONE);
        List<YearMonth> months = new ArrayList<>();
        for (int month = 1; month <= current.getMonthValue(); month++) {
            months.add(YearMonth.of(current.getYear(), month));
        }
        return monthlyCounts(submissions, months);
    }

    private static List<CountItem> monthlyCounts(List<Submission> submissions, List<YearMonth> months) {
        Map<YearMonth, Long> counts = new LinkedHashMap<>();
        months.forEach(month -> counts.put(month, 0L));
        submittedDates(submissions).forEach(date -> counts.computeIfPresent(YearMonth.from(date), (key, value) -> value + 1));
        return counts.entrySet().stream()
                .map(entry -> new CountItem("Thg " + entry.getKey().getMonthValue(), entry.getValue()))
                .toList();
    }
}
