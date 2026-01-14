import { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import PriceChart from './components/PriceChart';
import PredictionChart from './components/PredictionChart';
import AnalysisReport from './components/AnalysisReport';
import CompanyInfo from './components/CompanyInfo';
import CryptoInfo from './components/CryptoInfo';
import { getCryptoData, getCryptoHistoricalData, resolveCoinId } from './services/cryptoService';
import { getStockData, getStockHistoricalData, type StockData } from './services/stockService';
import { getAssetNews } from './services/newsService';
import { generatePricePrediction } from './services/aiService';
import { getExchangeRates, convertCurrency, formatCurrency } from './utils/currencyUtils';
import type { HistoricalPrice, CryptoData } from './services/cryptoService';
import type { PredictionResult } from './services/aiService';
import './index.css';

function App() {
  const [assetName, setAssetName] = useState<string>('');
  const [assetType, setAssetType] = useState<'crypto' | 'stock'>('crypto');
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [historicalData, setHistoricalData] = useState<HistoricalPrice[]>([]);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [cryptoData, setCryptoData] = useState<CryptoData | null>(null);

  // 通貨設定（JPYを標準）
  const [currency, setCurrency] = useState<'JPY' | 'USD'>('JPY');
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({ USD: 1, JPY: 150 });

  // 為替レート取得
  useEffect(() => {
    const fetchRates = async () => {
      const rates = await getExchangeRates();
      setExchangeRates(rates);
    };
    fetchRates();
  }, []);

  const handleSearch = async (query: string, type: 'crypto' | 'stock') => {
    setIsLoading(true);
    setError('');
    setAssetType(type);
    setPrediction(null);
    setStockData(null);
    setCryptoData(null);

    try {
      let name = '';
      let price = 0;
      let change = 0;
      let historical: HistoricalPrice[] = [];

      if (type === 'crypto') {
        // シンボル/名前からIDを解決
        const coinId = await resolveCoinId(query.toLowerCase());

        // 仮想通貨データ取得
        const data = await getCryptoData(coinId);
        setCryptoData(data);

        name = data.name;
        price = data.current_price;
        change = data.price_change_percentage_24h;
        historical = await getCryptoHistoricalData(coinId);
      } else {
        // 株式データ取得
        const stockDataResult = await getStockData(query.toUpperCase());
        setStockData(stockDataResult);
        name = stockDataResult.name;
        price = stockDataResult.price;
        change = stockDataResult.changePercent;
        historical = await getStockHistoricalData(query.toUpperCase());
      }

      setAssetName(name);
      setCurrentPrice(price);
      setPriceChange(change);
      setHistoricalData(historical);

      // ニュース取得
      const news = await getAssetNews(name);

      // AI予測生成
      const predictionResult = await generatePricePrediction(name, type, historical, news);
      setPrediction(predictionResult);
    } catch (err) {
      console.error('Search error:', err);
      // エラーオブジェクトか文字列か判定してメッセージを設定
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';

      const displayMessage = errorMessage.includes('見つかりませんでした')
        ? '指定された銘柄が見つかりませんでした。別の名前やシンボルで試してください。'
        : 'データの取得に失敗しました。しばらくしてから再度お試しください。';
      setError(displayMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* ヘッダー */}
      <header style={{ padding: '2rem 0 1rem', textAlign: 'center', position: 'relative' }}>
        <h1
          className="font-heading text-gradient-cyan-purple"
          style={{
            fontSize: 'clamp(1.5rem, 5vw, 3.5rem)',
            marginBottom: '0.5rem',
            letterSpacing: '0.1em',
            textTransform: 'none',
            padding: '0 1rem',
          }}
        >
          AI Financial Forecaster
        </h1>
        <p style={{
          color: 'var(--color-gray-400)',
          fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)',
          padding: '0 1rem',
          marginBottom: '1rem',
        }}>
          仮想通貨・株式の未来を予測する次世代AIアナリスト
        </p>

        {/* 通貨切り替えボタン - モバイル対応 */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'center',
          padding: '0 1rem',
        }}>
          <button
            className={`btn ${currency === 'JPY' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setCurrency('JPY')}
            style={{
              minWidth: '80px',
              padding: '0.5rem 1rem',
              fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
            }}
          >
            ¥ JPY
          </button>
          <button
            className={`btn ${currency === 'USD' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setCurrency('USD')}
            style={{
              minWidth: '80px',
              padding: '0.5rem 1rem',
              fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
            }}
          >
            $ USD
          </button>
        </div>
      </header>

      {/* 検索バー */}
      <div className="container" style={{ marginBottom: '3rem' }}>
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* ローディング */}
      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem' }}>
          <div className="spinner animate-glow" />
          <p style={{ marginLeft: '1rem', color: 'var(--color-accent-cyan)', fontFamily: 'Orbitron' }}>
            データ分析中...
          </p>
        </div>
      )}

      {/* エラー */}
      {error && (
        <div className="container">
          <div
            className="glass-card"
            style={{
              padding: '2rem',
              textAlign: 'center',
              borderColor: 'var(--color-error)',
            }}
          >
            <p style={{ color: 'var(--color-error)', fontSize: '1.125rem' }}>⚠️ {error}</p>
          </div>
        </div>
      )}

      {/* 結果表示 */}
      {!isLoading && assetName && historicalData.length > 0 && (
        <div className="container">
          {/* 資産情報カード */}
          <div
            className="glass-card animate-slide-up"
            style={{
              padding: 'clamp(1rem, 3vw, 2rem)',
              marginBottom: '2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 'clamp(1rem, 3vw, 2rem)',
            }}
          >
            <div>
              <p style={{ color: 'var(--color-gray-400)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                資産名
              </p>
              <p className="glow-text-cyan" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {assetName}
              </p>
            </div>
            <div>
              <p style={{ color: 'var(--color-gray-400)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                現在価格
              </p>
              <p className="glow-text-green" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {(() => {
                  // 日本株の場合はJPY、米国株・仮想通貨の場合はUSD
                  const sourceCurrency = (assetType === 'stock' && stockData?.country === 'JP') ? 'JPY' : 'USD';
                  return formatCurrency(convertCurrency(currentPrice, sourceCurrency, currency, exchangeRates), currency);
                })()}
              </p>
            </div>
            <div>
              <p style={{ color: 'var(--color-gray-400)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                24時間変動
              </p>
              <p
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: priceChange >= 0 ? 'var(--color-success)' : 'var(--color-error)',
                }}
              >
                {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
              </p>
            </div>
          </div>

          {/* 会社情報（株式のみ） */}
          {assetType === 'stock' && stockData && (
            <CompanyInfo stockData={stockData} />
          )}

          {/* 仮想通貨詳細情報（仮想通貨のみ） */}
          {assetType === 'crypto' && cryptoData && (
            <CryptoInfo
              cryptoData={cryptoData}
              currency={currency}
              exchangeRates={exchangeRates}
            />
          )}

          {/* 過去データチャート */}
          <div style={{ marginBottom: '2rem' }}>
            <PriceChart
              data={historicalData}
              title="過去1年間の価格推移"
              color="#00f0ff"
              currency={currency}
              exchangeRates={exchangeRates}
              sourceCurrency={(assetType === 'stock' && stockData?.country === 'JP') ? 'JPY' : 'USD'}
            />
          </div>

          {/* 予測チャート */}
          {prediction && (
            <>
              <div style={{ marginBottom: '2rem' }}>
                <PredictionChart
                  historicalData={historicalData}
                  predictionData={prediction.predictions}
                  title="今後1年間のAI価格予測"
                  currency={currency}
                  exchangeRates={exchangeRates}
                  sourceCurrency={(assetType === 'stock' && stockData?.country === 'JP') ? 'JPY' : 'USD'}
                />
              </div>

              {/* AI分析レポート */}
              <div style={{ marginBottom: '2rem' }}>
                <AnalysisReport prediction={prediction} assetName={assetName} />
              </div>
            </>
          )}
        </div>
      )}

      {/* フッター */}
      <footer
        style={{
          marginTop: '4rem',
          padding: '2rem',
          textAlign: 'center',
          borderTop: '1px solid var(--glass-border)',
        }}
      >
        <p style={{ color: 'var(--color-gray-600)', fontSize: '0.75rem', opacity: 0.5 }}>
          Powered by AI • CoinGecko • News API
        </p>
      </footer>
    </div>
  );
}

export default App;
