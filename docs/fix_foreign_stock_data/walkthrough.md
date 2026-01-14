# J-Quants V2 API Integration Walkthrough

## Overview
Successfully replaced the Yahoo Finance unofficial API with the official **J-Quants V2 API** for Japanese stock data.
Due to the constraints of the J-Quants Free Plan, the data is provided with a **12-week delay**.

## Changes Implemented

### Server-Side (`server/index.js`)
- Integrated J-Quants V2 API endpoints.
- **Current Price**: Fetches the latest available data (approx. 12 weeks ago).
- **History Data**: Adjusts the requested date range to fit within the free plan's available data (up to ~90 days ago).
- Implemented `isDelayed: true` flag in the response.

### Verification Results

#### Final Browser Verification
- **Stock**: Toyota (7203)
- **Status**: Success
- **Observations**:
    - Current price displayed (mock/delayed data).
    - **History Chart**: Successfully rendered with data ending in Oct 2025 (reflecting the 12-week delay).
    - No 500 errors observed.

![J-Quants Integration Complete](/C:/Users/konbu/.gemini/antigravity/brain/06070818-4aef-447c-acb9-662d862c4464/jquants_complete_1768389775909.png)

### J-Quants Data Delay Verification
- **Issue**: Chart data stops approx. 3 months ago.
- **Verification**: Confirmed with Toyota (7203) and Persol (2181). Both charts end on **Oct 16, 2025** (as of Jan 2026).
- **Conclusion**: This is the expected behavior of the J-Quants Free Plan (12-week delay).


### Foreign Stock Support (Yahoo Finance)
- **Problem**: Finnhub Free tier does not support history candles.
- **Solution**: Integrated `yahoo-finance2` on the server to fetch history for non-Japanese stocks (e.g., AAPL, NVDA).
- **Verification**:
    - **Stock**: Apple Inc. (AAPL)
    - **Status**: Success
    - **Chart**: 1-year history displayed correctly.

![Foreign Stock History (Yahoo Finance)](/C:/Users/konbu/.gemini/antigravity/brain/06070818-4aef-447c-acb9-662d862c4464/aapl_history_fixed_1768390250561.png)

### Cryptocurrency Data Verification
- **Source**: CoinGecko API (Official)
- **Status**: Live Data Confirmed
- **Verification**: XRP price ~¥337 (vs Mock ¥99), matching real-time market data.

![XRP Verification](/C:/Users/konbu/.gemini/antigravity/brain/06070818-4aef-447c-acb9-662d862c4464/xrp_verification_retry_1768392928945.png)

## Environment Configuration (Production)
To ensure correct data fetching in production (or when accessing from other devices), set the following environment variable:

```env
VITE_API_BASE_URL=https://your-production-api-url.com
```
*If not set, it defaults to `http://localhost:3001` (Development).*

## Next Steps
- Push changes to repository.
- Deploy to production and verified with env var set.
