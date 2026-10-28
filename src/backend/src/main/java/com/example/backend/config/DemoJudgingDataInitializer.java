package com.example.backend.config;

import com.example.backend.entity.Contest;
import com.example.backend.entity.JudgeAssignment;
import com.example.backend.entity.Submission;
import com.example.backend.entity.User;
import com.example.backend.entity.embedded.FilmMetadata;
import com.example.backend.entity.embedded.JudgingCriterion;
import com.example.backend.entity.embedded.JudgingRound;
import com.example.backend.enums.ContestStatus;
import com.example.backend.enums.SubmissionStatus;
import com.example.backend.repository.ContestRepository;
import com.example.backend.repository.JudgeAssignmentRepository;
import com.example.backend.repository.SubmissionRepository;
import com.example.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

/**
 * Tạo dữ liệu chấm thi mẫu để thử phân hệ Judge khi chưa có màn hình Organizer nối backend:
 * <ul>
 *   <li>Analog Moments 2025 (công khai tác giả): 4 bài VERIFIED + 1 bài PENDING — judge@gmail.com chấm toàn bộ bài VERIFIED</li>
 *   <li>Film &amp; City (chấm ẩn danh): 3 bài VERIFIED — judge@gmail.com chấm 2 bài đầu, judge2@gmail.com chấm bài thứ 3</li>
 * </ul>
 * Chỉ chạy khi DB chưa có cuộc thi nào và tài khoản mẫu đã được tạo; tắt cùng DEMO_ACCOUNTS_ENABLED.
 */
