import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight,
  ClipboardCopy, Eye, FileImage, Filter, ImageOff, Info, Search,
  ShieldAlert, X, XCircle,
} from 'lucide-react';

/**
 * Admin > Bài dự thi (màn hình 04).
 * Chế độ xem và giám sát, KHÔNG duyệt/từ chối bài dự thi.
 * Mọi bản ghi và kết quả kiểm tra đều là DEMO, không đến từ API hay mô hình AI.
 * Theo SRS: việc xác minh/quyết định duyệt thuộc Organizer; AI chỉ hỗ trợ.
 */
type SubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'JUDGING';
type VerificationResult = 'PASS' | 'REVIEW' | 'FLAGGED';
type FilterStatus = 'ALL' | SubmissionStatus;

type FilmMetadata = {
  filmStock: string;
  iso: number;
  camera: string;
  lens: string;
  format: string;
  roll: string;
  frame: string;
  location: string;
  lab: string;
  scan: string;
  negativeReference?: string;
};

type Submission = {
  id: string;
  title: string;
  author: string;
  contest: string;
  submittedAt: string; // ISO date YYYY-MM-DD, dùng cho sắp xếp và lọc
  image: string;
  status: SubmissionStatus;
  duplicateCheck: VerificationResult;
  aiImageCheck: VerificationResult;
  metadataCheck: VerificationResult;
  metadata: FilmMetadata;
  reviewNote: string;
};

type DemoSubmission = Omit<Submission, 'metadata'> & {
  filmStock: string;
  iso: number;
  camera: string;
  format: string;
  roll: string;
  frame: string;
};

const IMAGE_URLS = [
  'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=400&q=75',
  'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=400&q=75',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=400&q=75',
  'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=400&q=75',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=400&q=75',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=75',
  'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=400&q=75',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=75',
];

