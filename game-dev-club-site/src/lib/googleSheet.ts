import Papa from 'papaparse';

const GAMES_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1RoujVUSQD7mOI2tpeqBszpjjt4tkgLEpr1LHcWND3O8/export?format=csv&gid=0';
const REVIEWS_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1RoujVUSQD7mOI2tpeqBszpjjt4tkgLEpr1LHcWND3O8/export?format=csv&gid=176236996';
export const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx50iKmE7Wret4IQu4DG2LKje76QmpwhZ7Ywmf1Ehn0DGZok5ZozHHxvW9EK4wnRW3a8s6/exec";


export interface Game {
  event: string;
  name: string;
  downloadUrl: string;
  imageUrl: string;
  cafeUrl: string;
  makers: string[];
  platform: string;
  rank: number | null;
}

export interface Review {
  gameName: string;
  reviewerName: string;
  content: string;
}

const parseCsv = <T>(csvText: string, transform: (row: any) => T | null, options?: Papa.ParseConfig): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true, // Default to true
      ...options,    // Allow overriding
      complete: (results) => {
        if (results.errors.length) {
          return reject(new Error(JSON.stringify(results.errors)));
        }
        const data: T[] = results.data
          .map(transform)
          .filter((item): item is T => item !== null);
        resolve(data);
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
};

export interface FetchGamesResult {
  games: Game[];
  error: string | null;
}

export const fetchGames = async (): Promise<FetchGamesResult> => {
  try {
    const response = await fetch(GAMES_SHEET_URL, { next: { revalidate: 3600 } }); // Revalidate every hour
    if (!response.ok) {
      throw new Error(`Failed to fetch Google Sheet: ${response.status} ${response.statusText}`);
    }
    const csvText = await response.text();
    if (!csvText) {
      throw new Error("Fetched CSV data is empty.");
    }
    const games = await parseCsv(csvText, (row: any) => {
      if (!row[''] || !row['_1']) return null;

      let imageUrl = row['_3'] || '';
      if (imageUrl === 'Default' || !imageUrl) {
        imageUrl = 'https://cafeptthumb-phinf.pstatic.net/MjAyNDAzMTJfMjI5/MDAxNzEwMTcwMTI2NTc3.4WA779aYiTCx536tDZqXLKJP1zUJ7NvRF5ISZpDiH98g.VwrVOlo9pNcPzKfbkRRb01mdK6GOa8ExwiVAoj3IDEQg.PNG/%25ED%2599%2594%25EB%25A9%25B4_%25EC%25B2%2598_2024-03-12_001459.png?type=w1600';
      } else if (imageUrl.includes('storyphoto/viewer.html')) {
        try {
          const url = new URL(imageUrl);
          imageUrl = url.searchParams.get("src") || row['_3'];
        } catch (e) {
          console.error("Invalid image URL format: ", imageUrl);
        }
      }

      return {
        event: row[''],
        name: row['_1'],
        downloadUrl: row['_2'],
        imageUrl: imageUrl,
        cafeUrl: row['_4'],
        makers: (row['_5'] || '').split(',').map((m: string) => m.trim()),
        platform: row['_6'],
        rank: parseInt(row['_7'], 10) || null,
      };
    });
    return { games, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error fetching or parsing game data:", errorMessage);
    return { games: [], error: errorMessage };
  }
};

export const fetchReviews = async (gameName: string): Promise<Review[]> => {
    try {
      const response = await fetch(REVIEWS_SHEET_URL);
      if (!response.ok) throw new Error(`Failed to fetch reviews sheet: ${response.statusText}`);
      const csvText = await response.text();
      
      // Parse with header: false, data is an array of arrays
      const allReviews = await parseCsv(csvText, (row: string[]) => {
        // row is now an array like ['Get Out Of', '22 최준규', '오리에서 그만뒀습니다.', ...]
        if (!row[0] || !row[1] || !row[2]) return null;
        return {
          gameName: row[0],
          reviewerName: row[1],
          content: row[2],
        };
      }, { header: false }); // Override header option

      return allReviews.filter(review => review.gameName === gameName);
    } catch (error) {
      console.error(`Error fetching reviews for ${gameName}:`, error);
      return [];
    }
  };
