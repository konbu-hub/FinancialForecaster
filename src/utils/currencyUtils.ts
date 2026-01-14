import axios from 'axios';

interface ExchangeRates {
    [currency: string]: number;
}

/**
 * 為替レートを取得（USD基準）
 */
export async function getExchangeRates(): Promise<ExchangeRates> {
    try {
        // 無料の為替レートAPI（exchangerate-api.com）を使用
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');

        if (response.data && response.data.rates) {
            return response.data.rates;
        }

        // フォールバック: 固定レート
        return getFallbackRates();
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        return getFallbackRates();
    }
}

/**
 * フォールバック用の固定為替レート
 */
function getFallbackRates(): ExchangeRates {
    return {
        USD: 1,
        JPY: 150, // 1 USD = 150 JPY（概算）
        EUR: 0.92,
        GBP: 0.79,
    };
}

/**
 * 通貨変換
 */
export function convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    rates: ExchangeRates
): number {
    if (fromCurrency === toCurrency) {
        return amount;
    }

    // USD基準で変換
    const amountInUSD = fromCurrency === 'USD' ? amount : amount / rates[fromCurrency];
    const convertedAmount = toCurrency === 'USD' ? amountInUSD : amountInUSD * rates[toCurrency];

    return convertedAmount;
}

/**
 * 通貨フォーマット
 */
export function formatCurrency(amount: number, currency: string): string {
    const locale = currency === 'JPY' ? 'ja-JP' : 'en-US';

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: currency === 'JPY' ? 0 : 2,
        maximumFractionDigits: currency === 'JPY' ? 0 : 2,
    }).format(amount);
}

/**
 * 通貨シンボルを取得
 */
export function getCurrencySymbol(currency: string): string {
    const symbols: { [key: string]: string } = {
        USD: '$',
        JPY: '¥',
        EUR: '€',
        GBP: '£',
    };

    return symbols[currency] || currency;
}
