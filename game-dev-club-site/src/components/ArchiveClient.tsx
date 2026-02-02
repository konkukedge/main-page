"use client";

import { useState, useMemo, useEffect } from "react"; // useEffect 추가
import { Game } from "@/lib/googleSheet";
import GameCard from "./GameCard";
import { motion, AnimatePresence } from "framer-motion";
import ReviewModal from "./ReviewModal";

interface ArchiveClientProps {
  games: Game[];
  error: string | null;
}

const priorityMap: { [key: string]: number } = { '1': 1, '2': 2, '3': 3, '5': 4, '4': 5, '-1': 6 };

const ArchiveClient = ({ games, error }: ArchiveClientProps) => {
  const events = useMemo(() => {
    // "소개" 탭 제거
    const eventSet = new Set(games.map(g => g.event));
    // 이벤트 목록을 정렬 (예: "1회 경진대회", "2회 경진대회" 순)
    const sortedEvents = Array.from(eventSet).sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '0');
      const numB = parseInt(b.match(/\d+/)?.[0] || '0');
      return numA - numB;
    });
    return sortedEvents;
  }, [games]);

  // 기본 선택 탭을 가장 최근(마지막) 이벤트로 설정
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null); // 이 줄을 다시 추가합니다.

  useEffect(() => {
    if (events.length > 0 && selectedTab === null) {
      setSelectedTab(events[events.length - 1]);
    }
  }, [events, selectedTab]);

  const filteredAndSortedGames = useMemo(() => {
    if (!selectedTab) return []; // 탭이 선택되지 않았으면 빈 배열 반환
    return games
      .filter(g => g.event === selectedTab)
      .sort((a, b) => {
        const rankA = priorityMap[String(a.rank)] ?? 6;
        const rankB = priorityMap[String(b.rank)] ?? 6;
        return rankA - rankB;
      });
  }, [games, selectedTab]);

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 text-red-300 rounded-lg p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">데이터 로딩 실패</h2>
        <p>게임 정보를 불러오는 데 문제가 발생했습니다.</p>
        <p className="text-sm text-red-400 mt-4">
          <strong>에러 정보:</strong> {error}
        </p>
        <p className="text-sm mt-2">
          Google Sheet가 공개 상태인지, 컬럼명이 올바른지 확인해주세요.
        </p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center text-gray-400 py-10">
        <p>표시할 게임 이벤트가 없습니다.</p>
        <p className="text-sm mt-2">Google Sheet에 게임 데이터가 있는지 확인해주세요.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {events.map(event => (
          <button
            key={event}
            onClick={() => setSelectedTab(event)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300 ${
              selectedTab === event
                ? "bg-brand-green text-dark-bg"
                : "bg-light-bg hover:bg-brand-purple/50 text-white"
            }`}
          >
            {event}
          </button>
        ))}
      </div>

      <motion.div layout className="relative">
        <AnimatePresence mode="wait">
          {selectedTab && ( // selectedTab이 null이 아닐 때만 렌더링
            <motion.div
              key={selectedTab}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredAndSortedGames.length > 0 ? (
                filteredAndSortedGames.map((game, index) => (
                  <GameCard key={`${game.name}-${index}`} game={game} onCardClick={() => setSelectedGame(game)} />
                ))
              ) : (
                <div className="col-span-full text-center text-gray-400 py-10">
                  <p>이 행사에 해당하는 게임이 없습니다.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {selectedGame && (
        <ReviewModal game={selectedGame} onClose={() => setSelectedGame(null)} />
      )}
    </>
  );
};

export default ArchiveClient;