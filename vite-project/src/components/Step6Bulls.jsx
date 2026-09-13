import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CattleCounter from './CattleCounter';
import WeightChipSelect from './WeightChipSelect';
import { BULL_WEIGHT_RANGES } from '../data/weightRanges';

const ACCENT = '#dc2626';

export default function Step6Bulls({
  bullsData,
  setBullsData,
  defaultBreed,
  acknowledgeStep,
  onNext,
  onPrev,
  t,
}) {
  // ── helpers ──────────────────────────────────────────────────────
  const addOne = () => {
    if (acknowledgeStep) acknowledgeStep();
    if (bullsData.length >= 200) return;
    setBullsData([...bullsData, { id: Date.now(), weight: '' }]);
  };

  const removeOne = () => {
    if (acknowledgeStep) acknowledgeStep();
    if (bullsData.length === 0) return;
    setBullsData(bullsData.slice(0, -1));
  };

  const clearAll = () => {
    if (acknowledgeStep) acknowledgeStep();
    setBullsData([]);
  };

  const setExactCount = (count) => {
    if (acknowledgeStep) acknowledgeStep();
    if (count === 0) {
      setBullsData([]);
      return;
    }
    const current = [...bullsData];
    if (current.length === count) return;
    if (current.length < count) {
      const needed = count - current.length;
      const added = Array.from({ length: needed }).map((_, i) => ({
        id: Date.now() + i + Math.random(),
        weight: current[0]?.weight || '',
      }));
      setBullsData([...current, ...added]);
    } else {
      setBullsData(current.slice(0, count));
    }
  };

  const updateWeight = (idx, val) => {
    if (acknowledgeStep) acknowledgeStep();
    const updated = [...bullsData];
    updated[idx] = { ...updated[idx], weight: val };
    setBullsData(updated);
  };

  const allReady = bullsData.length > 0 && bullsData.every(b => b.weight && Number(b.weight) > 0);
  const needsWeight = bullsData.filter(b => !b.weight || Number(b.weight) <= 0).length;

  // ── render ────────────────────────────────────────────────────────
  return (
    <div className="wg-card animate-fade-in">

      {/* ── Header banner ── */}
      <div className="step-banner" style={{
        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        border: '1.5px solid #fca5a5',
      }}>
        <div className="step-banner-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ background: ACCENT, color: '#fff', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>
              {t ? t('step6.badge') : 'STEP 6 OF 10'}
            </span>
            <span style={{ fontSize: '0.825rem', color: '#b91c1c', fontWeight: 800 }}>
              {t ? t('step6.tag') : 'BREEDING & WORK MALES'}
            </span>
          </div>
          <h2 className="step-banner-title" style={{ color: '#7f1d1d' }}>
            {t ? t('step6.title') : 'Bull Cattle Management'}
          </h2>
          <p className="step-banner-subtitle" style={{ color: '#334155' }}>
            <strong>Bulls</strong> are adult male cattle used for breeding or draft work. They have higher maintenance energy needs due to their large body size.
          </p>
        </div>
        <img
          src="/cattle_art/cartoon_bull.jpg"
          alt="Breeding Bull"
          className="step-banner-img"
          onError={e => { e.target.style.display = 'none'; }}
        />
      </div>

      {/* ── Prominent Question & Quick Count Selection ── */}
      <div style={{
        background: '#ffffff',
        border: '1.5px solid #fca5a5',
        borderRadius: '16px',
        padding: '16px 20px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(220, 38, 38, 0.04)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '12px',
        }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#7f1d1d', margin: '0 0 4px' }}>
              How many Bulls are on your farm?
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
              Adult males for breeding or draft work. Tap a quick number or use the counter button.
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#fef2f2',
            padding: '6px 14px',
            borderRadius: '12px',
            border: `1.5px solid ${ACCENT}30`,
          }}>
            <span style={{ fontSize: '0.8rem', color: '#b91c1c', fontWeight: 700 }}>Total Bulls:</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: ACCENT }}>{bullsData.length}</span>
          </div>
        </div>

        {/* Quick Count Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', marginRight: '4px' }}>
            Quick Select:
          </span>
          {[0, 1, 2, 3, 5].map((qty) => {
            const isSelected = bullsData.length === qty;
            return (
              <button
                key={qty}
                type="button"
                onClick={() => setExactCount(qty)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: `2px solid ${isSelected ? ACCENT : '#e2e8f0'}`,
                  background: isSelected ? ACCENT : '#ffffff',
                  color: isSelected ? '#ffffff' : '#475569',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? `0 2px 8px ${ACCENT}40` : 'none',
                }}
              >
                {qty === 0 ? '0 Bulls (None)' : `${qty} Bull${qty > 1 ? 's' : ''}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tap counter ── */}
      <CattleCounter
        count={bullsData.length}
        onAdd={addOne}
        onRemove={removeOne}
        onClear={clearAll}
        cattleType="bull"
        accentColor={ACCENT}
        label="Bull"
        description="Adult males for breeding or draft work"
        showCycle={true}
      />

      {/* ── Empty State Prompt ── */}
      {bullsData.length === 0 && (
        <div style={{
          padding: '18px',
          borderRadius: '14px',
          background: '#fef2f2',
          border: '1.5px dashed #fca5a5',
          textAlign: 'center',
          marginBottom: '24px',
        }}>
          <p style={{ fontSize: '0.9rem', color: '#b91c1c', fontWeight: 700, margin: '0 0 6px' }}>
            No bulls currently on your farm?
          </p>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
            Click <strong>"Next Step"</strong> below to proceed to Grazing Management, or tap above to add bulls.
          </p>
        </div>
      )}

      {/* ── Weight chips for each bull ── */}
      {bullsData.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '14px',
          }}>
            <div style={{ height: '2px', flex: 1, background: 'linear-gradient(90deg, #fca5a5, transparent)', borderRadius: '2px' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: ACCENT, whiteSpace: 'nowrap' }}>
              SET WEIGHT FOR EACH BULL
            </span>
            <div style={{ height: '2px', flex: 1, background: 'linear-gradient(270deg, #fca5a5, transparent)', borderRadius: '2px' }} />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
            gap: '14px',
          }}>
            {bullsData.map((bull, idx) => (
              <div
                key={bull.id || idx}
                className="cattle-icon-anim"
                style={{
                  background: '#ffffff',
                  border: `1.5px solid ${bull.weight && Number(bull.weight) > 0 ? '#fca5a5' : '#fca5a5'}`,
                  borderRadius: '16px',
                  padding: '14px 16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  animationDelay: `${idx * 0.05}s`,
                }}
              >
                {/* Card header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: bull.weight && Number(bull.weight) > 0 ? ACCENT : '#f1f5f9',
                    color: bull.weight && Number(bull.weight) > 0 ? '#ffffff' : '#94a3b8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 900, flexShrink: 0,
                  }}>
                    {idx + 1}
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                    Bull #{idx + 1}
                  </span>
                  {bull.weight && Number(bull.weight) > 0 && (
                    <span style={{
                      marginLeft: 'auto', fontSize: '0.72rem', background: '#fef2f2',
                      color: ACCENT, border: '1px solid #fca5a5', borderRadius: '20px',
                      padding: '2px 8px', fontWeight: 800,
                    }}>
                      ✓ Ready
                    </span>
                  )}
                </div>

                <WeightChipSelect
                  value={bull.weight}
                  onChange={val => updateWeight(idx, val)}
                  ranges={BULL_WEIGHT_RANGES}
                  label={t ? t('step6.body_weight') : 'Body Weight'}
                  accentColor={ACCENT}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Progress ── */}
      {bullsData.length > 0 && (
        <div style={{
          padding: '10px 14px', borderRadius: '10px',
          background: allReady ? '#fef2f2' : '#fffbeb',
          border: `1px solid ${allReady ? '#fca5a5' : '#fde68a'}`,
          marginBottom: '20px', fontSize: '0.8rem', fontWeight: 700,
          color: allReady ? '#b91c1c' : '#92400e',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{ fontSize: '1rem' }}>{allReady ? '✅' : '⚠️'}</span>
          {allReady
            ? `All ${bullsData.length} bull${bullsData.length > 1 ? 's' : ''} configured — ready to proceed!`
            : `${needsWeight} bull${needsWeight > 1 ? 's' : ''} still need a weight selected.`
          }
        </div>
      )}

      {/* ── Navigation ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
        <button onClick={onPrev} className="btn-secondary">
          <ChevronLeft size={18} />
          <span>{t ? t('previous') : 'Previous'}</span>
        </button>
        <button
          onClick={() => {
            if (bullsData.length > 0 && bullsData.some(b => !b.weight || Number(b.weight) <= 0)) {
              alert('Please select weights for all bulls before proceeding.');
              return;
            }
            onNext();
          }}
          className="btn-primary"
        >
          <span>{t ? t('next_step') : 'Next Step'}</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
