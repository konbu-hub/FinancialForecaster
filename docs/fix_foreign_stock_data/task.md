# 機能拡張: 分析レポート詳細化とグラフ時間軸変更

## AI分析レポートの改善
- [x] `aiService.ts`の型定義を更新 (各要因・リスクに詳細説明フィールドを追加)
- [x] `aiService.ts`のモックデータ生成ロジックを更新し、詳細な考察テキストを追加
- [x] `AnalysisReport.tsx`のUIを改修し、各項目をクリックして詳細(考察)を展開表示できるようにする

## グラフ時間軸スケールの実装
- [x] `PredictionChart.tsx`に期間選択UI(1W, 1M, 6M, 1Y)を追加
- [x] 選択された期間に応じて表示データをフィルタリング/整形するロジックを実装
- [x] `PriceChart.tsx`にも同様の期間選択UIを追加(必要に応じて)
- [x] 時間軸変更の連携(親コンポーネントでの管理が必要か検討) - 未来予測データのフィルタリング対応完了
- [x] チャート予測ロジックのマイルド化（減衰係数導入）
- [x] チャート表示バランス（過去:未来 = 50:50）の検証

## 検証
- [x] 分析レポートのドリルダウン動作確認
- [x] グラフの時間軸切り替え動作確認

## デプロイ
- [x] GitHubへのPush
- [x] Vercelプロジェクト作成と環境変数設定
- [x] 動作確認

## 機能追加
- [x] 企業情報に前回決算（売上高・営業利益）を追加
- [x] 企業情報に上場市場（東証プライム、NASDAQ等）を追加
- [x] 仮想通貨検索の堅牢化（API制限時のモックフォールバック実装）

## 予測精度向上 & アドバイス強化
- [x] テクニカル指標計算ロジックの実装 (`technicalIndicators.ts`)
  - [x] RSI (相対力指数)
  - [x] SMA (移動平均線)
  - [x] Volatility (変動率/擬似VIX)
  - [ ] **Data Source Integration**
    - [x] Integrate Finnhub API for US stocks
    - [x] Implement fallback to mock data
    - [x] Add user alert for mock data usage
    - [/] Implement Yahoo Finance Japan Proxy (for JP stocks)
        - [x] Set up Express server
        - [x] Integrate Yahoo Finance unofficial API (Replaced J-Quants/Minkabu)
        - [x] Connect frontend to proxy
        - [x] Fix currency display issue (JPY/USD conversion)
- [x] AIサービス連携 (`aiService.ts`)
  - [x] プロンプトへの指標データ組み込み
  - [x] インサイト/アドバイス生成ロジックの強化

## データアーキテクチャ改善 (Keep Alive)
- [x] クライアントサイドキャッシュの実装 (localStorage/sessionStorage)
  - [x] `cacheUtils.ts` の作成
  - [x] `cryptoService.ts` へのキャッシュ組み込み
  - [x] `stockService.ts` へのキャッシュ組み込み

## UI拡張
- [x] 仮想通貨情報サマリ(`CryptoInfo.tsx`)の実装
  - [x] 時価総額、取引高、供給量などの表示
  - [x] `App.tsx` への組み込み
- [x] 検索サジェストのUX向上（Enterキーでトップ候補を自動選択）

## その他


## リアルタイム株価データ統合
- [x] Finnhub API連携の実装 (`stockService.ts`)
- [x] APIキー設定（環境変数 `VITE_FINNHUB_API_KEY`）の準備
- [x] フォールバックロジック（API失敗時にモックデータ使用）の実装

## リアルなヒストリカルデータの実装 (Yahoo Finance)
- [x] サーバーエンドポイント追加 (`/api/stock/:code/history`)
- [x] クライアントデータ取得ロジック更新 (`stockService.ts`)
- [x] グラフ描画の検証 (リアルデータ表示確認済み)
- [x] プロジェクトのクリーンアップ完了

## J-Quants API再挑戦 (V2)
- [x] トークン/APIキーの検証
- [x] V2 API統合 (成功時: 12週間遅延データを使用)
- [x] 履歴データ(History)エンドポイントの修正と検証 ✅
- [x] 外国株のHistory対応 (`yahoo-finance2`導入) ✅



