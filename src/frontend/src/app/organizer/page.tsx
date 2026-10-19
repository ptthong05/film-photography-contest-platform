import { useState, type JSX } from "react";
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

interface OrganizerPageProps {
  onGoHome?: () => void;
}

// Trang con (tạo/chi tiết) vẫn sáng mục menu của trang cha.
function getMenuView(route: OrganizerRoute): OrganizerView {
  if (route.view === "CREATE_CONTEST" || route.view === "CONTEST_DETAIL") return "CONTESTS";
  if (route.view === "SUBMISSION_DETAIL") return route.backTo ?? "SUBMISSIONS";
  return route.view;
}

function renderView(route: OrganizerRoute, onNavigate: (next: OrganizerRoute) => void): JSX.Element {
  switch (route.view) {
    case "OVERVIEW":
      return <OverviewView onNavigate={onNavigate} />;
    case "CONTESTS":
      return <ContestsView onNavigate={onNavigate} />;
    case "PARTICIPANTS":
      return <ParticipantsView />;
    case "SUBMISSIONS":
      return <SubmissionsView onNavigate={onNavigate} />;
    case "JUDGES":
      return <JudgesView />;
    case "ASSIGNMENTS":
      return <AssignmentsView />;
    case "ARCHIVE":
      return <ArchiveView onNavigate={onNavigate} />;
    case "RESULTS":
      return <ResultsView />;
    case "REPORTS":
      return <ReportsView />;
    case "PROFILE":
      return <ProfileView />;
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

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar activeView={getMenuView(route)} onNavigate={(view) => setRoute({ view })} onGoHome={onGoHome} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-8">{renderView(route, setRoute)}</main>
      </div>
    </div>
  );
}
