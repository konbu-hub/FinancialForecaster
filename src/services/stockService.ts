import type { HistoricalPrice } from './cryptoService';

export interface StockData {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    marketCap?: number;
    sector?: string;        // 業種
    employees?: number;     // 従業員数
    description?: string;   // 企業説明
    country?: string;       // 国（'US' | 'JP'）
}


/**
 * 株式の現在価格とデータを取得
 * 注: デモ用にモックデータを返す実装も含む
 */
export async function getStockData(symbol: string): Promise<StockData> {
    try {
        // デモ用のモックデータ（実際のAPIキーがない場合）
        const mockData: { [key: string]: StockData } = {
            // 米国株
            AAPL: {
                symbol: 'AAPL',
                name: 'Apple Inc.',
                price: 178.25,
                change: 2.35,
                changePercent: 1.34,
                marketCap: 2800000000000,
                sector: 'Technology',
                employees: 164000,
                description: '世界最大級のテクノロジー企業。iPhone、Mac、iPadなどを展開',
                country: 'US',
            },
            GOOGL: {
                symbol: 'GOOGL',
                name: 'Alphabet Inc.',
                price: 142.65,
                change: -1.25,
                changePercent: -0.87,
                marketCap: 1800000000000,
                sector: 'Technology',
                employees: 190234,
                description: 'Google親会社。検索エンジン、クラウド、AIサービスを提供',
                country: 'US',
            },
            MSFT: {
                symbol: 'MSFT',
                name: 'Microsoft Corporation',
                price: 378.91,
                change: 4.12,
                changePercent: 1.10,
                marketCap: 2820000000000,
                sector: 'Technology',
                employees: 221000,
                description: 'Windows、Office、Azureを提供する世界的ソフトウェア企業',
                country: 'US',
            },
            TSLA: {
                symbol: 'TSLA',
                name: 'Tesla, Inc.',
                price: 248.50,
                change: -3.75,
                changePercent: -1.49,
                marketCap: 789000000000,
                sector: 'Automotive',
                employees: 127855,
                description: '電気自動車のパイオニア。自動運転技術も開発',
                country: 'US',
            },
            // 日本株
            '7203.T': {
                symbol: '7203.T',
                name: 'トヨタ自動車株式会社',
                price: 2845,
                change: 35,
                changePercent: 1.25,
                marketCap: 42000000000000,
                sector: '自動車',
                employees: 375235,
                description: '世界最大級の自動車メーカー。ハイブリッド技術のリーダー',
                country: 'JP',
            },
            '6758.T': {
                symbol: '6758.T',
                name: 'ソニーグループ株式会社',
                price: 13250,
                change: -120,
                changePercent: -0.90,
                marketCap: 16500000000000,
                sector: 'エレクトロニクス',
                employees: 109700,
                description: 'グローバルエンタテインメント企業。ゲーム、音楽、映画を展開',
                country: 'JP',
            },
            '7974.T': {
                symbol: '7974.T',
                name: '任天堂株式会社',
                price: 7890,
                change: 85,
                changePercent: 1.09,
                marketCap: 10300000000000,
                sector: 'ゲーム',
                employees: 6717,
                description: '世界的なゲーム機・ソフトウェアメーカー。Switch、マリオなど',
                country: 'JP',
            },
            '9984.T': {
                symbol: '9984.T',
                name: 'ソフトバンクグループ株式会社',
                price: 6420,
                change: -85,
                changePercent: -1.31,
                marketCap: 9800000000000,
                sector: '通信・投資',
                employees: 67000,
                description: 'テクノロジー投資会社。通信事業とベンチャー投資を展開',
                country: 'JP',
            },
            '6861.T': {
                symbol: '6861.T',
                name: '株式会社キーエンス',
                price: 68500,
                change: 1200,
                changePercent: 1.78,
                marketCap: 16200000000000,
                sector: '電子機器',
                employees: 9335,
                description: '産業用センサー・測定器のトップメーカー。高収益企業',
                country: 'JP',
            },
            '7267.T': {
                symbol: '7267.T',
                name: '本田技研工業株式会社',
                price: 1580,
                change: 22,
                changePercent: 1.41,
                marketCap: 8500000000000,
                sector: '輸送用機器',
                employees: 204035,
                description: '世界的な自動車・二輪車メーカー。F1でも活躍',
                country: 'JP',
            },
            '7201.T': {
                symbol: '7201.T',
                name: '日産自動車株式会社',
                price: 485,
                change: -8,
                changePercent: -1.62,
                marketCap: 1900000000000,
                sector: '輸送用機器',
                employees: 131461,
                description: '日本の大手自動車メーカー。電気自動車リーフを展開',
                country: 'JP',
            },
            '9433.T': {
                symbol: '9433.T',
                name: 'KDDI株式会社',
                price: 4235,
                change: 45,
                changePercent: 1.07,
                marketCap: 9200000000000,
                sector: '情報・通信業',
                employees: 49930,
                description: '日本の大手通信事業者。auブランドで展開',
                country: 'JP',
            },
            '9432.T': {
                symbol: '9432.T',
                name: '日本電信電話株式会社',
                price: 165,
                change: 2,
                changePercent: 1.23,
                marketCap: 16000000000000,
                sector: '情報・通信業',
                employees: 330000,
                description: '日本最大の通信事業者。NTTドコモなどを傘下に持つ',
                country: 'JP',
            },
            '8306.T': {
                symbol: '8306.T',
                name: '三菱UFJフィナンシャル・グループ',
                price: 1285,
                change: 18,
                changePercent: 1.42,
                marketCap: 16500000000000,
                sector: '銀行業',
                employees: 160000,
                description: '日本最大の金融グループ。三菱UFJ銀行を中核とする',
                country: 'JP',
            },
            '4502.T': {
                symbol: '4502.T',
                name: '武田薬品工業株式会社',
                price: 4125,
                change: -35,
                changePercent: -0.84,
                marketCap: 6500000000000,
                sector: '医薬品',
                employees: 47099,
                description: '日本最大の製薬会社。グローバルに事業展開',
                country: 'JP',
            },
            '6501.T': {
                symbol: '6501.T',
                name: '日立製作所株式会社',
                price: 3845,
                change: 62,
                changePercent: 1.64,
                marketCap: 11000000000000,
                sector: '電気機器',
                employees: 368247,
                description: '総合電機メーカー。社会インフラ、ITシステムに強み',
                country: 'JP',
            },
            '9983.T': {
                symbol: '9983.T',
                name: 'ファーストリテイリング株式会社',
                price: 38500,
                change: 450,
                changePercent: 1.18,
                marketCap: 11500000000000,
                sector: '小売業',
                employees: 56143,
                description: 'ユニクロを展開する世界的アパレル企業',
                country: 'JP',
            },
            // 新規追加銘柄
            '2181.T': {
                symbol: '2181.T',
                name: 'パーソルホールディングス',
                price: 3250,
                change: 45,
                changePercent: 1.40,
                marketCap: 520000000000,
                sector: 'サービス業',
                employees: 58000,
                description: '人材派遣・人材紹介サービスの大手。テンプスタッフ、パーソルキャリアなどを展開',
                country: 'JP',
            },
            '6098.T': {
                symbol: '6098.T',
                name: 'リクルートホールディングス',
                price: 5840,
                change: -32,
                changePercent: -0.54,
                marketCap: 9500000000000,
                sector: 'サービス業',
                employees: 51000,
                description: '人材サービス、求人広告の世界的企業。Indeed、リクナビなどを運営',
                country: 'JP',
            },
            '4385.T': {
                symbol: '4385.T',
                name: 'メルカリ',
                price: 2890,
                change: 78,
                changePercent: 2.77,
                marketCap: 450000000000,
                sector: 'サービス業',
                employees: 2100,
                description: '日本最大のフリマアプリ運営企業。C2Cマーケットプレイスのリーダー',
                country: 'JP',
            },
            '4751.T': {
                symbol: '4751.T',
                name: 'サイバーエージェント',
                price: 1245,
                change: 15,
                changePercent: 1.22,
                marketCap: 680000000000,
                sector: 'サービス業',
                employees: 6500,
                description: 'インターネット広告、ゲーム事業を展開。AbemaTVを運営',
                country: 'JP',
            },
            '4519.T': {
                symbol: '4519.T',
                name: '中外製薬',
                price: 5420,
                change: -85,
                changePercent: -1.54,
                marketCap: 4200000000000,
                sector: '医薬品',
                employees: 7800,
                description: 'ロシュグループの日本法人。がん治療薬に強み',
                country: 'JP',
            },
            '4523.T': {
                symbol: '4523.T',
                name: 'エーザイ',
                price: 8950,
                change: 120,
                changePercent: 1.36,
                marketCap: 2500000000000,
                sector: '医薬品',
                employees: 10500,
                description: 'アルツハイマー病治療薬の開発に注力する大手製薬会社',
                country: 'JP',
            },
            '9434.T': {
                symbol: '9434.T',
                name: 'ソフトバンク',
                price: 1850,
                change: 22,
                changePercent: 1.20,
                marketCap: 8500000000000,
                sector: '情報・通信業',
                employees: 18500,
                description: '国内大手通信キャリア。5G、IoT事業を展開',
                country: 'JP',
            },
            '9613.T': {
                symbol: '9613.T',
                name: 'エヌ・ティ・ティ・データ',
                price: 2680,
                change: 35,
                changePercent: 1.32,
                marketCap: 3800000000000,
                sector: '情報・通信業',
                employees: 150000,
                description: 'NTTグループのシステムインテグレーター。官公庁、金融に強み',
                country: 'JP',
            },
            '6594.T': {
                symbol: '6594.T',
                name: '日本電産',
                price: 12500,
                change: 180,
                changePercent: 1.46,
                marketCap: 3600000000000,
                sector: '電気機器',
                employees: 110000,
                description: '精密小型モーター世界トップ。EV用モーターにも注力',
                country: 'JP',
            },
            '6981.T': {
                symbol: '6981.T',
                name: '村田製作所',
                price: 18200,
                change: -95,
                changePercent: -0.52,
                marketCap: 5400000000000,
                sector: '電気機器',
                employees: 76000,
                description: '電子部品世界大手。セラミックコンデンサで圧倒的シェア',
                country: 'JP',
            },
            '6920.T': {
                symbol: '6920.T',
                name: 'レーザーテック',
                price: 28500,
                change: 420,
                changePercent: 1.50,
                marketCap: 1800000000000,
                sector: '電気機器',
                employees: 1500,
                description: '半導体検査装置の世界的リーダー。EUV関連で高成長',
                country: 'JP',
            },
            '9843.T': {
                symbol: '9843.T',
                name: 'ニトリホールディングス',
                price: 19800,
                change: 150,
                changePercent: 0.76,
                marketCap: 2100000000000,
                sector: '小売業',
                employees: 18000,
                description: '家具・インテリア小売大手。製造小売業(SPA)モデルで成長',
                country: 'JP',
            },
            '7453.T': {
                symbol: '7453.T',
                name: '良品計画',
                price: 1680,
                change: -12,
                changePercent: -0.71,
                marketCap: 280000000000,
                sector: '小売業',
                employees: 8500,
                description: '無印良品を展開。シンプルデザインで国内外に店舗展開',
                country: 'JP',
            },
            '4755.T': {
                symbol: '4755.T',
                name: '楽天グループ',
                price: 1250,
                change: -15,
                changePercent: -1.19,
                marketCap: 1600000000000,
                sector: 'サービス業',
                employees: 28000,
                description: 'EC、フィンテック、通信など多角的に事業展開する日本のインターネットサービス企業',
                country: 'JP',
            },
        };

        const upperSymbol = symbol.toUpperCase();
        if (mockData[upperSymbol]) {
            return mockData[upperSymbol];
        }

        throw new Error('株式が見つかりませんでした');
    } catch (error) {
        console.error('Error fetching stock data:', error);
        throw error;
    }
}

