import { SubmitEntryForm } from './components/SubmitEntryForm';
import { MyEntriesList } from './components/MyEntriesList';

export default function ParticipantPage() {
  return (
    <main className="min-h-screen p-8 pt-16 space-y-6">
      <h1 className="text-2xl font-bold">Thí Sinh</h1>
      <SubmitEntryForm />
      <MyEntriesList />
    </main>
  );
}
