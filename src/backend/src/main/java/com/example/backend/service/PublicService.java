package com.example.backend.service;

import com.example.backend.dto.ArchiveEntryResponse;
import com.example.backend.dto.LeaderboardEntryResponse;
import com.example.backend.dto.PublicStatsResponse;
import com.example.backend.entity.ArchiveEntry;
import com.example.backend.entity.BaseDocument;
import com.example.backend.entity.Contest;
import com.example.backend.entity.Submission;
import com.example.backend.entity.User;
import com.example.backend.enums.ContestStatus;
import com.example.backend.enums.PrizeRank;
import com.example.backend.enums.Role;
import com.example.backend.enums.SubmissionStatus;
import com.example.backend.repository.ArchiveEntryRepository;
import com.example.backend.repository.ContestRepository;
import com.example.backend.repository.SubmissionRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Số liệu cho trang công khai. Chỉ dùng bài đã duyệt và kết quả đã công bố. */
@Service
public class PublicService {

    private final ContestRepository contestRepository;
    private final SubmissionRepository submissionRepository;
    private final ArchiveEntryRepository archiveEntryRepository;
    private final UserRepository userRepository;

    public PublicService(
            ContestRepository contestRepository,
            SubmissionRepository submissionRepository,
            ArchiveEntryRepository archiveEntryRepository,
            UserRepository userRepository) {
        this.contestRepository = contestRepository;
        this.submissionRepository = submissionRepository;
        this.archiveEntryRepository = archiveEntryRepository;
        this.userRepository = userRepository;
    }

    public PublicStatsResponse getStats() {
        Instant now = Instant.now();
        List<Contest> contests = contestRepository.findAll().stream()
                .filter(contest -> contest.getStatus() != ContestStatus.DRAFT && !contest.isArchived())
                .toList();
        long ongoing = contests.stream()
                .filter(contest -> ContestService.effectiveStatus(contest, now) == ContestStatus.ONGOING)
                .count();
        return new PublicStatsResponse(
                contests.size(),
                ongoing,
                userRepository.countByRole(Role.PARTICIPANT),
                submissionRepository.countByStatus(SubmissionStatus.VERIFIED),
                userRepository.countByRole(Role.JUDGE),
                archiveEntryRepository.count());
    }

    public List<ArchiveEntryResponse> getArchive(Integer year, String contestId) {
        List<ArchiveEntry> entries = contestId != null
                ? archiveEntryRepository.findByContestId(contestId)
                : year != null ? archiveEntryRepository.findByYear(year) : archiveEntryRepository.findAll();
        return entries.stream()
                .sorted(Comparator.comparingInt(ArchiveEntry::getYear).reversed()
                        .thenComparing(item -> item.getPrizeRank() == null ? PrizeRank.HONORABLE.ordinal() : item.getPrizeRank().ordinal()))
                .map(ArchiveEntryResponse::fromEntity)
                .toList();
    }

    public List<LeaderboardEntryResponse> getLeaderboard() {
        Map<String, List<ArchiveEntry>> awardsByParticipant = archiveEntryRepository.findAll().stream()
                .collect(Collectors.groupingBy(ArchiveEntry::getParticipantId));
        Map<String, List<Submission>> scoredByParticipant = submissionRepository.findAll().stream()
                .filter(item -> item.getStatus() == SubmissionStatus.VERIFIED && item.getTotalScore() != null)
                .collect(Collectors.groupingBy(Submission::getParticipantId));
        // Chỉ tính cuộc thi đã công bố để không lộ điểm đang chấm
        Map<String, Boolean> publishedByContest = contestRepository.findAll().stream()
                .collect(Collectors.toMap(BaseDocument::getId, contest -> contest.getResultPublishedAt() != null));
        Map<String, User> users = userRepository.findAllById(awardsByParticipant.keySet()).stream()
                .collect(Collectors.toMap(BaseDocument::getId, Function.identity()));

        List<LeaderboardEntryResponse> unranked = new ArrayList<>();
        for (Map.Entry<String, List<ArchiveEntry>> entry : awardsByParticipant.entrySet()) {
            String participantId = entry.getKey();
            List<ArchiveEntry> awards = entry.getValue();
            List<Submission> published = scoredByParticipant.getOrDefault(participantId, List.of()).stream()
                    .filter(item -> publishedByContest.getOrDefault(item.getContestId(), false))
                    .toList();
            double average = published.stream().map(Submission::getTotalScore).filter(Objects::nonNull)
                    .mapToDouble(Double::doubleValue).average().orElse(0);
            ArchiveEntry best = awards.stream()
                    .max(Comparator.comparingDouble(item -> item.getTotalScore() == null ? 0 : item.getTotalScore()))
                    .orElseThrow();
            User user = users.get(participantId);
            unranked.add(new LeaderboardEntryResponse(
                    0,
                    participantId,
                    user == null ? best.getAuthorName() : user.getName(),
                    user == null ? null : user.getAvatarUrl(),
                    published.size(),
                    awards.size(),
                    awards.stream().filter(item -> item.getPrizeRank() == PrizeRank.FIRST).count(),
                    Math.round(average * 10) / 10.0,
                    best.getImageUrl(),
                    best.getTitle()));
        }
        unranked.sort(Comparator.comparingLong(LeaderboardEntryResponse::firstPrizeCount).reversed()
                .thenComparing(Comparator.comparingLong(LeaderboardEntryResponse::awardCount).reversed())
                .thenComparing(Comparator.comparingDouble(LeaderboardEntryResponse::averageScore).reversed()));
        List<LeaderboardEntryResponse> ranked = new ArrayList<>();
        for (int index = 0; index < unranked.size(); index++) {
            LeaderboardEntryResponse item = unranked.get(index);
            ranked.add(new LeaderboardEntryResponse(index + 1, item.participantId(), item.name(), item.avatarUrl(),
                    item.submissionCount(), item.awardCount(), item.firstPrizeCount(), item.averageScore(),
                    item.bestPhotoUrl(), item.bestPhotoTitle()));
        }
        return ranked;
    }
}
