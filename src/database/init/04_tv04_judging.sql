-- =====================================================================
-- TV04 - Chấm điểm & kết quả
--   judging_criteria, judge_assignment, evaluations, contest_results
--   + 2 bảng phụ: judge_assignment_submissions, evaluation_scores
--
-- Tham chiếu sang bảng của thành viên khác:
--   users(id)        - TV01
--   contests(id)     - TV02
--   submissions(id)  - TV03
-- Quy ước: khóa chính BIGINT AUTO_INCREMENT, khóa ngoại BIGINT.
-- Bảng cha phải dùng cùng kiểu BIGINT cho cột id, nếu không MySQL báo lỗi khóa ngoại.
--
-- FOREIGN_KEY_CHECKS = 0 để file này chạy được kể cả khi bảng của TV01-03 chưa có;
-- ràng buộc vẫn được tạo và có hiệu lực khi bảng cha được tạo.
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- Tiêu chí chấm điểm của từng cuộc thi.
-- Tổng weight các tiêu chí của một cuộc thi = 100 (kiểm tra ở tầng service).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS judging_criteria (
    id            BIGINT        NOT NULL AUTO_INCREMENT,
    contest_id    BIGINT        NOT NULL,
    name          VARCHAR(100)  NOT NULL,
    description   VARCHAR(500)  NULL,
    max_score     DECIMAL(5,2)  NOT NULL DEFAULT 10.00,
    weight        DECIMAL(5,2)  NOT NULL COMMENT 'Trọng số theo %',
    display_order INT           NOT NULL DEFAULT 0,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_criteria_contest_name (contest_id, name),
    CONSTRAINT fk_criteria_contest FOREIGN KEY (contest_id) REFERENCES contests (id) ON DELETE CASCADE,
    CONSTRAINT chk_criteria_max_score CHECK (max_score > 0),
    CONSTRAINT chk_criteria_weight CHECK (weight > 0 AND weight <= 100)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci
  COMMENT = 'Tiêu chí chấm điểm';

-- ---------------------------------------------------------------------
-- Ban tổ chức phân công giám khảo chấm một cuộc thi (theo vòng).
-- Mỗi giám khảo chỉ có một dòng phân công cho mỗi vòng của một cuộc thi.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS judge_assignment (
    id             BIGINT     NOT NULL AUTO_INCREMENT,
    contest_id     BIGINT     NOT NULL,
    judge_id       BIGINT     NOT NULL COMMENT 'users.id, role JUDGE',
    round_no       TINYINT    NOT NULL DEFAULT 1 COMMENT 'Vòng chấm, bắt đầu từ 1',
    assigned_by    BIGINT     NULL     COMMENT 'users.id của người phân công',
    deadline       DATETIME   NULL,
    reminders_sent INT        NOT NULL DEFAULT 0,
    assigned_at    DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_assignment_contest_round_judge (contest_id, round_no, judge_id),
    KEY idx_assignment_judge (judge_id),
    CONSTRAINT fk_assignment_contest  FOREIGN KEY (contest_id)  REFERENCES contests (id) ON DELETE CASCADE,
    CONSTRAINT fk_assignment_judge    FOREIGN KEY (judge_id)    REFERENCES users (id)    ON DELETE CASCADE,
    CONSTRAINT fk_assignment_assigner FOREIGN KEY (assigned_by) REFERENCES users (id)    ON DELETE SET NULL,
    CONSTRAINT chk_assignment_round CHECK (round_no >= 1)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci
  COMMENT = 'Phân công giám khảo';

-- ---------------------------------------------------------------------
-- Bài cụ thể được giao cho một phân công.
-- Phân công KHÔNG có dòng nào ở đây = giám khảo chấm toàn bộ bài của vòng.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS judge_assignment_submissions (
    assignment_id BIGINT NOT NULL,
    submission_id BIGINT NOT NULL,
    PRIMARY KEY (assignment_id, submission_id),
    KEY idx_assignment_sub_submission (submission_id),
    CONSTRAINT fk_assignment_sub_assignment FOREIGN KEY (assignment_id) REFERENCES judge_assignment (id) ON DELETE CASCADE,
    CONSTRAINT fk_assignment_sub_submission FOREIGN KEY (submission_id) REFERENCES submissions (id)      ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci
  COMMENT = 'Bài được giao cho từng phân công giám khảo';

-- ---------------------------------------------------------------------
-- Phiếu chấm: một giám khảo chấm một bài một lần trong mỗi vòng.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS evaluations (
    id                   BIGINT        NOT NULL AUTO_INCREMENT,
    submission_id        BIGINT        NOT NULL,
    judge_id             BIGINT        NOT NULL COMMENT 'users.id, role JUDGE',
    round_no             TINYINT       NOT NULL DEFAULT 1,
    total_score          DECIMAL(6,2)  NULL COMMENT 'Tổng có trọng số theo judging_criteria',
    comment              TEXT          NULL COMMENT 'Nhận xét gửi thí sinh',
    private_note         TEXT          NULL COMMENT 'Ghi chú riêng, chỉ giám khảo đó thấy',
    recommend_next_round BOOLEAN       NOT NULL DEFAULT FALSE,
    status               ENUM('DRAFT', 'FINALIZED') NOT NULL DEFAULT 'DRAFT',
    finalized_at         DATETIME      NULL,
    created_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_evaluation_submission_judge_round (submission_id, judge_id, round_no),
    KEY idx_evaluation_judge_status (judge_id, status),
    CONSTRAINT fk_evaluation_submission FOREIGN KEY (submission_id) REFERENCES submissions (id) ON DELETE CASCADE,
    CONSTRAINT fk_evaluation_judge      FOREIGN KEY (judge_id)      REFERENCES users (id)       ON DELETE CASCADE,
    CONSTRAINT chk_evaluation_round CHECK (round_no >= 1),
    CONSTRAINT chk_evaluation_total CHECK (total_score IS NULL OR total_score >= 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci
  COMMENT = 'Phiếu chấm';

-- ---------------------------------------------------------------------
-- Điểm từng tiêu chí trong một phiếu chấm.
-- 0 <= score <= judging_criteria.max_score (kiểm tra ở tầng service).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS evaluation_scores (
    evaluation_id BIGINT       NOT NULL,
    criterion_id  BIGINT       NOT NULL,
    score         DECIMAL(5,2) NOT NULL,
    PRIMARY KEY (evaluation_id, criterion_id),
    KEY idx_eval_score_criterion (criterion_id),
    CONSTRAINT fk_eval_score_evaluation FOREIGN KEY (evaluation_id) REFERENCES evaluations (id)      ON DELETE CASCADE,
    CONSTRAINT fk_eval_score_criterion  FOREIGN KEY (criterion_id)  REFERENCES judging_criteria (id) ON DELETE CASCADE,
    CONSTRAINT chk_eval_score CHECK (score >= 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci
  COMMENT = 'Điểm theo tiêu chí của phiếu chấm';

-- ---------------------------------------------------------------------
-- Kết quả cuối cùng của từng bài trong cuộc thi.
-- final_score = trung bình total_score các phiếu FINALIZED.
-- prize_rank NULL = không đạt giải. published_at NULL = chưa công bố.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contest_results (
    id            BIGINT        NOT NULL AUTO_INCREMENT,
    contest_id    BIGINT        NOT NULL,
    submission_id BIGINT        NOT NULL,
    final_score   DECIMAL(6,2)  NOT NULL DEFAULT 0,
    rank_position INT           NULL COMMENT 'Thứ hạng trong cuộc thi, 1 = cao nhất',
    prize_rank    ENUM('FIRST', 'SECOND', 'THIRD', 'HONORABLE') NULL,
    award_title   VARCHAR(150)  NULL COMMENT 'Tên giải, vd. Giải Nhất',
    published_at  DATETIME      NULL,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_result_submission (submission_id),
    KEY idx_result_contest_rank (contest_id, rank_position),
    KEY idx_result_contest_prize (contest_id, prize_rank),
    CONSTRAINT fk_result_contest    FOREIGN KEY (contest_id)    REFERENCES contests (id)    ON DELETE CASCADE,
    CONSTRAINT fk_result_submission FOREIGN KEY (submission_id) REFERENCES submissions (id) ON DELETE CASCADE,
    CONSTRAINT chk_result_rank CHECK (rank_position IS NULL OR rank_position >= 1),
    CONSTRAINT chk_result_score CHECK (final_score >= 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci
  COMMENT = 'Kết quả cuộc thi';

SET FOREIGN_KEY_CHECKS = 1;
