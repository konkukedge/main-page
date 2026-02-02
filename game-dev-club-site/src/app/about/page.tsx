import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-dark-bg p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center text-brand-green hover:text-white mb-8">
          <ArrowLeft size={18} className="mr-2" />
          Back to Home
        </Link>
        <h1 className="text-5xl sm:text-7xl font-bold text-white tracking-tighter mb-8">
          About Us
        </h1>
        <div className="bg-light-bg p-8 rounded-xl prose prose-invert lg:prose-xl max-w-4xl mx-auto">
          <h2>EDGE 동아리 소개</h2>
          <hr />
          <p>안녕하세요!</p>
          <p>
            <strong>EDGE(Extreme Development Game Ecole)</strong>는 건국대학교
            서울캠퍼스 유일 게임제작 중앙 동아리입니다.
          </p>
          <p>
            매년 교내 게임 개발 경진대회를 개최하여 학생들의 창의적인 게임을
            발굴하고 시상하고 있습니다. 이 웹사이트는 역대 경진대회 출품작들을
            한눈에 볼 수 있도록 정리한 아카이브입니다.
          </p>
          <h3>주요 활동</h3>
          <ul>
            <li>정기적인 게임 개발/기획 스터디 진행</li>
            <li>그 외 다양한 주제의 상호 스터디 진행</li>
            <li>매 학기 게임 개발 경진대회 진행</li>
            <li>전국 대학생 게임제작 동아리 연합 "UNIDEV" 활동</li>
          </ul>
          <div className="not-prose">
            <a
              href="https://cafe.naver.com/imedge"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-brand-green text-dark-bg font-bold py-2 px-4 rounded-lg hover:bg-brand-green/80 transition-colors"
            >
              네이버 카페 바로가기
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
