# 📐 Quy Tắc Code Dự Án (Coding Conventions)

> Hệ thống **Quản lý Cuộc thi Nhiếp ảnh Film**
> Backend: **Spring Boot 3 + MongoDB** (port `8081`) · Frontend: **Vite + React 19 + TypeScript + Tailwind CSS v4**

Mọi thành viên **bắt buộc** đọc và tuân thủ tài liệu này trước khi tạo Pull Request.

---

## 1. Quy tắc chung

| # | Quy tắc |
|---|---------|
| 1.1 | Encoding **UTF-8**, xuống dòng **LF**, file kết thúc bằng 1 dòng trống. |
| 1.2 | Thụt lề: **Java = 4 spaces**, **TS/TSX/CSS/JSON = 2 spaces**. Không dùng Tab. |
| 1.3 | Độ dài dòng tối đa **120 ký tự** (trừ chuỗi className Tailwind). |
| 1.4 | **Tên biến, hàm, class, file viết bằng tiếng Anh.** Text hiển thị cho người dùng & message lỗi viết **tiếng Việt**. |
| 1.5 | Comment giải thích **tại sao** (why), không giải thích **cái gì** (what). Comment có thể viết tiếng Việt. |
| 1.6 | Không commit code bị comment-out, `console.log`, `System.out.println` debug. |
| 1.7 | **Không commit secret** (`.env.local`, mật khẩu DB, API key). Chỉ commit `.env.example`. |
| 1.8 | Không để hard-code URL/port trong code — luôn đọc từ biến môi trường. |

---

## 2. Backend (Java / Spring Boot)

### 2.1. Cấu trúc package

```text
com.example.backend
├── config/        # @Configuration (CORS, Security, Mongo...)
├── controller/    # @RestController — chỉ nhận request, gọi service, trả response
├── service/       # @Service — toàn bộ business logic
├── repository/    # MongoRepository<Entity, String>
├── entity/        # @Document — ánh xạ collection MongoDB
├── dto/           # XxxRequest / XxxResponse
├── enums/         # Role, ContestStatus, SubmissionStatus...
└── exception/     # Custom exception + GlobalExceptionHandler
```

### 2.2. Đặt tên

| Thành phần | Quy tắc | Ví dụ |
|-----------|---------|-------|
| Class | `PascalCase` + hậu tố theo layer | `ContestController`, `ContestService`, `ContestRepository` |
| Entity | Danh từ số ít | `Contest`, `Submission`, `User` |
| DTO | `<Entity>Request` / `<Entity>Response` | `ContestRequest`, `ContestResponse` |
| Exception | `<Lý do>Exception` | `ResourceNotFoundException`, `DuplicateResourceException` |
| Method / biến | `camelCase`, động từ đứng đầu | `getContestById`, `createSubmission` |
| Hằng số | `UPPER_SNAKE_CASE` | `DEFAULT_ROLE`, `MAX_FILE_SIZE` |
| Collection MongoDB | `snake_case`, số nhiều | `@Document(collection = "contest_submissions")` |

### 2.3. Quy tắc phân lớp (bắt buộc)

```text
Controller  →  Service  →  Repository  →  MongoDB
   (DTO)        (DTO ↔ Entity)   (Entity)
```