@Component
@Order(3)
public class DemoJudgingDataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoJudgingDataInitializer.class);

    private static final List<JudgingCriterion> BASIC_CRITERIA = List.of(
            new JudgingCriterion("cr-composition", "Bố cục", "Sắp xếp chủ thể, đường dẫn, cân bằng khung hình", 10, 20),
            new JudgingCriterion("cr-light", "Ánh sáng", "Cách khai thác và kiểm soát ánh sáng", 10, 20),
            new JudgingCriterion("cr-content", "Nội dung / Ý tưởng", "Thông điệp và câu chuyện của bức ảnh", 10, 20),
            new JudgingCriterion("cr-aesthetic", "Tính thẩm mỹ", "Cảm xúc thị giác, màu sắc, tông ảnh", 10, 20),
            new JudgingCriterion("cr-film-technique", "Kỹ thuật nhiếp ảnh phim", "Phơi sáng, tráng rửa, chất lượng bản quét", 10, 20));

    private static final List<JudgingCriterion> FILM_CRITERIA = List.of(
            new JudgingCriterion("cr-composition", "Bố cục", "Sắp xếp chủ thể và khung hình", 10, 30),
            new JudgingCriterion("cr-grain", "Grain & tông màu phim", "Đặc trưng của film stock được khai thác", 10, 25),
            new JudgingCriterion("cr-scan", "Chất lượng scan", "Độ nét, dải tương phản, xử lý bụi xước", 10, 25),
            new JudgingCriterion("cr-story", "Câu chuyện đô thị", "Tinh thần chủ đề Film & City", 10, 20));

    private final UserRepository userRepository;
    private final ContestRepository contestRepository;
    private final SubmissionRepository submissionRepository;
    private final JudgeAssignmentRepository judgeAssignmentRepository;
    private final boolean isEnabled;

    public DemoJudgingDataInitializer(
            UserRepository userRepository,
            ContestRepository contestRepository,
            SubmissionRepository submissionRepository,
            JudgeAssignmentRepository judgeAssignmentRepository,
            @Value("${app.demo-accounts.enabled}") boolean isEnabled) {
        this.userRepository = userRepository;
        this.contestRepository = contestRepository;
        this.submissionRepository = submissionRepository;
        this.judgeAssignmentRepository = judgeAssignmentRepository;
        this.isEnabled = isEnabled;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!isEnabled || contestRepository.count() > 0) {
            return;
        }
        Optional<User> organizer = userRepository.findByEmail("organizer@gmail.com");
        Optional<User> participant = userRepository.findByEmail("participant@gmail.com");
        Optional<User> judge = userRepository.findByEmail("judge@gmail.com");
        Optional<User> secondJudge = userRepository.findByEmail("judge2@gmail.com");
        if (organizer.isEmpty() || participant.isEmpty() || judge.isEmpty() || secondJudge.isEmpty()) {
            log.warn("Thiếu tài khoản mẫu, bỏ qua tạo dữ liệu chấm thi mẫu");
            return;
        }
        String organizerId = organizer.get().getId();
        String participantId = participant.get().getId();
        Instant now = Instant.now();

        Contest analog = contestRepository.save(contest("Analog Moments 2025", "analog-moments-2025", false,
                List.of("Phong cảnh", "Đường phố", "Chân dung"), BASIC_CRITERIA,
                new JudgingRound("rd-analog-1", "Vòng sơ khảo", 1, now.minus(2, ChronoUnit.DAYS), now.plus(14, ChronoUnit.DAYS)),
                organizerId, "analog-moments"));
        List<Submission> analogSubmissions = submissionRepository.saveAll(List.of(
                submission(analog, participantId, "Chiều bên hồ", "Phong cảnh", "Kodak Portra 400", SubmissionStatus.VERIFIED, "chieu-ben-ho"),
                submission(analog, participantId, "Góc phố cũ", "Đường phố", "Ilford HP5 Plus", SubmissionStatus.VERIFIED, "goc-pho-cu"),
                submission(analog, participantId, "Ánh sáng cuối ngày", "Chân dung", "Fujifilm Superia 400", SubmissionStatus.VERIFIED, "anh-sang-cuoi-ngay"),
                submission(analog, participantId, "Bình minh", "Phong cảnh", "Kodak Ektar 100", SubmissionStatus.VERIFIED, "binh-minh"),
                // Chưa duyệt nên không giám khảo nào thấy, dù phân công "toàn bộ bài"
                submission(analog, participantId, "Bài đang chờ duyệt", "Đường phố", "Kodak Gold 200", SubmissionStatus.PENDING, "cho-duyet")));

        Contest city = contestRepository.save(contest("Film & City", "film-and-city", true,
                List.of("Đường phố", "Kiến trúc", "Đời sống"), FILM_CRITERIA,
                new JudgingRound("rd-city-1", "Vòng chung khảo", 1, now.minus(1, ChronoUnit.DAYS), now.plus(10, ChronoUnit.DAYS)),
                organizerId, "film-city"));
        List<Submission> citySubmissions = submissionRepository.saveAll(List.of(
                submission(city, participantId, "Mưa đêm", "Đường phố", "CineStill 800T", SubmissionStatus.VERIFIED, "mua-dem"),
                submission(city, participantId, "Cầu thang xoắn", "Kiến trúc", "Ilford Delta 100", SubmissionStatus.VERIFIED, "cau-thang-xoan"),
                submission(city, participantId, "Người bán hàng rong", "Đời sống", "Kodak Tri-X 400", SubmissionStatus.VERIFIED, "ban-hang-rong")));

        judgeAssignmentRepository.saveAll(List.of(
                assignment(analog, "rd-analog-1", judge.get().getId(), organizerId, List.of()),
                assignment(city, "rd-city-1", judge.get().getId(), organizerId,
                        List.of(citySubmissions.get(0).getId(), citySubmissions.get(1).getId())),
                assignment(city, "rd-city-1", secondJudge.get().getId(), organizerId,
                        List.of(citySubmissions.get(2).getId()))));

        log.info("Đã tạo dữ liệu chấm thi mẫu: 2 cuộc thi, {} bài dự thi, 3 phân công",
                analogSubmissions.size() + citySubmissions.size());
    }

    private static Contest contest(String title, String slug, boolean anonymousJudging, List<String> categories,
                                   List<JudgingCriterion> criteria, JudgingRound round, String organizerId, String coverSeed) {
        Contest contest = new Contest();
        contest.setTitle(title);
        contest.setSlug(slug);
        contest.setCoverUrl(photo(coverSeed, 480, 320));
        contest.setCategories(categories);
        contest.setOrganizerId(organizerId);
        contest.setStatus(ContestStatus.JUDGING);
        contest.setJudgingStart(round.startDate());
        contest.setJudgingEnd(round.endDate());
        contest.setAnonymousJudging(anonymousJudging);
        contest.setRounds(List.of(round));
        contest.setCriteria(criteria);
        return contest;
    }

    private static Submission submission(Contest contest, String participantId, String title, String category,
                                         String filmStock, SubmissionStatus status, String imageSeed) {
        Submission submission = new Submission();
        submission.setContestId(contest.getId());
        submission.setParticipantId(participantId);
        submission.setTitle(title);
        submission.setDescription("Tác phẩm mẫu \"" + title + "\" chụp bằng " + filmStock + ".");
        submission.setCategory(category);
        submission.setImageUrls(List.of(photo(imageSeed, 1600, 1067)));
        submission.setThumbnailUrls(List.of(photo(imageSeed, 320, 213)));
        submission.setMetadata(new FilmMetadata(filmStock.split(" ")[0], filmStock, 400, "Canon AE-1", "50mm f/1.8",
                "35mm", "12", LocalDate.of(2025, 5, 15), "TP. Hồ Chí Minh", "Lab Sài Gòn", "Epson V600 (3200dpi)"));
        submission.setStatus(status);
        return submission;
    }

    private static JudgeAssignment assignment(Contest contest, String roundId, String judgeId, String assignedBy,
                                              List<String> submissionIds) {
        JudgeAssignment assignment = new JudgeAssignment();
        assignment.setContestId(contest.getId());
        assignment.setRoundId(roundId);
        assignment.setJudgeId(judgeId);
        assignment.setAssignedBy(assignedBy);
        assignment.setSubmissionIds(submissionIds);
        return assignment;
    }

    private static String photo(String seed, int width, int height) {
        return "https://picsum.photos/seed/" + seed + "/" + width + "/" + height;
    }
}
