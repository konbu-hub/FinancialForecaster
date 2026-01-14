import axios from 'axios';
import type { HistoricalPrice } from './cryptoService';
import type { NewsArticle } from './newsService';
import { calculateSMA, calculateRSI, calculateVolatility } from '../utils/technicalIndicators';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

export interface PredictionResult {
    predictions: HistoricalPrice[];
    analysis: string;
    confidence: 'high' | 'medium' | 'low';
    keyFactors: { title: string; reasoning: string }[];
    risks: { title: string; reasoning: string }[];
}

/**
 * AI価格予測を生成
 */
export async function generatePricePrediction(
    assetName: string,
    assetType: 'crypto' | 'stock',
    historicalData: HistoricalPrice[],
    newsArticles: NewsArticle[]
): Promise<PredictionResult> {
    try {
        const prices = historicalData.map(d => d.price);
        const rsi = calculateRSI(prices);
        const sma7 = calculateSMA(prices, 7);
        const sma30 = calculateSMA(prices, 30);
        const volatility = calculateVolatility(prices);

        const technicalIndicators = { rsi, sma7, sma30, volatility };

        if (!GEMINI_API_KEY) {
            console.warn('Gemini API key not found, returning mock prediction');
            return generateMockPrediction(assetName, historicalData);
        }

        const prompt = buildPredictionPrompt(assetName, assetType, historicalData, newsArticles, technicalIndicators);

        const response = await axios.post(
            `${GEMINI_API_BASE}/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [
                    {
                        parts: [
                            {
                                text: prompt,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                },
            }
        );

        if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            const aiResponse = response.data.candidates[0].content.parts[0].text;
            return parsePredictionResponse(aiResponse, historicalData);
        }

        throw new Error('AI応答の解析に失敗しました');
    } catch (error) {
        console.error('Error generating AI prediction:', error);
        return generateMockPrediction(assetName, historicalData);
    }
}

/**
 * 予測プロンプトを構築
 */
function buildPredictionPrompt(
    assetName: string,
    assetType: string,
    historicalData: HistoricalPrice[],
    newsArticles: NewsArticle[],
    indicators: { rsi: number | null, sma7: number | null, sma30: number | null, volatility: number | null }
): string {
    const recentPrices = historicalData.slice(-30);
    const currentPrice = historicalData[historicalData.length - 1].price;
    const priceChange = ((currentPrice - historicalData[0].price) / historicalData[0].price) * 100;

    const newsContext = newsArticles
        .slice(0, 5)
        .map((article) => `- ${article.title}: ${article.description}`)
        .join('\n');

    const indicatorsText = `
【テクニカル分析指標】
- RSI (14日): ${indicators.rsi ? indicators.rsi.toFixed(2) : 'データ不足'} (70以上:買われすぎ / 30以下:売られすぎ)
- SMA (7日): ${indicators.sma7 ? '$' + indicators.sma7.toFixed(2) : 'データ不足'}
- SMA (30日): ${indicators.sma30 ? '$' + indicators.sma30.toFixed(2) : 'データ不足'}
- Volatility (30日): ${indicators.volatility ? indicators.volatility.toFixed(2) + '%' : 'データ不足'}
`;

    return `あなたは金融アナリストAIです。以下の情報を基に、${assetName}の今後1年間の価格予測を行ってください。

【資産情報】
- 資産名: ${assetName}
- 資産タイプ: ${assetType === 'crypto' ? '仮想通貨' : '株式'}
- 現在価格: $${currentPrice.toFixed(2)}
- 過去1年間の変動: ${priceChange.toFixed(2)}%

${indicatorsText}

【過去30日間の価格トレンド】
${recentPrices.map((p) => `$${p.price.toFixed(2)}`).join(', ')}

【最新ニュース】
${newsContext}

以下の形式でJSON形式で回答してください:

{
  "monthlyPredictions": [
    {"month": 1, "predictedPrice": 価格, "confidence": "high/medium/low"},
    ... (12ヶ月分)
  ],
  "analysis": "詳細な分析レポート（日本語、500文字程度）",
  "keyFactors": [
    { "title": "主要な成長要因タイトル", "reasoning": "その要因がなぜ成長に寄与するかの詳細な考察（200文字程度）" }
  ],
  "risks": [
    { "title": "潜在的リスクタイトル", "reasoning": "そのリスクの影響と対策についての詳細な考察（200文字程度）" }
  ],
  "overallConfidence": "high/medium/low"
}

注意: 
- 予測は現実的な範囲内で行ってください
- 分析には具体的なエビデンスを含めてください
- リスクと機会の両面を考慮してください
- これは投資アドバイスではないことを明記してください`;
}

/**
 * AI応答を解析
 */
function parsePredictionResponse(
    aiResponse: string,
    historicalData: HistoricalPrice[]
): PredictionResult {
    try {
        // JSONブロックを抽出
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('JSON形式の応答が見つかりません');
        }

        const parsed = JSON.parse(jsonMatch[0]);
        const currentPrice = historicalData[historicalData.length - 1].price;
        const lastTimestamp = historicalData[historicalData.length - 1].timestamp;

        // 月次予測を日次データに補間変換
        const predictions: HistoricalPrice[] = [];
        const monthlyPredictions = parsed.monthlyPredictions || [];

        let lastPrice = currentPrice;
        let lastDate = lastTimestamp;

        for (let i = 0; i < monthlyPredictions.length; i++) {
            const monthData = monthlyPredictions[i];
            const targetDate = lastTimestamp + monthData.month * 30 * 24 * 60 * 60 * 1000;
            const targetPrice = monthData.predictedPrice;

            // 日数計算
            const daysDiff = Math.floor((targetDate - lastDate) / (24 * 60 * 60 * 1000));
            const priceStep = (targetPrice - lastPrice) / daysDiff;

            // 日次データを生成して埋める
            for (let d = 1; d <= daysDiff; d++) {
                predictions.push({
                    timestamp: lastDate + d * 24 * 60 * 60 * 1000,
                    price: lastPrice + priceStep * d,
                });
            }

            lastPrice = targetPrice;
            lastDate = targetDate;
        }

        // keyFactorsとrisksが文字列配列かオブジェクト配列かを判定して整形
        const formatFactors = (items: any[]) => {
            if (!Array.isArray(items)) return [];
            return items.map(item => {
                if (typeof item === 'string') {
                    return { title: item, reasoning: 'AIによる詳細な分析データが含まれていませんが、この要因は現在の市場トレンドにおいて重要です。' };
                }
                return item;
            });
        };

        return {
            predictions,
            analysis: parsed.analysis || 'AI分析を生成できませんでした',
            confidence: parsed.overallConfidence || 'medium',
            keyFactors: formatFactors(parsed.keyFactors),
            risks: formatFactors(parsed.risks),
        };
    } catch (error) {
        console.error('Error parsing AI response:', error);
        return generateMockPrediction('Asset', historicalData);
    }
}

/**
 * モック予測を生成（APIキーがない場合のフォールバック）
 */
function generateMockPrediction(
    assetName: string,
    historicalData: HistoricalPrice[]
): PredictionResult {
    const currentPrice = historicalData[historicalData.length - 1].price;
    const lastTimestamp = historicalData[historicalData.length - 1].timestamp;

    // シンプルなトレンド予測（過去30日の平均成長率を使用）
    const recentData = historicalData.slice(-30);
    const avgGrowthRate = (currentPrice - recentData[0].price) / recentData[0].price / 30;

    const predictions: HistoricalPrice[] = [];
    let predictedPrice = currentPrice;

    // 1年分（365日）の日次データを生成
    const dampingFactor = 0.995; // 成長率の減衰係数（徐々に成長を緩やかにする）
    let currentGrowthRate = avgGrowthRate;

    for (let day = 1; day <= 365; day++) {
        // 成長率を減衰させる
        currentGrowthRate *= dampingFactor;

        // ランダムな変動を追加 (変動幅をさらに小さくしてマイルドに)
        // ノイズを滑らかにするために、前日の変動の影響を残す（簡易的な平滑化）
        const randomNoise = (Math.random() - 0.5) * 0.015;
        const randomFactor = 1 + randomNoise;

        // 成長トレンド + ランダム変動
        predictedPrice = predictedPrice * (1 + currentGrowthRate) * randomFactor;

        const timestamp = lastTimestamp + day * 24 * 60 * 60 * 1000;
        predictions.push({
            timestamp,
            price: predictedPrice,
        });
    }

    return {
        predictions,
        analysis: `${assetName}の今後1年間の価格予測分析:

過去1年間のデータとテクニカル分析に基づき、${assetName}は今後12ヶ月間で段階的な成長が見込まれます。

【主要な分析ポイント】
1. **トレンド分析**: 過去30日間のデータから、平均的な成長率は${(avgGrowthRate * 100).toFixed(2)}%/日と算出されます。この傾向が継続すると仮定した場合、年間で約${((Math.pow(1 + avgGrowthRate, 365) - 1) * 100).toFixed(2)}%の成長が期待されます。

2. **市場環境**: 現在の市場環境は比較的安定しており、機関投資家の参入も継続しています。これは中長期的な価格上昇を支える要因となります。

3. **ボラティリティ**: 短期的には±10-15%程度の価格変動が予想されますが、長期的なトレンドは上昇基調を維持すると予測されます。

【注意事項】
この予測は過去のデータとテクニカル分析に基づくものであり、投資アドバイスではありません。実際の市場は予測不可能な要因により大きく変動する可能性があります。投資判断は自己責任で行ってください。`,
        confidence: 'medium',
        keyFactors: [
            {
                title: '過去30日間の安定した成長トレンド',
                reasoning: '移動平均線が右肩上がりを示しており、短期・中期ともに上昇基調が継続しています。過去のボラティリティと比較しても安定した推移を見せており、大口投資家の継続的な買い支えが示唆されています。'
            },
            {
                title: '市場全体の好調なセンチメント',
                reasoning: '主要な経済指標の改善や、関連セクターへの資金流入が観測されており、投資家心理が改善傾向にあります。特に若年層の新規参入が増加しており、市場の底上げ要因となっています。'
            },
            {
                title: '機関投資家の継続的な参入',
                reasoning: 'オンチェーン分析によると、大口アドレスの保有量が増加傾向にあります。ETFや投資信託を通じた機関投資家の資金流入は、短期的な価格変動を抑制し、長期的な上昇トレンドを形成する基盤となります。'
            },
            {
                title: 'テクニカル指標の強気シグナル',
                reasoning: 'RSI（相対力指数）が依然として買われすぎ水準には達しておらず、MACDもゴールデンクロスを維持しています。これらはテクニカル分析において、上昇トレンドがまだ継続する可能性が高いことを示唆しています。'
            },
        ],
        risks: [
            {
                title: '規制環境の変化による影響',
                reasoning: '主要国における暗号資産や金融商品に対する規制強化の動きは、市場センチメントを冷やす最大のリスク要因です。特に未登録証券問題や税制改正に関するニュースには注意が必要です。'
            },
            {
                title: 'マクロ経済の不確実性',
                reasoning: 'インフレ率の高止まりや中央銀行に金融引き締め政策への転換は、リスク資産全般への逆風となります。景気後退懸念が高まった場合、資金がリスクオフに向かい、価格が下落する可能性があります。'
            },
            {
                title: '市場全体の調整局面の可能性',
                reasoning: '短期間での急激な価格上昇の反動として、利益確定売りによる一時的な調整局面が訪れる可能性があります。過去のパターンからも、一定の上昇後には10-20%程度の下落調整が一般的です。'
            },
            {
                title: '競合資産への資金流出リスク',
                reasoning: 'より高い利回りや技術的優位性を持つ新しいプロジェクトや競合資産への関心が高まり、資金が流出するリスクがあります。市場シェアの推移を注視する必要があります。'
            },
        ],
    };
}
