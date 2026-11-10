import { MOCK_OVERVIEW_STATS } from "../mocks/organizerData";
import type { Contest, ContestDraft } from "../types/contest";
import { mockRequest } from "./mockClient";
import {
  getAllUnifiedContests,
  createNewUnifiedContest,
} from "./contestSyncService";

const CONTEST_ID_ALIASES: Record<string, string> = {
  c1: "CT-2026-001",
  c2: "CT-2026-002",
  c3: "CT-2026-003",
  c4: "CT-2026-004",
  c5: "CT-2026-005",
};

export const contestService = {
  getContests: () => mockRequest(getAllUnifiedContests()),
  getOverviewStats: () => {
    const all = getAllUnifiedContests();
    return mockRequest({
      ongoingContests: all.filter((c) => c.status === "ONGOING").length,
      participants: 1386 + all.length * 45,
      submissions: 1845 + all.length * 80,
      judges: 28,
    });
  },
  getContestById: (id: string) => {
    const resolvedId = CONTEST_ID_ALIASES[id] ?? id;
    const all = getAllUnifiedContests();
    const found = all.find((c) => c.id === resolvedId || c.id === id || c.name.toLowerCase() === id.toLowerCase()) ?? null;
    return mockRequest(found);
  },
  createContest: (draft: ContestDraft, judgeIds: string[]) => {
    const contest = createNewUnifiedContest(draft, judgeIds);
    return mockRequest(contest);
  },
};
