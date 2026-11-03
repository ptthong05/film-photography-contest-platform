import type { AccountStatus, Judge, Participant } from "../types/organizerUser";
import { request } from "./apiClient";

type ApiUserStatus = "ACTIVE" | "SUSPENDED" | "LOCKED";

interface ApiJudge {
  id: string;
  fullName: string;
  email: string;
  specialty: string | null;
  contestCount: number;
  status: ApiUserStatus;
  isDefault: boolean;
  temporaryPassword: string | null;
}

interface ApiParticipant {
  id: string;
  fullName: string;
  email: string;
  submissionCount: number;
  registeredAt: string;
  status: ApiUserStatus;
  contestIds: string[];
}

const toAccountStatus = (status: ApiUserStatus): AccountStatus => (status === "ACTIVE" ? "ACTIVE" : "LOCKED");

function toJudge(item: ApiJudge): Judge {
  return {
    id: item.id,
    fullName: item.fullName,
    email: item.email,
    specialty: item.specialty ?? "Chưa cập nhật",
    contestCount: item.contestCount,
    status: toAccountStatus(item.status),
    isDefault: item.isDefault,
    temporaryPassword: item.temporaryPassword ?? undefined,
  };
}

function toParticipant(item: ApiParticipant): Participant {
  return { ...item, status: toAccountStatus(item.status) };
}

export const organizerUserService = {
  getParticipants: async () => (await request<ApiParticipant[]>("/organizer/participants")).map(toParticipant),
  setParticipantStatus: async (id: string, status: AccountStatus) =>
    toParticipant(await request<ApiParticipant>(`/organizer/participants/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })),
  getJudges: async () => (await request<ApiJudge[]>("/organizer/judges")).map(toJudge),
  setDefaultJudge: async (id: string, isDefault: boolean) =>
    toJudge(await request<ApiJudge>(`/organizer/judges/${id}/default?isDefault=${isDefault}`, { method: "PATCH" })),
  createJudge: async (judge: { fullName: string; email: string; specialty: string }) =>
    toJudge(await request<ApiJudge>("/organizer/judges", { method: "POST", body: JSON.stringify(judge) })),
};
