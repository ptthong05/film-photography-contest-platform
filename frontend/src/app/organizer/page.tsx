import { CreateContestForm } from './components/CreateContestForm';
import { VerifySubmissionCard } from './components/VerifySubmissionCard';

export default function OrganizerPage() {
  return (
    <main className="min-h-screen p-8 pt-16 space-y-6">
      <h1 className="text-2xl font-bold">Ban Tổ Chức</h1>
      <CreateContestForm />
      <VerifySubmissionCard />
    </main>
  );
}
