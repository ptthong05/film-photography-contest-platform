import { MOCK_RESULTS } from "../mocks/organizerData";
import { mockRequest } from "./mockClient";

export const resultService = {
  getResults: () => mockRequest(MOCK_RESULTS),
};
