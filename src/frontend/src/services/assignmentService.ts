import { MOCK_ASSIGNMENTS } from "../mocks/organizerData";
import { mockRequest } from "./mockClient";

export const assignmentService = {
  getAssignments: () => mockRequest(MOCK_ASSIGNMENTS),
};