- ❌ Controller **không** gọi trực tiếp Repository.
- ❌ Controller **không** trả về Entity — luôn trả về `XxxResponse`.
- ❌ Không viết business logic trong Controller.
- ✅ DTO viết bằng **`record`** (Java 17). Mapping Entity → DTO bằng static factory `XxxResponse.fromEntity(entity)` (theo mẫu [UserResponse.java](file:///c:/Users/pttho/Downloads/my_project/backend/src/main/java/com/example/backend/dto/UserResponse.java)).
- ✅ **Code mẫu chuẩn:** toàn bộ luồng `User` (controller → service → repository → entity → dto). Tạo tính năng mới hãy copy theo mẫu này.
- ✅ Dùng **constructor injection** với field `private final`. **Không** dùng `@Autowired` trên field.

```java
@Service
public class ContestService {
    private final ContestRepository contestRepository;

    public ContestService(ContestRepository contestRepository) {
        this.contestRepository = contestRepository;
    }
}
```

### 2.4. REST API

| Quy tắc | Ví dụ |
|---------|-------|
| Prefix `/api`, danh từ **số nhiều**, `kebab-case` | `/api/contests`, `/api/activity-logs` |
| Tài nguyên con lồng nhau tối đa 1 cấp | `/api/contests/{id}/submissions` |
| Đúng HTTP method | `GET` đọc · `POST` tạo · `PUT` cập nhật toàn bộ · `PATCH` cập nhật 1 phần · `DELETE` xóa |
| Đúng status code | `200` OK · `201` Created · `204` No Content · `400` Validation · `401/403` Auth · `404` Not Found · `409` Conflict · `500` Server |
| Request body phải có `@Valid` | `@Valid @RequestBody ContestRequest request` |

**Định dạng lỗi thống nhất** (frontend đang đọc `data.message`):

```json
{ "message": "Không tìm thấy cuộc thi với ID: 123" }
```

### 2.5. Validation & Exception

- Validation đặt ở **DTO Request** (`@NotBlank`, `@Email`, `@Size`, `@Min`...), message tiếng Việt.
- Service ném exception nghiệp vụ; **không** `try/catch` rồi nuốt lỗi.
- Mọi exception xử lý tập trung tại [GlobalExceptionHandler.java](file:///c:/Users/pttho/Downloads/my_project/backend/src/main/java/com/example/backend/exception/GlobalExceptionHandler.java).
- Lỗi `500` **không** trả `ex.getMessage()` ra client (tránh lộ thông tin) — chỉ log server.

### 2.6. Khác

- Giá trị cố định (role, trạng thái) dùng **`enum`**, không dùng String rời rạc (`"USER"`, `"ADMIN"`).
- Dùng `.toList()` (Java 16+) thay cho `.collect(Collectors.toList())`.
- Cấu hình nhạy cảm dùng placeholder: `${MONGODB_URI:mongodb://localhost:27017/...}`.
- Dùng SLF4J `Logger` để log, không dùng `System.out`.

---

## 3. Frontend (React / TypeScript / Tailwind)

### 3.1. Cấu trúc thư mục

```text
src/
├── main.tsx                 # Entry point
├── app/
│   ├── page.tsx             # Root — điều hướng giữa các portal
│   ├── globals.css          # Theme, CSS variables, utility dùng chung
│   └── <portal>/            # home | auth | admin | organizer | judge | participant
│       ├── page.tsx         # Trang chính của portal (default export)
│       └── components/      # Component chỉ dùng trong portal này
├── components/              # Component dùng chung ≥ 2 portal (Button, Modal, Badge...)
├── services/                # Gọi API — mỗi resource 1 file: userService.ts, contestService.ts
├── types/                   # Interface/type dùng chung: user.ts, contest.ts
├── hooks/                   # Custom hooks: useFetch.ts, useAuth.ts
└── utils/                   # Hàm thuần: formatDate.ts, calculateScore.ts
```

### 3.2. Đặt tên

| Thành phần | Quy tắc | Ví dụ |
|-----------|---------|-------|
| File component | `PascalCase.tsx` | `ScoringPanel.tsx`, `UserModal.tsx` |
| File trang | `page.tsx` | `app/judge/page.tsx` |
| File service / util / hook | `camelCase.ts` | `contestService.ts`, `useAuth.ts` |
| Component | `PascalCase` | `CreateContestForm` |
| Props interface | `<Component>Props` | `ScoringPanelProps` |
| Biến / hàm | `camelCase` | `selectedContest`, `handleSubmit` |
| Event handler | `handle<Event>` (bên trong) / `on<Event>` (props) | `handleSave` / `onSave` |
| Boolean | tiền tố `is/has/can/should` | `isLoading`, `hasError` |
| Hằng số | `UPPER_SNAKE_CASE` | `API_BASE_URL`, `MAX_SCORE` |
| Type union | `PascalCase` | `type Portal = 'HOME' \| 'AUTH' \| 'ADMIN'` |

### 3.3. Component

- Dùng **function component** + hooks. Không dùng class component.
- **Named export** cho component con, **default export** chỉ cho `page.tsx`.
- Một file = một component chính. File > **250 dòng** → tách nhỏ.
- Thứ tự trong component: `hooks (useState, useEffect...)` → `biến tính toán` → `handlers` → `return JSX`.

```tsx
interface ScoringPanelProps {
  submission: JudgeSubmission;
  onSave: () => void;
}

export function ScoringPanel({ submission, onSave }: ScoringPanelProps) {
  const [comment, setComment] = useState('');
  const total = calculateTotal(submission.scores);

  const handleSave = () => {
    onSave();
  };

  return <div>...</div>;
}
```

### 3.4. TypeScript

- ❌ **Cấm `any`** (kể cả `as any`). Dùng `unknown`, union type hoặc generic.
- ❌ Hạn chế non-null assertion `!` — chỉ dùng khi chắc chắn 100%.
- ✅ Type/interface dùng chung giữa nhiều file → đặt trong `src/types/`, **không** export type từ file component.
- ✅ Type phải khớp với `XxxResponse` của backend.
- ✅ Dùng utility types: `Omit<User, 'id'>`, `Partial<User>`, `Pick<...>`.

### 3.5. Gọi API

- **Chỉ** gọi API trong `src/services/` qua hàm `request()` của [apiClient.ts](file:///c:/Users/pttho/Downloads/my_project/frontend/src/services/apiClient.ts) — component **không** gọi `fetch` trực tiếp.
- Mỗi resource 1 service, theo mẫu [userService.ts](file:///c:/Users/pttho/Downloads/my_project/frontend/src/services/userService.ts).
- `VITE_API_URL` là base `/api` (vd: `http://localhost:8081/api`); service tự nối `/users`, `/contests`...
- Luôn xử lý 3 trạng thái: **loading / error / success** — dùng hook [useFetch.ts](file:///c:/Users/pttho/Downloads/my_project/frontend/src/hooks/useFetch.ts).
- Lỗi đọc từ `message` của backend (`apiClient` đã xử lý sẵn).

### 3.6. Styling (Tailwind v4)

- Dùng utility class của Tailwind; style dùng chung / theme đặt trong `globals.css`.
- Chuỗi class lặp lại ≥ 3 lần → tách thành **component** (vd: `<BackButton />`) hoặc class trong `globals.css` bằng `@apply`.
- Bảng màu chủ đạo: nền `zinc-900/950`, nhấn `amber-400/500`. Không tự ý thêm màu mới ngoài palette.
- Icon dùng duy nhất thư viện **`lucide-react`**.
- Thứ tự class gợi ý: `layout → box model → typography → màu → hiệu ứng → state (hover/focus)`.

### 3.7. Import order

```tsx
// 1. Thư viện bên ngoài
import { useState } from 'react';
import { Star } from 'lucide-react';
// 2. Module nội bộ (services, types, hooks, utils)
import { contestService } from '../../services/contestService';
import type { Contest } from '../../types/contest';
// 3. Component cùng cấp
import { ScoringPanel } from './components/ScoringPanel';
// 4. CSS
import './styles.css';
```

---

## 4. Git Workflow

### 4.1. Branch

| Loại | Format | Ví dụ |
|------|--------|-------|
| Tính năng | `feature/<mô-tả-ngắn>` | `feature/judge-scoring` |
| Sửa lỗi | `fix/<mô-tả-ngắn>` | `fix/login-redirect` |
| Refactor | `refactor/<mô-tả-ngắn>` | `refactor/user-service` |
| Tài liệu | `docs/<mô-tả-ngắn>` | `docs/update-readme` |

- `main`: code ổn định, **không push trực tiếp**.
- `develop`: nhánh tích hợp; mọi PR merge vào `develop`.

### 4.2. Commit message — [Conventional Commits](https://www.conventionalcommits.org/)

```text
<type>(<scope>): <mô tả ngắn, thì hiện tại>
```

| Type | Ý nghĩa |
|------|---------|
| `feat` | Thêm tính năng |
| `fix` | Sửa lỗi |
| `refactor` | Tái cấu trúc, không đổi hành vi |
| `style` | Format, khoảng trắng (không đổi logic) |
| `docs` | Tài liệu |
| `test` | Thêm/sửa test |
| `chore` | Cấu hình, dependency, build |

Ví dụ:

```text
feat(judge): add scoring panel with 3 criteria
fix(backend): return 409 when email already exists
refactor(frontend): extract BackButton component
```

### 4.3. Pull Request

- [ ] Tên PR theo format commit message.
- [ ] Mô tả: **làm gì, tại sao, cách test**, ảnh chụp nếu thay đổi UI.
- [ ] Frontend: `npm run lint` và `npm run build` **không lỗi**.
- [ ] Backend: `mvn clean verify` **không lỗi**.
- [ ] Không chứa file thừa (`target/`, `node_modules/`, `dist/`, `.env.local`, `*.tsbuildinfo`).
- [ ] Ít nhất **1 thành viên review & approve** trước khi merge.
- [ ] PR nhỏ gọn (< 400 dòng thay đổi nếu có thể).

---

## 5. Checklist nhanh trước khi commit

- [ ] Tên biến/hàm rõ nghĩa, bằng tiếng Anh
- [ ] Không có `any`, `console.log`, code comment-out
- [ ] Không hard-code URL, port, secret
- [ ] Controller không gọi Repository, không trả Entity
- [ ] Component không gọi `fetch` trực tiếp
- [ ] Đã xử lý loading / error
- [ ] Lint + build pass
