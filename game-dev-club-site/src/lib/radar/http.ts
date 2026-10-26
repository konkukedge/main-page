const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const TIMEOUT_MS = 15_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 출처 하나가 쓰는 요청기. 같은 사이트에 연달아 요청할 때 delayMs 만큼 쉬고, 받은 쿠키를 다음 요청에 붙인다.
 * 페이지가 ISR 로 다시 만들어질 때마다 새로 긁어야 하므로 Next 의 fetch 캐시는 쓰지 않는다 (no-store).
 */
export class Http {
  private last = 0;
  private cookies = new Map<string, string>();

  constructor(private delayMs = 700) {}

  async request(url: string, init: RequestInit = {}): Promise<Response> {
    const wait = this.last + this.delayMs - Date.now();
    if (wait > 0) await sleep(wait);
    this.last = Date.now();

    const headers = new Headers(init.headers);
    headers.set("User-Agent", USER_AGENT);
    headers.set("Accept-Language", "ko-KR,ko;q=0.9,en;q=0.8");
    if (this.cookies.size) headers.set("Cookie", Array.from(this.cookies, ([k, v]) => `${k}=${v}`).join("; "));

    const res = await fetch(url, { ...init, headers, cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
    for (const line of res.headers.getSetCookie?.() ?? []) {
      const [pair] = line.split(";");
      const i = pair.indexOf("=");
      if (i > 0) this.cookies.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim());
    }
    return res;
  }

  async text(url: string, init?: RequestInit): Promise<string> {
    return (await this.request(url, init)).text();
  }

  async json<T>(url: string, init?: RequestInit): Promise<T> {
    return (await this.request(url, init)).json() as Promise<T>;
  }
}
