import React, { useState } from 'react';
import type { PredictionResult } from '../services/aiService';

interface AnalysisReportProps {
    prediction: PredictionResult;
    assetName: string;
}

// リストアイテム用コンポーネント
const FactorList = ({ items }: { items: { title: string; reasoning: string }[] }) => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {items.map((item, index) => (
                <div
                    key={index}
                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                    style={{
                        padding: '1rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e6e6e6', fontWeight: 500 }}>
                            <span style={{ color: item.title.includes('リスク') ? '#ff4d6d' : '#00f0ff', fontSize: '0.8rem' }}>▶</span>
                            {item.title}
                        </div>
                        <span style={{
                            fontSize: '0.8rem',
                            color: '#666',
                            transform: expandedIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s'
                        }}>▼</span>
                    </div>

                    {expandedIndex === index && (
                        <div className="animate-slide-down" style={{
                            marginTop: '0.75rem',
                            paddingTop: '0.75rem',
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            fontSize: '0.9rem',
                            color: '#ccc',
                            lineHeight: '1.6'
                        }}>
                            <strong>考察:</strong> {item.reasoning}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default function AnalysisReport({ prediction, assetName }: AnalysisReportProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['analysis', 'factors', 'risks']));

    const toggleSection = (section: string) => {
        const newSections = new Set(expandedSections);
        if (newSections.has(section)) {
            newSections.delete(section);
        } else {
            newSections.add(section);
        }
        setExpandedSections(newSections);
    };

    const getConfidenceColor = (confidence: string) => {
        switch (confidence) {
            case 'high': return '#00ff88';
            case 'medium': return '#fbbf24';
            case 'low': return '#ef4444';
            default: return '#fbbf24';
        }
    };

    const getConfidenceLabel = (confidence: string) => {
        switch (confidence) {
            case 'high': return '高';
            case 'medium': return '中';
            case 'low': return '低';
            default: return '中';
        }
    };

    return (
        <div className="glass-card animate-slide-up" style={{ padding: '2rem' }}>
            <h2 className="font-heading glow-text-green" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                📊 {assetName} AI分析レポート
            </h2>

            {/* 信頼度インジケーター */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--color-gray-400)', fontSize: '0.875rem' }}>予測信頼度:</span>
                    <span
                        style={{
                            color: getConfidenceColor(prediction.confidence),
                            fontWeight: 700,
                            fontSize: '1.125rem',
                            textShadow: `0 0 10px ${getConfidenceColor(prediction.confidence)}`,
                        }}
                    >
                        {getConfidenceLabel(prediction.confidence)}
                    </span>
                </div>
                <div
                    style={{
                        height: '4px',
                        background: 'var(--glass-border)',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            height: '100%',
                            width: prediction.confidence === 'high' ? '80%' : prediction.confidence === 'medium' ? '50%' : '30%',
                            background: getConfidenceColor(prediction.confidence),
                            boxShadow: `0 0 10px ${getConfidenceColor(prediction.confidence)}`,
                            transition: 'width var(--transition-slow)',
                        }}
                    />
                </div>
            </div>

            {/* 分析セクション */}
            <Section
                title="📝 詳細分析"
                isExpanded={expandedSections.has('analysis')}
                onToggle={() => toggleSection('analysis')}
            >
                <p style={{ lineHeight: 1.8, color: 'var(--color-gray-300)', whiteSpace: 'pre-line' }}>
                    {prediction.analysis}
                </p>
            </Section>

            {/* 主要要因 */}
            <Section
                title="✅ 主要な成長要因"
                isExpanded={expandedSections.has('factors')}
                onToggle={() => toggleSection('factors')}
            >
                <div style={{ color: '#00ff88', marginBottom: '1rem', fontSize: '0.85rem' }}>
                    ※各項目をクリックすると詳細な考察が表示されます
                </div>
                <FactorList items={prediction.keyFactors} />
            </Section>

            {/* リスク */}
            <Section
                title="⚠️ 潜在的リスク"
                isExpanded={expandedSections.has('risks')}
                onToggle={() => toggleSection('risks')}
            >
                <div style={{ color: '#ffb86c', marginBottom: '1rem', fontSize: '0.85rem' }}>
                    ※各項目をクリックすると詳細な考察が表示されます
                </div>
                <FactorList items={prediction.risks} />
            </Section>

            {/* 免責事項 */}
            <div
                style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    background: 'rgba(255, 184, 0, 0.05)',
                    border: '1px solid rgba(255, 184, 0, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    color: 'var(--color-gray-400)',
                }}
            >
                <strong style={{ color: 'var(--color-warning)' }}>⚠️ 免責事項:</strong> この予測はAIによる分析結果であり、投資アドバイスではありません。
                実際の投資判断は自己責任で行ってください。
            </div>
        </div>
    );
}

interface SectionProps {
    title: string;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

function Section({ title, isExpanded, onToggle, children }: SectionProps) {
    return (
        <div style={{ marginBottom: '1rem' }}>
            <button
                onClick={onToggle}
                style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-accent-cyan)',
                    fontFamily: 'Orbitron',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all var(--transition-base)',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--glass-bg-hover)';
                    e.currentTarget.style.borderColor = 'var(--color-accent-cyan)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--glass-bg)';
                    e.currentTarget.style.borderColor = 'var(--glass-border)';
                }}
            >
                <span>{title}</span>
                <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform var(--transition-base)' }}>
                    ▼
                </span>
            </button>
            {isExpanded && (
                <div
                    className="animate-slide-down"
                    style={{
                        marginTop: '0.5rem',
                        padding: '1.5rem',
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--radius-md)',
                    }}
                >
                    {children}
                </div>
            )}
        </div>
    );
}
