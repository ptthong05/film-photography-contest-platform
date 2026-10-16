import { MOCK_CONTESTS, MOCK_OVERVIEW_STATS } from "../mocks/organizerData";
import { mockRequest } from "./mockClient";

export const contestService = {
  getContests: () => mockRequest(MOCK_CONTESTS),
  getOverviewStats: () => mockRequest(MOCK_OVERVIEW_STATS),
};
