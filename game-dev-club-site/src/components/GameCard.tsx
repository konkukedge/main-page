"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Download, Gamepad2, Users } from "lucide-react";
import { Game } from "@/lib/googleSheet";

interface GameCardProps {
  game: Game;
  onCardClick: () => void;
}

const rankStyles: { [key: number]: string } = {
  1: "border-yellow-400",
  2: "border-gray-300",
  3: "border-yellow-600",
};

const rankLabels: { [key: number]: string } = {
    1: "1위",
    2: "2위",
    3: "3위",
    4: "장려상",
    5: "대외 수상",
};

const GameCard = ({ game, onCardClick }: GameCardProps) => {
  const rankClass = game.rank ? rankStyles[game.rank] || "border-brand-green" : "border-gray-700";
  const rankLabel = game.rank ? rankLabels[game.rank] : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`bg-glass-bg border ${rankClass} rounded-xl backdrop-blur-xl overflow-hidden flex flex-col cursor-pointer group`}
      onClick={onCardClick}
      title={rankLabel ? `수상: ${rankLabel}` : ''}
    >
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={game.imageUrl || "https://via.placeholder.com/400x225.png?text=No+Image"}
          alt={game.name}
          layout="fill"
          objectFit="cover"
          referrerPolicy="no-referrer"
          className="group-hover:scale-110 transition-transform duration-300 ease-in-out"
        />
        {rankLabel && (
          <div className="absolute top-2 right-2 bg-brand-purple text-white text-xs font-bold px-2 py-1 rounded-full z-10">
            {rankLabel}
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-white mb-1">{game.name}</h3>
        <div className="flex items-center text-gray-400 text-sm mb-2">
          <Users size={14} className="mr-2" />
          <span>{game.makers.join(", ")}</span>
        </div>
        <div className="flex items-center text-gray-400 text-sm mb-4">
          <Gamepad2 size={14} className="mr-2" />
          <span>{game.platform}</span>
        </div>
        <div className="mt-auto grid grid-cols-2 gap-2 z-20">
          <a
            href={game.cafeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-center bg-light-bg hover:bg-brand-purple/50 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            소개
          </a>
          <a
            href={game.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center bg-brand-green hover:bg-brand-green/80 text-dark-bg font-bold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            <Download size={16} className="mr-2" />
            다운로드
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default GameCard;