// Dữ liệu giả riêng cho bước 10. Không đồng bộ với Dashboard/Users/Contests.
const DEMO_ROWS: DemoSubmission[] = [
  { id: 'SUB-001', title: 'Sài Gòn chiều mưa', author: 'Trần Thị Bình', contest: 'Analog Moments 2025', submittedAt: '2025-08-26', image: IMAGE_URLS[3], status: 'PENDING', duplicateCheck: 'PASS', aiImageCheck: 'PASS', metadataCheck: 'PASS', filmStock: 'Kodak Portra 400', iso: 400, camera: 'Nikon FM2', format: '35mm', roll: 'ROLL-001', frame: '24', reviewNote: 'Đang chờ Ban tổ chức kiểm tra thủ công.' },
  { id: 'SUB-002', title: 'Nắng cuối ngày', author: 'Nguyễn Văn C', contest: 'Film & City', submittedAt: '2025-06-25', image: IMAGE_URLS[5], status: 'APPROVED', duplicateCheck: 'PASS', aiImageCheck: 'PASS', metadataCheck: 'PASS', filmStock: 'Kodak Gold 200', iso: 200, camera: 'Canon AE-1', format: '35mm', roll: 'ROLL-002', frame: '12', reviewNote: 'Thông tin mẫu đã được đánh dấu hợp lệ.' },
  { id: 'SUB-003', title: 'Đường về', author: 'Lê Thu D', contest: 'The Vintage Look', submittedAt: '2025-07-20', image: IMAGE_URLS[2], status: 'REJECTED', duplicateCheck: 'FLAGGED', aiImageCheck: 'PASS', metadataCheck: 'REVIEW', filmStock: 'Ilford HP5 Plus', iso: 400, camera: 'Pentax K1000', format: '35mm', roll: 'ROLL-003', frame: '08', reviewNote: 'Bản ghi mẫu có cờ nghi ngờ ảnh tương đồng; không đại diện kết luận thật của AI.' },
  { id: 'SUB-004', title: 'Đỉnh núi', author: 'Phạm Văn E', contest: 'Nature on Film', submittedAt: '2025-08-18', image: IMAGE_URLS[0], status: 'JUDGING', duplicateCheck: 'PASS', aiImageCheck: 'PASS', metadataCheck: 'PASS', filmStock: 'Fujifilm Superia 400', iso: 400, camera: 'Olympus OM-1', format: '35mm', roll: 'ROLL-004', frame: '15', reviewNote: 'Bản ghi minh họa đang ở vòng chấm.' },
  { id: 'SUB-005', title: 'Nhịp phố', author: 'Đỗ Minh G', contest: 'Film & City', submittedAt: '2025-06-21', image: IMAGE_URLS[3], status: 'PENDING', duplicateCheck: 'PASS', aiImageCheck: 'REVIEW', metadataCheck: 'PASS', filmStock: 'Cinestill 800T', iso: 800, camera: 'Minolta X-700', format: '35mm', roll: 'ROLL-005', frame: '03', reviewNote: 'Dấu hiệu cần kiểm tra thêm chỉ mang tính minh họa.' },
  { id: 'SUB-006', title: 'Bình yên', author: 'Hồ Thị Lan', contest: 'Analog Moments 2025', submittedAt: '2025-08-24', image: IMAGE_URLS[6], status: 'APPROVED', duplicateCheck: 'PASS', aiImageCheck: 'PASS', metadataCheck: 'PASS', filmStock: 'Kodak Ektar 100', iso: 100, camera: 'Canon A-1', format: '35mm', roll: 'ROLL-006', frame: '26', reviewNote: 'Đã đánh dấu duyệt trong tập dữ liệu mẫu.' },
  { id: 'SUB-007', title: 'Sương sớm', author: 'Vũ Thanh Mai', contest: 'Black & White Stories', submittedAt: '2025-05-12', image: IMAGE_URLS[2], status: 'APPROVED', duplicateCheck: 'PASS', aiImageCheck: 'PASS', metadataCheck: 'PASS', filmStock: 'Ilford Delta 100', iso: 100, camera: 'Nikon F3', format: '35mm', roll: 'ROLL-007', frame: '06', reviewNote: 'Metadata đầy đủ trong dữ liệu mẫu.' },
  { id: 'SUB-008', title: 'Chân dung', author: 'Nguyễn Phú H', contest: 'The Vintage Look', submittedAt: '2025-07-09', image: IMAGE_URLS[7], status: 'JUDGING', duplicateCheck: 'PASS', aiImageCheck: 'PASS', metadataCheck: 'PASS', filmStock: 'Kodak Tri-X 400', iso: 400, camera: 'Yashica FX-3', format: '35mm', roll: 'ROLL-008', frame: '19', reviewNote: 'Bản ghi demo đang trong quá trình chấm.' },
  { id: 'SUB-009', title: 'Một chiều Hà Nội', author: 'Trịnh Gia K', contest: 'Analog Moments 2025', submittedAt: '2025-08-20', image: IMAGE_URLS[3], status: 'REJECTED', duplicateCheck: 'PASS', aiImageCheck: 'FLAGGED', metadataCheck: 'REVIEW', filmStock: 'Kodak Portra 160', iso: 160, camera: 'Leica M6', format: '35mm', roll: 'ROLL-009', frame: '33', reviewNote: 'Ví dụ cờ nghi ngờ ảnh AI; không chứng minh ảnh thật sự do AI tạo.' },
  { id: 'SUB-010', title: 'Mùa hoa', author: 'Trần Mỹ Linh', contest: 'Nature on Film', submittedAt: '2025-08-22', image: IMAGE_URLS[4], status: 'PENDING', duplicateCheck: 'REVIEW', aiImageCheck: 'PASS', metadataCheck: 'PASS', filmStock: 'Fujicolor C200', iso: 200, camera: 'Nikon FM10', format: '35mm', roll: 'ROLL-010', frame: '10', reviewNote: 'Cần xem ảnh tham chiếu khi kiểm duyệt.' },
  { id: 'SUB-011', title: 'Thành phố đêm', author: 'Lâm Minh P', contest: 'Film & City', submittedAt: '2025-06-27', image: IMAGE_URLS[3], status: 'JUDGING', duplicateCheck: 'PASS', aiImageCheck: 'PASS', metadataCheck: 'PASS', filmStock: 'Cinestill 800T', iso: 800, camera: 'Pentax MX', format: '35mm', roll: 'ROLL-011', frame: '17', reviewNote: 'Đang chấm theo dữ liệu mô phỏng.' },
  { id: 'SUB-012', title: 'Góc phố cũ', author: 'Đinh Văn Q', contest: 'Black & White Stories', submittedAt: '2025-05-03', image: IMAGE_URLS[7], status: 'APPROVED', duplicateCheck: 'PASS', aiImageCheck: 'PASS', metadataCheck: 'PASS', filmStock: 'Ilford HP5 Plus', iso: 400, camera: 'Canon FTb', format: '35mm', roll: 'ROLL-012', frame: '02', reviewNote: 'Bản ghi mẫu được duyệt.' },
];

