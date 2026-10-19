import { MOCK_CONTESTS, MOCK_JUDGES, MOCK_OVERVIEW_STATS } from "../mocks/organizerData";
import type { Contest, ContestDraft } from "../types/contest";
import { mockRequest } from "./mockClient";

// Mock: ghi thẳng vào mảng trong bộ nhớ để các trang thấy dữ liệu mới (tải lại trang là mất).
export const contestService = {
  getContests: () => mockRequest([...MOCK_CONTESTS]),
  getOverviewStats: () => mockRequest(MOCK_OVERVIEW_STATS),
  getContestById: (id: string) => mockRequest(MOCK_CONTESTS.find((contest) => contest.id === id) ?? null),
  createContest: (draft: ContestDraft, judgeIds: string[]) => {
    const contest: Contest = {
      id: `c-${Date.now()}`,
      name: draft.name.trim(),
      startDate: draft.startDate,
      endDate: draft.endDate,
      participantCount: 0,
      submissionCount: 0,
      status: "UPCOMING",
      tags: [draft.category],
      description: draft.description.trim(),
      prizes: draft.prizes,
      judgeNames: MOCK_JUDGES.filter((judge) => judgeIds.includes(judge.id)).map((judge) => judge.fullName),
    };
    MOCK_CONTESTS.unshift(contest);
    return mockRequest(contest);
  },
};
