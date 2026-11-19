# Backend TV3 — triển khai, kiểm thử và final review

Báo cáo duy nhất của TV3: `doc/vi/developer/backend-tv3.md`. Các thay đổi tiếp theo cập nhật tại đây; không tạo báo cáo TV3 song song.

## 1. Tổng quan Backend TV3

Đã triển khai module TV3: ba bảng MySQL/JPA, migration Flyway, CRUD FilmRoll/Frame,
Submission multipart, validation metadata, trạng thái và kiểm duyệt, Cloudinary và kiểm thử.
Không thay đổi frontend, module User MongoDB, không nhập code JWT/Contest của nhánh auth.
Không commit/push, merge, rebase, pull hay chuyển nhánh.

**Chưa phải hệ thống tích hợp hoàn chỉnh.** Nhánh hiện tại chưa có middleware JWT TV1
hoặc adapter Contest/Registration TV2. API TV3 yêu cầu principal TV1; không có JWT trả 401.
Nghiệp vụ cần TV2 trả 503 khi adapter chưa có. Không có bean giả cho phép nộp bài trong production.
Upload Cloudinary thật chưa được kiểm chứng vì chưa có credential; kiểm thử storage dùng mock.



Lượt final review xác nhận nhánh `feature/backend-tv3`. Git đầu lượt **không sạch**:
hai file đã track (`pom.xml`, `application.properties`) modified, cùng mã TV3/test/config
và ba báo cáo cũ untracked từ lượt triển khai trước. Không xem untracked là file thừa.
Target đã track không có thay đổi đầu lượt. Mọi thay đổi được giữ để người dùng review;
không git add, commit, push, pull, merge, rebase, cherry-pick hoặc chuyển nhánh.

## 2. Phạm vi công việc được nhóm phân công

TV3 sở hữu FilmRoll CRUD, Frame CRUD, Submission, upload Cloudinary/S3, validation 10 metadata,
trạng thái PENDING/VERIFIED/REJECTED và Organizer review; ba bảng film_rolls/frames/submissions.
Triển khai provider Cloudinary, không đồng thời thêm S3 khi chưa có yêu cầu chuẩn hóa của nhóm.
Không làm JWT/Profile TV1, Contest/Registration/Category TV2, chấm điểm/kết quả TV4,
AI/ActivityLog/Admin/Seeder TV5. Không sửa frontend hoặc chuyển module MongoDB của người khác sang JPA.

## 3. Kiến trúc và cấu trúc thư mục

```text
src/backend/src/main/java/com/example/backend/tv3/
  dto/          Request validation, response mapping
  entity/       FilmRoll, Frame, Submission, metadata, status, base timestamps/version
  repository/   JPA, truy vấn và pessimistic locking
  service/      Nghiệp vụ, transaction, kiểm tra quyền
  integration/  CurrentActor, Actor, hợp đồng ContestAccess của TV2
  storage/      ImageStorage, CloudinaryStorage, ImageValidator, TransactionalImages
  web/          REST controllers và exception handler phạm vi TV3
src/backend/src/main/resources/db/tv3/V1__tv3_tables.sql
src/backend/src/test/java/com/example/backend/tv3/  Unit, HTTP, security, MySQL, cloud mock
src/backend/scripts/test-tv3.ps1                  Clean verify trong Docker/JDK 17
```

Controller → Service → Repository → MySQL. Controller không trả Entity JPA trực tiếp.
Spring/JPA/Flyway/reflection sử dụng nhiều class gián tiếp; đã giữ các class này và toàn bộ
test nghiệp vụ. Không thấy dependency TV3 nào có đủ chứng cứ là thừa:
JPA/MySQL/Flyway cho persistence, security-core cho SecurityContext (không tạo login/JWT),
Cloudinary SDK cho upload, WebP ImageIO cho decoder; MongoDB và dependencies cũ vẫn cần module User.
Không thêm mock production, không xóa class chỉ vì thiếu tham chiếu trực tiếp.

## 4. Các chức năng đã triển khai

- CRUD FilmRoll cá nhân, kiểm tra chủ, ISO/tổng Frame, ngăn giảm giới hạn dưới Frame hiện có.
- CRUD Frame thuộc cuộn cá nhân, số trong giới hạn, chống trùng ở service và DB.
- Không sửa/xóa Frame đã được nộp; không xóa cuộn còn Frame/tham chiếu.
- Submission multipart; kiểm tra metadata, ảnh chính/âm bản; lưu URL/public ID thay binary.
- Chỉ sửa/xóa PENDING còn hạn qua TV2; không đổi contest/Frame sau khi nộp.
- Organizer/Admin review qua quyền cuộc thi TV2; lý do từ chối bắt buộc; ghi reviewer/time.
- Pessimistic locking, version và compensation cloud theo transaction.

Các nhánh nghiệp vụ dựa vào TV2 đã có lời gọi adapter và test mock; **chưa chạy thành công
đầu cuối** khi module JWT/TV2 thật chưa có. Không coi interface là tích hợp đã hoàn tất.

## 5. Ba bảng MySQL, khóa ngoại, index và migration

Migration: `src/backend/src/main/resources/db/tv3/V1__tv3_tables.sql`.
Profile `tv3` bật JPA/MySQL/Flyway; mặc định ứng dụng giữ khởi động theo MongoDB cũ.
`ddl-auto=validate`, `clean-disabled=true`, không dùng create/create-drop.
Flyway quản lý bảng lịch sử riêng `flyway_tv3_history` (bảng kỹ thuật, không phải bảng nghiệp vụ thứ tư).

| Bảng | Dữ liệu và ràng buộc |
|---|---|
| film_rolls | UUID do TV3 sinh; participant_id; name, brand, iso > 0, format, camera_body, total_frames > 0; version; timestamps; index owner |
| frames | UUID; FK film_roll_id → film_rolls; frame_number > 0, notes; UNIQUE(film_roll_id, frame_number); version; timestamps |
| submissions | UUID; contest_id, participant_id, category; frame_id tùy chọn; title/description; URL/public ID ảnh chính/âm bản; 10 metadata và shooting_date; status/reason/reviewer/time; version; timestamps |

Submissions có FK `frame_id → frames.id`, UNIQUE(frame_id) và UNIQUE(image_public_id).
MySQL cho phép nhiều `frame_id=NULL`; một Frame chỉ được dùng trong một bài, kể cả khác cuộc thi.
FK đều RESTRICT, không cascade xóa dữ liệu. Index `(participant_id,contest_id)` và `(contest_id,status)`.
CHECK ISO, trạng thái và lý do từ chối không rỗng. Frame vượt `total_frames` được kiểm tra
trong transaction dưới khóa FilmRoll vì CHECK MySQL không tham chiếu sang bảng khác.

ID bên ngoài TV3 là chuỗi opaque tối đa 128 ký tự theo hợp đồng adapter, không khai báo
FK giả tới các bảng chưa tồn tại. Category giữ chuỗi theo frontend auth; chưa giả định category PK.
Sau khi TV1/TV2 chốt schema, nhóm cần adapter chuyển đổi ID và migration mới bổ sung
FK user/contest/category/reviewed_by. Không sửa V1 đã áp dụng và không tự baseline schema chung.
Khi hợp nhất vào database 16 bảng, cần thống nhất Flyway history/version với nhóm trước.
Chưa tuyên bố đã tích hợp MySQL cho 13 bảng khác.

