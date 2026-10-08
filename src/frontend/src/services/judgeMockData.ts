import type {
  AssignedSubmission,
  ContestResultEntry,
  Evaluation,
  EvaluationHistoryItem,
  FilmMetadata,
  JudgeContest,
  JudgeNotification,
  JudgeProfile,
  JudgingCriterion,
} from '../types/judge';

// Dữ liệu mẫu cho Judge Portal khi backend chưa có API chấm thi. Xóa file này khi nối API thật.

function photo(seed: string, width: number, height: number, isGrayscale = false): string {
  return `https://picsum.photos/seed/${seed}/${width}/${height}${isGrayscale ? '?grayscale' : ''}`;
}

const BASIC_CRITERIA: JudgingCriterion[] = [
  { id: 'cr-composition', name: 'Bố cục', description: 'Sắp xếp chủ thể, đường dẫn, cân bằng khung hình', maxScore: 10, weight: 20 },
  { id: 'cr-light', name: 'Ánh sáng', description: 'Cách khai thác và kiểm soát ánh sáng', maxScore: 10, weight: 20 },
  { id: 'cr-idea', name: 'Nội dung / Ý tưởng', description: 'Thông điệp, khả năng kể chuyện', maxScore: 10, weight: 20 },
  { id: 'cr-aesthetic', name: 'Tính thẩm mỹ', description: 'Cảm xúc và giá trị nghệ thuật tổng thể', maxScore: 10, weight: 20 },
  { id: 'cr-film', name: 'Kỹ thuật nhiếp ảnh phim', description: 'Phơi sáng, độ hạt, dải tông, chất lượng scan', maxScore: 10, weight: 20 },
];

const FILM_CRITERIA: JudgingCriterion[] = [
  { id: 'cr-creativity', name: 'Sáng tạo nghệ thuật', description: 'Góc nhìn mới, cá tính tác giả', maxScore: 10, weight: 25 },
  { id: 'cr-composition', name: 'Bố cục', description: 'Sắp xếp chủ thể, đường dẫn, cân bằng khung hình', maxScore: 10, weight: 20 },
  { id: 'cr-story', name: 'Khả năng kể chuyện', description: 'Bức ảnh truyền tải câu chuyện về đô thị', maxScore: 10, weight: 20 },
  { id: 'cr-grain', name: 'Độ hạt & dải tông', description: 'Đặc trưng hạt phim, chi tiết vùng sáng/tối', maxScore: 10, weight: 20 },
  { id: 'cr-scan', name: 'Chất lượng bản quét', description: 'Độ nét, màu sắc, bụi xước khi scan', maxScore: 10, weight: 15 },
];

export const mockProfile: JudgeProfile = {
  id: 'judge-01',
  fullName: 'Trần Thị Bình',
  email: 'tranthibinh@filmcontest.vn',
  phone: '0901 234 567',
  specialty: 'Nhiếp ảnh phim',
  yearsOfExperience: 12,
  bio: 'Nhiếp ảnh gia và giám khảo các cuộc thi nhiếp ảnh phim trong và ngoài nước. Quan tâm đặc biệt tới ảnh đường phố và chân dung đen trắng.',
  avatarUrl: '',
};

export const mockContests: Omit<JudgeContest, 'assignedCount' | 'evaluatedCount'>[] = [
  {
    id: 'ct-analog',
    title: 'Analog Moments 2025',
    coverUrl: photo('analog-moments', 480, 320),
    startDate: '2025-06-01',
    endDate: '2025-09-30',
    status: 'JUDGING',
    currentRound: { id: 'rd-analog-1', name: 'Vòng sơ khảo', order: 1, startDate: '2025-10-01', endDate: '2025-10-15' },
    criteria: BASIC_CRITERIA,
    isResultPublished: false,
  },
  {
    id: 'ct-city',
    title: 'Film & City',
    coverUrl: photo('film-city', 480, 320, true),
    startDate: '2025-08-15',
    endDate: '2025-11-30',
    status: 'JUDGING',
    currentRound: { id: 'rd-city-2', name: 'Vòng chung khảo', order: 2, startDate: '2025-12-01', endDate: '2025-12-20' },
    criteria: FILM_CRITERIA,
    isResultPublished: false,
  },
  {
    id: 'ct-vintage',
    title: 'The Vintage Look',
    coverUrl: photo('vintage-look', 480, 320),
    startDate: '2025-07-10',
    endDate: '2025-09-30',
    status: 'NOT_STARTED',
    currentRound: { id: 'rd-vintage-1', name: 'Vòng sơ khảo', order: 1, startDate: '2025-10-20', endDate: '2025-11-05' },
    criteria: BASIC_CRITERIA,
    isResultPublished: false,
  },
  {
    id: 'ct-mono',
    title: 'Monochrome Stories 2024',
    coverUrl: photo('monochrome-stories', 480, 320, true),
    startDate: '2024-03-01',
    endDate: '2024-05-31',
    status: 'COMPLETED',
    currentRound: { id: 'rd-mono-2', name: 'Vòng chung khảo', order: 2, startDate: '2024-06-10', endDate: '2024-06-25' },
    criteria: BASIC_CRITERIA,
    isResultPublished: true,
  },
];

