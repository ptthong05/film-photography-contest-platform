import { useEffect, useRef, useState, type JSX } from "react";
import { Camera, Menu, X } from "lucide-react";
import type { OrganizerRoute, OrganizerView } from "../../types/organizer";
import { ArchiveView } from "./components/ArchiveView";
import { AssignmentsView } from "./components/AssignmentsView";
import { ContestDetailPage } from "./components/ContestDetailPage";
import { ContestsView } from "./components/ContestsView";
import { CreateContestForm } from "./components/CreateContestForm";
import { JudgesView } from "./components/JudgesView";
import { OverviewView } from "./components/OverviewView";
import { ParticipantsView } from "./components/ParticipantsView";
import { ProfileView } from "./components/ProfileView";
import { ReportsView } from "./components/ReportsView";
import { ResultsView } from "./components/ResultsView";
import { Sidebar } from "./components/Sidebar";
import { SubmissionDetailPage } from "./components/SubmissionDetailPage";
import { SubmissionsView } from "./components/SubmissionsView";
import { Topbar } from "./components/Topbar";
import { readOrganizerProfile } from "../../services/profileService";

interface OrganizerPageProps {
  onGoHome?: () => void;
}

// Trang con (tạo/chi tiết) vẫn sáng mục menu của trang cha.
function getMenuView(route: OrganizerRoute): OrganizerView {
  if (route.view === "CREATE_CONTEST" || route.view === "CONTEST_DETAIL") return "CONTESTS";
  if (route.view === "SUBMISSION_DETAIL") return route.backTo ?? "SUBMISSIONS";
  return route.view;
}

function renderView(route: OrganizerRoute, onNavigate: (next: OrganizerRoute) => void, onProfileNameSaved: (name: string) => void): JSX.Element {
  switch (route.view) {
    case "OVERVIEW":
      return <OverviewView onNavigate={onNavigate} />;
    case "CONTESTS":
      return <ContestsView onNavigate={onNavigate} />;
    case "PARTICIPANTS":
      return <ParticipantsView onNavigate={onNavigate} />;
    case "SUBMISSIONS":
      return <SubmissionsView onNavigate={onNavigate} />;
    case "JUDGES":
      return <JudgesView onNavigate={onNavigate} />;
    case "ASSIGNMENTS":
      return <AssignmentsView onNavigate={onNavigate} />;
    case "ARCHIVE":
      return <ArchiveView onNavigate={onNavigate} />;
    case "RESULTS":
      return <ResultsView />;
    case "REPORTS":
      return <ReportsView />;
    case "PROFILE":
      return <ProfileView onNameSaved={onProfileNameSaved} />;
    case "CREATE_CONTEST":
      return (
        <CreateContestForm
          onBack={() => onNavigate({ view: "CONTESTS" })}
          onCreated={(contest) => onNavigate({ view: "CONTEST_DETAIL", id: contest.id })}
        />
      );
    case "CONTEST_DETAIL":
      return <ContestDetailPage contestId={route.id ?? ""} onBack={() => onNavigate({ view: "CONTESTS" })} />;
    case "SUBMISSION_DETAIL":
      return (
        <SubmissionDetailPage
          submissionId={route.id ?? ""}
          onBack={() => onNavigate({ view: route.backTo ?? "SUBMISSIONS" })}
        />
      );
  }
}

export default function OrganizerPage({ onGoHome }: OrganizerPageProps) {
  const [route, setRoute] = useState<OrganizerRoute>({ view: "OVERVIEW" });
  const [organizerName, setOrganizerName] = useState(() => readOrganizerProfile().fullName);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileCloseButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = (next: OrganizerRoute) => {
    setRoute(next);
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setIsMobileMenuOpen(false); };
    document.addEventListener("keydown", closeOnEscape);
    mobileCloseButtonRef.current?.focus();
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 md:flex">
      <div className="sticky top-0 hidden h-screen w-60 shrink-0 md:block">
        <Sidebar activeView={getMenuView(route)} onNavigate={(view) => navigate({ view })} onGoHome={onGoHome} organizerName={organizerName} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 pb-3 pt-4 md:hidden">
          <button type="button" onClick={() => setIsMobileMenuOpen(true)} aria-label="Mở menu ban tổ chức" aria-expanded={isMobileMenuOpen} className="rounded-lg p-2 text-[#0B356B] hover:bg-blue-50"><Menu size={22} aria-hidden="true" /></button>
          <span className="flex items-center gap-2 font-semibold text-[#0B356B]"><Camera size={22} aria-hidden="true" />FilmContest</span>
          <span className="ml-auto text-xs font-semibold uppercase tracking-wider text-slate-500">Organizer</span>
        </div>
        <Topbar organizerName={organizerName} />
        <main id="organizer-main-content" className="mx-auto w-full max-w-[1700px] p-4 outline-none sm:p-6 lg:p-8">{renderView(route, navigate, setOrganizerName)}</main>
      </div>
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menu ban tổ chức">
          <button type="button" className="absolute inset-0 bg-slate-950/60" onClick={() => setIsMobileMenuOpen(false)} aria-label="Đóng menu" />
          <div className="absolute inset-y-0 left-0 w-60 shadow-xl"><Sidebar activeView={getMenuView(route)} onNavigate={(view) => navigate({ view })} onGoHome={onGoHome} organizerName={organizerName} /></div>
          <button ref={mobileCloseButtonRef} type="button" onClick={() => setIsMobileMenuOpen(false)} aria-label="Đóng menu ban tổ chức" className="absolute left-[15.5rem] top-4 rounded-full bg-white p-2 text-slate-800 shadow-md"><X size={20} aria-hidden="true" /></button>
        </div>
      )}
    </div>
  );
}