Final review không sửa V1, không baseline tự động, không reset database. MySQL test dùng
database TV3 độc lập; verify lại checksum/mapping trên schema đã có. Schema nhóm còn BLOCKED
cho đến khi chốt PK và ranh giới migration. Không lấy migration độc lập làm bằng chứng
đã tích hợp đủ 16 bảng.

## 6. Danh sách API, request/response và vai trò

Tất cả URL dưới `/api`. P = PARTICIPANT; O = ORGANIZER; A = ADMIN.
Quyền A giữ hợp đồng auth nhưng việc truy cập cuộc thi cụ thể vẫn do adapter TV2 quyết định.

| Method | Endpoint | Role | Request | Response/status | Quy tắc |
|---|---|---|---|---|---|
| GET | /film-rolls | P | — | FilmRollResponse[] / 200 | Chỉ dữ liệu cá nhân |
| GET | /film-rolls/{id} | P | — | FilmRollResponse / 200 | Chủ sở hữu; khác chủ 404 |
| POST | /film-rolls | P | FilmRollRequest JSON | FilmRollResponse / 201 | Chủ lấy từ principal |
| PUT | /film-rolls/{id} | P | FilmRollRequest JSON | FilmRollResponse / 200 | Không giảm giới hạn dưới Frame hiện có; khóa metadata đã được tham chiếu |
| DELETE | /film-rolls/{id} | P | — | 204 | Cuộn còn Frame hoặc Submission: 409 |
| GET | /film-rolls/{rollId}/frames | P | — | FrameResponse[] / 200 | Kiểm tra chủ cuộn |
| POST | /film-rolls/{rollId}/frames | P | frameNumber, notes JSON | FrameResponse / 201 | Trong giới hạn, không trùng |
| GET | /film-rolls/{rollId}/frames/{id} | P | — | FrameResponse / 200 | Frame thuộc cuộn cá nhân |
| PUT | /film-rolls/{rollId}/frames/{id} | P | FrameRequest JSON | FrameResponse / 200 | Frame đã được nộp: 409 |
| DELETE | /film-rolls/{rollId}/frames/{id} | P | — | 204 | Frame đã được nộp: 409 |
| POST | /submissions | P | Multipart bên dưới | SubmissionResponse / 201 | Đăng ký APPROVED, còn hạn, category hợp lệ, chưa vượt quota |
| GET | /submissions/mine | P | — | SubmissionResponse[] / 200 | Chủ lấy từ principal |
| GET | /submissions/{id} | P/O/A | — | SubmissionResponse / 200 | Chủ hoặc quản lý cuộc thi |
| PUT | /submissions/{id} | P | Multipart; file/negativeFile tùy chọn | SubmissionResponse / 200 | Chỉ PENDING, còn hạn; không chuyển contest hoặc Frame |
| DELETE | /submissions/{id} | P | — | 204 | Chỉ PENDING, còn hạn |
| GET | /submissions | O/A | contestId tùy chọn | SubmissionResponse[] / 200 | Chỉ các cuộc thi được quản lý |
| PATCH | /submissions/{id}/status | O/A | status, reason JSON | SubmissionResponse / 200 | Chỉ PENDING → VERIFIED/REJECTED; REJECTED bắt buộc reason |

Lỗi trả `{ "message": "..." }`: 400 validation, 401 chưa xác thực, 403 sai vai trò/quản lý,
404 không tìm thấy/khác chủ, 409 trùng/tham chiếu/trạng thái/xung đột, 413 quá dung lượng,
502 cloud lỗi, 503 adapter hoặc cloud chưa cấu hình. Lỗi bất ngờ vẫn dùng handler chung,
không trả nội dung exception nội bộ cho client.



FilmRollRequest: `name, brand, iso, format, cameraBody, totalFrames`.
`usedFrameNumbers` trong response được tính từ bảng frames, không lưu nguồn dữ liệu thứ hai.
Nếu client cũ gửi danh sách này, chỉ chấp nhận đúng danh sách hiện tại (hoặc [] khi tạo mới);
gửi thay đổi trả 400 và hướng dẫn dùng API Frame. Frontend auth cần đổi hành vi nếu trước đây
chỉnh trực tiếp usedFrameNumbers; không tự sửa UI ngoài phạm vi.

SubmissionRequest multipart:

```text
contestId, title, description?, category, frameId?,
filmBrand, filmStock, iso, camera, lens, format, frameNumber,
shootingDate?, shootingLocation, developingLab, scanningSpecs,
file (bắt buộc khi tạo), negativeFile? (tùy chọn)
```



Response giữ imageUrls/thumbnailUrls/negativeUrls, metadata, status, rejectionReason, submittedAt;
thêm frameId, version, reviewedBy, reviewedAt. Tối đa một ảnh chính và một ảnh âm bản.
Thumbnail hiện dùng URL chính, chưa tạo derivative. contestTitle/authorName/authorEmail/AI/score/prize
còn null và resultPublished=false; đây là enrichment cần các thành viên khác, không giả dữ liệu.

## 7. Validation metadata và quy tắc trạng thái

Mười trường: filmBrand, filmStock, iso, camera, lens, format, frameNumber,
shootingLocation, developingLab, scanningSpecs. Chuỗi bắt buộc không null/rỗng/whitespace;
giới hạn độ dài nằm trong DTO; ISO nguyên dương; Frame nguyên dương tối đa 9 chữ số.
Không ép danh mục ISO/hãng phim/máy ảnh tự đặt. ShootingDate giữ làm trường bổ sung, không ở tương lai.
Đối chiếu metadata với hãng, ISO, camera, format và số Frame khi frameId được gắn.
Tài liệu schema dùng developingLaboratory/scanningSpecifications nhưng hợp đồng request thực tế
dùng developingLab/scanningSpecs; response dùng filmFormat/scanSpec như frontend auth.

| Tác nhân | Trạng thái/điều kiện | Hành vi |
|---|---|---|
| Thí sinh | PENDING, còn hạn theo TV2 | Sửa/xóa bài cá nhân |
| Thí sinh | VERIFIED hoặc REJECTED | 409, không thay đổi |
| Organizer/Admin | Quản lý đúng contest, bài PENDING | VERIFIED hoặc REJECTED |
| Organizer/Admin | Contest khác hoặc đã review | 403/409, không mở lại bài |
| Từ chối | Thiếu reason/whitespace | 400 |

Không sửa các bảng chấm điểm TV4. TV4 cần chỉ nhận bài VERIFIED;
TV3 không mở lại bài đã duyệt/từ chối nên không thay đổi dữ liệu chấm điểm đã chốt.

## 8. Upload Cloudinary và xử lý transaction

