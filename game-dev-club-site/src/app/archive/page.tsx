import { fetchGames } from "@/lib/googleSheet";
import ArchiveClient from "@/components/ArchiveClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ArchivePage() {
  const { games, error } = await fetchGames();

  return (
    <div className="min-h-screen bg-dark-bg p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center text-brand-green hover:text-white mb-8">
          <ArrowLeft size={18} className="mr-2" />
          Back to Home
        </Link>
        <div className="text-center mb-12">
          <h1 className="text-6xl sm:text-8xl font-bold text-white tracking-tighter">
            GAME ARCHIVE
          </h1>
          <p className="text-brand-green text-lg mt-2">EDGE 역대 출품작</p>
        </div>
        <ArchiveClient games={games} error={error} />
      </div>
    </div>
  );
}
