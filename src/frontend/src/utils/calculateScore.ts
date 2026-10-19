import type { CriterionScore, JudgingCriterion } from '../types/judge';

/**
 * Điểm tổng quy về thang 10 theo trọng số: Σ(score / maxScore × weight) / Σweight × 10.
 * Trả về null nếu còn tiêu chí chưa chấm, vì điểm tạm tính sẽ gây hiểu nhầm.
 */
export function calculateWeightedScore(criteria: JudgingCriterion[], scores: CriterionScore[]): number | null {
  const totalWeight = criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
  if (criteria.length === 0 || totalWeight === 0) {
    return null;
  }

  let weightedSum = 0;
  for (const criterion of criteria) {
    const score = scores.find((item) => item.criterionId === criterion.id);
    if (!score) {
      return null;
    }
    weightedSum += (score.score / criterion.maxScore) * criterion.weight;
  }

  return Math.round((weightedSum / totalWeight) * 100) / 10;
}
