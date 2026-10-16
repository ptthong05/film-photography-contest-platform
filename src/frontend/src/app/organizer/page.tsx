import { useState, type JSX } from "react";
import type { OrganizerView } from "../../types/organizer";
import { ArchiveView } from "./components/ArchiveView";
import { AssignmentsView } from "./components/AssignmentsView";
import { ContestsView } from "./components/ContestsView";
import { JudgesView } from "./components/JudgesView";
import { OverviewView } from "./components/OverviewView";
import { ParticipantsView } from "./components/ParticipantsView";
import { ProfileView } from "./components/ProfileView";
import { ReportsView } from "./components/ReportsView";
import { ResultsView } from "./components/ResultsView";
import { Sidebar } from "./components/Sidebar";
import { SubmissionsView } from "./components/SubmissionsView";
import { Topbar } from "./components/Topbar";

const VIEWS: Record<OrganizerView, () => JSX.Element> = {
  OVERVIEW: OverviewView,
  CONTESTS: ContestsView,
  PARTICIPANTS: ParticipantsView,
  SUBMISSIONS: SubmissionsView,
  JUDGES: JudgesView,
  ASSIGNMENTS: AssignmentsView,
  ARCHIVE: ArchiveView,
  RESULTS: ResultsView,
  REPORTS: ReportsView,
  PROFILE: ProfileView,
};

export default function OrganizerPage() {
  const [activeView, setActiveView] = useState<OrganizerView>("OVERVIEW");
  const ActiveView = VIEWS[activeView];

  return (
    <div className="flex min-h-screen">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-6">
          <ActiveView />
        </main>
      </div>
    </div>
  );
}