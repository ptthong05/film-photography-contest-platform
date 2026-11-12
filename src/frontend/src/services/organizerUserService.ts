import { unifiedUserService } from "./unifiedUserService";
import type { Judge, Participant } from "../types/organizerUser";
import { mockRequest } from "./mockClient";

export const organizerUserService = {
  getParticipants: () => {
    return mockRequest<Participant[]>(unifiedUserService.getParticipants());
  },
  getJudges: () => {
    return mockRequest<Judge[]>(unifiedUserService.getJudges());
  },
  setDefaultJudge: (id: string, isDefault: boolean) => {
    unifiedUserService.setDefaultJudge(id, isDefault);
    return mockRequest<void>(undefined, 50);
  },
  createJudge: (judge: Judge) => {
    unifiedUserService.addUser({
      id: judge.id,
      fullName: judge.fullName,
      email: judge.email,
      role: 'JUDGE',
      specialty: judge.specialty,
      contestCount: judge.contestCount || 1,
      status: judge.status === 'LOCKED' ? 'LOCKED' : 'ACTIVE',
      isDefault: Boolean(judge.isDefault),
      joinedAt: new Date().toLocaleDateString('sv-SE'),
    });
    return mockRequest<Judge>(judge, 50);
  },
};
