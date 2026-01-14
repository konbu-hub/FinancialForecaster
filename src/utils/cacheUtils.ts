/**
 * シンプルなクライアントサイドキャッシュユーティリティ
 * localStorageを使用し、TTL（有効期限）管理を行う
 */

interface CacheItem<T> {
    data: T;
    timestamp: number; // 有効期限（ミリ秒）
}

export const cacheUtils = {
    /**
     * データをキャッシュに保存
     * @param key キャッシュキー
     * @param data 保存するデータ
     * @param ttlMinutes 有効期限（分）デフォルト: 5分
     */
    set: <T>(key: string, data: T, ttlMinutes: number = 5): void => {
        try {
            const item: CacheItem<T> = {
                data,
                timestamp: Date.now() + ttlMinutes * 60 * 1000,
            };
            localStorage.setItem(key, JSON.stringify(item));
        } catch (e) {
            // クォータ超過などのエラーハンドリング（警告のみ）
            console.warn('Cache write failed:', e);
        }
    },

    /**
     * キャッシュからデータを取得
     * @param key キャッシュキー
     * @returns キャッシュされたデータ、またはnull（期限切れ/存在しない場合）
     */
    get: <T>(key: string): T | null => {
        try {
            const stored = localStorage.getItem(key);
            if (!stored) return null;

            const item: CacheItem<T> = JSON.parse(stored);

            // 有効期限切れチェック
            if (Date.now() > item.timestamp) {
                localStorage.removeItem(key);
                return null;
            }

            return item.data;
        } catch (e) {
            // パースエラー時などは無効として扱う
            console.warn('Cache read failed:', e);
            localStorage.removeItem(key);
            return null;
        }
    },

    /**
     * 指定されたプレフィックスを持つキャッシュを削除
     */
    clear: (keyPrefix: string): void => {
        try {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(keyPrefix)) {
                    localStorage.removeItem(key);
                }
            });
        } catch (e) {
            console.warn('Cache clear failed:', e);
        }
    }
};