interface SubmissionSeed {
  id: string;
  contestId: string;
  title: string;
  authorName: string | null;
  category: string;
  description: string;
  submittedAt: string;
  isGrayscale: boolean;
  metadata: FilmMetadata;
}

const SUBMISSION_SEEDS: SubmissionSeed[] = [
  {
    id: 'sb-01', contestId: 'ct-analog', title: 'Chiều bên hồ', authorName: 'Nguyễn Văn A', category: 'Phong cảnh',
    description: 'Một buổi chiều yên bình bên hồ, ánh nắng cuối ngày phản chiếu trên mặt nước, tạo nên khung cảnh thơ mộng.',
    submittedAt: '2025-06-10', isGrayscale: false,
    metadata: { filmStock: 'Kodak Portra 400', iso: 400, cameraBody: 'Canon AE-1', lens: '50mm f/1.8', filmFormat: '35mm', frameNumber: '12', shootingDate: '2025-05-15', shootingLocation: 'Hồ Tuyền Lâm, Đà Lạt', developingLab: 'Lab Sài Gòn', scanSpec: 'Epson V600 (3200dpi)' },
  },
  {
    id: 'sb-02', contestId: 'ct-analog', title: 'Góc phố cũ', authorName: 'Lê Minh Cường', category: 'Đường phố',
    description: 'Con hẻm nhỏ ở phố cổ, nơi thời gian dường như ngừng lại giữa những bức tường rêu phong.',
    submittedAt: '2025-06-08', isGrayscale: true,
    metadata: { filmStock: 'Ilford HP5+', iso: 400, cameraBody: 'Nikon FM2', lens: '35mm f/2', filmFormat: '35mm', frameNumber: '24', shootingDate: '2025-04-02', shootingLocation: 'Phố cổ Hội An', developingLab: 'Hanoi Film Lab', scanSpec: 'Noritsu HS-1800 (3000px)' },
  },
  {
    id: 'sb-03', contestId: 'ct-analog', title: 'Ánh sáng cuối ngày', authorName: 'Phạm Thị Dung', category: 'Chân dung',
    description: 'Chân dung cô gái trong ánh nắng vàng cuối ngày, khoảnh khắc lặng lẽ và tự nhiên.',
    submittedAt: '2025-06-05', isGrayscale: false,
    metadata: { filmStock: 'Fujifilm Superia 400', iso: 400, cameraBody: 'Olympus OM-1', lens: '50mm f/1.4', filmFormat: '35mm', frameNumber: '7', shootingDate: '2025-05-20', shootingLocation: 'Quận 1, TP.HCM', developingLab: 'Lab Sài Gòn', scanSpec: 'Fuji Frontier SP-3000' },
  },
  {
    id: 'sb-04', contestId: 'ct-analog', title: 'Ga xưa', authorName: 'Đỗ Minh G', category: 'Kiến trúc',
    description: 'Nhà ga cổ với mái vòm và những ô cửa sổ đón nắng sớm.',
    submittedAt: '2025-06-02', isGrayscale: true,
    metadata: { filmStock: 'Kodak Tri-X 400', iso: 400, cameraBody: 'Minolta X-700', lens: '28mm f/2.8', filmFormat: '35mm', frameNumber: '3', shootingDate: '2025-03-11', shootingLocation: 'Ga Đà Lạt', developingLab: 'Tự tráng (HC-110)', scanSpec: 'Epson V850 (4800dpi)' },
  },
  {
    id: 'sb-05', contestId: 'ct-analog', title: 'Nhịp sống thành phố', authorName: 'Trần Văn H', category: 'Đời sống',
    description: 'Dòng người hối hả trên phố giờ tan tầm.',
    submittedAt: '2025-06-01', isGrayscale: false,
    metadata: { filmStock: 'CineStill 800T', iso: 800, cameraBody: 'Canon A-1', lens: '50mm f/1.4', filmFormat: '35mm', frameNumber: '18', shootingDate: '2025-04-28', shootingLocation: 'Phố đi bộ Nguyễn Huệ', developingLab: 'Lab Sài Gòn', scanSpec: 'Noritsu HS-1800 (3000px)' },
  },
  {
    id: 'sb-06', contestId: 'ct-analog', title: 'Bình minh', authorName: 'Hoàng Minh K', category: 'Phong cảnh',
    description: 'Bình minh trên đồi chè, sương sớm còn phủ kín thung lũng.',
    submittedAt: '2025-05-31', isGrayscale: false,
    metadata: { filmStock: 'Kodak Ektar 100', iso: 100, cameraBody: 'Hasselblad 503CW', lens: '80mm f/2.8', filmFormat: '120 (6x6)', frameNumber: '5', shootingDate: '2025-02-14', shootingLocation: 'Mộc Châu, Sơn La', developingLab: 'Hanoi Film Lab', scanSpec: 'Hasselblad Flextight X1' },
  },
  {
    id: 'sb-07', contestId: 'ct-city', title: 'Cầu thang xoắn', authorName: 'Vũ Thanh L', category: 'Kiến trúc',
    description: 'Cầu thang xoắn ốc trong khu chung cư cũ nhìn từ trên xuống.',
    submittedAt: '2025-09-12', isGrayscale: true,
    metadata: { filmStock: 'Ilford Delta 3200', iso: 3200, cameraBody: 'Leica M6', lens: '28mm f/2', filmFormat: '35mm', frameNumber: '30', shootingDate: '2025-08-20', shootingLocation: 'Chung cư Tôn Thất Đạm', developingLab: 'Lab Sài Gòn', scanSpec: 'Plustek 8200i (3600dpi)' },
  },
  {
    id: 'sb-08', contestId: 'ct-city', title: 'Mưa đêm', authorName: 'Ngô Bảo M', category: 'Đường phố',
    description: 'Ánh đèn neon phản chiếu trên mặt đường ướt sau cơn mưa đêm.',
    submittedAt: '2025-09-30', isGrayscale: false,
    metadata: { filmStock: 'CineStill 800T', iso: 800, cameraBody: 'Contax G2', lens: '45mm f/2', filmFormat: '35mm', frameNumber: '14', shootingDate: '2025-09-05', shootingLocation: 'Chợ Lớn, TP.HCM', developingLab: 'Lab Sài Gòn', scanSpec: 'Fuji Frontier SP-3000' },
  },
  {
    id: 'sb-09', contestId: 'ct-city', title: 'Người bán hàng rong', authorName: 'Lý Thu N', category: 'Đời sống',
    description: 'Gánh hàng rong buổi sớm trên phố Hà Nội.',
    submittedAt: '2025-10-05', isGrayscale: false,
    metadata: { filmStock: 'Kodak Gold 200', iso: 200, cameraBody: 'Pentax K1000', lens: '50mm f/2', filmFormat: '35mm', frameNumber: '21', shootingDate: '2025-09-18', shootingLocation: 'Phố Hàng Mã, Hà Nội', developingLab: 'Hanoi Film Lab', scanSpec: 'Noritsu HS-1800 (3000px)' },
  },
  {
    id: 'sb-10', contestId: 'ct-city', title: 'Tầng thượng', authorName: 'Đặng Quốc P', category: 'Kiến trúc',
    description: 'Đường chân trời thành phố nhìn từ tầng thượng lúc hoàng hôn.',
    submittedAt: '2025-10-11', isGrayscale: false,
    metadata: { filmStock: 'Fujifilm Pro 400H', iso: 400, cameraBody: 'Mamiya 7II', lens: '80mm f/4', filmFormat: '120 (6x7)', frameNumber: '8', shootingDate: '2025-09-25', shootingLocation: 'Quận 4, TP.HCM', developingLab: 'Lab Sài Gòn', scanSpec: 'Epson V850 (4800dpi)' },
  },
  {
    id: 'sb-11', contestId: 'ct-vintage', title: 'Chiếc Vespa đỏ', authorName: 'Mai Anh Q', category: 'Đời sống',
    description: 'Chiếc Vespa đời cũ bên quán cà phê vỉa hè.',
    submittedAt: '2025-09-20', isGrayscale: false,
    metadata: { filmStock: 'Kodak ColorPlus 200', iso: 200, cameraBody: 'Yashica Electro 35', lens: '45mm f/1.7', filmFormat: '35mm', frameNumber: '16', shootingDate: '2025-08-30', shootingLocation: 'Đà Lạt', developingLab: 'Lab Sài Gòn', scanSpec: 'Noritsu HS-1800 (3000px)' },
  },
  {
    id: 'sb-12', contestId: 'ct-vintage', title: 'Hiệu ảnh xưa', authorName: 'Tôn Nữ R', category: 'Kiến trúc',
    description: 'Mặt tiền hiệu ảnh bốn mươi năm tuổi giữa lòng Sài Gòn.',
    submittedAt: '2025-09-28', isGrayscale: true,
    metadata: { filmStock: 'Fomapan 100', iso: 100, cameraBody: 'Rolleiflex 2.8F', lens: '80mm f/2.8', filmFormat: '120 (6x6)', frameNumber: '9', shootingDate: '2025-09-02', shootingLocation: 'Quận 3, TP.HCM', developingLab: 'Tự tráng (Rodinal)', scanSpec: 'Epson V850 (4800dpi)' },
  },
  {
    id: 'sb-13', contestId: 'ct-mono', title: 'Những con hẻm', authorName: 'Phan Gia S', category: 'Đường phố',
    description: 'Trẻ em chơi đùa trong con hẻm nhỏ dưới ánh nắng xiên.',
    submittedAt: '2024-05-10', isGrayscale: true,
    metadata: { filmStock: 'Kodak Tri-X 400', iso: 400, cameraBody: 'Leica M3', lens: '35mm f/2', filmFormat: '35mm', frameNumber: '11', shootingDate: '2024-04-01', shootingLocation: 'Quận 5, TP.HCM', developingLab: 'Lab Sài Gòn', scanSpec: 'Noritsu HS-1800 (3000px)' },
  },
  {
    id: 'sb-14', contestId: 'ct-mono', title: 'Chân dung ngư dân', authorName: 'Hồ Văn T', category: 'Chân dung',
    description: 'Gương mặt người ngư dân già sau chuyến biển đêm.',
    submittedAt: '2024-05-18', isGrayscale: true,
    metadata: { filmStock: 'Ilford HP5+', iso: 400, cameraBody: 'Pentax 67', lens: '105mm f/2.4', filmFormat: '120 (6x7)', frameNumber: '4', shootingDate: '2024-04-22', shootingLocation: 'Mũi Né, Bình Thuận', developingLab: 'Hanoi Film Lab', scanSpec: 'Hasselblad Flextight X1' },
  },
];