FilmRoll là khóa ổn định cho mọi thay đổi Frame và gắn Frame vào bài dự thi.
Submissions có khóa PESSIMISTIC_WRITE và `@Version`; dữ liệu được refresh sau khi khóa
để không duyệt theo entity PENDING cũ đã nằm trong persistence context.
UNIQUE bảo vệ Frame trùng ngay cả khi validation đọc dữ liệu chưa mới.
Không cho mở lại VERIFIED/REJECTED nên không thay đổi bài đã đưa vào chấm điểm.

Quota chưa thể tự khóa trên một bảng TV2 không tồn tại. Hợp đồng `ContestAccess.lockParticipation`
bắt buộc adapter TV2 khóa một hàng contest/registration ổn định trước khi đếm bài,
kể cả lần nộp đầu tiên. Thứ tự khóa: contest/registration → FilmRoll → Submission.
Adapter phải dùng cùng JPA transaction, locking read trước consistent snapshot ở MySQL REPEATABLE READ,
không dùng mutex trong JVM thay khóa DB. Việc kiểm thử quota đồng thời xuyên TV2 còn bị chặn.



Cloudinary nhận byte[] sau khi ImageIO xác minh nội dung thật, không tin MIME/filename.
Giới hạn mặc định 20 MiB và 60 triệu pixel; JPEG/PNG/TIFF/WebP theo decoder.
Reader có warning (ví dụ JPEG bị cắt cuối nhưng vẫn trả pixel) cũng bị từ chối.
Cấu hình maxBytes/maxPixels không hợp lệ bị chặn khi khởi tạo.
Public ID chỉ do server sinh: filmcontest-tv3/<UUID>. Khi xóa bắt buộc đúng pattern namespace;
không có API nhận public ID từ client. Chỉ coi destroy thành công khi provider trả ok/not found.
Provider error được chuyển thành 502 không chứa chi tiết/secret; constructor cấu hình qua env.

Hai ảnh đều validate trước upload. TransactionalImages chỉ xóa ảnh mới khi trạng thái transaction
là ROLLED_BACK; COMMITTED giữ ảnh mới và sau commit mới xóa ảnh cũ. UNKNOWN giữ cả tài nguyên
có thể đã commit, log để đối soát; không suy UNKNOWN thành rollback.
Upload lỗi/timeout hoặc runtime provider lỗi thử compensation bằng public ID đã biết.
Nếu cleanup thất bại log `Cloud cleanup requires retry: <id>`; cần vận hành retry idempotent.
Nếu process bị kill giữa upload/commit hoặc commit UNKNOWN, đối soát định kỳ prefix TV3 với
public ID trong submissions; chỉ xóa tài nguyên không tham chiếu sau khoảng chờ an toàn.
Chưa có worker/outbox bền vững vì không thêm bảng nghiệp vụ thứ tư; cần thống nhất nhóm trước production.
Cloud thật NOT RUN, toàn bộ test provider dùng mock, không upload tài khoản thật.

## 9. Danh sách file đã tạo/chỉnh sửa và dọn dẹp

