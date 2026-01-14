import React, { useState } from 'react';
import { searchCrypto } from '../services/cryptoService';
import { searchStock } from '../services/stockService';
import '../styles/design-system.css';

interface SearchBarProps {
    onSearch: (query: string, type: 'crypto' | 'stock') => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [assetType, setAssetType] = useState<'crypto' | 'stock'>('crypto');
    const [suggestions, setSuggestions] = useState<Array<{ id?: string; symbol: string; name: string }>>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const handleInputChange = async (value: string) => {
        setQuery(value);
        setSelectedIndex(-1);

        if (value.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setIsLoading(true);
        try {
            if (assetType === 'crypto') {
                const results = await searchCrypto(value);
                setSuggestions(results);
            } else {
                const results = await searchStock(value);
                setSuggestions(results);
            }
            setShowSuggestions(true);
        } catch (error) {
            console.error('Search error:', error);
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (searchQuery?: string) => {
        const finalQuery = searchQuery || query;
        if (finalQuery.trim()) {
            onSearch(finalQuery.trim(), assetType);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion: { id?: string; symbol: string; name: string }) => {
        const searchQuery = suggestion.id || suggestion.symbol;
        setQuery(suggestion.name);
        handleSearch(searchQuery);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions || suggestions.length === 0) {
            if (e.key === 'Enter') {
                handleSearch();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSuggestionClick(suggestions[selectedIndex]);
                } else {
                    handleSearch();
                }
                break;
            case 'Escape':
                e.preventDefault();
                setShowSuggestions(false);
                setSelectedIndex(-1);
                break;
        }
    };

    // 入力フィールド外のクリックで検索結果を閉じる
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.search-container')) {
                setShowSuggestions(false);
                setSelectedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="search-container" style={{ position: 'relative', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
            {/* タイプ選択 */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', justifyContent: 'center' }}>
                <button
                    className={`btn ${assetType === 'crypto' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setAssetType('crypto')}
                    style={{ minWidth: '150px' }}
                >
                    🪙 仮想通貨
                </button>
                <button
                    className={`btn ${assetType === 'stock' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setAssetType('stock')}
                    style={{ minWidth: '150px' }}
                >
                    🏢 株式
                </button>
            </div>

            {/* 検索バー */}
            <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        className="input"
                        placeholder={assetType === 'crypto' ? 'Bitcoin, ETH, BTC...' : 'トヨタ、7203、自動車、Toyota...'}
                        value={query}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                            if (suggestions.length > 0) {
                                setShowSuggestions(true);
                            }
                        }}
                        style={{ flex: 1 }}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={() => handleSearch()}
                        disabled={!query.trim()}
                        style={{ minWidth: '120px' }}
                    >
                        {isLoading ? '検索中...' : '🔍 検索'}
                    </button>
                </div>

                {/* サジェスション */}
                {showSuggestions && suggestions.length > 0 && (
                    <div
                        className="glass-card"
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 0.5rem)',
                            left: 0,
                            right: 0,
                            zIndex: 1000,
                            maxHeight: '300px',
                            overflowY: 'auto',
                        }}
                    >
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                style={{
                                    padding: '1rem',
                                    cursor: 'pointer',
                                    borderBottom: index < suggestions.length - 1 ? '1px solid var(--glass-border)' : 'none',
                                    transition: 'background var(--transition-fast)',
                                    background: selectedIndex === index ? 'var(--glass-bg-hover)' : 'transparent',
                                }}
                                onMouseEnter={(e) => {
                                    setSelectedIndex(index);
                                    e.currentTarget.style.background = 'var(--glass-bg-hover)';
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedIndex !== index) {
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                            >
                                <div style={{ fontWeight: 600, color: 'var(--color-accent-cyan)' }}>
                                    {suggestion.symbol.toUpperCase()}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--color-gray-400)', marginTop: '0.25rem' }}>
                                    {suggestion.name}
                                </div>
                                {(suggestion as any).sector && (suggestion as any).market && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', marginTop: '0.25rem' }}>
                                        {(suggestion as any).sector} | {(suggestion as any).market}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
