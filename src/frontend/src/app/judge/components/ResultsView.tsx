import { useState } from 'react';
import { judgeService } from '../../../services/judgeService';
import { useFetch } from '../../../hooks/useFetch';
import { AsyncState } from './AsyncState';
import { EvaluatedTable } from './EvaluatedTable';
import { FinalResultsTable } from './FinalResultsTable';
import { ScoreStatistics } from './ScoreStatistics';

type ResultTab = 'EVALUATED' | 'STATISTICS' | 'FINAL';

const TABS: { value: ResultTab; label: string }[] = [
  { value: 'EVALUATED', label: 'Bài đã chấm' },
  { value: 'STATISTICS', label: 'Thống kê điểm' },
  { value: 'FINAL', label: 'Kết quả chung cuộc' },
];

interface ResultsViewProps {
  onViewDetail: (submissionId: string) => void;
}

export function ResultsView({ onViewDetail }: ResultsViewProps) {
  const [tab, setTab] = useState<ResultTab>('EVALUATED');
  const [selectedContestId, setSelectedContestId] = useState('');
  const contests = useFetch(judgeService.getContests);
  const submissions = useFetch(judgeService.getAssignedSubmissions);
  const evaluations = useFetch(judgeService.getEvaluations);

  if (!contests.data || !submissions.data || !evaluations.data) {
    const error = contests.error ?? submissions.error ?? evaluations.error;
    const handleRetry = () => {
      void contests.refetch();
      void submissions.refetch();
      void evaluations.refetch();
    };
    return (
      <div className="judge-card">
        <AsyncState isLoading={!error} error={error} onRetry={handleRetry} />
      </div>
    );
  }

  const contest = contests.data.find((item) => item.id === selectedContestId) ?? contests.data[0];
  if (!contest) {
    return <div className="judge-card py-16 text-center text-sm text-slate-500">Bạn chưa được phân công cuộc thi nào.</div>;
  }

  const finalizedSubmissions = submissions.data.filter(
    (item) => item.contestId === contest.id && item.evaluationStatus === 'FINALIZED',
  );
  const contestEvaluations = evaluations.data.filter(
    (item) => item.status === 'FINALIZED' && finalizedSubmissions.some((submission) => submission.id === item.submissionId),
  );

  return (
    <section className="judge-card p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Cuộc thi:
          <select value={contest.id} onChange={(event) => setSelectedContestId(event.target.value)} className="judge-input">
            {contests.data.map((item) => (
              <option key={item.id} value={item.id}>{item.title}</option>
            ))}
          </select>
        </label>
        <p className="text-sm text-slate-500">
          Đã chấm <span className="font-semibold text-slate-800">{contest.evaluatedCount}/{contest.assignedCount}</span> bài · {contest.currentRound.name}
        </p>
      </div>

      <div className="mt-4 flex gap-1 overflow-x-auto border-b border-slate-200" role="tablist">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={item.value === tab}
            onClick={() => setTab(item.value)}
            className={`-mb-px cursor-pointer border-b-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap ${item.value === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === 'EVALUATED' && <EvaluatedTable submissions={finalizedSubmissions} evaluations={contestEvaluations} onViewDetail={onViewDetail} />}
        {tab === 'STATISTICS' && <ScoreStatistics criteria={contest.criteria} evaluations={contestEvaluations} />}
        {tab === 'FINAL' && <FinalResultsTable contestId={contest.id} isPublished={contest.isResultPublished} />}
      </div>
    </section>
  );
}
