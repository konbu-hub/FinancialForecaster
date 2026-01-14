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

// 株価履歴データ取得エンドポイント
app.get('/api/stock/:code/history', async (req, res) => {
    try {
        const { code } = req.params;
        const { range = '1y', interval = '1d' } = req.query;

        // .Tサフィックスを追加
        const symbol = code.endsWith('.T') ? code : `${code}.T`;

        console.log(`Fetching history for: ${symbol}, Range: ${range}, Interval: ${interval}`);

        const response = await axios.get(
            `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
            {
                params: {
                    range,
                    interval
                },
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }
        );

        const result = response.data.chart.result[0];

        if (!result || !result.timestamp) {
            return res.status(404).json({
                error: 'History not found',
                details: `No historical data available for symbol ${symbol}`
            });
        }

        const timestamps = result.timestamp;
        const quote = result.indicators.quote[0];

        // 配列を結合してオブジェクトの配列に変換
        const history = timestamps.map((timestamp, index) => {
            return {
                timestamp: timestamp * 1000, // 秒 -> ミリ秒
                open: quote.open[index],
                high: quote.high[index],
                low: quote.low[index],
                close: quote.close[index],
                volume: quote.volume[index],
                price: quote.close[index] // 互換性のためpriceも設定
            };
        }).filter(item => item.close !== null); // nullデータをフィルタリング

        res.json(history);

    } catch (error) {
        console.error('Yahoo Finance History API Error:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Failed to fetch historical data',
            details: error.response?.data?.chart?.error?.description || error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy Server running on http://localhost:${PORT}`);
    console.log('Using Yahoo Finance API for Japanese stock data');
});
