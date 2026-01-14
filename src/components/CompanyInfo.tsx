import type { StockData } from '../services/stockService';

interface CompanyInfoProps {
    stockData: StockData;
}

export default function CompanyInfo({ stockData }: CompanyInfoProps) {
    return (
        <div className="glass-card animate-slide-up" style={{ padding: '2rem', marginBottom: '2rem' }}>
            {stockData.isMock && (
                <div style={{
                    background: 'rgba(255, 150, 0, 0.1)',
                    border: '1px solid rgba(255, 150, 0, 0.3)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: '#ffb347' // 明るいオレンジ
                }}>
                    <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                    <p style={{ margin: 0, fontSize: '0.875rem' }}>
                        リアルタイムデータの取得に失敗したため、デモデータを表示しています。
                        <br />
                        <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                            (API制限またはキー設定エラーの可能性があります)
                        </span>
                    </p>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 className="glow-text-cyan" style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                    🏢 企業情報
                </h3>
                {stockData.market && (
                    <span style={{
                        background: 'rgba(0, 255, 255, 0.1)',
                        border: '1px solid rgba(0, 255, 255, 0.3)',
                        borderRadius: '4px',
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.875rem',
                        color: 'var(--color-text-secondary)'
                    }}>
                        {stockData.market}
                    </span>
                )}
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem'
            }}>
                {stockData.description && (
                    <div style={{ gridColumn: '1 / -1' }}>
                        <p style={{ color: 'var(--color-gray-300)', lineHeight: 1.6, fontSize: '1rem' }}>
                            {stockData.description}
                        </p>
                    </div>
                )}

                {stockData.sector && (
                    <div>
                        <p style={{ color: 'var(--color-gray-400)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            業種
                        </p>
                        <p className="glow-text-cyan" style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                            {stockData.sector}
                        </p>
                    </div>
                )}

                {stockData.marketCap && (
                    <div>
                        <p style={{ color: 'var(--color-gray-400)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            時価総額
                        </p>
                        <p className="glow-text-purple" style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                            {stockData.country === 'US' ? '$' : '¥'}{formatLargeNumber(stockData.marketCap, stockData.country)}
                        </p>
                    </div>
                )}

                {stockData.employees && (
                    <div>
                        <p style={{ color: 'var(--color-gray-400)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            従業員数
                        </p>
                        <p className="glow-text-green" style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                            {stockData.employees.toLocaleString()}人
                        </p>
                    </div>
                )}

                {stockData.revenue && (
                    <div>
                        <p style={{ color: 'var(--color-gray-400)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            前年度売上高
                        </p>
                        <p className="glow-text-blue" style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                            {stockData.country === 'US' ? '$' : '¥'}{formatLargeNumber(stockData.revenue, stockData.country)}
                        </p>
                    </div>
                )}

                {stockData.operatingIncome && (
                    <div>
                        <p style={{ color: 'var(--color-gray-400)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            営業利益
                        </p>
                        <p style={{ fontSize: '1.125rem', fontWeight: 600, color: stockData.operatingIncome >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                            {stockData.country === 'US' ? '$' : '¥'}{formatLargeNumber(stockData.operatingIncome, stockData.country)}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function formatLargeNumber(value: number, country?: string): string {
    const absValue = Math.abs(value);
    // USドルの場合 (Billion/Million)
    if (country === 'US') {
        if (absValue >= 1_000_000_000) {
            return `${(value / 1_000_000_000).toFixed(1)}B`;
        } else if (absValue >= 1_000_000) {
            return `${(value / 1_000_000).toFixed(1)}M`;
        }
        return value.toLocaleString();
    }

    // 日本円の場合 (兆/億)
    if (absValue >= 1_000_000_000_000) {
        return `${(value / 1_000_000_000_000).toFixed(1)}兆`;
    } else if (absValue >= 100_000_000) {
        return `${(value / 100_000_000).toFixed(0)}億`;
    }
    return value.toLocaleString();
}
