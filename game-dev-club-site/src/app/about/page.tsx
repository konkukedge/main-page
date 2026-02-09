"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-dark-bg p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center text-brand-green hover:text-white mb-8">
          <ArrowLeft size={18} className="mr-2" />
          Back to Home
        </Link>
        <motion.h1 
          className="text-5xl sm:text-7xl font-bold text-white tracking-tighter mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          About Us
        </motion.h1>
        <motion.div 
          className="bg-light-bg p-8 rounded-xl prose prose-invert lg:prose-xl max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2 variants={itemVariants}>EDGE 동아리 소개</motion.h2>
          <motion.hr variants={itemVariants} className="my-4 border-gray-600"/>
          <motion.p variants={itemVariants}>안녕하세요!</motion.p>
          <motion.p variants={itemVariants}>
            <strong>EDGE(Extreme Development Game Ecole)</strong>는 건국대학교
            서울캠퍼스 유일 게임제작 중앙 동아리입니다.
          </motion.p>
          <motion.p variants={itemVariants}>
            매년 교내 게임 개발 경진대회를 개최하여 학생들의 창의적인 게임을
            발굴하고 시상하고 있습니다. 
          </motion.p>
          <motion.p variants={itemVariants}>
            또한 다양한 대외 활동과 공모전에 도전하여 꾸준히 우수한 성과를 거두며, 건국대학교를 대표하는 게임 개발 단체로서 그 실력을 증명해왔습니다.
          </motion.p>
          <motion.h3 variants={itemVariants} className="!mb-4">주요 활동</motion.h3>
          <motion.ul variants={itemVariants} className="!mt-0">
            <li>정기적인 게임 개발/기획 스터디 진행</li>
            <li>그 외 다양한 주제의 상호 스터디 진행</li>
            <li>매 학기 게임 개발 경진대회 진행</li>
            <li>대외 활동 및 공모전 참가</li>
            <li>기업과 전시회 탐방</li>
            <li>전국 대학생 게임제작 동아리 연합 "UNIDEV" 활동</li>
          </motion.ul>
          <motion.div variants={itemVariants} className="not-prose mt-8">
            <a
              href="https://cafe.naver.com/imedge"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-brand-green text-dark-bg font-bold py-2 px-4 rounded-lg hover:bg-brand-green/80 transition-colors"
            >
              네이버 카페 바로가기
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
