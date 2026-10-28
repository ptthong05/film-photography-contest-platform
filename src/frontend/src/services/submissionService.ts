import { MOCK_SUBMISSIONS } from "../mocks/organizerData";
import { mockRequest } from "./mockClient";

export const submissionService = {
  getSubmissions: () => mockRequest(MOCK_SUBMISSIONS),
  getSubmissionById: (id: string) => mockRequest(MOCK_SUBMISSIONS.find((submission) => submission.id === id) ?? null),
};
