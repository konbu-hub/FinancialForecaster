import axios from 'axios';

export interface NewsArticle {
    title: string;
    description: string;
    url: string;
    publishedAt: string;
    source: string;
    urlToImage?: string;
}

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const NEWS_API_BASE = 'https://newsapi.org/v2';

/**
 * 銘柄関連のニュースを取得
 */
export async function getAssetNews(
    query: string,
    pageSize: number = 10
): Promise<NewsArticle[]> {
    try {
        if (!NEWS_API_KEY) {
            console.warn('News API key not found, returning mock data');
            return getMockNews(query);
        }

        const response = await axios.get(`${NEWS_API_BASE}/everything`, {
            params: {
                q: query,
                apiKey: NEWS_API_KEY,
                language: 'en',
                sortBy: 'publishedAt',
                pageSize: pageSize,
            },
        });

        if (response.data && response.data.articles) {
            return response.data.articles.map((article: any) => ({
                title: article.title,
                description: article.description,
                url: article.url,
                publishedAt: article.publishedAt,
                source: article.source.name,
                urlToImage: article.urlToImage,
            }));
        }

        return [];
    } catch (error) {
        console.error('Error fetching news:', error);
        return getMockNews(query);
    }
}

/**
 * モックニュースデータを生成（APIキーがない場合のフォールバック）
 */
function getMockNews(query: string): NewsArticle[] {
    const now = new Date();

    return [
        {
            title: `${query} Reaches New Milestone in Market Performance`,
            description: `Recent analysis shows ${query} demonstrating strong market fundamentals with increased institutional adoption and positive technical indicators.`,
            url: '#',
            publishedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
            source: 'Financial Times',
        },
        {
            title: `Analysts Predict Bullish Trend for ${query}`,
            description: `Market experts suggest that ${query} could see significant growth in the coming months based on current market conditions and adoption rates.`,
            url: '#',
            publishedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
            source: 'Bloomberg',
        },
        {
            title: `${query} Technical Analysis: Key Support and Resistance Levels`,
            description: `Technical analysts identify critical price levels for ${query}, with strong support zones and potential breakout patterns emerging.`,
            url: '#',
            publishedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
            source: 'CoinDesk',
        },
        {
            title: `Market Update: ${query} Shows Resilience Amid Volatility`,
            description: `Despite recent market turbulence, ${query} maintains stable performance with growing trading volumes and investor confidence.`,
            url: '#',
            publishedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
            source: 'Reuters',
        },
        {
            title: `Institutional Interest in ${query} Continues to Grow`,
            description: `Major financial institutions are increasing their exposure to ${query}, signaling long-term confidence in the asset's potential.`,
            url: '#',
            publishedAt: new Date(now.getTime() - 36 * 60 * 60 * 1000).toISOString(),
            source: 'Wall Street Journal',
        },
    ];
}

/**
 * 一般的な仮想通貨/金融ニュースを取得
 */
export async function getGeneralFinanceNews(pageSize: number = 10): Promise<NewsArticle[]> {
    try {
        if (!NEWS_API_KEY) {
            return getMockNews('cryptocurrency market');
        }

        const response = await axios.get(`${NEWS_API_BASE}/top-headlines`, {
            params: {
                category: 'business',
                apiKey: NEWS_API_KEY,
                language: 'en',
                pageSize: pageSize,
            },
        });

        if (response.data && response.data.articles) {
            return response.data.articles.map((article: any) => ({
                title: article.title,
                description: article.description,
                url: article.url,
                publishedAt: article.publishedAt,
                source: article.source.name,
                urlToImage: article.urlToImage,
            }));
        }

        return [];
    } catch (error) {
        console.error('Error fetching general news:', error);
        return getMockNews('finance');
    }
}
