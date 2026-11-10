import { mockRequest } from "./mockClient";
import { getAllUnifiedSubmissions } from "./contestSyncService";
import type { Submission } from "../types/submission";

function getAllAvailableSubmissions(): Submission[] {
  return getAllUnifiedSubmissions();
}

export const submissionService = {
  getSubmissions: () => mockRequest(getAllAvailableSubmissions()),
  getSubmissionById: (id: string) => {
    const list = getAllAvailableSubmissions();
    const found = list.find((s) => s.id === id || s.code === id || s.title.toLowerCase() === id.toLowerCase()) ?? null;
    return mockRequest(found);
  },
};