export const mockSubmissions: Omit<AssignedSubmission, 'evaluationStatus' | 'totalScore' | 'evaluatedAt'>[] =
  SUBMISSION_SEEDS.map((seed) => {
    const contest = mockContests.find((item) => item.id === seed.contestId);
    return {
      id: seed.id,
      contestId: seed.contestId,
      contestTitle: contest?.title ?? '',
      roundId: contest?.currentRound.id ?? '',
      roundName: contest?.currentRound.name ?? '',
      title: seed.title,
      authorName: seed.authorName,
      category: seed.category,
      description: seed.description,
      submittedAt: seed.submittedAt,
      imageUrls: [0, 1, 2, 3, 4].map((index) => photo(`${seed.id}-${index}`, 1200, 800, seed.isGrayscale)),
      thumbnailUrls: [0, 1, 2, 3, 4].map((index) => photo(`${seed.id}-${index}`, 240, 160, seed.isGrayscale)),
      negativeUrls: [0, 1, 2].map((index) => photo(`${seed.id}-neg-${index}`, 360, 240, true)),
      contactSheetUrl: photo(`${seed.id}-contact`, 900, 600, true),
      metadata: seed.metadata,
    };
  });

function scoresOf(criteria: JudgingCriterion[], values: number[]) {
  return criteria.map((criterion, index) => ({ criterionId: criterion.id, score: values[index] ?? 0 }));
}

