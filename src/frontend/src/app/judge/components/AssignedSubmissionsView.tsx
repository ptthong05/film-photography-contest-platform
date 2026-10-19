import { useMemo, useState } from 'react';
import { Filter, Search } from 'lucide-react';
import { judgeService } from '../../../services/judgeService';
import { useFetch } from '../../../hooks/useFetch';
import type { AssignedSubmission, EvaluationStatus } from '../../../types/judge';
import { AsyncState } from './AsyncState';
import { Pagination } from './Pagination';
import { SubmissionTable } from './SubmissionTable';

const PAGE_SIZE_OPTIONS = [6, 12, 24];

const STATUS_OPTIONS: { value: EvaluationStatus; label: string }[] = [
  { value: 'NOT_STARTED', label: 'Chưa chấm' },
  { value: 'DRAFT', label: 'Đang nháp' },
  { value: 'FINALIZED', label: 'Đã chấm' },
];

type StatusTab = 'ALL' | 'PENDING' | 'FINALIZED';

const TABS: { value: StatusTab; label: string; match: (item: AssignedSubmission) => boolean }[] = [
  { value: 'ALL', label: 'Tất cả', match: () => true },
  { value: 'PENDING', label: 'Chưa chấm', match: (item) => item.evaluationStatus !== 'FINALIZED' },
  { value: 'FINALIZED', label: 'Đã chấm', match: (item) => item.evaluationStatus === 'FINALIZED' },
];

interface AssignedSubmissionsViewProps {
  initialContestId: string | null;
  onStartScoring: (submissionId: string) => void;
  onViewDetail: (submissionId: string) => void;
}

export function AssignedSubmissionsView({ initialContestId, onStartScoring, onViewDetail }: AssignedSubmissionsViewProps) {
  const [tab, setTab] = useState<StatusTab>('ALL');
  const [keyword, setKeyword] = useState('');
  const [contestId, setContestId] = useState(initialContestId ?? '');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<EvaluationStatus | ''>('');
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(initialContestId !== null);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useFetch(judgeService.getAssignedSubmissions);

  const submissions = useMemo(() => data ?? [], [data]);
  const contestOptions = useMemo(
    () => [...new Map(submissions.map((item) => [item.contestId, item.contestTitle])).entries()],
    [submissions],
  );
  const categoryOptions = useMemo(() => [...new Set(submissions.map((item) => item.category))], [submissions]);

  // Số đếm trên tab tính sau khi áp các bộ lọc khác để khớp với danh sách người dùng đang nhìn thấy
  const filteredByFields = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return submissions.filter((item) => {
      const searchable = `${item.title} ${item.authorName ?? ''} ${item.metadata.filmStock} ${item.metadata.cameraBody}`.toLowerCase();
      return (
        (!normalizedKeyword || searchable.includes(normalizedKeyword)) &&
        (!contestId || item.contestId === contestId) &&
        (!category || item.category === category) &&
        (!status || item.evaluationStatus === status)
      );
    });
  }, [submissions, keyword, contestId, category, status]);

  const activeTab = TABS.find((item) => item.value === tab) ?? TABS[0];
  const visible = filteredByFields.filter(activeTab.match);
  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = visible.slice(startIndex, startIndex + pageSize);

  const resetPageAnd = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  return (
    <section className="judge-card p-5">
      <div className="flex gap-1 border-b border-slate-200" role="tablist">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={item.value === tab}
            onClick={() => resetPageAnd(setTab)(item.value)}
            className={`-mb-px cursor-pointer border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${item.value === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            {item.label} ({filteredByFields.filter(item.match).length})
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_180px_auto]">
        <label className="relative">
          <span className="sr-only">Tìm kiếm</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={keyword}
            onChange={(event) => resetPageAnd(setKeyword)(event.target.value)}
            placeholder="Tìm theo tên tác phẩm, tác giả, film stock..."
            className="judge-input w-full pl-9"
          />
        </label>
        <select value={category} onChange={(event) => resetPageAnd(setCategory)(event.target.value)} className="judge-input" aria-label="Lọc theo chủ đề">
          <option value="">Tất cả chủ đề</option>
          {categoryOptions.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(event) => resetPageAnd(setStatus)(event.target.value as EvaluationStatus | '')}
          className="judge-input"
          aria-label="Lọc theo trạng thái"
        >
          <option value="">Tất cả trạng thái</option>
          {STATUS_OPTIONS.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setIsMoreFiltersOpen((value) => !value)}
          aria-expanded={isMoreFiltersOpen}
          className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${isMoreFiltersOpen || contestId ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
        >
          <Filter className="h-4 w-4" /> Bộ lọc
        </button>
      </div>

      {isMoreFiltersOpen && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 p-3">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Cuộc thi:
            <select value={contestId} onChange={(event) => resetPageAnd(setContestId)(event.target.value)} className="judge-input">
              <option value="">Tất cả cuộc thi</option>
              {contestOptions.map(([id, title]) => (
                <option key={id} value={id}>{title}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="mt-4">
        <AsyncState isLoading={isLoading} error={error} onRetry={refetch} />
        {data && visible.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-500">Không có bài dự thi nào phù hợp với bộ lọc.</p>
        )}
        {data && visible.length > 0 && (
          <SubmissionTable
            submissions={pageItems}
            startIndex={startIndex}
            onStartScoring={onStartScoring}
            onViewDetail={onViewDetail}
          />
        )}
      </div>

      {visible.length > 0 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-slate-500">
            Hiển thị {startIndex + 1} - {startIndex + pageItems.length} của {visible.length} bài dự thi
          </p>
          <div className="flex items-center gap-3">
            <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
            <select
              value={pageSize}
              onChange={(event) => resetPageAnd(setPageSize)(Number(event.target.value))}
              className="judge-input py-1.5"
              aria-label="Số bài mỗi trang"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </section>
  );
}
