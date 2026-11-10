import React, { useMemo } from "react";
import {
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  Mail,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  UserCheck,
  UserRoundCheck,
} from "lucide-react";
import type { Assignment } from "../../../types/assignment";
import type { Contest } from "../../../types/contest";
import type { Judge } from "../../../types/organizerUser";
import { ACCOUNT_STATUS } from "../../../utils/statusBadges";
import { StatusBadge } from "../../../components/StatusBadge";
import type { ManagedAssignment } from "./assignmentManagementStorage";
import { formatDate } from "../../../utils/formatDate";

interface OrganizerJudgeDetailPageProps {
  judge: Judge;
  contests: Contest[];
  assignments: Assignment[];
  managedAssignments: ManagedAssignment[];
  onBack: () => void;
  onToggleDefault: () => void;
}

export function OrganizerJudgeDetailPage({
  judge,
  contests,
  assignments,
  managedAssignments,
  onBack,
  onToggleDefault,
}: OrganizerJudgeDetailPageProps) {
  const isCurrentJudge = judge.fullName === "Trần Thị Bình";
  const initials = judge.fullName
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Danh sách cuộc thi được phân công
  const assignedContests = useMemo(() => {
    // 1. Từ managedAssignments
    const managedContestIds = new Set(
      managedAssignments.filter((item) => item.judgeId === judge.id).map((item) => item.contestId)
    );
    // 2. Từ assignments
    const assignedNames = new Set(
      assignments.filter((item) => item.judgeName === judge.fullName).map((item) => item.contestName)
    );
    // 3. Từ contest.judgeNames
    return contests.filter(
      (contest) =>
        managedContestIds.has(contest.id) ||
        assignedNames.has(contest.name) ||
        (contest.judgeNames ?? []).includes(judge.fullName)
    );
  }, [contests, assignments, managedAssignments, judge]);

  const totalAssignedCount = assignedContests.length || judge.contestCount || 3;
  const estimatedScored = Math.max(12, totalAssignedCount * 14);

  return (
    <section aria-label="Chi tiết hồ sơ giám khảo" className="space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 sm:text-sm">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 font-semibold text-blue-600 transition hover:text-blue-800 cursor-pointer"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Quay lại danh sách giám khảo</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-600">Quản lý giám khảo</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-800 truncate max-w-xs">{judge.fullName}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 cursor-pointer"
          >
            Đóng trang chi tiết
          </button>
        </div>
      </div>

      {/* Hero Profile Banner */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="relative bg-gradient-to-r from-[#0B356B] via-[#0E4484] to-[#14539A] p-6 text-white sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <span
                className={`flex size-20 shrink-0 items-center justify-center rounded-2xl font-black text-2xl text-white shadow-xl ${
                  isCurrentJudge
                    ? "bg-gradient-to-tr from-blue-500 to-indigo-400 ring-4 ring-white/30"
                    : "bg-gradient-to-tr from-slate-700 to-slate-500 ring-4 ring-white/20"
                }`}
              >
                {initials}
              </span>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                    {judge.fullName}
                  </h1>
                  {isCurrentJudge && (
                    <span className="rounded-full bg-blue-400/30 px-3 py-1 text-xs font-bold text-blue-100 backdrop-blur-sm border border-blue-300/30">
                      Tài khoản cổng Giám khảo
                    </span>
                  )}
                  {judge.isDefault && (
                    <span className="rounded-full bg-amber-400/30 px-3 py-1 text-xs font-bold text-amber-200 backdrop-blur-sm border border-amber-300/30">
                      Chấm mặc định
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm font-medium text-blue-100">
                  {judge.specialty}
                </p>
                <p className="mt-1 flex items-center gap-2 text-xs text-blue-200">
                  <Mail size={14} className="shrink-0" />
                  <span>{judge.email}</span>
                  <span>•</span>
                  <span>Mã định danh: <strong>{judge.id}</strong></span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge {...ACCOUNT_STATUS[judge.status]} />
              <button
                type="button"
                onClick={onToggleDefault}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-sm cursor-pointer ${
                  judge.isDefault
                    ? "border border-amber-300 bg-amber-500/20 text-amber-200 hover:bg-amber-500/30"
                    : "border border-white/30 bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <Star size={14} className={judge.isDefault ? "fill-amber-300 text-amber-300" : "text-white"} />
                <span>{judge.isDefault ? "Hủy mặc định" : "Đặt làm mặc định"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 divide-y divide-slate-100 border-t border-slate-100 bg-slate-50/70 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          <div className="p-4 sm:p-5">
            <p className="text-xs font-medium text-slate-500">Cuộc thi được phân công</p>
            <p className="mt-1 flex items-center gap-1.5 text-xl font-black text-[#0B356B]">
              <Trophy size={18} className="text-blue-600" />
              {totalAssignedCount} cuộc thi
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">Đang trực tiếp tham gia chấm</p>
          </div>

          <div className="p-4 sm:p-5">
            <p className="text-xs font-medium text-slate-500">Bài dự thi đã đánh giá</p>
            <p className="mt-1 flex items-center gap-1.5 text-xl font-black text-emerald-700">
              <CheckCircle2 size={18} className="text-emerald-600" />
              {estimatedScored} bài thi
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">Đã gửi điểm & nhận xét</p>
          </div>

          <div className="p-4 sm:p-5">
            <p className="text-xs font-medium text-slate-500">Tiến độ chấm điểm</p>
            <p className="mt-1 flex items-center gap-1.5 text-xl font-black text-violet-700">
              <Clock size={18} className="text-violet-600" />
              100% đúng hạn
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">Không có bài quá hạn</p>
          </div>

          <div className="p-4 sm:p-5">
            <p className="text-xs font-medium text-slate-500">Độ tin cậy chuyên môn</p>
            <p className="mt-1 flex items-center gap-1.5 text-xl font-black text-amber-600">
              <Award size={18} className="text-amber-500" />
              Xuất sắc (9.8/10)
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">Thẩm định theo tiêu chí ISO</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Details & Contests */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Chuyên môn & Hồ sơ thẩm định (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <span className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700 font-bold">
                <FileText size={16} />
              </span>
              <div>
                <h3 className="font-bold text-[#0B356B] text-base">Hồ sơ chuyên môn</h3>
                <p className="text-xs text-slate-400">Thông tin năng lực và kinh nghiệm thẩm định</p>
              </div>
            </div>

            <dl className="mt-4 space-y-3.5 text-xs sm:text-sm">
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-xs font-semibold text-slate-500">Lĩnh vực chuyên môn chính</dt>
                <dd className="mt-1 font-bold text-slate-800">{judge.specialty}</dd>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-xs font-semibold text-slate-500">Kinh nghiệm nhiếp ảnh analog</dt>
                <dd className="mt-1 font-bold text-slate-800">
                  {isCurrentJudge ? "12 năm kinh nghiệm nhiếp ảnh đường phố & tư liệu phim" : "15 năm kinh nghiệm thực hành phòng tối và thẩm định nghệ thuật"}
                </dd>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-xs font-semibold text-slate-500">Tiêu chí chuyên sâu</dt>
                <dd className="mt-1 text-slate-700 leading-relaxed">
                  Đánh giá chi tiết về bố cục, kiểm soát ánh sáng, dải tông hạt phim (Grain structure), kỹ thuật tráng scan và chiều sâu câu chuyện tác phẩm.
                </dd>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-xs font-semibold text-slate-500">Quy chế bảo mật</dt>
                <dd className="mt-1 inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                  <ShieldCheck size={15} />
                  Chấm thi độc lập và bảo mật điểm số theo quy định BTC
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Right Column: Cuộc thi được phân công (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 font-bold">
                  <Trophy size={16} />
                </span>
                <div>
                  <h3 className="font-bold text-[#0B356B] text-base">Cuộc thi được phân công</h3>
                  <p className="text-xs text-slate-400">Danh sách các cuộc thi giám khảo đang phụ trách thẩm định</p>
                </div>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                {assignedContests.length} cuộc thi
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {assignedContests.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                  Chưa có cuộc thi nào được phân công cho giám khảo này.
                </div>
              ) : (
                assignedContests.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={c.image || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=120&q=80"}
                        alt={c.name}
                        className="size-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm truncate">{c.name}</h4>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                            {c.id}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {c.startDate} — {c.endDate}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {(c.tags ?? []).map((t) => (
                            <span key={t} className="rounded bg-blue-50 px-1.5 py-0.2 text-[10px] font-medium text-blue-700">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                        Đang chấm
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

