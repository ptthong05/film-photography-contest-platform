export interface CountItem {
  label: string;
  count: number;
}

/** Khớp ReportResponse của backend; mọi số liệu đều đếm từ DB */
export interface Report {
  ongoingContests: number;
  totalContests: number;
  participants: number;
  submissions: number;
  verifiedSubmissions: number;
  pendingSubmissions: number;
  rejectedSubmissions: number;
  judges: number;
  categoryDistribution: CountItem[];
  filmStockDistribution: CountItem[];
  submissionsLast30Days: CountItem[];
  submissionsLast6Months: CountItem[];
  submissionsThisYear: CountItem[];
}
