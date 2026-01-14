import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { format } from 'date-fns';
import type { HistoricalPrice } from '../services/cryptoService';
import { convertCurrency, getCurrencySymbol } from '../utils/currencyUtils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface PriceChartProps {
    data: HistoricalPrice[];
    title: string;
    color?: string;
    currency?: string;
    exchangeRates?: { [key: string]: number };
    sourceCurrency?: string; // 元の通貨（JPYまたはUSD）
}

export default function PriceChart({
    data,
    title,
    color = '#00f0ff',
    currency = 'JPY',
    exchangeRates = { USD: 1, JPY: 150 },
    sourceCurrency = 'USD' // デフォルトはUSD
}: PriceChartProps) {
    const currencySymbol = getCurrencySymbol(currency);
    const [timeRange, setTimeRange] = useState<'1W' | '1M' | '6M' | '1Y'>('1M');

    // 期間に応じてデータをフィルタリング
    const getFilteredData = () => {
        let daysToSlice = 30; // 1M (default)
        switch (timeRange) {
            case '1W': daysToSlice = 7; break;
            case '1M': daysToSlice = 30; break;
            case '6M': daysToSlice = 180; break;
            case '1Y': daysToSlice = 365; break;
        }
        return data.slice(-Math.min(data.length, daysToSlice));
    };

    const filteredData = getFilteredData();

    const chartData = {
        labels: filteredData.map((d) => format(new Date(d.timestamp), 'yyyy/MM/dd')),
        datasets: [
            {
                label: `価格 (${currency})`,
                data: filteredData.map((d) => convertCurrency(d.price, sourceCurrency, currency, exchangeRates)),
                borderColor: color,
                backgroundColor: `${color}20`,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: color,
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top' as const,
                labels: {
                    color: '#e6e6e6',
                    font: {
                        family: 'Orbitron',
                        size: 12,
                    },
                },
            },
            title: {
                display: true,
                text: title,
                color: color,
                font: {
                    family: 'Orbitron',
                    size: 16,
                    weight: 'bold' as const,
                },
            },
            tooltip: {
                backgroundColor: 'rgba(10, 14, 39, 0.9)',
                titleColor: color,
                bodyColor: '#e6e6e6',
                borderColor: color,
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                callbacks: {
                    label: function (context: any) {
                        const value = currency === 'JPY' ? Math.round(context.parsed.y) : context.parsed.y.toFixed(2);
                        return `${currencySymbol}${value.toLocaleString()}`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false,
                },
                ticks: {
                    color: '#999',
                    maxTicksLimit: 8,
                    font: {
                        family: 'Inter',
                        size: 10,
                    },
                },
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false,
                },
                ticks: {
                    color: '#999',
                    callback: function (value: any) {
                        const formatted = currency === 'JPY' ? Math.round(value) : value.toFixed(0);
                        return currencySymbol + formatted.toLocaleString();
                    },
                    font: {
                        family: 'Inter',
                        size: 10,
                    },
                },
            },
        },
        interaction: {
            intersect: false,
            mode: 'index' as const,
        },
    };

    return (
        <div className="glass-card animate-slide-up" style={{ padding: '1.5rem', height: '460px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10, display: 'flex', gap: '0.5rem' }}>
                {(['1W', '1M', '6M', '1Y'] as const).map((range) => (
                    <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        style={{
                            background: timeRange === range ? `${color}40` : 'rgba(255, 255, 255, 0.05)',
                            border: `1px solid ${timeRange === range ? color : 'rgba(255, 255, 255, 0.1)'}`,
                            color: timeRange === range ? color : '#aaa',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontFamily: 'Orbitron',
                            transition: 'all 0.2s'
                        }}
                    >
                        {range}
                    </button>
                ))}
            </div>
            <div style={{ height: '100%' }}>
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
}
