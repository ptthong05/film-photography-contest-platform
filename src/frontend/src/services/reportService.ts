import type { Report } from "../types/report";
import { request } from "./apiClient";

export const reportService = {
  getReport: (contestId?: string) =>
    request<Report>(`/organizer/reports${contestId ? `?contestId=${contestId}` : ""}`),
};
