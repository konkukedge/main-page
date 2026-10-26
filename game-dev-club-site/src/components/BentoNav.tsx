"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Gamepad2, Radar, Users } from "lucide-react"; // GalleryHorizontal 제거

const navItems = [
  {
    href: "/about",
    label: "About Us",
    icon: <Users size={48} />,
    colSpan: "col-span-1",
    rowSpan: "row-span-1",
  },
  {
    href: "/archive",
    label: "Game Archive",
    icon: <Gamepad2 size={48} />,
    colSpan: "col-span-1",
    rowSpan: "row-span-1",
  },
  {
    href: "/radar",
    label: "Game Radar",
    icon: <Radar size={48} />,
    // 모바일(2열)에서는 한 줄을 다 쓰고, sm 이상 3열에서는 한 칸
    colSpan: "col-span-2 sm:col-span-1",
    rowSpan: "row-span-1",
  },
];

const BentoNav = () => {
  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-4xl mx-auto justify-center" // justify-center 추가
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {navItems.map((item) => (
        // col-span 은 그리드의 직계 자식(Link)에 있어야 적용된다
        <Link href={item.href} key={item.href} className={`${item.colSpan} ${item.rowSpan}`}>
          <motion.div
            className="h-full"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <div className="h-full p-6 bg-glass-bg border border-gray-700 rounded-xl backdrop-blur-xl hover:bg-brand-purple/30 transition-colors duration-300 flex flex-col items-center justify-center">
              {item.icon}
              <span className="mt-2 text-lg font-semibold">{item.label}</span>
            </div>
          </motion.div>
        </Link>
      ))}
    </motion.div>
  );
};

export default BentoNav;
