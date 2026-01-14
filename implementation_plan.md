# Implementation Plan - Stock API Integration

## Goal
Enable real-time stock data fetching for both US and Japanese stocks by integrating the **Finnhub API**.
The user wants to replace/supplement mock data with real API data.

## User Review Required
> [!IMPORTANT]
> You will need to obtain a free API key from [Finnhub.io](https://finnhub.io/) to use the real-time data features.
> Add this key to your `.env` file as `VITE_FINNHUB_API_KEY=your_key_here`.

## Proposed Changes

### Configuration
#### [NEW] .env.example
- Add `VITE_FINNHUB_API_KEY` to the example environment file.

### Services
#### [MODIFY] src/services/stockService.ts
- Import `VITE_FINNHUB_API_KEY`.
- Create a new function `fetchStockDataFromFinnhub(symbol: string)`.
- **Symbol Handling**:
    - US Stocks: Use as is (e.g., `AAPL`).
    - JP Stocks: Ensure format `XXXX.T` is correctly handled (Finnhub often uses `XXXX.T` for Tokyo).
- **Data Mapping**:
    - Map Finnhub `quote` endpoint response:
        - `c` -> `price` (Current price)
        - `d` -> `change` (Change)
        - `dp` -> `changePercent` (Percent change)
- **Fallback Logic**:
    - In `getStockData`, check if `API_KEY` exists.
    - If yes, try `fetchStockDataFromFinnhub`.
    - If it fails (error or rate limit), log warning and fall back to `mockData`.

## Verification Plan
### Automated Tests
- None (API integration difficult to unit test without mocking network).

### Manual Verification
1.  **Without Key**: Confirm app still loads with updated mock data (checked in previous task).
2.  **With Key**:
    - Add a valid Finnhub key to `.env` (User to perform).
    - search "7203" or "Toyota".
    - Verify price matches roughly the real market price (not the mock 3600 if market moves).
    - Verify "Market" badge still appears.