| File | Trạng thái so với HEAD | Mục đích |
|---|---|---|
| `doc/vi/developer/backend-tv3.md` | Untracked (mã/tài liệu cần giữ) | Báo cáo TV3 duy nhất |
| `src/backend/.env.example` | Untracked (mã/tài liệu cần giữ) | Placeholder cấu hình DB/cloud, không chứa secret thật |
| `src/backend/compose.tv3.yml` | Untracked (mã/tài liệu cần giữ) | MySQL riêng project TV3, cổng loopback 3307 và volume riêng |
| `src/backend/pom.xml` | Modified | Thêm JPA/MySQL/Flyway, security-core đọc context, Cloudinary và decoder WebP; giữ Mongo hiện có |
| `src/backend/scripts/test-tv3.ps1` | Untracked (mã/tài liệu cần giữ) | Chạy clean verify bằng JDK 17/MySQL TV3, không gắn Docker socket |
| `src/backend/src/main/java/com/example/backend/tv3/dto/FilmRollRequest.java` | Untracked (mã/tài liệu cần giữ) | Hợp đồng request/response, validation metadata và tương thích tên trường frontend auth |
| `src/backend/src/main/java/com/example/backend/tv3/dto/FilmRollResponse.java` | Untracked (mã/tài liệu cần giữ) | Hợp đồng request/response, validation metadata và tương thích tên trường frontend auth |
| `src/backend/src/main/java/com/example/backend/tv3/dto/FrameRequest.java` | Untracked (mã/tài liệu cần giữ) | Hợp đồng request/response, validation metadata và tương thích tên trường frontend auth |
| `src/backend/src/main/java/com/example/backend/tv3/dto/FrameResponse.java` | Untracked (mã/tài liệu cần giữ) | Hợp đồng request/response, validation metadata và tương thích tên trường frontend auth |
| `src/backend/src/main/java/com/example/backend/tv3/dto/SubmissionRequest.java` | Untracked (mã/tài liệu cần giữ) | Hợp đồng request/response, validation metadata và tương thích tên trường frontend auth |
| `src/backend/src/main/java/com/example/backend/tv3/dto/SubmissionResponse.java` | Untracked (mã/tài liệu cần giữ) | Hợp đồng request/response, validation metadata và tương thích tên trường frontend auth |
| `src/backend/src/main/java/com/example/backend/tv3/dto/SubmissionStatusRequest.java` | Untracked (mã/tài liệu cần giữ) | Hợp đồng request/response, validation metadata và tương thích tên trường frontend auth |
| `src/backend/src/main/java/com/example/backend/tv3/entity/FilmMetadata.java` | Untracked (mã/tài liệu cần giữ) | Entity/embedded/status JPA của đúng ba bảng TV3; UUID, version và timestamps |
| `src/backend/src/main/java/com/example/backend/tv3/entity/FilmRoll.java` | Untracked (mã/tài liệu cần giữ) | Entity/embedded/status JPA của đúng ba bảng TV3; UUID, version và timestamps |
| `src/backend/src/main/java/com/example/backend/tv3/entity/Frame.java` | Untracked (mã/tài liệu cần giữ) | Entity/embedded/status JPA của đúng ba bảng TV3; UUID, version và timestamps |
| `src/backend/src/main/java/com/example/backend/tv3/entity/Submission.java` | Untracked (mã/tài liệu cần giữ) | Entity/embedded/status JPA của đúng ba bảng TV3; UUID, version và timestamps |
| `src/backend/src/main/java/com/example/backend/tv3/entity/SubmissionStatus.java` | Untracked (mã/tài liệu cần giữ) | Entity/embedded/status JPA của đúng ba bảng TV3; UUID, version và timestamps |
| `src/backend/src/main/java/com/example/backend/tv3/entity/Tv3Entity.java` | Untracked (mã/tài liệu cần giữ) | Entity/embedded/status JPA của đúng ba bảng TV3; UUID, version và timestamps |
| `src/backend/src/main/java/com/example/backend/tv3/integration/Actor.java` | Untracked (mã/tài liệu cần giữ) | Ranh giới TV1/TV2; đọc principal xác thực hoặc yêu cầu adapter thật, không bỏ qua kiểm tra |
| `src/backend/src/main/java/com/example/backend/tv3/integration/ContestAccess.java` | Untracked (mã/tài liệu cần giữ) | Ranh giới TV1/TV2; đọc principal xác thực hoặc yêu cầu adapter thật, không bỏ qua kiểm tra |
| `src/backend/src/main/java/com/example/backend/tv3/integration/CurrentActor.java` | Untracked (mã/tài liệu cần giữ) | Ranh giới TV1/TV2; đọc principal xác thực hoặc yêu cầu adapter thật, không bỏ qua kiểm tra |
| `src/backend/src/main/java/com/example/backend/tv3/repository/FilmRollRepository.java` | Untracked (mã/tài liệu cần giữ) | JPA truy vấn, kiểm tra ràng buộc và khóa dữ liệu TV3 |
| `src/backend/src/main/java/com/example/backend/tv3/repository/FrameRepository.java` | Untracked (mã/tài liệu cần giữ) | JPA truy vấn, kiểm tra ràng buộc và khóa dữ liệu TV3 |
| `src/backend/src/main/java/com/example/backend/tv3/repository/SubmissionRepository.java` | Untracked (mã/tài liệu cần giữ) | JPA truy vấn, kiểm tra ràng buộc và khóa dữ liệu TV3 |
| `src/backend/src/main/java/com/example/backend/tv3/service/FilmRollService.java` | Untracked (mã/tài liệu cần giữ) | Nghiệp vụ TV3 có transaction, quyền sở hữu, giới hạn, trạng thái và bảo vệ đồng thời |
| `src/backend/src/main/java/com/example/backend/tv3/service/FrameService.java` | Untracked (mã/tài liệu cần giữ) | Nghiệp vụ TV3 có transaction, quyền sở hữu, giới hạn, trạng thái và bảo vệ đồng thời |
| `src/backend/src/main/java/com/example/backend/tv3/service/IntegrationPorts.java` | Untracked (mã/tài liệu cần giữ) | Nghiệp vụ TV3 có transaction, quyền sở hữu, giới hạn, trạng thái và bảo vệ đồng thời |
| `src/backend/src/main/java/com/example/backend/tv3/service/SubmissionService.java` | Untracked (mã/tài liệu cần giữ) | Nghiệp vụ TV3 có transaction, quyền sở hữu, giới hạn, trạng thái và bảo vệ đồng thời |
| `src/backend/src/main/java/com/example/backend/tv3/storage/CloudinaryStorage.java` | Untracked (mã/tài liệu cần giữ) | Cloudinary qua interface, xác minh nội dung ảnh hoặc bù tài nguyên theo transaction |
| `src/backend/src/main/java/com/example/backend/tv3/storage/ImageStorage.java` | Untracked (mã/tài liệu cần giữ) | Cloudinary qua interface, xác minh nội dung ảnh hoặc bù tài nguyên theo transaction |
| `src/backend/src/main/java/com/example/backend/tv3/storage/ImageValidator.java` | Untracked (mã/tài liệu cần giữ) | Cloudinary qua interface, xác minh nội dung ảnh hoặc bù tài nguyên theo transaction |
| `src/backend/src/main/java/com/example/backend/tv3/storage/TransactionalImages.java` | Untracked (mã/tài liệu cần giữ) | Cloudinary qua interface, xác minh nội dung ảnh hoặc bù tài nguyên theo transaction |
| `src/backend/src/main/java/com/example/backend/tv3/web/FilmRollController.java` | Untracked (mã/tài liệu cần giữ) | REST API và thông báo lỗi/HTTP status trong phạm vi TV3 |
| `src/backend/src/main/java/com/example/backend/tv3/web/FrameController.java` | Untracked (mã/tài liệu cần giữ) | REST API và thông báo lỗi/HTTP status trong phạm vi TV3 |
| `src/backend/src/main/java/com/example/backend/tv3/web/SubmissionController.java` | Untracked (mã/tài liệu cần giữ) | REST API và thông báo lỗi/HTTP status trong phạm vi TV3 |
| `src/backend/src/main/java/com/example/backend/tv3/web/Tv3Exception.java` | Untracked (mã/tài liệu cần giữ) | REST API và thông báo lỗi/HTTP status trong phạm vi TV3 |
| `src/backend/src/main/java/com/example/backend/tv3/web/Tv3ExceptionHandler.java` | Untracked (mã/tài liệu cần giữ) | REST API và thông báo lỗi/HTTP status trong phạm vi TV3 |
| `src/backend/src/main/resources/application-tv3.properties` | Untracked (mã/tài liệu cần giữ) | Bật MySQL/Flyway với validate, cấu hình upload qua env, tắt index Mongo khi startup TV3 |
| `src/backend/src/main/resources/application.properties` | Modified | Giữ startup MongoDB mặc định bằng cách tắt auto-config JPA/MySQL ngoài profile TV3 |
| `src/backend/src/main/resources/db/tv3/V1__tv3_tables.sql` | Untracked (mã/tài liệu cần giữ) | Migration V1 chỉ tạo ba bảng nghiệp vụ TV3, FK/unique/check/index |
| `src/backend/src/test/java/com/example/backend/tv3/ApiContractTest.java` | Untracked (mã/tài liệu cần giữ) | Kiểm thử thực tế; fixture/mock chỉ trong test, chi tiết ở báo cáo test |
| `src/backend/src/test/java/com/example/backend/tv3/FilmRollFrameTest.java` | Untracked (mã/tài liệu cần giữ) | Kiểm thử thực tế; fixture/mock chỉ trong test, chi tiết ở báo cáo test |
| `src/backend/src/test/java/com/example/backend/tv3/ImageStorageTest.java` | Untracked (mã/tài liệu cần giữ) | Kiểm thử thực tế; fixture/mock chỉ trong test, chi tiết ở báo cáo test |
| `src/backend/src/test/java/com/example/backend/tv3/integration/AuthenticationBoundaryTest.java` | Untracked (mã/tài liệu cần giữ) | Test hồi quy adapter/security/cloud; fixture khác FQN TV1 |
| `src/backend/src/test/java/com/example/backend/tv3/MetadataTest.java` | Untracked (mã/tài liệu cần giữ) | Kiểm thử thực tế; fixture/mock chỉ trong test, chi tiết ở báo cáo test |
| `src/backend/src/test/java/com/example/backend/tv3/MySqlPersistenceTest.java` | Untracked (mã/tài liệu cần giữ) | Kiểm thử thực tế; fixture/mock chỉ trong test, chi tiết ở báo cáo test |
| `src/backend/src/test/java/com/example/backend/tv3/storage/CloudinaryStorageTest.java` | Untracked (mã/tài liệu cần giữ) | Test hồi quy adapter/security/cloud; fixture khác FQN TV1 |
| `src/backend/src/test/java/com/example/backend/tv3/SubmissionServiceTest.java` | Untracked (mã/tài liệu cần giữ) | Kiểm thử thực tế; fixture/mock chỉ trong test, chi tiết ở báo cáo test |

