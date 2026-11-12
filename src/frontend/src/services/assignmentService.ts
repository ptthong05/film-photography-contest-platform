import { MOCK_ASSIGNMENTS, MOCK_JUDGES, MOCK_SUBMISSIONS } from "../mocks/organizerData";
import { mockRequest } from "./mockClient";

const ASSIGNED_SUBMISSION_IDS = new Set<string>();

export const assignmentService = {
  getAssignments: () => mockRequest(MOCK_ASSIGNMENTS.map((assignment) => ({ ...assignment }))),
  autoAssign: async () => {
    const pending = MOCK_SUBMISSIONS.filter((submission) => submission.status === "PENDING" && !ASSIGNED_SUBMISSION_IDS.has(submission.id));
    const eligibleJudges = MOCK_JUDGES.filter((judge) => judge.status === "ACTIVE");
    if (pending.length === 0) return mockRequest({ assignedCount: 0, message: "Không còn bài chờ phân công." }, 250);
    if (eligibleJudges.length === 0) return mockRequest({ assignedCount: 0, message: "Không có giám khảo đang hoạt động để nhận bài." }, 250);

    for (const submission of pending) {
      const judge = [...eligibleJudges].sort((left, right) => {
        const leftLoad = MOCK_ASSIGNMENTS.filter((item) => item.judgeName === left.fullName).reduce((total, item) => total + item.assignedCount, 0);
        const rightLoad = MOCK_ASSIGNMENTS.filter((item) => item.judgeName === right.fullName).reduce((total, item) => total + item.assignedCount, 0);
        return leftLoad - rightLoad || left.fullName.localeCompare(right.fullName, "vi");
      })[0];
      const existing = MOCK_ASSIGNMENTS.find((item) => item.judgeName === judge.fullName && item.contestName === submission.contestName);
      if (existing) existing.assignedCount += 1;
      else MOCK_ASSIGNMENTS.push({ id: `a-${Date.now()}-${submission.id}`, judgeName: judge.fullName, contestName: submission.contestName, assignedCount: 1, reviewedCount: 0 });
      judge.contestCount += 1;
      ASSIGNED_SUBMISSION_IDS.add(submission.id);
    }
    return mockRequest({ assignedCount: pending.length, message: `Đã phân công ${pending.length} bài cho giám khảo đang hoạt động.` }, 250);
  },
};
