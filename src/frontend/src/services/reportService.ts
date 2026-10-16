import { MOCK_TYPE_DISTRIBUTION } from "../mocks/organizerData";
import { mockRequest } from "./mockClient";

export const reportService = {
  getTypeDistribution: () => mockRequest(MOCK_TYPE_DISTRIBUTION),
};
