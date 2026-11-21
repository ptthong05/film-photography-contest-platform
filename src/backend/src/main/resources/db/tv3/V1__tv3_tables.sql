-- Only TV3 tables. External IDs are opaque integration keys, not guessed foreign keys.
CREATE TABLE film_rolls (
 id VARCHAR(36) PRIMARY KEY, participant_id VARCHAR(128) NOT NULL,
 name VARCHAR(120) NOT NULL, brand VARCHAR(120) NOT NULL, iso INT NOT NULL,
 format VARCHAR(40) NOT NULL, camera_body VARCHAR(200) NOT NULL, total_frames INT NOT NULL,
 version BIGINT NOT NULL DEFAULT 0, created_at DATETIME(6) NOT NULL, updated_at DATETIME(6) NOT NULL,
 CONSTRAINT ck_roll_iso CHECK (iso > 0), CONSTRAINT ck_roll_frames CHECK (total_frames > 0),
 INDEX ix_roll_owner (participant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE frames (
 id VARCHAR(36) PRIMARY KEY, film_roll_id VARCHAR(36) NOT NULL, frame_number INT NOT NULL, notes VARCHAR(1000),
 version BIGINT NOT NULL DEFAULT 0, created_at DATETIME(6) NOT NULL, updated_at DATETIME(6) NOT NULL,
 CONSTRAINT fk_frame_roll FOREIGN KEY (film_roll_id) REFERENCES film_rolls(id) ON DELETE RESTRICT,
 CONSTRAINT uq_frame_number UNIQUE (film_roll_id, frame_number), CONSTRAINT ck_frame_number CHECK (frame_number > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE submissions (
 id VARCHAR(36) PRIMARY KEY, contest_id VARCHAR(128) NOT NULL, participant_id VARCHAR(128) NOT NULL,
 frame_id VARCHAR(36), title VARCHAR(200) NOT NULL, description VARCHAR(4000), category VARCHAR(120) NOT NULL,
 image_url VARCHAR(2048) NOT NULL, image_public_id VARCHAR(255) NOT NULL,
 negative_url VARCHAR(2048), negative_public_id VARCHAR(255),
 film_brand VARCHAR(120) NOT NULL, film_stock VARCHAR(120) NOT NULL, iso INT NOT NULL,
 camera VARCHAR(200) NOT NULL, lens VARCHAR(200) NOT NULL, film_format VARCHAR(40) NOT NULL,
 frame_number VARCHAR(10) NOT NULL, shooting_date DATE, shooting_location VARCHAR(300) NOT NULL,
 developing_lab VARCHAR(200) NOT NULL, scan_spec VARCHAR(500) NOT NULL,
 status VARCHAR(16) NOT NULL, rejection_reason VARCHAR(1000), reviewed_by VARCHAR(128), reviewed_at DATETIME(6),
 version BIGINT NOT NULL DEFAULT 0, created_at DATETIME(6) NOT NULL, updated_at DATETIME(6) NOT NULL,
 CONSTRAINT fk_submission_frame FOREIGN KEY (frame_id) REFERENCES frames(id) ON DELETE RESTRICT,
 CONSTRAINT uq_submission_frame UNIQUE(frame_id), CONSTRAINT uq_submission_image UNIQUE(image_public_id),
 CONSTRAINT ck_submission_iso CHECK (iso > 0),
 CONSTRAINT ck_submission_status CHECK (status IN ('PENDING','VERIFIED','REJECTED')),
 CONSTRAINT ck_rejection CHECK (status <> 'REJECTED' OR (rejection_reason IS NOT NULL AND CHAR_LENGTH(TRIM(rejection_reason)) > 0)),
 INDEX ix_submission_owner_contest (participant_id,contest_id), INDEX ix_submission_contest_status (contest_id,status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
