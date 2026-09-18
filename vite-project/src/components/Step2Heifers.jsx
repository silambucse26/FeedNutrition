import React from 'react';
import { ChevronLeft, ChevronRight, Copy, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import CattleCounter from './CattleCounter';
import WeightChipSelect from './WeightChipSelect';
import { HEIFER_WEIGHT_RANGES } from '../data/weightRanges';

const ACCENT = '#16a34a';
const QUICK_COUNTS = [0, 1, 2, 3, 5, 8, 10];

export default function Step2Heifers({
  heifersData = [],
  setHeifersData,
  defaultBreed,
  acknowledgeStep,
  onNext,
  onPrev,
  t,
}) {
  // ── helpers ──────────────────────────────────────────────────────
  const addOne = () => {
    if (acknowledgeStep) acknowledgeStep();
    if (heifersData.length >= 200) return;
    setHeifersData([...heifersData, { id: Date.now() + Math.random(), weight: '' }]);
  };

  const removeOne = () => {
    if (acknowledgeStep) acknowledgeStep();
    if (heifersData.length === 0) return;
    setHeifersData(heifersData.slice(0, -1));
  };

  const removeIndex = (idx) => {
    if (acknowledgeStep) acknowledgeStep();
    const updated = [...heifersData];
    updated.splice(idx, 1);
    setHeifersData(updated);
  };

  const clearAll = () => {
    if (acknowledgeStep) acknowledgeStep();
    setHeifersData([]);
  };

  const setExactCount = (count) => {
    if (acknowledgeStep) acknowledgeStep();
    if (count === 0) {
      setHeifersData([]);
      return;
    }
    const current = [...heifersData];
    if (current.length === count) return;
    if (current.length < count) {
      const needed = count - current.length;
      const added = Array.from({ length: needed }).map((_, i) => ({
        id: Date.now() + i + Math.random(),
        weight: current[0]?.weight || '',
      }));
      setHeifersData([...current, ...added]);
    } else {
      setHeifersData(current.slice(0, count));
    }
  };

  const updateWeight = (idx, val) => {
    if (acknowledgeStep) acknowledgeStep();
    const updated = [...heifersData];
    updated[idx] = { ...updated[idx], weight: val };
    setHeifersData(updated);
  };

  const copyToAll = (sourceIdx) => {
    if (acknowledgeStep) acknowledgeStep();
    const source = heifersData[sourceIdx];
    if (!source || !source.weight) return;
    const updated = heifersData.map(h => ({
      ...h,
      weight: source.weight,
    }));
    setHeifersData(updated);
  };

  const allWeightsFilled = heifersData.length > 0 && heifersData.every(h => h.weight && Number(h.weight) > 0);
  const hasEmpty = heifersData.length > 0 && heifersData.some(h => !h.weight || Number(h.weight) <= 0);

  // ── render ────────────────────────────────────────────────────────
  return (
    <div className="wg-card animate-fade-in">

      {/* ── Header banner ── */}
      <div className="step-banner" style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        border: `1.5px solid #86efac`,
      }}>
        <div className="step-banner-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ background: ACCENT, color: '#fff', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>
              {t ? t('step2.badge') : 'STEP 2 OF 10'}
            </span>
            <span style={{ fontSize: '0.825rem', color: '#15803d', fontWeight: 800 }}>
              {t ? t('step2.tag') : 'YOUNG CATTLE'}
            </span>
          </div>
          <h2 className="step-banner-title" style={{ color: '#14532d' }}>
            {t ? t('step2.title') : 'Heifer Cattle Management'}
          </h2>
          <p className="step-banner-subtitle" style={{ color: '#334155' }}>
            <strong>Above 12 months old cattle only</strong> — young female cattle before their first calving. Enter body weight for each heifer.
          </p>
        </div>
        <img
          src="/cattle_art/cartoon_heifer.jpg"
          alt="Young Heifer"
          className="step-banner-img"
          onError={e => { e.target.style.display = 'none'; }}
        />
      </div>

      {/* ── Question & Quick Count Selection ── */}
      <div style={{
        background: '#ffffff',
        border: '1.5px solid #bbf7d0',
        borderRadius: '16px',
        padding: '16px 20px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(22, 163, 74, 0.04)',
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
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#14532d', margin: '0 0 4px' }}>
              How many Heifers are on your farm?
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
              Above 12 months old cattle only. Tap a quick number or use the counter button.
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#f0fdf4',
            padding: '6px 14px',
            borderRadius: '12px',
            border: `1.5px solid ${ACCENT}30`,
          }}>
            <span style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 700 }}>Total Heifers:</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: ACCENT }}>{heifersData.length}</span>
          </div>
        </div>

        {/* Quick Count Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', marginRight: '4px' }}>
            Quick Select:
          </span>
          {QUICK_COUNTS.map((qty) => {
            const isSelected = heifersData.length === qty;
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
                {qty === 0 ? '0 Heifers (None)' : `${qty} Heifer${qty > 1 ? 's' : ''}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tap counter ── */}
      <CattleCounter
        count={heifersData.length}
        onAdd={addOne}
        onRemove={removeOne}
        onClear={clearAll}
        cattleType="heifer"
        accentColor={ACCENT}
        label="Heifer"
        description="Above 12 months old cattle only"
        showCycle={true}
      />

      {/* ── Empty State Prompt ── */}
      {heifersData.length === 0 && (
        <div style={{
          padding: '18px',
          borderRadius: '14px',
          background: '#f0fdf4',
          border: '1.5px dashed #86efac',
          textAlign: 'center',
          marginBottom: '24px',
        }}>
          <p style={{ fontSize: '0.9rem', color: '#166534', fontWeight: 700, margin: '0 0 6px' }}>
            No heifers currently on your farm?
          </p>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
            Click <strong>"Next Step"</strong> below to proceed to Pregnant Cattle, or tap above to add heifers.
          </p>
        </div>
      )}

      {/* ── Weight chips for each heifer ── */}
      {heifersData.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            marginBottom: '16px',
            flexWrap: 'wrap',
          }}>
            <span style={{
              fontSize: '0.85rem',
              fontWeight: 900,
              color: ACCENT,
            }}>
              SET BODY WEIGHT FOR EACH HEIFER ({heifersData.length})
            </span>

            {heifersData.length > 1 && (
              <button
                type="button"
                onClick={() => copyToAll(0)}
                className="btn-secondary"
                style={{
                  fontSize: '0.75rem',
                  padding: '5px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: ACCENT,
                  borderColor: '#86efac',
                }}
                title="Copy weight from Heifer #1 to all heifers"
              >
                <Copy size={13} />
                Copy Heifer #1 weight to all
              </button>
            )}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
            gap: '14px',
          }}>
            {heifersData.map((heifer, idx) => {
              const hasWeight = heifer.weight && Number(heifer.weight) > 0;
              return (
                <div
                  key={heifer.id || idx}
                  className="cattle-icon-anim"
                  style={{
                    background: '#ffffff',
                    border: `1.5px solid ${hasWeight ? '#86efac' : '#fca5a5'}`,
                    borderRadius: '16px',
                    padding: '14px 16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    animationDelay: `${idx * 0.05}s`,
                  }}
                >
                  {/* Card header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px',
                  }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: hasWeight ? ACCENT : '#f1f5f9',
                      color: hasWeight ? '#ffffff' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      flexShrink: 0,
                    }}>
                      {idx + 1}
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                      Heifer #{idx + 1}
                    </span>

                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {hasWeight && (
                        <span style={{
                          fontSize: '0.72rem',
                          background: '#f0fdf4',
                          color: '#15803d',
                          border: '1px solid #86efac',
                          borderRadius: '20px',
                          padding: '1px 8px',
                          fontWeight: 800,
                        }}>
                          ✓ Ready
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeIndex(idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        title="Delete this heifer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Weight chip selector */}
                  <WeightChipSelect
                    value={heifer.weight}
                    onChange={val => updateWeight(idx, val)}
                    ranges={HEIFER_WEIGHT_RANGES}
                    label={t ? t('step2.weight_label', { num: idx + 1 }) : 'Body Weight'}
                    accentColor={ACCENT}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Progress indicator ── */}
      {heifersData.length > 0 && (
        <div style={{
          padding: '10px 14px',
          borderRadius: '10px',
          background: allWeightsFilled ? '#f0fdf4' : '#fffbeb',
          border: `1px solid ${allWeightsFilled ? '#86efac' : '#fde68a'}`,
          marginBottom: '20px',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: allWeightsFilled ? '#15803d' : '#92400e',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          {allWeightsFilled ? <CheckCircle2 size={16} color="#16a34a" /> : <AlertCircle size={16} color="#d97706" />}
          {allWeightsFilled
            ? `All ${heifersData.length} heifer${heifersData.length > 1 ? 's' : ''} configured — ready to proceed!`
            : `${heifersData.filter(h => !h.weight || Number(h.weight) <= 0).length} heifer${heifersData.filter(h => !h.weight || Number(h.weight) <= 0).length > 1 ? 's' : ''} still need a weight selected.`
          }
        </div>
      )}

      {/* ── Navigation ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid #e2e8f0',
        paddingTop: '20px',
      }}>
        <button onClick={onPrev} className="btn-secondary">
          <ChevronLeft size={18} />
          <span>{t ? t('previous') : 'Previous'}</span>
        </button>

        <button
          onClick={() => {
            if (hasEmpty) {
              alert('Please select weights for all heifers before proceeding.');
              return;
            }
            if (acknowledgeStep) acknowledgeStep();
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
