import { MOCK_CONTESTS, MOCK_OVERVIEW_STATS } from "../mocks/organizerData";
import type { Contest, ContestDraft } from "../types/contest";
import { mockRequest } from "./mockClient";

export const contestService = {
  getContests: () => mockRequest(MOCK_CONTESTS),
  getOverviewStats: () => mockRequest(MOCK_OVERVIEW_STATS),
  // Mock: chưa lưu vào đâu cả. Khi có API đổi thành request<Contest>("/contests", { method: "POST", ... }).
  createContest: (draft: ContestDraft) =>
    mockRequest<Contest>({
      id: `c-${Date.now()}`,
      name: draft.name.trim(),
      startDate: draft.startDate,
      endDate: draft.endDate,
      participantCount: 0,
      submissionCount: 0,
      status: "UPCOMING",
    }),
};