const DEMO_SUBMISSIONS: Submission[] = DEMO_ROWS.map((row, index) => ({
  ...row,
  metadata: {
    filmStock: row.filmStock,
    iso: row.iso,
    camera: row.camera,
    lens: index % 2 === 0 ? '50mm f/1.8' : '35mm f/2.8',
    format: row.format,
    roll: row.roll,
    frame: row.frame,
    location: index % 2 === 0 ? 'TP. Hồ Chí Minh' : 'Hà Nội',
    lab: index % 2 === 0 ? 'Lab A (mẫu)' : 'Lab B (mẫu)',
    scan: 'JPEG · 3000 × 2000 px · 24-bit',
    negativeReference: index % 3 === 0 ? 'Có thông tin tham chiếu (mẫu)' : undefined,
  },
}));

const PAGE_SIZE = 6;
const fmt = new Intl.NumberFormat('vi-VN');
const formatDate = (date: string) => date.split('-').reverse().join('/');

const STATUS_TABS: { key: FilterStatus; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ duyệt' },
  { key: 'APPROVED', label: 'Đã duyệt' },
  { key: 'REJECTED', label: 'Bị từ chối' },
  { key: 'JUDGING', label: 'Đang chấm' },
];
const STATUS_INFO: Record<SubmissionStatus, { label: string; className: string }> = {
  PENDING: { label: 'Chờ duyệt', className: 'bg-amber-100 text-amber-700' },
  APPROVED: { label: 'Đã duyệt', className: 'bg-emerald-100 text-emerald-700' },
  REJECTED: { label: 'Bị từ chối', className: 'bg-rose-100 text-rose-700' },
  JUDGING: { label: 'Đang chấm', className: 'bg-blue-100 text-blue-700' },
};
const CHECK_INFO: Record<VerificationResult, { label: string; className: string }> = {
  PASS: { label: 'Không có cờ cảnh báo', className: 'text-emerald-700' },
  REVIEW: { label: 'Cần xem xét', className: 'text-amber-700' },
  FLAGGED: { label: 'Có cờ nghi ngờ', className: 'text-rose-700' },
};

