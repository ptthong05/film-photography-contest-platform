import type { Portal } from '../../types/portal';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { LiveContestsSection } from './components/LiveContestsSection';
import { ExhibitionSection } from './components/ExhibitionSection';
import { AiTechSection } from './components/AiTechSection';
import { Footer } from './components/Footer';

interface HomePageProps {
  onSelectPortal: (portal: Portal) => void;
}

const DEV_PORTALS: { portal: Portal; label: string }[] = [
  { portal: 'AUTH', label: 'Đăng nhập' },
  { portal: 'ADMIN', label: 'Admin' },
  { portal: 'ORGANIZER', label: 'Ban Tổ Chức' },
  { portal: 'JUDGE', label: 'Giám Khảo' },
  { portal: 'PARTICIPANT', label: 'Thí Sinh' },
];

export default function HomePage({ onSelectPortal }: HomePageProps) {
  return (
    <main className="min-h-screen p-8 space-y-6">
      <h1 className="text-2xl font-bold">Trang Chủ</h1>

      {/* Điều hướng tạm thời để dev truy cập các portal — xóa khi đã có Navbar thật */}
      <nav className="flex flex-wrap gap-2">
        {DEV_PORTALS.map(({ portal, label }) => (
          <button
            key={portal}
            type="button"
            onClick={() => onSelectPortal(portal)}
            className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-sm hover:bg-zinc-800 cursor-pointer"
          >
            {label}
          </button>
        ))}
      </nav>

      <Navbar />
      <HeroSection />
      <LiveContestsSection />
      <ExhibitionSection />
      <AiTechSection />
      <Footer />
    </main>
  );
}
