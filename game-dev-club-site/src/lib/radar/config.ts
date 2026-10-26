import type { Category } from "./types";

export const CATEGORY_LABELS: Record<Category, string> = {
  contest: "공모전·대회",
  jam: "게임잼",
  event: "행사·전시",
  job: "취업",
};

// 공모전 포털처럼 게임 외 정보가 섞인 출처는 제목에 이 단어가 있어야 남긴다 (대소문자 무시)
export const GAME_KEYWORDS = [
  "게임", "game", "게임잼", "e스포츠", "이스포츠", "esports", "인디게임",
  "유니티", "unity", "언리얼", "unreal", "로블록스", "roblox", "마인크래프트", "minecraft",
];

// 제목에 있으면 모든 출처에서 뺀다 (학원 광고)
export const EXCLUDE_KEYWORDS = ["국비지원"];

// 공모전·행사 제목에 있으면 게임잼으로 분류
export const JAM_KEYWORDS = ["게임잼", "game jam", "gamejam", "잼"];

// 게임잡 직종 이름 → 취업 분야. 어디에도 안 맞으면 OTHER_FIELD
export const JOB_FIELDS: Record<string, string[]> = {
  프로그래밍: ["게임개발(클라이언트)", "게임개발(모바일)", "게임AI 개발", "플랫폼 개발",
    "서버", "네트워크", "엔진", "시스템·DB", "보안", "클라우드", "결제·PG"],
  기획: ["게임기획", "플랫폼 기획"],
  아트: ["인터페이스 디자인", "원화", "모델링", "애니메이션", "이펙트·FX", "플랫폼 디자인", "BX·브랜드 디자인"],
  사운드: ["사운드 제작"],
  QA: ["QA·테스터"],
};
export const OTHER_FIELD = "기타";

export const ITCH_MIN_JOINED = 30;
// 게임이 아닌 잼(만화·작곡·글쓰기 등)
export const ITCH_EXCLUDE_KEYWORDS = ["comic", "composing", "music jam", "writing", "poetry", "art jam"];
