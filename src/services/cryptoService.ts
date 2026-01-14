import axios from 'axios';

export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
}

export interface HistoricalPrice {
  timestamp: number;
  price: number;
}

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

/**
 * 仮想通貨の現在価格とマーケットデータを取得
 */
export async function getCryptoData(coinId: string): Promise<CryptoData> {
  try {
    const response = await axios.get(`${COINGECKO_API_BASE}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        ids: coinId,
        order: 'market_cap_desc',
        per_page: 1,
        page: 1,
        sparkline: false,
      },
    });

    if (response.data && response.data.length > 0) {
      return response.data[0];
    }
    throw new Error('仮想通貨が見つかりませんでした');
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    throw error;
  }
}

/**
 * 仮想通貨の過去1年間の価格履歴を取得
 */
export async function getCryptoHistoricalData(
  coinId: string,
  days: number = 365
): Promise<HistoricalPrice[]> {
  try {
    const response = await axios.get(
      `${COINGECKO_API_BASE}/coins/${coinId}/market_chart`,
      {
        params: {
          vs_currency: 'usd',
          days: days,
          interval: 'daily',
        },
      }
    );

    if (response.data && response.data.prices) {
      return response.data.prices.map(([timestamp, price]: [number, number]) => ({
        timestamp,
        price,
      }));
    }
    throw new Error('価格履歴データが見つかりませんでした');
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
}

/**
 * 仮想通貨IDを検索（名前またはシンボルから）
 */
export async function searchCrypto(query: string): Promise<{ id: string; name: string; symbol: string }[]> {
  try {
    const response = await axios.get(`${COINGECKO_API_BASE}/search`, {
      params: {
        query: query,
      },
    });

    if (response.data && response.data.coins) {
      return response.data.coins.slice(0, 10).map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
      }));
    }
    return [];
  } catch (error) {
    console.error('Error searching crypto:', error);
    throw error;
  }
}

/**
 * シンボルまたは名前からcoin IDを解決
 */
export async function resolveCoinId(query: string): Promise<string> {
  const lowerQuery = query.toLowerCase().trim();

  // まずそのまま試す（既にIDの場合）
  try {
    const response = await getCryptoData(lowerQuery);
    if (response) {
      return lowerQuery;
    }
  } catch {
    // IDでない場合は検索APIを使用
  }

  // 検索APIで正しいIDを取得
  try {
    const results = await searchCrypto(lowerQuery);
    if (results.length > 0) {
      // 最初の結果を使用（最も関連性が高い）
      return results[0].id;
    }
  } catch (error) {
    console.error('Error resolving coin ID:', error);
  }

  throw new Error('仮想通貨が見つかりませんでした');
}

/**
 * 人気の仮想通貨トップ10を取得
 */
export async function getTopCryptos(): Promise<CryptoData[]> {
  try {
    const response = await axios.get(`${COINGECKO_API_BASE}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 10,
        page: 1,
        sparkline: false,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching top cryptos:', error);
    throw error;
  }
}
