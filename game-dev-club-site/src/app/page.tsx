"use client";

import BentoNav from "@/components/BentoNav";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-dark-bg flex flex-col justify-between p-4 sm:p-8 overflow-hidden">
      <main className="flex-grow flex flex-col items-center justify-center text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { 
                duration: 0.5, 
                ease: "easeOut",
                when: "beforeChildren",
                staggerChildren: 0.2,
              },
            },
          }}
          className="relative flex flex-col items-center"
        >
          <motion.div
            className="mb-8"
            variants={{
              hidden: { opacity: 0, scale: 0.8 },
              visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
            }}
          >
            <Image
              src="/logo_purple.png"
              alt="EDGE Logo"
              width={280}
              height={70}
              priority
            />
          </motion.div>
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter uppercase"
            variants={{
              hidden: { opacity: 0, x: -50 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
            }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-green-400">
              <span className="text-white">E</span>xtreme <span className="text-white">D</span>evelopment
            </span>
          </motion.h1>
          <motion.h2
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter uppercase mt-2"
            variants={{
              hidden: { opacity: 0, x: 50 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
            }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-400">
              <span className="text-white">G</span>ame <span className="text-white">E</span>cole
            </span>
          </motion.h2>
        </motion.div>
      </main>
      <BentoNav />
      <Footer />
    </div>
  );
}