Đã xóa sau hợp nhất: ba báo cáo cũ backend-tv3-files.md, backend-tv3-handover.md,
backend-tv3-test-results.md. Đã xóa test stub `src/backend/src/test/java/com/example/backend/security/AuthenticatedUser.java`
vì trùng FQN TV1. AuthenticationBoundaryTest được chuyển từ package tv3 sang tv3.integration để
test seam package-private, giữ và mở rộng test thay vì xóa kiểm chứng. Không xóa mã/test/migration cần thiết.

## 10. Kết quả kiểm thử thực tế mới nhất

Lần chạy mới nhất: `mvn -B -ntp clean verify` trong Docker Maven 3.9.9/JDK 17,
MySQL 8.4 thật trên network filmcontest-tv3_default. Tổng **62 PASS, 0 FAIL, 0 ERROR, 0 SKIP**;
**10 integration test MySQL thật**. Không giữ con số 48 của lượt trước.

```text
[INFO] Tests run: 62, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
[INFO] Total time:  01:31 min
[INFO] Finished at: 2026-11-19T12:27:59Z
```

Log: `src/backend/target/tv3-review-run.log`; Surefire XML/TXT tại target/surefire-reports.
Đây là build artifacts không nằm trong nội dung dự kiến commit. SQL ERROR 1062/1451 trong
test unique/FK là lỗi cố ý được assert, không phải FAIL của suite.
Mỗi test dưới đây đã chạy trong suite mới nhất; chọn riêng bằng `mvn '-Dtest=Class#method' test`.
MySQL tests cần TV3_TEST_MYSQL_URL/USER/PASSWORD; thiếu URL sẽ SKIP và không được ghi nhận PASS MySQL.

| Test | Kết quả | Thời gian (giây) | Phạm vi |
|---|---|---|---|
| `ApiContractTest.returns401ForUnauthenticatedUser` | PASS | 15.784 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `ApiContractTest.multipartRejectsMissingMetadata` | PASS | 1.333 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `ApiContractTest.invalidJsonRollReturns400WithFieldName` | PASS | 0.679 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `ApiContractTest.multipartBindsFrontendFieldNamesAndReturns201` | PASS | 0.235 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `ApiContractTest.deleteReturns204AndConflictReturns409` | PASS | 0.071 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `ApiContractTest.optimisticConcurrencyConflictReturns409` | PASS | 0.061 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `FilmRollFrameTest.rollCrudUsesAuthenticatedOwner` | PASS | 1.77 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `FilmRollFrameTest.rejectsOutOfRangeFrame` | PASS | 0.038 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `FilmRollFrameTest.blocksDeleteReferencedFrame` | PASS | 0.01 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `FilmRollFrameTest.blocksDeleteReferencedRoll` | PASS | 0.007 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `FilmRollFrameTest.frameReadUpdateDelete` | PASS | 0.042 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `FilmRollFrameTest.blocksShrinkingRollPastExistingFrame` | PASS | 0.007 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `FilmRollFrameTest.usedNumbersCannotBeWrittenIndependently` | PASS | 0.006 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `FilmRollFrameTest.rejectsDuplicateFrame` | PASS | 0.006 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `FilmRollFrameTest.validFrameCreate` | PASS | 0.007 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `FilmRollFrameTest.cannotAccessOtherOwnersRoll` | PASS | 0.005 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `ImageStorageTest.rejectsInvalidUploadLimitConfiguration` | PASS | 0.003 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `ImageStorageTest.verifiesActualContentInsteadOfMimeOrName` | PASS | 0.127 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `ImageStorageTest.rollbackDeletesNewAssetsAndCommitKeepsOldUntilSuccess` | PASS | 0.095 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `ImageStorageTest.noCloudCredentialsFailsClosed` | PASS | 0.144 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `ImageStorageTest.successfulCommitDeletesOnlyOldAsset` | PASS | 0.004 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `ImageStorageTest.rejectsTruncatedJpegEvenIfDecoderReturnsPartialPixels` | PASS | 0.015 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `ImageStorageTest.unknownCommitOutcomeNeverDeletesPotentiallyCommittedImage` | PASS | 0.012 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `ImageStorageTest.rejectsEmptyOversizeAndTooManyPixels` | PASS | 0.005 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `AuthenticationBoundaryTest.rejectsMissingIdAndNullRole` | PASS | 0.037 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `AuthenticationBoundaryTest.rejectsMissingAuthentication` | PASS | 0.002 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `AuthenticationBoundaryTest.missingTv2AdapterFailsClosed` | PASS | 0.184 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `AuthenticationBoundaryTest.rejectsGenericSpringPrincipal` | PASS | 0.001 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `AuthenticationBoundaryTest.rejectsMismatchedAuthorities` | PASS | 0.001 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `AuthenticationBoundaryTest.productionResolverRejectsTestFixture` | PASS | 0.001 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `AuthenticationBoundaryTest.readsContractAndEnforcesAllowedRole` | PASS | 0.002 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `AuthenticationBoundaryTest.rejectsUnauthenticatedToken` | PASS | 0.006 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `MetadataTest.rollAndFrameValidation` | PASS | 0.141 | Bean Validation thật |
| `MetadataTest.rejectsOversizeMetadataBadFrameAndFutureDate` | PASS | 0.045 | Bean Validation thật |
| `MetadataTest.validTenFieldsAndOptionalShootingDate` | PASS | 0.002 | Bean Validation thật |
| `MetadataTest.everyRequiredMetadataRejectsNullAndWhitespace` | PASS | 0.037 | Bean Validation thật |
| `MySqlPersistenceTest.realRollbackKeepsOldCloudImageAndRemovesNewUpload` | PASS | 0.89 | JPA/MySQL/transaction thật; identity/TV2/cloud mock |
| `MySqlPersistenceTest.migrationAndCrudOnRealMySql` | PASS | 0.16 | JPA/MySQL/transaction thật; identity/TV2/cloud mock |
| `MySqlPersistenceTest.concurrentFrameClaimsAreRejectedByMySqlUniqueConstraint` | PASS | 0.148 | JPA/MySQL/transaction thật; identity/TV2/cloud mock |
| `MySqlPersistenceTest.uniqueFrameNumberEnforcedByDatabase` | PASS | 0.026 | JPA/MySQL/transaction thật; identity/TV2/cloud mock |
| `MySqlPersistenceTest.participantEditAndOrganizerReviewCannotOverwriteFinalStatus` | PASS | 0.536 | JPA/MySQL/transaction thật; identity/TV2/cloud mock |
| `MySqlPersistenceTest.concurrentReviewsSerializeAndSecondSeesFinalState` | PASS | 0.062 | JPA/MySQL/transaction thật; identity/TV2/cloud mock |
| `MySqlPersistenceTest.frameCannotBeUsedByTwoSubmissions` | PASS | 0.035 | JPA/MySQL/transaction thật; identity/TV2/cloud mock |
| `MySqlPersistenceTest.concurrentServiceReviewsOnlyOneSucceeds` | PASS | 0.06 | JPA/MySQL/transaction thật; identity/TV2/cloud mock |
| `MySqlPersistenceTest.referencedFrameCannotBeDeleted` | PASS | 0.042 | JPA/MySQL/transaction thật; identity/TV2/cloud mock |
| `MySqlPersistenceTest.rollbackLeavesNoPartialData` | PASS | 0.131 | JPA/MySQL/transaction thật; identity/TV2/cloud mock |
| `CloudinaryStorageTest.refusesForeignAndMalformedIdsBeforeContactingCloud` | PASS | 0.164 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `CloudinaryStorageTest.failedDeleteDoesNotPretendSuccessOrExposeProviderDetails` | PASS | 0.28 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `CloudinaryStorageTest.onlyConfirmedOrAlreadyMissingDeletesCountAsSuccess` | PASS | 0.008 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `CloudinaryStorageTest.runtimeProviderFailureIsSanitizedAndCompensated` | PASS | 0.017 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `SubmissionServiceTest.blocksReReviewAndPendingTransition` | PASS | 0.012 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `SubmissionServiceTest.submitsPendingAfterUpload` | PASS | 0.012 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `SubmissionServiceTest.rejectsQuota` | PASS | 0.009 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `SubmissionServiceTest.rejectionRequiresReasonAndStoresIt` | PASS | 0.008 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `SubmissionServiceTest.blocksWrongOrganizer` | PASS | 0.011 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `SubmissionServiceTest.reviewVerified` | PASS | 0.011 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `SubmissionServiceTest.finalStatusesCannotBeEditedOrDeleted(SubmissionStatus)[1]` | PASS | 0.074 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `SubmissionServiceTest.finalStatusesCannotBeEditedOrDeleted(SubmissionStatus)[2]` | PASS | 0.006 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `SubmissionServiceTest.rejectsUnapprovedRegistrationBeforeUpload` | PASS | 0.005 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `SubmissionServiceTest.blocksOtherParticipant` | PASS | 0.004 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `SubmissionServiceTest.rejectsClosedContestBeforeUpload` | PASS | 0.005 | Unit/MockMvc/contract; không JWT hoặc cloud thật |
| `SubmissionServiceTest.validatesBothFilesBeforeAnyUpload` | PASS | 0.008 | Unit/MockMvc/contract; không JWT hoặc cloud thật |

