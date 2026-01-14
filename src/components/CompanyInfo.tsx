import type { StockData } from '../services/stockService';

interface CompanyInfoProps {
    stockData: StockData;
}

export default function CompanyInfo({ stockData }: CompanyInfoProps) {
    return (
        <div className="glass-card animate-slide-up" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h3 className="glow-text-cyan" style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>
                🏢 企業情報
            </h3>

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
                            {formatMarketCap(stockData.marketCap)}
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
            </div>
        </div>
    );
}

function formatMarketCap(value: number): string {
    if (value >= 1_000_000_000_000) {
        return `¥${(value / 1_000_000_000_000).toFixed(1)}兆`;
    } else if (value >= 100_000_000) {
        return `¥${(value / 100_000_000).toFixed(0)}億`;
    }
    return `¥${value.toLocaleString()}`;
}
