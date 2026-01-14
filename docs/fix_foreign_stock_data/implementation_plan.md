# J-Quants API (V2) 統合実装計画

## 概要

Yahoo Finance（非公式・リアルタイム）の代わりに、**J-Quants API V2**（公式・12週間遅延）を使用して日本株データを取得するようにサーバーを更新します。

## 検証結果

- **ステータス**: 成功 ✅
- **取得データ日付**: `2025-10-22` (現在 `2026-01-14` なので約12週間の遅延)
- **認証方式**: `x-api-key` ヘッダー

## 実装詳細

### 1. サーバー側の変更

#### [MODIFY] [server/index.js](file:///c:/Users/konbu/crypto/server/index.js)

Yahoo FinanceのロジックをJ-Quants V2に置き換えます（またはエンドポイントを分割）。

**新仕様:**
- **URL**: `https://api.jquants.com/v2/equities/bars/daily`
- **Headers**: `x-api-key: [USER_API_KEY]`
- **Params**: `code=[CODE]`

**データマッピング:**
- `price` <- `AdjC` (調整後終値)
- `change` <- `AdjC` - `AdjO` (簡易計算) または前日比取得ロジック
- `timestamp` <- `Date`

### 2. 環境変数の更新

- `.env` に `JQUANTS_API_KEY` を追加
- `.env` から Yahoo Finance 関連（もしあれば）を削除（今回はコード内のみなので不要）

## 懸念点・確認事項

> [!WARNING]
> **データの鮮度について**
> J-Quantsの無料プランは **12週間遅延** です。
> 現在（2026/01/14）のデータとして、2025/10/22 の株価が表示されます。
> 予測AIとしての精度や、ユーザー体験（現在の市場価格との乖離）に影響が出る可能性があります。

## 代替案（推奨）

1. **ハイブリッド構成**:
   - **現在価格**: Yahoo Finance (リアルタイム) を継続利用
   - **企業情報・財務情報**: J-Quants (正確・公式) を利用（※財務情報APIが使える場合）
   - **ヒストリカル**: Yahoo Finance (直近データあり)


## 外国株のヒストリカルデータ対応
> [!IMPORTANT]
> Finnhubの無料プランでは `Candles` (ヒストリカルデータ) エンドポイントが使用不可であることが判明しました。
> 外国株（米国株など）のチャートを正常に表示するため、サーバー側に `yahoo-finance2` ライブラリを導入し、非日本株の履歴データを取得できるようにします。

### 1. サーバー側の変更
#### [NEW] `npm install yahoo-finance2`
#### [MODIFY] [server/index.js](file:///c:/Users/konbu/crypto/server/index.js)
- `/api/stock/:code/history` エンドポイントを拡張
- 分岐ロジック:
    - 日本株 (末尾 `.T` または数値4桁): **J-Quants API** (既存)
    - その他 (AAPL, MSFT等): **Yahoo Finance** (`yahoo-finance2`)
- `/api/stock/:code` (現在価格) も同様にYahoo Financeで外国株をサポート可能だが、現状はFinnhub (Client側) で動作しているので、まずはHistoryのみ対応。

### 2. クライアント側の変更
#### [MODIFY] [src/services/stockService.ts](file:///c:/Users/konbu/crypto/src/services/stockService.ts)
- `fetchStockHistoryFromProxy` 内で `.T` を削除するロジックを修正し、外国株シンボルもそのままサーバーに渡せるようにする。
- Foreign stockの場合も `fetchStockHistoryFromProxy` を呼ぶように変更。

## 検証プラン
1. サーバーに `yahoo-finance2` をインストール。
2. サーバーロジック修正。
3. `curl` で `AAPL` の履歴取得テスト: `curl "http://localhost:3001/api/stock/AAPL/history?range=1y"`
4. ブラウザで `AAPL` や `NVDA` を検索し、チャートが表示されることを確認。