Test metadata thử đủ 10 trường với null/rỗng/whitespace/ISO âm hoặc 0. Test song song gồm
hai review, hai claims cùng Frame và participant edit đối đầu organizer review; kiểm tra trạng thái,
nội dung cuối cùng và xung đột 409, không chỉ kiểm tra số lượng request thành công.
Test rollback thật dùng TransactionTemplate/MySQL và cloud mock để kiểm tra ảnh mới được thu hồi,
ảnh cũ được giữ khi transaction thất bại. Provider mock không chứng minh upload cloud thực tế.

Smoke test JAR mới đã chạy sau clean build: log `Started BackendApplication in 18.016 seconds`.
Gọi thực tế `curl.exe -s -i http://localhost:8081/api/film-rolls` trả:

```text
HTTP/1.1 401
Content-Type: application/json
{"message":"Vui lòng đăng nhập bằng JWT của TV1"}
```

`SHOW TABLES` trả film_rolls, frames, submissions và bảng kỹ thuật flyway_tv3_history;
truy vấn history trả version=1, success=1. JAR chứa CurrentActor.class và không chứa
AuthenticatedUser.class của test. MongoDB User cũ vẫn có monitor báo không kết nối localhost:27017;
không chặn TV3 khởi động, nhưng chức năng User cũ cần MongoDB như trước.
Đây chỉ là smoke test từ chối thiếu JWT, không phải kiểm chứng đăng nhập/nộp bài đầu cuối.
Bộ chờ startup dùng Invoke-WebRequest không nhận diện được status trong exception và hết cửa sổ chờ;
không ghi nhận bộ chờ đó PASS. Kết luận smoke test dựa trên log khởi động và lệnh curl riêng
trả HTTP 401 thực tế, cùng truy vấn MySQL riêng đã thành công.

## 11. Lỗi phát hiện và cách sửa

| File | Mức độ | Nguyên nhân/bằng chứng | Sửa và kiểm chứng |
|---|---|---|---|
| storage/TransactionalImages.java | Cao | status != COMMITTED xóa ảnh mới cả khi UNKNOWN, có thể xóa ảnh DB đã commit | Chỉ cleanup khi ROLLED_BACK; UNKNOWN log để đối soát; test unknownCommitOutcomeNeverDeletesPotentiallyCommittedImage và rollback thật |
| storage/CloudinaryStorage.java | Trung bình | destroy không giới hạn namespace; không có input public ID từ client nhưng DB ID sai có thể xóa tài nguyên ngoài TV3 | Pattern prefix/UUID trước gọi SDK; test refusesForeignAndMalformedIdsBeforeContactingCloud |
| storage/CloudinaryStorage.java | Trung bình | Bỏ qua response destroy; runtime provider lỗi không được bù/sanitize | Xác nhận ok/not found; lỗi khác 502; compensation khi runtime upload lỗi; 3 test SDK mock |
| storage/ImageValidator.java | Trung bình | JPEG reader có thể trả ảnh một phần kèm warning thay vì throw | Reject decode warning; test JPEG thiếu EOI; validate cấu hình giới hạn tránh overflow/giá trị âm |
| test/security/AuthenticatedUser.java | Trung bình (tích hợp) | Test fixture trùng FQN production TV1, có thể shadow class thật khi merge | Xóa stub; fixture tên riêng nested trong integration test; production resolver phải từ chối fixture |
| integration/CurrentActor.java | Trung bình (phòng ngừa) | Chỉ đọc role trong principal, chưa kiểm tra authority cùng role | Bắt buộc `ROLE_<role>` nhất quán với principal; test mismatch/null role/blank ID/unauthenticated |
| scripts/test-tv3.ps1 | Thấp | verify không clean có thể giữ bytecode/stale fixture từ test trước | Dùng clean verify; build mới không còn stub FQN TV1 |
| Ba báo cáo TV3 cũ | Thấp | Nội dung trùng và số liệu cũ dễ bị hiểu thành hiện tại | Hợp nhất thành file này, giữ lịch sử và phân biệt số liệu mới; kiểm tra liên kết trước xóa |

Không thay đổi URL/request/response frontend. Không sửa V1 đã áp dụng hoặc cấu trúc bảng thành viên khác.
Các file chung pom.xml/application*.properties/.env.example/compose vẫn giữ chức năng như trước;
không tìm thấy secret thật hoặc ddl-auto phá dữ liệu. Không chuẩn hóa newline hàng loạt:
file mới/sửa TV3 giữ UTF-8/LF, cảnh báo git chuyển CRLF↔LF được phân biệt với lỗi whitespace.

## 12. Vấn đề chưa hoàn thành hoặc chưa kiểm chứng

