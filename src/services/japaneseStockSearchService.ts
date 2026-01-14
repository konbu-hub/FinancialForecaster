import japaneseStocksData from '../data/japanese-stocks.json';

export interface JapaneseStock {
    code: string;
    nameJa: string;
    nameEn: string;
    sector: string;
    market: string;
}

export interface SearchResult extends JapaneseStock {
    score: number;
}

// かな/カナ正規化マップ
const kanaMap: { [key: string]: string } = {
    'ガ': 'カ', 'ギ': 'キ', 'グ': 'ク', 'ゲ': 'ケ', 'ゴ': 'コ',
    'ザ': 'サ', 'ジ': 'シ', 'ズ': 'ス', 'ゼ': 'セ', 'ゾ': 'ソ',
    'ダ': 'タ', 'ヂ': 'チ', 'ヅ': 'ツ', 'デ': 'テ', 'ド': 'ト',
    'バ': 'ハ', 'ビ': 'ヒ', 'ブ': 'フ', 'ベ': 'ヘ', 'ボ': 'ホ',
    'パ': 'ハ', 'ピ': 'ヒ', 'プ': 'フ', 'ペ': 'ヘ', 'ポ': 'ホ',
    'ァ': 'ア', 'ィ': 'イ', 'ゥ': 'ウ', 'ェ': 'エ', 'ォ': 'オ',
    'ッ': 'ツ', 'ャ': 'ヤ', 'ュ': 'ユ', 'ョ': 'ヨ', 'ヮ': 'ワ',
    'ヴ': 'ウ', 'ヵ': 'カ', 'ヶ': 'ケ',
};

/**
 * ひらがなをカタカナに変換
 */
function hiraganaToKatakana(str: string): string {
    return str.replace(/[\u3041-\u3096]/g, (match) => {
        const chr = match.charCodeAt(0) + 0x60;
        return String.fromCharCode(chr);
    });
}

/**
 * カタカナを正規化（濁点・半濁点を除去）
 */
function normalizeKatakana(str: string): string {
    return str.split('').map(char => kanaMap[char] || char).join('');
}

/**
 * 検索用の正規化された文字列を生成
 */
function normalizeForSearch(str: string): string {
    // ひらがなをカタカナに変換
    let normalized = hiraganaToKatakana(str);
    // カタカナを正規化
    normalized = normalizeKatakana(normalized);
    // 小文字に変換
    normalized = normalized.toLowerCase();
    // スペースを除去
    normalized = normalized.replace(/\s+/g, '');
    return normalized;
}

/**
 * 検索スコアを計算
 * @param target 検索対象の文字列
 * @param query 検索クエリ
 * @returns スコア（高いほど関連度が高い）
 */
function calculateScore(target: string, query: string): number {
    const normalizedTarget = normalizeForSearch(target);
    const normalizedQuery = normalizeForSearch(query);
    const lowerTarget = target.toLowerCase();
    const lowerQuery = query.toLowerCase();

    // 完全一致（最高スコア）
    if (normalizedTarget === normalizedQuery || lowerTarget === lowerQuery) {
        return 1000;
    }

    // 前方一致（高スコア）
    if (normalizedTarget.startsWith(normalizedQuery) || lowerTarget.startsWith(lowerQuery)) {
        return 500;
    }

    // 部分一致（中スコア）
    if (normalizedTarget.includes(normalizedQuery) || lowerTarget.includes(lowerQuery)) {
        // マッチ位置が早いほど高スコア
        const normalizedIndex = normalizedTarget.indexOf(normalizedQuery);
        const lowerIndex = lowerTarget.indexOf(lowerQuery);
        const index = normalizedIndex >= 0 ? normalizedIndex : lowerIndex;
        return 100 - index;
    }

    return 0;
}

/**
 * 日本株を検索
 * @param query 検索クエリ（証券コード、日本語名、英語名、業種）
 * @returns 検索結果（スコア順にソート、最大10件）
 */
export function searchJapaneseStocks(query: string): SearchResult[] {
    if (!query || query.trim().length === 0) {
        return [];
    }

    const trimmedQuery = query.trim();
    const results: SearchResult[] = [];

    // 各企業に対してスコアを計算
    for (const stock of japaneseStocksData as JapaneseStock[]) {
        let maxScore = 0;

        // 証券コードでの検索
        const codeScore = calculateScore(stock.code, trimmedQuery);
        maxScore = Math.max(maxScore, codeScore);

        // 日本語名での検索
        const nameJaScore = calculateScore(stock.nameJa, trimmedQuery);
        maxScore = Math.max(maxScore, nameJaScore);

        // 英語名での検索
        const nameEnScore = calculateScore(stock.nameEn, trimmedQuery);
        maxScore = Math.max(maxScore, nameEnScore);

        // 業種での検索
        const sectorScore = calculateScore(stock.sector, trimmedQuery);
        maxScore = Math.max(maxScore, sectorScore * 0.8); // 業種マッチは少し低めのスコア

        // スコアが0より大きい場合のみ結果に追加
        if (maxScore > 0) {
            results.push({
                ...stock,
                score: maxScore,
            });
        }
    }

    // スコア順にソート（降順）
    results.sort((a, b) => b.score - a.score);

    // 最大10件まで返す
    return results.slice(0, 10);
}

/**
 * 証券コードから株式情報を取得
 * @param code 証券コード（4桁）
 * @returns 株式情報（見つからない場合はnull）
 */
export function getStockByCode(code: string): JapaneseStock | null {
    const stock = (japaneseStocksData as JapaneseStock[]).find(
        (s) => s.code === code
    );
    return stock || null;
}

/**
 * 全ての日本株を取得
 * @returns 全ての日本株
 */
export function getAllJapaneseStocks(): JapaneseStock[] {
    return japaneseStocksData as JapaneseStock[];
}
