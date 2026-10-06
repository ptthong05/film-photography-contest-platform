import { AssignedListSidebar } from './components/AssignedListSidebar';
import { ScoringPanel } from './components/ScoringPanel';

export default function JudgePage() {
  return (
    <main className="min-h-screen p-8 pt-16 space-y-6">
      <h1 className="text-2xl font-bold">Giám Khảo</h1>
      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <AssignedListSidebar />
        <ScoringPanel />
      </div>
    </main>
  );
}