export const mockEvaluations: Evaluation[] = [
  {
    submissionId: 'sb-04', roundId: 'rd-analog-1', scores: scoresOf(BASIC_CRITERIA, [9, 8, 8, 9, 9]),
    comment: 'Bố cục đối xứng tốt, khai thác ánh sáng tự nhiên rất tinh tế. Dải tông đen trắng giàu chi tiết.',
    recommendNextRound: true, status: 'FINALIZED', totalScore: 8.6, updatedAt: '2025-10-02',
  },
  {
    submissionId: 'sb-06', roundId: 'rd-analog-1', scores: scoresOf(BASIC_CRITERIA, [8, 9, 7, 8, 8]),
    comment: 'Màu phim Ektar thể hiện rất tốt sương sớm, tuy nhiên chủ thể chưa thật rõ ràng.',
    recommendNextRound: true, status: 'FINALIZED', totalScore: 8, updatedAt: '2025-10-03',
  },
  {
    submissionId: 'sb-02', roundId: 'rd-analog-1', scores: scoresOf(BASIC_CRITERIA, [7, 7, 8]),
    comment: '', recommendNextRound: false, status: 'DRAFT', totalScore: null, updatedAt: '2025-10-04',
  },
  {
    submissionId: 'sb-07', roundId: 'rd-city-2', scores: scoresOf(FILM_CRITERIA, [9, 10, 8, 9, 8]),
    comment: 'Góc nhìn độc đáo, hạt phim Delta 3200 tạo không khí rất riêng.',
    recommendNextRound: false, status: 'FINALIZED', totalScore: 8.9, updatedAt: '2025-12-03',
  },
  {
    submissionId: 'sb-13', roundId: 'rd-mono-2', scores: scoresOf(BASIC_CRITERIA, [9, 9, 9, 9, 9]),
    comment: 'Khoảnh khắc đắt giá, kể chuyện tự nhiên và giàu cảm xúc.',
    recommendNextRound: false, status: 'FINALIZED', totalScore: 9, updatedAt: '2024-06-20',
  },
  {
    submissionId: 'sb-14', roundId: 'rd-mono-2', scores: scoresOf(BASIC_CRITERIA, [8, 8, 9, 8, 8]),
    comment: 'Biểu cảm nhân vật mạnh mẽ, kỹ thuật medium format tốt.',
    recommendNextRound: false, status: 'FINALIZED', totalScore: 8.2, updatedAt: '2024-06-21',
  },
];

