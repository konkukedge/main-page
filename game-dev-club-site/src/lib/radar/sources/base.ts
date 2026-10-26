import type { Http } from "../http";
import type { RadarItem } from "../types";

/** 출처가 돌려주는 항목. id·sourceLabel·also 는 crawlRadar 가 채운다 */
export type Draft = Omit<RadarItem, "id" | "source" | "sourceLabel" | "also"> & { key: string };

export interface Source {
  name: string;
  label: string;
  /** true 면 제목에 게임 키워드가 있는 항목만 남긴다 (게임 외 정보가 섞인 출처) */
  gameFilterTitle: boolean;
  /** 이 출처에만 적용할 제외 키워드 */
  excludeKeywords?: string[];
  fetch(http: Http): Promise<Draft[]>;
}

export function draft(d: Pick<Draft, "key" | "category" | "title" | "url"> & Partial<Draft>): Draft {
  return {
    org: "", deadline: null, start: null, end: null, location: "",
    fields: [], tags: [], note: "", joined: null, isNew: false,
    ...d,
  };
}

/** 공백·줄바꿈을 한 칸으로 */
export const clean = (s: string) => s.replace(/\s+/g, " ").trim();
