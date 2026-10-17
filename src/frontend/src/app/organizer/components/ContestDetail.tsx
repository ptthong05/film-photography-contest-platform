import { StatusBadge } from "../../../components/StatusBadge";
import type { Contest } from "../../../types/contest";
import { formatDate } from "../../../utils/formatDate";
import { CONTEST_STATUS } from "../../../utils/statusBadges";
import type { DetailInfo } from "./DetailModal";

export function toContestDetail(contest: Contest): DetailInfo {
  return {
    title: contest.name,
    fields: [
      { label: "Thời gian", value: `${formatDate(contest.startDate)} - ${formatDate(contest.endDate)}` },
      { label: "Thí sinh", value: contest.participantCount },
      { label: "Bài dự thi", value: contest.submissionCount.toLocaleString("en-US") },
      { label: "Trạng thái", value: <StatusBadge {...CONTEST_STATUS[contest.status]} /> },
    ],
  };
}
