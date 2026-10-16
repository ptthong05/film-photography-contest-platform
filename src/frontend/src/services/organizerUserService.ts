import { MOCK_JUDGES, MOCK_PARTICIPANTS } from "../mocks/organizerData";
import { mockRequest } from "./mockClient";

export const organizerUserService = {
  getParticipants: () => mockRequest(MOCK_PARTICIPANTS),
  getJudges: () => mockRequest(MOCK_JUDGES),
};