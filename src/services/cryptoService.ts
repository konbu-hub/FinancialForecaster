import axios from 'axios';
import { cacheUtils } from '../utils/cacheUtils';

export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  circulating_supply?: number; // 循環供給量
  max_supply?: number;         // 最大供給量
  ath?: number;               // 過去最高値
}

export interface HistoricalPrice {
  timestamp: number;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
}

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';
const CACHE_TTL_MINUTES = 5;       // 基本データは5分
const CACHE_TTL_HISTORY = 10;      // 履歴データは10分
const CACHE_TTL_SEARCH = 30;       // 検索結果は30分

// API制限時用のモックデータ
const MOCK_CRYPTO_DATA: { [key: string]: CryptoData } = {
  bitcoin: {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    current_price: 64500,
    price_change_percentage_24h: 2.5,
    market_cap: 1200000000000,
    total_volume: 35000000000,
    circulating_supply: 19650000,
    max_supply: 21000000,
    ath: 73750,
  },
  ethereum: {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    current_price: 3450,
    price_change_percentage_24h: 1.8,
    market_cap: 400000000000,
    total_volume: 15000000000,
    circulating_supply: 120000000,
    ath: 4891,
  },
  solana: {
    id: 'solana',
    symbol: 'sol',
    name: 'Solana',
    current_price: 145,
    price_change_percentage_24h: 5.2,
    market_cap: 65000000000,
    total_volume: 4000000000,
    circulating_supply: 443000000,
    ath: 260,
  },
  ripple: {
    id: 'ripple',
    symbol: 'xrp',
    name: 'XRP',
    current_price: 0.62,
    price_change_percentage_24h: -0.5,
    market_cap: 34000000000,
    total_volume: 1200000000,
    circulating_supply: 54800000000,
    max_supply: 100000000000,
    ath: 3.84,
  },
  cardano: {
    id: 'cardano',
    symbol: 'ada',
    name: 'Cardano',
    current_price: 0.45,
    price_change_percentage_24h: 1.2,
    market_cap: 16000000000,
    total_volume: 500000000,
    circulating_supply: 35500000000,
    max_supply: 45000000000,
    ath: 3.10,
  },
  dogecoin: {
    id: 'dogecoin',
    symbol: 'doge',
    name: 'Dogecoin',
    current_price: 0.16,
    price_change_percentage_24h: 8.5,
    market_cap: 23000000000,
    total_volume: 2000000000,
    circulating_supply: 143000000000,
    ath: 0.73,
  }
};

/**
 * 仮想通貨の現在価格とマーケットデータを取得
 */
export async function getCryptoData(coinId: string): Promise<CryptoData> {
  const cacheKey = `crypto_data_${coinId}`;

  // 1. キャッシュ確認
  const cached = cacheUtils.get<CryptoData>(cacheKey);
  if (cached) {
    return cached;
  }

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
      const data = response.data[0];
      // キャッシュ保存
      cacheUtils.set(cacheKey, data, CACHE_TTL_MINUTES);
      return data;
    }

    // APIで見つからない場合、モックデータをチェック
    if (MOCK_CRYPTO_DATA[coinId]) {
      console.warn('Returning mock data for', coinId);
      return MOCK_CRYPTO_DATA[coinId];
    }

    throw new Error('仮想通貨が見つかりませんでした');
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    // APIエラー時もモックデータをチェック
    if (MOCK_CRYPTO_DATA[coinId]) {
      console.warn('API Error, returning mock data for', coinId);
      return MOCK_CRYPTO_DATA[coinId];
    }
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
  const cacheKey = `crypto_history_${coinId}_${days}`;

  // 1. キャッシュ確認
  const cached = cacheUtils.get<HistoricalPrice[]>(cacheKey);
  if (cached) {
    return cached;
  }

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
      const data = response.data.prices.map(([timestamp, price]: [number, number]) => ({
        timestamp,
        price,
      }));
      // キャッシュ保存
      cacheUtils.set(cacheKey, data, CACHE_TTL_HISTORY);
      return data;
    }

    throw new Error('価格履歴データが見つかりませんでした');
  } catch (error) {
    console.error('Error fetching historical data:', error);

    // モックデータが存在する場合は、ダミーの履歴データを生成して返す
    if (MOCK_CRYPTO_DATA[coinId]) {
      return generateMockHistoricalData(MOCK_CRYPTO_DATA[coinId].current_price, days);
    }

    throw error;
  }
}

