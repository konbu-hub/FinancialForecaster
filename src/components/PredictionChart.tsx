import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import type { HistoricalPrice } from '../services/cryptoService';
import { convertCurrency, getCurrencySymbol } from '../utils/currencyUtils';

interface PredictionChartProps {
    historicalData: HistoricalPrice[];
    predictionData: HistoricalPrice[];
    title: string;
    currency?: string;
    exchangeRates?: { [key: string]: number };
    sourceCurrency?: string;
}

export default function PredictionChart({
    historicalData,
    predictionData,
    title,
    currency = 'JPY',
    exchangeRates = { USD: 1, JPY: 150 },
    sourceCurrency = 'USD'
}: PredictionChartProps) {
    const currencySymbol = getCurrencySymbol(currency);
    const [timeRange, setTimeRange] = useState<'1W' | '1M' | '6M' | '1Y'>('1M');

    // 期間に応じてデータをフィルタリング
    const getFilteredData = () => {
        let daysToSlice = 30; // 1M (default)
        let predictionDays = 30; // 予測データの表示期間

        switch (timeRange) {
            case '1W':
                daysToSlice = 7;
                predictionDays = 7;
                break;
            case '1M':
                daysToSlice = 30;
                predictionDays = 30;
                break;
            case '6M':
                daysToSlice = 180;
                predictionDays = 180;
                break;
            case '1Y':
                daysToSlice = 365;
                predictionDays = 365;
                break;
        }

        const filteredHistorical = historicalData.slice(-Math.min(historicalData.length, daysToSlice));
        const filteredPrediction = predictionData.slice(0, Math.min(predictionData.length, predictionDays));

        return {
            recentHistorical: filteredHistorical,
            filteredPrediction,
            combinedData: [...filteredHistorical, ...filteredPrediction],
            predictionLength: filteredPrediction.length
        };
    };

    const { recentHistorical, filteredPrediction, combinedData, predictionLength } = getFilteredData();

    const chartData = {
        labels: combinedData.map((d) => format(new Date(d.timestamp), 'yyyy/MM/dd')),
        datasets: [
            {
                label: '過去データ',
                data: [
                    ...recentHistorical.map((d) => convertCurrency(d.price, sourceCurrency, currency, exchangeRates)),
                    ...new Array(predictionLength).fill(null),
                ],
                borderColor: '#00f0ff',
                backgroundColor: 'rgba(0, 240, 255, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
            },
            {
                label: 'AI予測',
                data: [
                    ...new Array(recentHistorical.length - 1).fill(null),
                    convertCurrency(recentHistorical[recentHistorical.length - 1].price, sourceCurrency, currency, exchangeRates),
                    ...filteredPrediction.map((d) => convertCurrency(d.price, sourceCurrency, currency, exchangeRates)),
                ],
                borderColor: '#00ff88',
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
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
                color: '#00ff88',
                font: {
                    family: 'Orbitron',
                    size: 16,
                    weight: 'bold' as const,
                },
            },
            tooltip: {
                backgroundColor: 'rgba(10, 14, 39, 0.9)',
                titleColor: '#00ff88',
                bodyColor: '#e6e6e6',
                borderColor: '#00ff88',
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                callbacks: {
                    label: function (context: any) {
                        if (context.parsed.y === null) return '';
                        const value = currency === 'JPY' ? Math.round(context.parsed.y) : context.parsed.y.toFixed(2);
                        return `${context.dataset.label}: ${currencySymbol}${value.toLocaleString()}`;
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
                    maxTicksLimit: 10,
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
                            background: timeRange === range ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                            border: `1px solid ${timeRange === range ? '#00f0ff' : 'rgba(255, 255, 255, 0.1)'}`,
                            color: timeRange === range ? '#00f0ff' : '#aaa',
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
