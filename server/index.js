require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3001;

app.use(cors());

// 株価データ取得エンドポイント
app.get('/api/stock/:code', async (req, res) => {
    try {
        const { code } = req.params;
        // .Tサフィックスを追加(Yahoo Financeの東証銘柄フォーマット)
        const symbol = code.endsWith('.T') ? code : `${code}.T`;

        console.log(`Fetching stock data for: ${symbol}`);

        // Yahoo Finance APIを使用
        const response = await axios.get(
            `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }
        );

        const result = response.data.chart.result[0];

        if (!result || !result.meta) {
            return res.status(404).json({
                error: 'Stock not found',
                details: `No data available for symbol ${symbol}`
            });
        }

        const meta = result.meta;
        const currentPrice = meta.regularMarketPrice;
        const previousClose = meta.previousClose || meta.chartPreviousClose;

        // 前日比を計算
        const change = currentPrice - previousClose;
        const changePercent = (change / previousClose) * 100;

        res.json({
            symbol: symbol,
            price: currentPrice,
            change: change,
            changePercent: changePercent,
            currency: meta.currency,
            exchange: meta.fullExchangeName,
            source: 'Yahoo Finance',
            timestamp: meta.regularMarketTime
        });

    } catch (error) {
        console.error('Yahoo Finance API Error:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Failed to fetch stock data',
            details: error.response?.data?.chart?.error?.description || error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy Server running on http://localhost:${PORT}`);
    console.log('Using Yahoo Finance API for Japanese stock data');
});
