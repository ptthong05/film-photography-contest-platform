import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight,
  ClipboardCopy, Eye, FileImage, Filter, ImageOff, Info, Search,
  ShieldAlert, X, XCircle,
} from 'lucide-react';
import { useFetch } from '../../../hooks/useFetch';
import { request } from '../../../services/apiClient';
import type { ApiContest } from '../../../services/contestService';
import type { ApiSubmission } from '../../../services/submissionService';

/**
 * Admin > Bài dự thi (màn hình 04).
 * Chế độ xem và giám sát, KHÔNG duyệt/từ chối bài dự thi.
 * Module AI chưa chạy nên kiểm tra trùng lặp và ảnh AI hiển thị "Chưa kiểm tra".
 * Theo SRS: việc xác minh/quyết định duyệt thuộc Organizer; AI chỉ hỗ trợ.
 */
type SubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'JUDGING';
type VerificationResult = 'PASS' | 'REVIEW' | 'FLAGGED' | 'NOT_RUN';
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

const NOT_DECLARED = 'Chưa khai báo';

const fetchSubmissions = async (): Promise<Submission[]> => {
  const [submissions, contests] = await Promise.all([
    request<ApiSubmission[]>('/submissions'),
    request<ApiContest[]>('/contests/managed'),
  ]);
  const stageById = new Map(contests.map((contest) => [contest.id, contest.status]));
  return submissions.map((item) => {
    const metadata = item.metadata;
    const isJudging = item.status === 'VERIFIED' && stageById.get(item.contestId) === 'JUDGING';
    const hasMetadata = Boolean(metadata?.filmStock && metadata.camera && metadata.filmFormat);
    return {
      id: item.code,
      title: item.title,
      author: item.authorName ?? NOT_DECLARED,
      contest: item.contestTitle ?? NOT_DECLARED,
      submittedAt: item.submittedAt.slice(0, 10),
      image: item.imageUrls[0] ?? '',
      status: isJudging ? 'JUDGING' : item.status === 'VERIFIED' ? 'APPROVED' : item.status,
      duplicateCheck: item.aiVerification ? (item.aiVerification.duplicate ? 'FLAGGED' : 'PASS') : 'NOT_RUN',
      aiImageCheck: item.aiVerification ? (item.aiVerification.aiGenerated ? 'FLAGGED' : 'PASS') : 'NOT_RUN',
      metadataCheck: hasMetadata ? 'PASS' : 'REVIEW',
      reviewNote: item.rejectionReason ?? '',
      metadata: {
        filmStock: metadata?.filmStock ?? NOT_DECLARED,
        iso: metadata?.iso ?? 0,
        camera: metadata?.camera ?? NOT_DECLARED,
        lens: metadata?.lens ?? NOT_DECLARED,
        format: metadata?.filmFormat ?? NOT_DECLARED,
        roll: metadata?.filmBrand ?? NOT_DECLARED,
        frame: metadata?.frameNumber ?? NOT_DECLARED,
        location: metadata?.shootingLocation ?? NOT_DECLARED,
        lab: metadata?.developingLab ?? NOT_DECLARED,
        scan: metadata?.scanSpec ?? NOT_DECLARED,
        negativeReference: item.negativeUrls.length ? 'Có ảnh âm bản' : undefined,
      },
    };
  });
};

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
  NOT_RUN: { label: 'Chưa kiểm tra', className: 'text-slate-500' },
};

function SubmissionThumbnail({ src, title, className = '' }: { src: string; title: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 ${className}`}>
      {failed ? (
        <ImageOff size={22} className="text-slate-400" aria-label="Không tải được ảnh" />
      ) : (
        <img src={src} alt={`Ảnh dự thi: ${title}`} loading="lazy"
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
      <span><span className="font-semibold">{label}:</span> {result === 'PASS' && label.toLowerCase().includes('metadata') ? 'Đầy đủ' : item.label}</span>
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
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Chi tiết bài dự thi</p>
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
  const { data, isLoading, error } = useFetch(fetchSubmissions);
  const submissions = useMemo(() => data ?? [], [data]);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');
  const [contestFilter, setContestFilter] = useState('ALL');
  const [verificationFilter, setVerificationFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [notice, setNotice] = useState('');

  const contests = [...new Set(submissions.map((item) => item.contest))].sort((a, b) => a.localeCompare(b, 'vi'));
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('vi');
    return submissions.filter((item) => {
      const flagged = [item.duplicateCheck, item.aiImageCheck, item.metadataCheck].some((value) => value !== 'PASS');
      return (statusFilter === 'ALL' || item.status === statusFilter)
        && (contestFilter === 'ALL' || item.contest === contestFilter)
        && (verificationFilter === 'ALL' || (verificationFilter === 'FLAGGED' ? flagged : !flagged))
        && (!term || [item.id, item.title, item.author, item.contest, item.metadata.filmStock]
          .some((value) => value.toLocaleLowerCase('vi').includes(term)));
    }).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  }, [contestFilter, search, statusFilter, verificationFilter, submissions]);

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
      {isLoading && <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>}
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-md bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
          Dữ liệu từ hệ thống · Module AI chưa hoạt động
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
            const count = tab.key === 'ALL' ? submissions.length : submissions.filter((item) => item.status === tab.key).length;
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
                <th className="min-w-52 px-3 py-3">Kiểm tra</th>
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