/**
 * 株式の過去1年間の価格履歴を取得
 */
export async function getStockHistoricalData(
    _symbol: string, // 未使用の変数はアンダースコアを付ける
    days: number = 365
): Promise<HistoricalPrice[]> {
    try {
        // デモ用のモックデータ生成
        const mockHistoricalData: HistoricalPrice[] = [];
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        let basePrice = 150;
        const volatility = 0.02;

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const randomChange = (Math.random() - 0.5) * 2 * volatility;
            basePrice = basePrice * (1 + randomChange);

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
                volume: Math.floor(Math.random() * 100000000),
            });
        }

        return mockHistoricalData;

    } catch (error) {
        console.error('Error fetching stock historical data:', error);
        throw error;
    }
}

/**
 * 株式を検索
 */
export async function searchStock(query: string): Promise<{ symbol: string; name: string; sector?: string; market?: string }[]> {
    try {
        // 日本株検索サービスを動的インポート
        const { searchJapaneseStocks } = await import('./japaneseStockSearchService');

        // 日本株を検索
        const japaneseResults = searchJapaneseStocks(query);
        const japaneseStocks = japaneseResults.map(stock => ({
            symbol: `${stock.code}.T`,
            name: stock.nameJa,
            sector: stock.sector,
            market: stock.market,
        }));

        // 米国株のモックデータ
        const usStocks = [
            { symbol: 'AAPL', name: 'Apple Inc.' },
            { symbol: 'GOOGL', name: 'Alphabet Inc.' },
            { symbol: 'MSFT', name: 'Microsoft Corporation' },
            { symbol: 'TSLA', name: 'Tesla, Inc.' },
            { symbol: 'AMZN', name: 'Amazon.com, Inc.' },
            { symbol: 'META', name: 'Meta Platforms, Inc.' },
            { symbol: 'NVDA', name: 'NVIDIA Corporation' },
            { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
        ];

        // 米国株を検索
        const lowerQuery = query.toLowerCase();
        const usResults = usStocks.filter(
            (stock) =>
                stock.symbol.toLowerCase().includes(lowerQuery) ||
                stock.name.toLowerCase().includes(lowerQuery)
        );

        // 日本株と米国株を結合（日本株を優先）
        return [...japaneseStocks, ...usResults];
    } catch (error) {
        console.error('Error searching stocks:', error);
        throw error;
    }
}