/** Lịch sử chấm các vòng trước của chính giám khảo này (không hiển thị điểm của giám khảo khác). */
export const mockPreviousRoundHistory: Record<string, EvaluationHistoryItem[]> = {
  'sb-07': [
    { roundName: 'Vòng sơ khảo', totalScore: 8.4, comment: 'Ý tưởng tốt, cần xem lại chất lượng scan.', recommendNextRound: true, evaluatedAt: '2025-11-05' },
  ],
  'sb-08': [
    { roundName: 'Vòng sơ khảo', totalScore: 8.1, comment: 'Không khí đêm mưa rất cuốn hút.', recommendNextRound: true, evaluatedAt: '2025-11-06' },
  ],
  'sb-13': [
    { roundName: 'Vòng sơ khảo', totalScore: 8.8, comment: 'Khoảnh khắc tự nhiên.', recommendNextRound: true, evaluatedAt: '2024-06-05' },
  ],
};

export const mockResults: Record<string, ContestResultEntry[]> = {
  'ct-mono': [
    { rank: 1, submissionTitle: 'Những con hẻm', authorName: 'Phan Gia S', averageScore: 9.1, award: 'Giải Nhất' },
    { rank: 2, submissionTitle: 'Chân dung ngư dân', authorName: 'Hồ Văn T', averageScore: 8.6, award: 'Giải Nhì' },
    { rank: 3, submissionTitle: 'Sương sớm Tam Đảo', authorName: 'Kiều Minh U', averageScore: 8.4, award: 'Giải Ba' },
    { rank: 4, submissionTitle: 'Chợ nổi', authorName: 'Lâm Thị V', averageScore: 8.1, award: 'Khuyến khích' },
    { rank: 5, submissionTitle: 'Bến đò', authorName: 'Quách Văn X', averageScore: 7.9, award: null },
  ],
};

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

export const mockNotifications: JudgeNotification[] = [
  { id: 'nt-1', type: 'ASSIGNMENT', message: 'Bạn được phân công chấm vòng sơ khảo cuộc thi Analog Moments 2025', createdAt: hoursAgo(2), isRead: false },
  { id: 'nt-2', type: 'DEADLINE', message: 'Hạn chấm điểm vòng sơ khảo Analog Moments 2025 còn 5 ngày', createdAt: hoursAgo(24), isRead: false },
  { id: 'nt-3', type: 'NEW_SUBMISSION', message: 'Có 4 bài dự thi mới được phân công trong cuộc thi Film & City', createdAt: hoursAgo(26), isRead: true },
  { id: 'nt-4', type: 'CRITERIA_UPDATE', message: 'Ban tổ chức đã cập nhật tiêu chí chấm cuộc thi Film & City', createdAt: hoursAgo(50), isRead: true },
];
