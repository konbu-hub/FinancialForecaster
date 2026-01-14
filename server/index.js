require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const yahooFinance = require('yahoo-finance2').default; // Foreign stock support

const app = express();
const PORT = 3001;

app.use(cors());

const JQUANTS_API_URL = 'https://api.jquants.com/v2';

// J-Quants API呼び出しヘルパー
async function fetchJQuantsData(code, from, to) {
    const apiKey = process.env.JQUANTS_API_KEY;
    if (!apiKey) {
        throw new Error('JQUANTS_API_KEY is not set');
    }

    // J-Quantsのコードは末尾の.Tを削除が必要な場合があるが、
    // V2のドキュメントや検証ではそのまま数字コード(7203等)を使用。
    // クライアントからは 7203.T で来るので削除する。
    const stockCode = code.replace('.T', '');

    try {
        const response = await axios.get(`${JQUANTS_API_URL}/equities/bars/daily`, {
            headers: { 'x-api-key': apiKey },
            params: {
                code: stockCode,
                from: from,
                to: to,
                pagination_key: '' // ページネーションが必要な場合があるが、とりあえず簡易実装
            }
        });
        return response.data.data; // { data: [...] }
    } catch (error) {
        console.error('J-Quants API Error:', error.response?.data || error.message);
        throw error;
    }
}

// 日付フォーマット YYYYMMDD
function formatDate(date) {
    const y = date.getFullYear();
    const m = ('0' + (date.getMonth() + 1)).slice(-2);
    const d = ('0' + date.getDate()).slice(-2);
    return `${y}${m}${d}`;
}

// 過去の日付を計算
function getPastDate(rangeStr) {
    const date = new Date();
    // J-Quants無料プランは12週間遅延なので、"現在"として扱う基準日をずらす必要があるか？
    // ユーザーは「過去のグラフなどもそのデータ参照」と言っているので、
    // 単純にAPIから返ってくる日付を使う。
    // ただし、検索範囲の 'to' は現在日時でよいが、データがないだけ。
    // 'from' は現在日時から遡って指定する。

    switch (rangeStr) {
        case '1d': date.setDate(date.getDate() - 5); break; // 休日考慮して少し長めに
        case '5d': date.setDate(date.getDate() - 10); break;
        case '1mo': date.setMonth(date.getMonth() - 1); break;
        case '3mo': date.setMonth(date.getMonth() - 3); break;
        case '6mo': date.setMonth(date.getMonth() - 6); break;
        case '1y': date.setFullYear(date.getFullYear() - 1); break;
        case '2y': date.setFullYear(date.getFullYear() - 2); break;
        case '5y': date.setFullYear(date.getFullYear() - 5); break;
        default: date.setFullYear(date.getFullYear() - 1);
    }
    return formatDate(date);
}

// 株価データ取得エンドポイント (現在価格相当)
app.get('/api/stock/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const symbol = code.endsWith('.T') ? code : `${code}.T`;
        console.log(`[J-Quants] Fetching delay stock data for: ${symbol}`);

        // 最新のデータを取得するために、過去6ヶ月分のデータを要求
        // J-Quants無料プランは"現在"から約12週間前までのデータしかアクセスできないため、
        // toDate も現在日時ではなく、12週間前の日付を指定する必要がある。
        // "Your subscription covers the following dates: ... ~ 2025-10-22" というエラーが出るため。

        const now = new Date();
        // 12週間(84日) + バッファで90日引く
        now.setDate(now.getDate() - 90);

        const toDate = formatDate(now);

        // fromはそこからさらに半年前
        const past = new Date(now);
        past.setMonth(past.getMonth() - 6);
        const fromDate = formatDate(past);

        const quotes = await fetchJQuantsData(code, fromDate, toDate);

        if (!quotes || quotes.length === 0) {
            return res.status(404).json({
                error: 'Stock not found',
                details: `No data available for symbol ${symbol} in J-Quants`
            });
        }

        // 配列の最後が最新
        const latest = quotes[quotes.length - 1];
        const previous = quotes.length >= 2 ? quotes[quotes.length - 2] : latest;

        // J-Quantsのレスポンス形式:
        // { Date: '2025-10-22', Code: '72030', O: ..., H: ..., L: ..., C: ..., ... }
        // 調整後終値(AdjC)を使用するのが一般的
        const currentPrice = latest.AdjC || latest.Close || latest.C;
        const previousClose = previous.AdjC || previous.Close || previous.C;

        const change = currentPrice - previousClose;
        const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;

        res.json({
            symbol: symbol,
            price: currentPrice,
            change: change,
            changePercent: changePercent,
            currency: 'JPY', // J-Quantsは日本株のみなのでJPY固定
            exchange: 'Tokyo',
            source: 'J-Quants (V2・Delayed)',
            isDelayed: true, // 遅延フラグ
            timestamp: new Date(latest.Date).getTime()
        });

    } catch (error) {
        console.error('J-Quants Proxy Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch stock data' });
    }
});