function SubmissionThumbnail({ src, title, className = '' }: { src: string; title: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 ${className}`}>
      {failed ? (
        <ImageOff size={22} className="text-slate-400" aria-label="Không tải được ảnh minh họa" />
      ) : (
        <img src={src} alt={`Ảnh minh họa: ${title}`} loading="lazy"
          onError={() => setFailed(true)} className="h-full w-full object-cover" />
      )}
    </div>
  );
}

function VerificationLine({ label, result }: { label: string; result: VerificationResult }) {
  const item = CHECK_INFO[result];
  return (
    <div className={`flex items-start gap-1.5 text-xs ${item.className}`}>
      {result === 'PASS' ? <CheckCircle2 size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
        : result === 'REVIEW' ? <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          : <XCircle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />}
      <span><span className="font-semibold">{label}:</span> {result === 'PASS' && label.toLowerCase().includes('metadata') ? 'Đầy đủ (mẫu)' : item.label}</span>
    </div>
  );
}

function SubmissionDetail({ item, onClose }: { item: Submission; onClose: () => void }) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const status = STATUS_INFO[item.status];
  const metadataFields: [string, string][] = [
    ['Loại phim (Film stock)', item.metadata.filmStock],
    ['ISO', String(item.metadata.iso)],
    ['Thân máy (Camera)', item.metadata.camera],
    ['Ống kính (Lens)', item.metadata.lens],
    ['Định dạng phim', item.metadata.format],
    ['Mã cuộn phim', item.metadata.roll],
    ['Khung hình (Frame)', item.metadata.frame],
    ['Địa điểm chụp', item.metadata.location],
    ['Lab tráng phim', item.metadata.lab],
    ['Thông số scan', item.metadata.scan],
    ['Phim âm bản / contact sheet', item.metadata.negativeReference ?? 'Không cung cấp (tùy chọn)'],
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/65 p-3 sm:p-5"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="admin-submission-detail-title"
        className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Chi tiết bài dự thi · Dữ liệu mẫu</p>
            <h2 id="admin-submission-detail-title" className="mt-1 text-xl font-bold text-[#0B356B]">{item.title}</h2>
            <p className="mt-1 text-xs text-slate-500">Mã bài dự thi: {item.id}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng chi tiết bài dự thi"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"><X size={20} /></button>
        </div>
        <div className="space-y-5 p-5">
          <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
            <SubmissionThumbnail src={item.image} title={item.title} className="h-44 w-full" />
            <dl className="grid content-start gap-2 text-sm">
              <div><dt className="inline text-slate-500">Tác giả: </dt><dd className="inline font-semibold text-slate-800">{item.author}</dd></div>
              <div><dt className="inline text-slate-500">Cuộc thi: </dt><dd className="inline font-semibold text-slate-800">{item.contest}</dd></div>
              <div><dt className="inline text-slate-500">Ngày nộp: </dt><dd className="inline text-slate-800">{formatDate(item.submittedAt)}</dd></div>
              <div className="flex items-center gap-2"><dt className="text-slate-500">Trạng thái:</dt><dd><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span></dd></div>
            </dl>
          </div>
          <div>
            <h3 className="mb-2 font-bold text-[#0B356B]">Thông tin kỹ thuật ảnh phim (Metadata)</h3>
            <dl className="grid gap-2 sm:grid-cols-2">
              {metadataFields.map(([label, value]) => (
                <div key={label} className="rounded-lg bg-slate-50 px-3 py-2">
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="mt-1 break-words text-sm font-semibold text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-3 font-bold text-[#0B356B]">Thông tin xác minh (mô phỏng)</h3>
            <div className="space-y-2">
              <VerificationLine label="Ảnh trùng/tương đồng" result={item.duplicateCheck} />
              <VerificationLine label="Dấu hiệu ảnh tạo bởi AI" result={item.aiImageCheck} />
              <VerificationLine label="Đầy đủ metadata" result={item.metadataCheck} />
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-600">{item.reviewNote}</p>
            <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-blue-800">
              <Info size={15} className="mt-0.5 shrink-0" />
              Không có mô hình AI thực sự được chạy tại màn hình này. Kết quả AI chỉ là tín hiệu hỗ trợ; quyết định xác minh thuộc Ban tổ chức.
            </p>
          </div>
        </div>
        <div className="flex justify-end border-t border-slate-200 px-5 py-4">
          <button type="button" onClick={onClose}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700">Đóng</button>
        </div>
      </section>
    </div>
  );
}

export function SubmissionsView() {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');
  const [contestFilter, setContestFilter] = useState('ALL');
  const [verificationFilter, setVerificationFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [notice, setNotice] = useState('');

  const contests = [...new Set(DEMO_SUBMISSIONS.map((item) => item.contest))].sort((a, b) => a.localeCompare(b, 'vi'));
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('vi');
    return DEMO_SUBMISSIONS.filter((item) => {
      const flagged = [item.duplicateCheck, item.aiImageCheck, item.metadataCheck].some((value) => value !== 'PASS');
      return (statusFilter === 'ALL' || item.status === statusFilter)
        && (contestFilter === 'ALL' || item.contest === contestFilter)
        && (verificationFilter === 'ALL' || (verificationFilter === 'FLAGGED' ? flagged : !flagged))
        && (!term || [item.id, item.title, item.author, item.contest, item.metadata.filmStock]
          .some((value) => value.toLocaleLowerCase('vi').includes(term)));
    }).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  }, [contestFilter, search, statusFilter, verificationFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const items = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const currentIds = items.map((item) => item.id);
  const allOnPageSelected = currentIds.length > 0 && currentIds.every((id) => selectedIds.includes(id));
  const resetPage = () => setPage(1);

  const toggleOne = (id: string) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  };
  const togglePage = () => {
    setSelectedIds((current) => allOnPageSelected
      ? current.filter((id) => !currentIds.includes(id))
      : [...new Set([...current, ...currentIds])]);
  };
  const copySelected = async () => {
    try {
      await navigator.clipboard.writeText(selectedIds.join('\n'));
      setNotice(`Đã sao chép ${selectedIds.length} mã bài dự thi.`);
    } catch {
      setNotice('Không thể tự động sao chép. Vui lòng kiểm tra quyền Clipboard của trình duyệt.');
    }
  };

  return (
    <section aria-label="Giám sát bài dự thi" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-md bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
          Dữ liệu và kết quả AI minh họa — chưa kết nối API Java / MongoDB
        </span>
        <span className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
          Admin: chỉ xem và giám sát · Organizer phụ trách duyệt bài
        </span>
      </div>

      {notice && <div role="status" className="flex items-start justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <span>{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="Đóng thông báo" className="rounded p-1 hover:bg-blue-100"><X size={16}/></button>
      </div>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex gap-1 overflow-x-auto border-b border-slate-200 px-4 pt-3" role="tablist" aria-label="Lọc bài theo trạng thái">
          {STATUS_TABS.map((tab) => {
            const count = tab.key === 'ALL' ? DEMO_SUBMISSIONS.length : DEMO_SUBMISSIONS.filter((item) => item.status === tab.key).length;
            return (
              <button key={tab.key} type="button" role="tab" aria-selected={statusFilter === tab.key}
                onClick={() => { setStatusFilter(tab.key); resetPage(); }}
                className={`shrink-0 border-b-2 px-3 py-3 text-xs font-semibold sm:text-sm ${statusFilter === tab.key
                  ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-blue-600'}`}>
                {tab.label} ({fmt.format(count)})
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Tìm bài dự thi theo tiêu đề, tác giả hoặc mã bài</span>
            <Search size={17} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input type="search" value={search} onChange={(event) => { setSearch(event.target.value); resetPage(); }}
              placeholder="Tìm theo tiêu đề, tác giả, mã bài..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"/>
          </label>
          <label className="sr-only" htmlFor="admin-submission-contest">Chọn cuộc thi</label>
          <select id="admin-submission-contest" value={contestFilter} onChange={(event) => { setContestFilter(event.target.value); resetPage(); }}
            className="max-w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 md:max-w-56">
            <option value="ALL">Tất cả cuộc thi</option>
            {contests.map((contest) => <option key={contest} value={contest}>{contest}</option>)}
          </select>
          <button type="button" onClick={() => setShowFilters((value) => !value)}
            aria-expanded={showFilters} aria-controls="admin-submission-extra-filters"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50">
            <Filter size={16} aria-hidden="true"/> Bộ lọc
          </button>
        </div>
        {showFilters && <div id="admin-submission-extra-filters" className="flex flex-wrap items-end gap-3 border-t border-slate-100 bg-slate-50 px-4 py-3">
          <label className="space-y-1 text-xs font-semibold text-slate-600">
            <span>Kết quả kiểm tra mô phỏng</span>
            <select value={verificationFilter} onChange={(event) => { setVerificationFilter(event.target.value); resetPage(); }}
              className="block rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-800">
              <option value="ALL">Tất cả kết quả</option>
              <option value="CLEAR">Không có cờ cảnh báo</option>
              <option value="FLAGGED">Có cờ cần xem xét</option>
            </select>
          </label>
          <button type="button" onClick={() => { setStatusFilter('ALL'); setContestFilter('ALL'); setVerificationFilter('ALL'); setSearch(''); resetPage(); }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">Xóa bộ lọc</button>
        </div>}

        {selectedIds.length > 0 && <div className="flex flex-wrap items-center gap-3 border-t border-blue-100 bg-blue-50 px-4 py-2.5 text-sm text-blue-800">
          <span>Đã chọn {selectedIds.length} bài</span>
          <button type="button" onClick={copySelected} className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-3 py-1.5 font-semibold hover:bg-blue-100">
            <ClipboardCopy size={15}/> Sao chép mã
          </button>
          <button type="button" onClick={() => setSelectedIds([])} className="font-semibold hover:underline">Bỏ chọn</button>
        </div>}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-600">
              <tr>
                <th className="w-10 px-4 py-3"><input type="checkbox" aria-label="Chọn tất cả bài trên trang hiện tại" checked={allOnPageSelected} onChange={togglePage} disabled={items.length === 0} className="accent-blue-600"/></th>
                <th className="min-w-64 px-3 py-3">Ảnh dự thi</th>
                <th className="min-w-56 px-3 py-3">Thông tin kỹ thuật</th>
                <th className="min-w-52 px-3 py-3">Kiểm tra (mẫu)</th>
                <th className="px-3 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => {
                const status = STATUS_INFO[item.status];
                return <tr key={item.id} className="align-top hover:bg-blue-50/30">
                  <td className="px-4 py-4"><input type="checkbox" aria-label={`Chọn bài ${item.title}`} checked={selectedIds.includes(item.id)} onChange={() => toggleOne(item.id)} className="accent-blue-600"/></td>
                  <td className="px-3 py-3">
                    <div className="flex items-start gap-3">
                      <SubmissionThumbnail src={item.image} title={item.title} className="h-20 w-20" />
                      <div className="min-w-0 space-y-1">
                        <p className="font-semibold text-[#0B356B]">{item.title}</p>
                        <p className="text-xs text-slate-600">{item.author}</p>
                        <p className="text-xs text-blue-700">{item.contest}</p>
                        <p className="text-xs text-slate-500">{formatDate(item.submittedAt)} · {item.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs leading-5 text-slate-600">
                    <p><span className="font-semibold text-slate-700">Film:</span> {item.metadata.filmStock}</p>
                    <p><span className="font-semibold text-slate-700">Camera:</span> {item.metadata.camera}</p>
                    <p><span className="font-semibold text-slate-700">Format:</span> {item.metadata.format} · ISO {item.metadata.iso}</p>
                    <p><span className="font-semibold text-slate-700">Frame:</span> {item.metadata.frame} · {item.metadata.roll}</p>
                  </td>
                  <td className="space-y-2 px-3 py-3">
                    <VerificationLine label="Trùng/tương đồng" result={item.duplicateCheck}/>
                    <VerificationLine label="Dấu hiệu ảnh AI" result={item.aiImageCheck}/>
                    <VerificationLine label="Metadata" result={item.metadataCheck}/>
                  </td>
                  <td className="px-3 py-4"><span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span></td>
                  <td className="px-4 py-4 text-center">
                    <button type="button" onClick={() => setSelectedSubmission(item)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-blue-300 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                      aria-label={`Xem chi tiết bài ${item.title}`}><Eye size={15}/> Xem</button>
                  </td>
                </tr>;
              })}
            </tbody>
          </table>
          {items.length === 0 && <div className="flex flex-col items-center gap-2 p-12 text-center text-slate-500">
            <FileImage size={28}/><p className="font-semibold">Không tìm thấy bài dự thi phù hợp</p><p className="text-sm">Thử thay đổi từ khóa hoặc bộ lọc.</p>
          </div>}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>Hiển thị {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} – {Math.min(currentPage * PAGE_SIZE, filtered.length)} của {fmt.format(filtered.length)} bài dự thi mẫu</p>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
              aria-label="Trang trước" className="rounded-lg border border-slate-200 p-2 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={16}/></button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
              <button key={pageNumber} type="button" onClick={() => setPage(pageNumber)} aria-label={`Trang ${pageNumber}`}
                aria-current={currentPage === pageNumber ? 'page' : undefined}
                className={`min-w-8 rounded-lg px-2 py-2 text-xs font-semibold ${currentPage === pageNumber
                  ? 'bg-blue-600 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-blue-50'}`}>{pageNumber}</button>
            ))}
            <button type="button" onClick={() => setPage(Math.min(pageCount, currentPage + 1))} disabled={currentPage >= pageCount}
              aria-label="Trang sau" className="rounded-lg border border-slate-200 p-2 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight size={16}/></button>
          </div>
        </div>
      </div>
      <p className="flex items-start gap-2 text-xs leading-5 text-slate-500"><ShieldAlert size={15} className="mt-0.5 shrink-0"/>
        Cờ kiểm tra trong bản demo không chứng minh có ảnh trùng hay ảnh tạo bằng AI. Chỉ Organizer có quyền kiểm duyệt theo SRS.
      </p>
      {selectedSubmission && <SubmissionDetail item={selectedSubmission} onClose={() => setSelectedSubmission(null)}/>}
    </section>
  );
}
