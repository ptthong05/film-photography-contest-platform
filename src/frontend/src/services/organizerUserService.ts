import { MOCK_JUDGES, MOCK_PARTICIPANTS } from "../mocks/organizerData";
import type { Judge } from "../types/organizerUser";
import { mockRequest } from "./mockClient";

// Mock: ghi thẳng vào mảng trong bộ nhớ để giả lập backend.
export const organizerUserService = {
  getParticipants: () => mockRequest(MOCK_PARTICIPANTS),
  getJudges: () => mockRequest(MOCK_JUDGES.map((judge) => ({ ...judge }))),
  setDefaultJudge: (id: string, isDefault: boolean) => {
    const judge = MOCK_JUDGES.find((item) => item.id === id);
    if (judge) judge.isDefault = isDefault;
    return mockRequest<void>(undefined, 100);
  },
  createJudge: (judge: Judge) => {
    MOCK_JUDGES.unshift(judge);
    return mockRequest(judge, 100);
  },
};