// 株価履歴データ取得エンドポイント
app.get('/api/stock/:code/history', async (req, res) => {
    try {
        const { code } = req.params;
        const { range = '1y', interval = '1d' } = req.query;

        // 日本株判定 (数字4-5桁 または .T で終わる)
        const isJp = /^\d{4,5}$/.test(code) || code.endsWith('.T');

        if (isJp) {
            // === J-Quants (日本株) Logic ===
            const symbol = code.endsWith('.T') ? code : `${code}.T`;
            console.log(`[J-Quants] Fetching history for: ${symbol}, Range: ${range}`);

            // J-Quants無料プラン対応: 現在から約90日前を最新(toDate)とする
            const now = new Date();
            now.setDate(now.getDate() - 90);
            const toDate = formatDate(now);

            // fromDateは、その toDate から range 分遡る
            const fromDateObj = new Date(now); // toDateの時点
            switch (range) {
                case '1d': fromDateObj.setDate(fromDateObj.getDate() - 5); break;
                case '5d': fromDateObj.setDate(fromDateObj.getDate() - 10); break;
                case '1mo': fromDateObj.setMonth(fromDateObj.getMonth() - 1); break;
                case '3mo': fromDateObj.setMonth(fromDateObj.getMonth() - 3); break;
                case '6mo': fromDateObj.setMonth(fromDateObj.getMonth() - 6); break;
                case '1y': fromDateObj.setFullYear(fromDateObj.getFullYear() - 1); break;
                case '2y': fromDateObj.setFullYear(fromDateObj.getFullYear() - 2); break;
                case '5y': fromDateObj.setFullYear(fromDateObj.getFullYear() - 5); break;
                default: fromDateObj.setFullYear(fromDateObj.getFullYear() - 1);
            }
            const fromDate = formatDate(fromDateObj);

            const quotes = await fetchJQuantsData(code, fromDate, toDate);

            if (!quotes || quotes.length === 0) {
                return res.status(404).json({ error: 'History not found' });
            }

            // フロントエンドの形式に変換
            const history = quotes.map(q => ({
                timestamp: new Date(q.Date).getTime(),
                open: q.testAdjO || q.AdjO || q.Open || q.O,
                high: q.AdjH || q.High || q.H,
                low: q.AdjL || q.Low || q.L,
                close: q.AdjC || q.Close || q.C,
                volume: q.AdjVolume || q.Volume || q.V || q.Vo,
                price: q.AdjC || q.Close || q.C
            }));

            res.json(history);

        } else {
            // === Yahoo Finance (外国株) Logic ===
            console.log(`[Yahoo Finance] Fetching history for: ${code}, Range: ${range}`);

            const now = new Date();
            const fromDate = new Date();
            switch (range) {
                case '1d': fromDate.setDate(now.getDate() - 1); break; // 1d is handled as logic
                case '5d': fromDate.setDate(now.getDate() - 5); break;
                case '1mo': fromDate.setMonth(now.getMonth() - 1); break;
                case '3mo': fromDate.setMonth(now.getMonth() - 3); break;
                case '6mo': fromDate.setMonth(now.getMonth() - 6); break;
                case '1y': fromDate.setFullYear(fromDate.getFullYear() - 1); break;
                case '2y': fromDate.setFullYear(fromDate.getFullYear() - 2); break;
                case '5y': fromDate.setFullYear(fromDate.getFullYear() - 5); break;
                default: fromDate.setFullYear(fromDate.getFullYear() - 1);
            }

            // queryOptions supports period1, period2, interval
            const result = await yahooFinance.chart(code, {
                period1: fromDate,
                period2: now,
                interval: interval // '1d', '1wk', '1mo'
            });

            if (!result || !result.quotes || result.quotes.length === 0) {
                return res.status(404).json({ error: 'History not found (Yahoo)' });
            }

            const history = result.quotes.map(q => ({
                timestamp: new Date(q.date).getTime(),
                open: q.open,
                high: q.high,
                low: q.low,
                close: q.close,
                volume: q.volume,
                price: q.close
            }));

            res.json(history);
        }

    } catch (error) {
        console.error('History API Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch historical data' });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy Server running on http://localhost:${PORT}`);
    console.log('Using J-Quants V2 API (Delayed Data)');
});
