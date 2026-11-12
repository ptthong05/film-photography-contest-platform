export type OrganizerView =
  | "OVERVIEW"
  | "CONTESTS"
  | "PARTICIPANTS"
  | "SUBMISSIONS"
  | "JUDGES"
  | "ASSIGNMENTS"
  | "ARCHIVE"
  | "RESULTS"
  | "REPORTS"
  | "SCORING_PUBLISH"
  | "PROFILE"
  | "CREATE_CONTEST"
  | "CONTEST_DETAIL"
  | "SUBMISSION_DETAIL";

export interface OrganizerRoute {
  view: OrganizerView;
  id?: string;
  backTo?: OrganizerView;
}

export interface OrganizerViewProps {
  onNavigate: (route: OrganizerRoute) => void;
}
