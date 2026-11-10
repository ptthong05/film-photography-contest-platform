import { useState } from 'react';
import { AlertCircle, CircleCheck, Lock } from 'lucide-react';
import { Toast, type ToastNotice } from '../../../components/Toast';
import type { Evaluation, EvaluationRequest, JudgingCriterion } from '../../../types/judge';
import { calculateWeightedScore } from '../../../utils/calculateScore';
import { formatDate } from '../../../utils/formatDate';
import { getJudgingDeadlineInfo } from '../../../utils/judgingDeadline';

const MAX_COMMENT_LENGTH = 1000;
const SCORE_STEP = 0.5;
const MIN_SCORE = 1;

type ScoreMap = Record<string, number | null>;

interface ScoringPanelProps {
  criteria: JudgingCriterion[];
  evaluation: Evaluation | null;
  onSave: (request: EvaluationRequest) => Promise<void>;
  roundEndDate?: string | null;
  contestId?: string;
}

function toScoreMap(criteria: JudgingCriterion[], evaluation: Evaluation | null): ScoreMap {
  return Object.fromEntries(
    criteria.map((criterion) => [
      criterion.id,
      evaluation?.scores.find((item) => item.criterionId === criterion.id)?.score ?? null,
    ]),
  );
}

/** Parent phải truyền key theo submission để state được khởi tạo lại khi chuyển bài. */
export function ScoringPanel({ criteria, evaluation, onSave, roundEndDate, contestId }: ScoringPanelProps) {
  const [scores, setScores] = useState<ScoreMap>(() => toScoreMap(criteria, evaluation));
  const [comment, setComment] = useState(evaluation?.comment ?? '');
  const [recommendNextRound, setRecommendNextRound] = useState(evaluation?.recommendNextRound ?? false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastNotice | null>(null);

  const deadlineInfo = getJudgingDeadlineInfo(roundEndDate, contestId);
  const isExpired = deadlineInfo.isExpired;
  const isLocked = evaluation?.status === 'FINALIZED' || isExpired;
  const scoreList = criteria.flatMap((criterion) => {
    const score = scores[criterion.id];
    return score === null || score === undefined ? [] : [{ criterionId: criterion.id, score }];
  });
  const totalScore = calculateWeightedScore(criteria, scoreList);
  const isComplete = totalScore !== null && comment.trim() !== '';
  const maxScale = criteria[0]?.maxScore ?? 10;

  const handleScoreChange = (criterion: JudgingCriterion, rawValue: string) => {
    const value = rawValue === '' ? null : Math.min(criterion.maxScore, Math.max(MIN_SCORE, Number(rawValue)));
    setScores((current) => ({ ...current, [criterion.id]: value }));
  };

  const handleSave = async (isFinal: boolean) => {
    if (isFinal && !window.confirm('Sau khi gửi, phiếu chấm sẽ bị khóa và không thể chỉnh sửa. Bạn chắc chắn muốn gửi?')) {
      return;
    }
    setIsSaving(true);
    try {
      await onSave({ scores: scoreList, comment: comment.trim(), recommendNextRound, isFinal });
      setToast({ id: Date.now(), type: 'success', message: isFinal ? 'Đã gửi đánh giá chính thức thành công.' : 'Đã lưu nháp đánh giá.' });
    } catch (err) {
      setToast({ id: Date.now(), type: 'error', message: err instanceof Error ? err.message : 'Không thể lưu phiếu chấm' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative flex h-full flex-col">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Tiêu chí chấm điểm</h3>
        <span className="text-xs text-slate-500">Thang điểm: 1 - {maxScale}</span>
      </div>

      <div className="mt-4 space-y-4">
        {criteria.map((criterion) => {
          const score = scores[criterion.id];
          const isScored = score !== null && score !== undefined;
          return (
            <div key={criterion.id}>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor={`score-${criterion.id}`} className="text-sm font-medium text-slate-800" title={criterion.description}>
                  {criterion.name} <span className="text-xs font-normal text-slate-400">({criterion.weight}%)</span>
                </label>
                <input
                  type="number"
                  min={MIN_SCORE}
                  max={criterion.maxScore}
                  step={SCORE_STEP}
                  value={score ?? ''}
                  placeholder="–"
                  disabled={isLocked}
                  onChange={(event) => handleScoreChange(criterion, event.target.value)}
                  className="judge-input w-16 px-2 py-1 text-center font-semibold"
                  aria-label={`Điểm ${criterion.name}`}
                />
              </div>
              <input
                id={`score-${criterion.id}`}
                type="range"
                min={MIN_SCORE}
                max={criterion.maxScore}
                step={SCORE_STEP}
                value={score ?? MIN_SCORE}
                disabled={isLocked}
                onChange={(event) => handleScoreChange(criterion, event.target.value)}
                className={`mt-1 w-full cursor-pointer accent-blue-600 disabled:cursor-not-allowed ${isScored ? '' : 'opacity-40'}`}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3">
        <span className="text-sm font-medium text-blue-900">Điểm tổng (theo trọng số)</span>
        <span className="text-2xl font-bold text-blue-700">{totalScore ?? '–'}<span className="text-sm font-medium text-blue-400">/10</span></span>
      </div>

      <div className="mt-5">
        <label htmlFor="judge-comment" className="text-sm font-semibold text-slate-900">Nhận xét của giám khảo</label>
        <textarea
          id="judge-comment"
          rows={4}
          maxLength={MAX_COMMENT_LENGTH}
          value={comment}
          disabled={isLocked}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Nhận xét về bố cục, ánh sáng, chất lượng phim và bản quét..."
          className="judge-input mt-2 w-full resize-none disabled:bg-slate-50"
        />
        <p className="text-right text-xs text-slate-400">{comment.length}/{MAX_COMMENT_LENGTH}</p>
      </div>

      <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={recommendNextRound}
          disabled={isLocked}
          onChange={(event) => setRecommendNextRound(event.target.checked)}
          className="h-4 w-4 accent-blue-600"
        />
        Đánh dấu vào vòng tiếp theo
      </label>

      {isExpired ? (
        <div className="mt-auto space-y-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
            <span>Hết thời hạn chấm điểm</span>
          </div>
          <p className="text-xs leading-relaxed text-rose-700">
            {deadlineInfo.message} Ban tổ chức đã khóa chức năng nhập điểm cho cuộc thi này.
          </p>
        </div>
      ) : isLocked ? (
        <p className="mt-auto flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-3 text-sm text-slate-600">
          <Lock className="h-4 w-4 shrink-0" />
          Phiếu chấm đã gửi{evaluation?.updatedAt ? ` ngày ${formatDate(evaluation.updatedAt)}` : ''}. Liên hệ ban tổ chức nếu cần mở lại.
        </p>
      ) : (
        <div className="mt-auto grid grid-cols-2 gap-3 pt-5">
          <button type="button" onClick={() => void handleSave(false)} disabled={isSaving} className="judge-btn-outline cursor-pointer">
            Lưu nháp
          </button>
          <button
            type="button"
            onClick={() => void handleSave(true)}
            disabled={isSaving || !isComplete}
            title={isComplete ? undefined : 'Cần chấm đủ tiêu chí và nhập nhận xét'}
            className="judge-btn-primary cursor-pointer"
          >
            <CircleCheck className="h-4 w-4" />
            Gửi đánh giá
          </button>
        </div>
      )}
    </div>
  );
}
