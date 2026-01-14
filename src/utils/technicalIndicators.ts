/**
 * テクニカル指標計算ユーティリティ
 */

// 単純移動平均 (SMA) の計算
export function calculateSMA(prices: number[], period: number): number | null {
    if (prices.length < period) return null;

    // 直近のデータを優先するため、配列の末尾からperiod分を取得することを想定
    // 入力配列は [oldest, ..., newest] の順序であることを前提とする
    const slice = prices.slice(-period);
    const sum = slice.reduce((a, b) => a + b, 0);
    return sum / period;
}

// 相対力指数 (RSI) の計算 (14日間推奨)
export function calculateRSI(prices: number[], period: number = 14): number | null {
    if (prices.length < period + 1) return null;

    let gains = 0;
    let losses = 0;

    // 直近 period + 1 日分のデータを使用して計算（前日比が必要なため）
    const relevantPrices = prices.slice(-(period + 1));

    for (let i = 1; i < relevantPrices.length; i++) {
        const difference = relevantPrices[i] - relevantPrices[i - 1];
        if (difference >= 0) {
            gains += difference;
        } else {
            losses += Math.abs(difference);
        }
    }

    // 初回の平均
    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

// ヒストリカル・ボラティリティ (変動率) の計算
// 標準偏差を現在価格に対する比率(%)で返す
export function calculateVolatility(prices: number[], period: number = 30): number | null {
    if (prices.length < period) return null;

    const slice = prices.slice(-period);
    const mean = slice.reduce((a, b) => a + b, 0) / period;

    const squaredDiffs = slice.map(price => Math.pow(price - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
    const stdDev = Math.sqrt(variance);

    // 変動係数 (CV) として返す (0-100%)
    return (stdDev / mean) * 100;
}