| Nội dung | Trạng thái | Điều kiện còn thiếu |
|---|---|---|
| JWT thật và HTTP có người dùng TV1 | BLOCKED | Nhánh chưa có JWT filter/security chain; không có fixture production |
| Contest/Category/APPROVED registration/lịch/quyền Organizer trên DB TV2 | BLOCKED | Chưa có bean ContestAccess thật và schema chính thức |
| Quota đồng thời xuyên TV2 | BLOCKED | Adapter cần khóa DB ổn định trước count; không giả bảng TV2 |
| Nộp bài đầy đủ JWT → TV2 → Cloudinary → DB | BLOCKED | Chưa đủ JWT/TV2/cloud credential |
| Cloudinary thật | NOT RUN | Không có credential được phép, không upload tài khoản thật |
| Foreign key tới user/contest/category | BLOCKED | Chưa chốt kiểu/tên PK MySQL; opaque ID chưa phải FK thật |
| Enrichment kết quả/AI/ActivityLog | NOT RUN | Ngoài phần nghiệp vụ TV3, chưa có hợp đồng chung |
| Cleanup cloud bền vững khi process chết/UNKNOWN | Chưa hoàn chỉnh production | Đã log/giữ ảnh an toàn, cần worker đối soát và chính sách retry |

Flyway phiên bản do Boot 3.3.4 quản lý cảnh báo MySQL 8.4 ngoài dải đã công bố kiểm thử;
verify/migration validation đã chạy thật nhưng nhóm cần thống nhất phiên bản trước triển khai chung.
WebP dùng native ImageIO plugin: lần build chạy Linux/JDK 17; chưa xác nhận decoder WebP trên mọi
Windows/CPU. Các API User hiện có ngoài package TV3 vẫn thuộc baseline MongoDB và chưa có JWT
trên nhánh này; không được coi toàn backend hiện tại đã được bảo vệ chỉ vì API TV3 fail closed.

## 13. Phụ thuộc TV1, TV2, TV4, TV5

| Thành viên | Việc cần cung cấp |
|---|---|
| TV1 | JWT filter/security chain thật; principal `com.example.backend.security.AuthenticatedUser` có id()/role(); hợp đồng ID MySQL. CurrentActor chỉ đọc principal từ SecurityContext, không triển khai JWT mới. Không còn test fixture cùng FQN TV1; CurrentActor yêu cầu authority ROLE_<role> cùng role principal. |
| TV2 | Bean ContestAccess thực: kiểm tra tồn tại, APPROVED registration, lịch, category, quota; khóa DB cùng transaction; quyền organizer/Admin và danh sách contest quản lý; schema PK/FK chính thức. |
| TV4 | Chỉ nhận bài VERIFIED, dùng submission ID/trạng thái/metadata; cung cấp enrichment kết quả nếu cần. Không có Evaluation/Assignment/Result implementation trong TV3. |
| TV5 | Thống nhất hook/event sau commit cho AI và ActivityLog. Hiện chưa phát sự kiện vì nhánh hiện tại không có hợp đồng chung. |

Thay đổi phần dùng chung chỉ gồm dependencies Maven và bật/tắt auto-configuration theo profile.
Các class mới nằm trong `com.example.backend.tv3` để tránh sao chép/chuyển đổi module của người khác.
JPA và MongoDB cùng tồn tại; profile tv3 không chuyển User sang MySQL.
Khởi động TV3 tắt auto-index Mongo để không cần thao tác index User; các API User cũ vẫn cần MongoDB.

## 14. Hướng dẫn build, chạy, Docker, MySQL và Cloudinary

Từ thư mục repository, kiểm tra cổng và thiết lập biến môi trường bằng giá trị của riêng bạn:

```powershell
Get-NetTCPConnection -LocalPort 3307 -ErrorAction SilentlyContinue
# Nếu có listener: dừng ở đây, chọn cổng riêng và sửa URL/Compose tương ứng.
$env:TV3_MYSQL_USER = 'filmcontest_tv3'
$env:TV3_MYSQL_PASSWORD = '<mat-khau-local-cua-ban>'
$env:TV3_MYSQL_ROOT_PASSWORD = '<mat-khau-root-rieng>'
docker compose -f src/backend/compose.tv3.yml up -d --wait
$env:TV3_MYSQL_URL = 'jdbc:mysql://localhost:3307/filmcontest_tv3?connectionTimeZone=UTC'
$env:SPRING_PROFILES_ACTIVE = 'tv3'
$env:CLOUDINARY_CLOUD_NAME = '<cloud-name>'
$env:CLOUDINARY_API_KEY = '<api-key>'
$env:CLOUDINARY_API_SECRET = '<api-secret>'
```

Compose chỉ dùng project `filmcontest-tv3`, volume `filmcontest-tv3_tv3_mysql_data`,
bind `127.0.0.1:3307`. Mật khẩu MySQL chỉ dùng lúc khởi tạo volume mới;
không thay mật khẩu biến môi trường rồi kỳ vọng volume cũ đổi mật khẩu.
Lượt triển khai trước đã tạo MySQL TV3 với mật khẩu ngẫu nhiên chỉ nằm trong môi trường container;
không in chúng trong báo cáo. Để tiếp tục dùng container đó, dùng `docker start filmcontest-tv3-mysql-1`
và lấy cấu hình qua Docker cục bộ, không khởi tạo/reset volume.

Khi máy có Maven và JDK 17:

```powershell
Set-Location src/backend
mvn test                  # MySQL tests skip nếu chưa đặt TV3_TEST_MYSQL_URL
mvn clean verify
mvn spring-boot:run
```

Spring Boot không tự đọc `.env`; `.env.example` chỉ là danh sách biến. Export chúng trong PowerShell.
Có thể build với JDK 17 trong container như lần kiểm thử này:

```powershell
docker run --rm --name filmcontest-tv3-build `
  -v "${PWD}:/work" -v filmcontest-tv3-maven-cache:/root/.m2 `
  -w /work/src/backend maven:3.9.9-eclipse-temurin-17 mvn -B -ntp clean verify
```

Để chạy MySQL tests trên **database kiểm thử riêng**, đặt:

```powershell
$env:TV3_TEST_MYSQL_URL = $env:TV3_MYSQL_URL
$env:TV3_TEST_MYSQL_USER = $env:TV3_MYSQL_USER
$env:TV3_TEST_MYSQL_PASSWORD = $env:TV3_MYSQL_PASSWORD
# Chỉ thực hiện nếu filmcontest_tv3 đang là DB kiểm thử riêng.
Set-Location src/backend
mvn test
```

Lệnh Docker thực tế tương đương khi Maven không có trên host: cho Maven vào network
`filmcontest-tv3_default`, URL `jdbc:mysql://mysql:3306/filmcontest_tv3?connectionTimeZone=UTC`,
truyền ba biến `TV3_TEST_MYSQL_*` bằng `-e NAME` (không ghi password trực tiếp vào lệnh).
Không gắn Docker socket. MySQL integration tests dùng DB thật, một số test concurrency commit
dữ liệu fixture ngẫu nhiên; không trỏ chúng vào database production.

Script tái chạy đúng cấu hình container đã dùng, không in mật khẩu:

```powershell
docker start filmcontest-tv3-mysql-1
.\src\backend\scripts\test-tv3.ps1
```

Sau khi TV1/TV2 đã tích hợp, lấy JWT bằng API TV1 rồi gọi:

