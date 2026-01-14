import { formatCurrency } from '../utils/currencyUtils';
import type { CryptoData } from '../services/cryptoService';

interface CryptoInfoProps {
    cryptoData: CryptoData;
    currency: 'JPY' | 'USD';
    exchangeRates: { [key: string]: number };
}

export default function CryptoInfo({ cryptoData, currency, exchangeRates }: CryptoInfoProps) {
    // 数値フォーマットヘルパー
    const formatLargeNumber = (value: number | undefined): string => {
        if (value === undefined || value === null) return '-';

        // 通貨変換（時価総額などUSD建ての場合）
        // CryptoDataは基本的にUSDで来るので、表示通貨に合わせて変換が必要か？
        // ここでは単純化のため、元の値（USDベースかもしれないし、API次第）を表示するか、
        // あるいは通貨記号をつける。CoinGeckoのデータはUSD指定で取得している。

        // JPY表示の場合はレート換算
        let displayValue = value;
        let prefix = '$';

        if (currency === 'JPY') {
            displayValue = value * exchangeRates['JPY'];
            prefix = '¥';
        }

        if (displayValue >= 1_000_000_000_000) {
            return `${prefix}${(displayValue / 1_000_000_000_000).toFixed(2)}T`; // Trillion
        } else if (displayValue >= 1_000_000_000) {
            return `${prefix}${(displayValue / 1_000_000_000).toFixed(2)}B`; // Billion
        } else if (displayValue >= 1_000_000) {
            return `${prefix}${(displayValue / 1_000_000).toFixed(2)}M`; // Million
        }
        return `${prefix}${displayValue.toLocaleString()}`;
    };

    // 供給量など通貨単位がないもののフォーマット
    const formatSupply = (value: number | undefined): string => {
        if (value === undefined || value === null) return 'Infinite'; // nullの場合は無限とみなすケースも
        if (value === 0) return '-';

        if (value >= 1_000_000_000) {
            return `${(value / 1_000_000_000).toFixed(2)}B`;
        } else if (value >= 1_000_000) {
            return `${(value / 1_000_000).toFixed(2)}M`;
        }
        return value.toLocaleString();
    };

    return (
        <div className="glass-card animate-slide-up" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h3 className="glow-text-cyan" style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>
                📊 通貨データ
            </h3>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem'
            }}>
                <div>
                    <p style={{ color: 'var(--color-gray-400)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        時価総額
                    </p>
                    <p className="glow-text-purple" style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                        {formatLargeNumber(cryptoData.market_cap)}
                    </p>
                </div>

                <div>
                    <p style={{ color: 'var(--color-gray-400)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        24時間取引高
                    </p>
                    <p className="glow-text-blue" style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                        {formatLargeNumber(cryptoData.total_volume)}
                    </p>
                </div>

                <div>
                    <p style={{ color: 'var(--color-gray-400)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        循環供給量
                    </p>
                    <p style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-gray-200)' }}>
                        {formatSupply(cryptoData.circulating_supply)}
                    </p>
                </div>

                {cryptoData.max_supply && (
                    <div>
                        <p style={{ color: 'var(--color-gray-400)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            最大供給量
                        </p>
                        <p style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-gray-200)' }}>
                            {formatSupply(cryptoData.max_supply)}
                        </p>
                    </div>
                )}

                {cryptoData.ath && (
                    <div>
                        <p style={{ color: 'var(--color-gray-400)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            過去最高値 (ATH)
                        </p>
                        <p className="glow-text-green" style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                            {formatCurrency(cryptoData.ath * (currency === 'JPY' ? exchangeRates['JPY'] : 1), currency)}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
