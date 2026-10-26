import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RadarClient from "@/components/radar/RadarClient";
import { crawlRadar } from "@/lib/radar";

// 6시간마다 Vercel 이 페이지를 다시 만들면서 그때 크롤링한다 (ISR).
// force-static 이라 크롤러의 no-store 요청이 페이지를 매 요청 렌더링(dynamic)으로 바꾸지 않는다.
export const dynamic = "force-static";
export const revalidate = 21600;
// 국내 사이트가 해외 IP 를 막는 경우가 있어 서울 리전에서 돌린다
export const preferredRegion = "icn1";
export const maxDuration = 60;

export const metadata: Metadata = {
  title: "Game Radar | EDGE Game Dev Club",
  description: "게임 공모전·게임잼·행사·채용 정보를 자동으로 모아 보여 줍니다.",
};

const updatedAt = (iso: string) =>
  new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

export default async function RadarPage() {
  const data = await crawlRadar();

  return (
    <div className="min-h-screen bg-dark-bg p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center text-brand-green hover:text-white mb-8">
          <ArrowLeft size={18} className="mr-2" />
          Back to Home
        </Link>
        <div className="text-center mb-10">
          <h1 className="text-6xl sm:text-8xl font-bold text-white tracking-tighter">GAME RADAR</h1>
          <p className="text-brand-green text-lg mt-2">공모전 · 게임잼 · 행사 · 채용 정보</p>
          <p className="text-gray-500 text-sm mt-1">{updatedAt(data.generatedAt)} 업데이트</p>
        </div>
        <RadarClient data={data} />
      </div>
    </div>
  );
}