```powershell
$headers = @{ Authorization = "Bearer $env:TV3_PARTICIPANT_JWT" }
Invoke-RestMethod 'http://localhost:8081/api/film-rolls' -Headers $headers
$body = @{name='Cuon 1';brand='Kodak';iso=200;format='35mm';cameraBody='Canon';totalFrames=36} | ConvertTo-Json
Invoke-RestMethod 'http://localhost:8081/api/film-rolls' -Method Post -Headers $headers -ContentType 'application/json' -Body $body
# Ví dụ multipart (cần contest/registration thật và credential cloud):
curl.exe -H "Authorization: Bearer $env:TV3_PARTICIPANT_JWT" `
  -F 'contestId=<contest-id>' -F 'title=Anh phim' -F 'category=<category>' `
  -F 'filmBrand=Kodak' -F 'filmStock=Gold' -F 'iso=200' -F 'camera=Canon' `
  -F 'lens=50mm' -F 'format=35mm' -F 'frameNumber=1' -F 'shootingLocation=Ha Noi' `
  -F 'developingLab=Lab' -F 'scanningSpecs=4000dpi' -F 'file=@C:\photos\scan.jpg' `
  http://localhost:8081/api/submissions
```

Hiện tại JWT/adapter chưa có, ví dụ nghiệp vụ trên chưa thể chạy thành công đầu cuối.
Không dùng header tự khai participantId, principal giả hoặc tắt quyền để chạy ví dụ.

Kiểm tra MySQL không cần in mật khẩu:

```powershell
'SHOW TABLES; SELECT version,success FROM flyway_tv3_history;' | docker exec -i filmcontest-tv3-mysql-1 sh -c 'export MYSQL_PWD=$MYSQL_PASSWORD; exec mysql --user=$MYSQL_USER filmcontest_tv3'
# Dừng riêng container TV3 nếu không dùng, giữ nguyên volume:
docker stop filmcontest-tv3-mysql-1
```

Không chạy down -v, prune, DROP DATABASE hoặc TRUNCATE. Không tác động SQL Server FamilyConnect.
File build target vốn được Git track từ trước được phục hồi về HEAD sau kiểm thử,
chỉ giữ mã nguồn/tài liệu trong thay đổi bàn giao; báo cáo Surefire vẫn nằm ở target/surefire-reports.

## 15. Tích hợp với backend chung

1. TV1 gắn JWT filter vào SecurityContext, principal FQN đúng hợp đồng, id()/role() và authority
   ROLE_PARTICIPANT/ROLE_ORGANIZER/ROLE_ADMIN tương ứng. CurrentActor không xác thực token tự nó.
   Khi chưa có filter/principal, nghiệp vụ TV3 trả 401; identity không lấy từ participantId client.
2. TV2 cung cấp ContestAccess bean thật cùng JPA transaction; kiểm tra quyền organizer trên từng contest
   và khóa hàng ổn định trước count quota. Không trả danh sách contest không quản lý hoặc mặc định duyệt đăng ký.
3. Thống nhất ID và migration/schema chung trước thêm FK. Không copy V1 sang Flyway history khác
   hoặc baseline nonempty schema tùy tiện. Sau khi V1 đã chạy chỉ thêm migration phiên bản mới.
4. Khi backend chung dùng JPA mặc định, nhóm cần đối chiếu spring.autoconfigure.exclude ở application.properties:
   hiện được dùng để bảo toàn startup MongoDB cũ; profile tv3 bật lại JPA. Không giữ exclusion này
   như chính sách chung cho toàn bộ module MySQL. Kiểm tra thứ tự profile khi phối hợp auth/tv3.
5. TV4 chỉ nhận VERIFIED, không mở lại bài đã đánh giá. Thống nhất enrichment/AI/log hook sau commit
   với TV4/TV5 mà không thêm logic chấm điểm/AI vào TV3.
6. Cấu hình credential cloud qua env được cấp phép; chạy test cloud thực riêng rồi mới nghiệm thu production.
   Không bật fixture hoặc adapter mock trong production.

## 16. Lịch sử chỉnh sửa TV3 và lưu ý trước merge

- 19/11/2026, lượt triển khai: 48 test PASS (7 MySQL), mvn verify, JAR startup và HTTP 401;
  đây là kết quả lịch sử, đã được thay bằng số liệu clean verify mới ở mục 10.
- Final review: đọc toàn bộ 32 class TV3, entities/DTO/repos/services/controllers/integration/storage,
  tất cả test, migration và cấu hình chung; sửa các lỗi tại mục 11; không loại bỏ dependency thiếu chứng cứ.
- Hợp đồng tham khảo giữ từ origin/feature/auth và tài liệu database: URL FilmRoll/Submission,
  metadata frontend Participant/Organizer và principal TV1; không merge code MongoDB/Security của nhánh đó.
- Hợp nhất toàn bộ thông tin còn hiệu lực của ba báo cáo cũ thành file này: chức năng, schema,
  API/hợp đồng frontend, transaction, phụ thuộc, từng file, kết quả test mới và cách chạy.
  Không duy trì bảng PASS cũ dưới nhãn hiện tại. Ba báo cáo cũ được xóa sau kiểm tra nội dung và liên kết.
- Trước merge: hoàn thiện các mục BLOCKED, kiểm tra profile/migration chung, giữ nguyên checksum V1,
  không stage target hoặc log, không stage secret. Lượt này không add/commit/push.
- Target đã track từ lịch sử được phục hồi về HEAD sau clean verify vì đầu lượt không có thay đổi
  tại đó. Không sửa .gitignore hoặc gỡ tracking hàng loạt. Log/Surefire ở target chỉ là bằng chứng local.

Kết thúc final review: vẫn ở `feature/backend-tv3`; `git diff --check` không báo lỗi whitespace.
Hai file đã track modified vẫn là pom.xml và application.properties từ lượt triển khai trước;
46 file untracked cần bàn giao được liệt kê ở mục 9 (tổng 48 file hiện có kể cả hai modified).
Không còn modified tracked file trong target. Không git add/commit/push.
Đã dừng `filmcontest-tv3-review-api` và `filmcontest-tv3-mysql-1`; không xóa volume/database,
không thao tác tài nguyên FamilyConnect. Chỉ còn một báo cáo riêng TV3 là file này.

File sửa trong riêng lượt review: CurrentActor.java; CloudinaryStorage.java; ImageValidator.java;
TransactionalImages.java; ImageStorageTest.java; MySqlPersistenceTest.java; test-tv3.ps1.
ApiContractTest.java chỉ được formatter chỉnh bố cục, không thay hành vi; giữ đủ các test API.
AuthenticationBoundaryTest.java chuyển sang tv3/integration và mở rộng kiểm tra; thêm
tv3/storage/CloudinaryStorageTest.java. Xóa stub test security/AuthenticatedUser.java và ba báo cáo cũ.
Kiểm tra newline phát hiện CRLF ở các file từ lượt cũ; chỉ chuẩn hóa LF cho bảy file đã chạm trong
review, không chuẩn hóa hàng loạt entity/DTO/module khác. Toàn bộ Java TV3 đã kiểm tra UTF-8,
newline cuối file và không trailing whitespace. Không chạy lại test cho thay đổi chỉ newline/tài liệu;
kết quả clean verify ở mục 10 áp dụng cho cùng mã Java có cùng hành vi.