function generateMockHistoricalData(currentPrice: number, days: number): HistoricalPrice[] {
  const mockHistoricalData: HistoricalPrice[] = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  let basePrice = currentPrice * 0.5; // 1年前は半額だったと仮定
  const volatility = 0.03;

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const randomChange = (Math.random() - 0.5) * 2 * volatility;
    basePrice = basePrice * (1 + randomChange);

    // 最終日に現在価格に近づける補正
    const progress = (d.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime());
    if (progress > 0.9) {
      basePrice = basePrice * (1 - progress * 0.1) + currentPrice * (progress * 0.1);
    }

    const open = basePrice * (1 + (Math.random() - 0.5) * 0.01);
    const close = basePrice * (1 + (Math.random() - 0.5) * 0.01);
    const high = Math.max(open, close) * (1 + Math.random() * 0.02);
    const low = Math.min(open, close) * (1 - Math.random() * 0.02);

    mockHistoricalData.push({
      timestamp: new Date(d).getTime(),
      price: close,
      open,
      high,
      low,
      close,
      volume: 1000000 + Math.random() * 10000000,
    });
  }
  return mockHistoricalData;
}

/**
 * 仮想通貨IDを検索（名前またはシンボルから）
 */
export async function searchCrypto(query: string): Promise<{ id: string; name: string; symbol: string }[]> {
  const cacheKey = `crypto_search_${query}`;

  // 1. キャッシュ確認
  const cached = cacheUtils.get<{ id: string; name: string; symbol: string }[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get(`${COINGECKO_API_BASE}/search`, {
      params: {
        query: query,
      },
    });

    if (response.data && response.data.coins) {
      const data = response.data.coins.slice(0, 10).map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
      }));
      // キャッシュ保存
      cacheUtils.set(cacheKey, data, CACHE_TTL_SEARCH);
      return data;
    }
    return [];
  } catch (error) {
    console.error('Error searching crypto:', error);

    // エラー時はモックデータから検索
    const lowerQuery = query.toLowerCase();
    const mockResults = Object.values(MOCK_CRYPTO_DATA).filter(coin =>
      coin.id.includes(lowerQuery) ||
      coin.symbol.includes(lowerQuery) ||
      coin.name.toLowerCase().includes(lowerQuery)
    ).map(coin => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol
    }));

    return mockResults;
  }
}

/**
 * シンボルまたは名前からcoin IDを解決
 */
export async function resolveCoinId(query: string): Promise<string> {
  const lowerQuery = query.toLowerCase().trim();

  // 1. まずモックデータを確認 (API節約のため)
  if (MOCK_CRYPTO_DATA[lowerQuery]) {
    return lowerQuery;
  }
  const mockBySymbol = Object.values(MOCK_CRYPTO_DATA).find(c => c.symbol === lowerQuery);
  if (mockBySymbol) {
    return mockBySymbol.id;
  }

  // 2. キャッシュされたIDがあればそれを使う（未実装だが、検索結果キャッシュでカバーされる可能性あり）

  // 3. そのまま試す（既にIDの場合）
  try {
    const response = await getCryptoData(lowerQuery);
    if (response) {
      return lowerQuery;
    }
  } catch {
    // IDでない場合は検索APIを使用
  }

  // 4. 検索APIで正しいIDを取得
  try {
    const results = await searchCrypto(lowerQuery);
    if (results.length > 0) {
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
  const cacheKey = 'crypto_top_10';

  // 1. キャッシュ確認
  const cached = cacheUtils.get<CryptoData[]>(cacheKey);
  if (cached) {
    return cached;
  }

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

    // キャッシュ保存
    cacheUtils.set(cacheKey, response.data, CACHE_TTL_MINUTES);
    return response.data;
  } catch (error) {
    console.error('Error fetching top cryptos:', error);
    // エラー時はモックデータを配列で返す
    return Object.values(MOCK_CRYPTO_DATA);
  }
}
