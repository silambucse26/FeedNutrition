import React from 'react';
import { ChevronLeft, ChevronRight, Trash2, Check, Plus } from 'lucide-react';
import CattleCounter from './CattleCounter';
import WeightChipSelect from './WeightChipSelect';
import { COW_WEIGHT_RANGES } from '../data/weightRanges';

const ACCENT = '#d97706'; // Warm amber

// Standard numeric day chips for pregnancy
const PREG_DAY_CHIPS = [30, 60, 90, 120, 150, 180, 210, 240, 270];

export default function Step3PregnantCows({
  pregnantCategory,
  setPregnantCategory,
  firstTimeCattle,
  setFirstTimeCattle,
  repeatCattle,
  setRepeatCattle,
  defaultBreed,
  acknowledgeStep,
  onNext,
  onPrev,
  t,
}) {
  // Combine both arrays into a unified list for single-place editing
  // Each unified cow has a `category`: 'firstTime' | 'repeat'
  const unifiedCattle = [
    ...firstTimeCattle.map(c => ({ ...c, category: 'firstTime' })),
    ...repeatCattle.map(c => ({ ...c, category: 'repeat' })),
  ];

  const totalCount = unifiedCattle.length;

  // Helper to split unified back into firstTimeCattle and repeatCattle
  const commitUnified = (updatedList) => {
    if (acknowledgeStep) acknowledgeStep();
    const first = updatedList
      .filter(c => c.category === 'firstTime')
      .map(({ category, ...rest }) => ({
        ...rest,
        pregDays: Number(rest.pregDays) || 150,
        pregMonth: Math.max(1, Math.min(9, Math.round((Number(rest.pregDays) || 150) / 30.4))),
      }));

    const rep = updatedList
      .filter(c => c.category === 'repeat')
      .map(({ category, ...rest }) => ({
        ...rest,
        pregDays: Number(rest.pregDays) || 210,
        pregMonth: Math.max(1, Math.min(9, Math.round((Number(rest.pregDays) || 210) / 30.4))),
      }));

    setFirstTimeCattle(first);
    setRepeatCattle(rep);

    if (first.length > 0 && rep.length > 0) {
      setPregnantCategory('both');
    } else if (first.length > 0) {
      setPregnantCategory('firstTime');
    } else if (rep.length > 0) {
      setPregnantCategory('repeat');
    } else {
      setPregnantCategory('both');
    }
  };

  // Tap to add one pregnant cow (defaults to repeat pregnant cow)
  const handleAddOne = () => {
    if (totalCount >= 200) return;
    const newCow = {
      id: Date.now() + Math.random(),
      weight: '',
      pregDays: 150,
      category: 'repeat',
    };
    commitUnified([...unifiedCattle, newCow]);
  };

  // Remove the last cow
  const handleRemoveOne = () => {
    if (totalCount === 0) return;
    commitUnified(unifiedCattle.slice(0, -1));
  };

  // Remove a specific cow
  const handleRemoveIndex = (idx) => {
    const next = [...unifiedCattle];
    next.splice(idx, 1);
    commitUnified(next);
  };

  // Clear all
  const handleClearAll = () => {
    if (acknowledgeStep) acknowledgeStep();
    setFirstTimeCattle([]);
    setRepeatCattle([]);
  };

  const handleSetExactCount = (count) => {
    if (acknowledgeStep) acknowledgeStep();
    if (count === 0) {
      handleClearAll();
      return;
    }
    if (unifiedCattle.length === count) return;
    if (unifiedCattle.length < count) {
      const needed = count - unifiedCattle.length;
      const added = Array.from({ length: needed }).map((_, i) => ({
        id: Date.now() + i + Math.random(),
        weight: unifiedCattle[0]?.weight || '',
        pregDays: unifiedCattle[0]?.pregDays || 150,
        category: 'repeat',
      }));
      commitUnified([...unifiedCattle, ...added]);
    } else {
      commitUnified(unifiedCattle.slice(0, count));
    }
  };

  // Update specific cow field
  const handleUpdateCow = (idx, field, val) => {
    const next = [...unifiedCattle];
    next[idx] = { ...next[idx], [field]: val };
    commitUnified(next);
  };

  // Adjust days by delta
  const handleStepDays = (idx, delta) => {
    const current = Number(unifiedCattle[idx].pregDays) || 150;
    const clamped = Math.max(1, Math.min(283, current + delta));
    handleUpdateCow(idx, 'pregDays', clamped);
  };

  const allWeightsFilled = totalCount > 0 && unifiedCattle.every(c => c.weight && Number(c.weight) > 0);
  const emptyWeightsCount = unifiedCattle.filter(c => !c.weight || Number(c.weight) <= 0).length;

  return (
    <div className="wg-card animate-fade-in">

      {/* Visual Header Banner */}
      <div
        className="step-banner"
        style={{
          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
          border: '1.5px solid #fde68a',
        }}
      >
        <div className="step-banner-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ background: ACCENT, color: '#ffffff', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>
              {t ? t('step3.badge') : 'STEP 3 OF 10'}
            </span>
            <span style={{ fontSize: '0.825rem', color: '#b45309', fontWeight: 800 }}>
              {t ? t('step3.tag') : 'GESTATION & MATERNITY'}
            </span>
          </div>
          <h2 className="step-banner-title" style={{ color: '#78350f' }}>
            {t ? t('step3.title') : 'Pregnant Cattle Management'}
          </h2>
          <p className="step-banner-subtitle" style={{ color: '#92400e' }}>
            Record body weight and exact <strong>number of days pregnant</strong> for each expectant cow or heifer.
          </p>
        </div>

        <img
          src="/cattle_art/cartoon_pregnant.jpg"
          alt="Pregnant Cow"
          className="step-banner-img"
          onError={e => { e.target.style.display = 'none'; }}
        />
      </div>

      {/* ── Question & Quick Count Selection ── */}
      <div style={{
        background: '#ffffff',
        border: '1.5px solid #fed7aa',
        borderRadius: '16px',
        padding: '16px 20px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(217, 119, 6, 0.04)',
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
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#78350f', margin: '0 0 4px' }}>
              How many Pregnant Cattle are on your farm?
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
              Expectant heifers and cows in gestation. Tap a quick number or use the counter button.
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#fffbeb',
            padding: '6px 14px',
            borderRadius: '12px',
            border: `1.5px solid ${ACCENT}30`,
          }}>
            <span style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 700 }}>Total Pregnant:</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: ACCENT }}>{totalCount}</span>
          </div>
        </div>

        {/* Quick Count Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', marginRight: '4px' }}>
            Quick Select:
          </span>
          {[0, 1, 2, 3, 5, 8, 10].map((qty) => {
            const isSelected = totalCount === qty;
            return (
              <button
                key={qty}
                type="button"
                onClick={() => handleSetExactCount(qty)}
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
                {qty === 0 ? '0 Pregnant (None)' : `${qty} Cow${qty > 1 ? 's' : ''}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tap Counter Component with Cartoon Avatar */}
      <CattleCounter
        count={totalCount}
        onAdd={handleAddOne}
        onRemove={handleRemoveOne}
        onClear={handleClearAll}
        cattleType="pregnant"
        accentColor={ACCENT}
        label="Pregnant Cow"
        description="Expectant heifers and cows in gestation"
        showCycle={true}
      />

      {/* Empty State Prompt */}
      {totalCount === 0 && (
        <div style={{
          padding: '18px',
          borderRadius: '14px',
          background: '#fffbeb',
          border: '1.5px dashed #fde68a',
          textAlign: 'center',
          marginBottom: '24px',
        }}>
          <p style={{ fontSize: '0.9rem', color: '#92400e', fontWeight: 700, margin: '0 0 6px' }}>
            No pregnant cattle currently on your farm?
          </p>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
            Click <strong>"Next Step"</strong> below to proceed to Lactating Cows, or tap above to add pregnant cattle.
          </p>
        </div>
      )}

      {/* Unified List of All Pregnant Cattle */}
      {totalCount > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '14px',
          }}>
            <div style={{
              height: '2px',
              flex: 1,
              background: 'linear-gradient(90deg, #fde68a, transparent)',
              borderRadius: '2px',
            }} />
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              color: ACCENT,
              whiteSpace: 'nowrap',
            }}>
              CONFIGURE EACH PREGNANT ANIMAL ({totalCount})
            </span>
            <div style={{
              height: '2px',
              flex: 1,
              background: 'linear-gradient(270deg, #fde68a, transparent)',
              borderRadius: '2px',
            }} />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))',
            gap: '16px',
          }}>
            {unifiedCattle.map((cow, idx) => {
              const days = Number(cow.pregDays) || 150;
              const hasWeight = cow.weight && Number(cow.weight) > 0;

              return (
                <div
                  key={cow.id || idx}
                  className="cattle-icon-anim"
                  style={{
                    background: '#ffffff',
                    border: `1.5px solid ${hasWeight ? '#fcd34d' : '#fca5a5'}`,
                    borderRadius: '16px',
                    padding: '16px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    animationDelay: `${idx * 0.04}s`,
                  }}
                >
                  {/* Card Header: Number + Category Pill + Delete */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #f1f5f9',
                    paddingBottom: '10px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: hasWeight ? ACCENT : '#f1f5f9',
                        color: hasWeight ? '#ffffff' : '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 900,
                      }}>
                        {idx + 1}
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                        Pregnant Cattle #{idx + 1}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {hasWeight && (
                        <span style={{
                          fontSize: '0.7rem',
                          background: '#fef3c7',
                          color: '#b45309',
                          border: '1px solid #fde68a',
                          borderRadius: '20px',
                          padding: '2px 8px',
                          fontWeight: 800,
                        }}>
                          ✓ Ready
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveIndex(idx)}
                        title="Remove this animal"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: '6px',
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Animal Type Toggle (Heifer vs Mature Cow) */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.76rem',
                      color: '#64748b',
                      fontWeight: 700,
                      marginBottom: '6px',
                    }}>
                      Pregnancy Type
                    </label>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '6px',
                      background: '#f8fafc',
                      padding: '4px',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                    }}>
                      <button
                        type="button"
                        onClick={() => handleUpdateCow(idx, 'category', 'firstTime')}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '8px',
                          border: 'none',
                          background: cow.category === 'firstTime' ? ACCENT : 'transparent',
                          color: cow.category === 'firstTime' ? '#ffffff' : '#64748b',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        1st Time (Heifer)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateCow(idx, 'category', 'repeat')}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '8px',
                          border: 'none',
                          background: cow.category === 'repeat' ? ACCENT : 'transparent',
                          color: cow.category === 'repeat' ? '#ffffff' : '#64748b',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Repeat (Mature Cow)
                      </button>
                    </div>
                  </div>

                  {/* Body Weight Chips (Numeric Only) */}
                  <WeightChipSelect
                    value={cow.weight}
                    onChange={val => handleUpdateCow(idx, 'weight', val)}
                    ranges={COW_WEIGHT_RANGES}
                    label="Body Weight"
                    accentColor={ACCENT}
                    required={true}
                  />

                  {/* Days Pregnant (Numeric Stepper & Chips, NO Early/Mid/Late) */}
                  <div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px',
                    }}>
                      <label style={{
                        fontSize: '0.8rem',
                        color: '#475569',
                        fontWeight: 700,
                      }}>
                        Days Pregnant *
                      </label>
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: ACCENT,
                        background: '#fef3c7',
                        padding: '2px 8px',
                        borderRadius: '12px',
                      }}>
                        {days} Days
                      </span>
                    </div>

                    {/* Numeric Stepper [-] [Days Input] [+] */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                    }}>
                      <button
                        type="button"
                        onClick={() => handleStepDays(idx, -10)}
                        disabled={days <= 1}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          border: '1.5px solid #e2e8f0',
                          background: '#ffffff',
                          color: '#0f172a',
                          fontWeight: 800,
                          fontSize: '1.2rem',
                          cursor: days <= 1 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        −
                      </button>

                      <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: `1.5px solid ${ACCENT}`,
                        background: '#ffffff',
                      }}>
                        <input
                          type="number"
                          min="1"
                          max="283"
                          value={days}
                          onChange={e => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val)) {
                              handleUpdateCow(idx, 'pregDays', Math.max(1, Math.min(283, val)));
                            }
                          }}
                          onWheel={e => e.target.blur()}
                          style={{
                            width: '60px',
                            textAlign: 'center',
                            fontSize: '1.05rem',
                            fontWeight: 800,
                            color: ACCENT,
                            border: 'none',
                            outline: 'none',
                          }}
                        />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>
                          days
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleStepDays(idx, 10)}
                        disabled={days >= 283}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          border: '1.5px solid #e2e8f0',
                          background: '#ffffff',
                          color: '#0f172a',
                          fontWeight: 800,
                          fontSize: '1.2rem',
                          cursor: days >= 283 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        +
                      </button>
                    </div>

                    {/* Quick-tap Day Number Chips */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                    }}>
                      {PREG_DAY_CHIPS.map(d => {
                        const isSelected = Math.abs(days - d) <= 5;
                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() => handleUpdateCow(idx, 'pregDays', d)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '16px',
                              border: `1.5px solid ${isSelected ? ACCENT : '#e2e8f0'}`,
                              background: isSelected ? ACCENT : '#f8fafc',
                              color: isSelected ? '#ffffff' : '#64748b',
                              fontSize: '0.72rem',
                              fontWeight: isSelected ? 800 : 600,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {d}d
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Progress & Validation Alert */}
      {totalCount > 0 && (
        <div style={{
          padding: '10px 14px',
          borderRadius: '10px',
          background: allWeightsFilled ? '#fffbeb' : '#fff1f2',
          border: `1px solid ${allWeightsFilled ? '#fde68a' : '#fecdd3'}`,
          marginBottom: '20px',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: allWeightsFilled ? '#b45309' : '#be123c',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontSize: '1rem' }}>{allWeightsFilled ? '✅' : '⚠️'}</span>
          {allWeightsFilled
            ? `All ${totalCount} pregnant cattle configured with weight & days — ready to proceed!`
            : `${emptyWeightsCount} animal${emptyWeightsCount > 1 ? 's' : ''} still need body weight selected.`
          }
        </div>
      )}

      {/* Navigation Buttons */}
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
            if (emptyWeightsCount > 0) {
              alert('Please select body weights for all pregnant cattle before proceeding.');
              return;
            }
            onNext();
          }}
          className="btn-primary"
          style={{ background: ACCENT, borderColor: ACCENT }}
        >
          <span>{t ? t('next_step') : 'Next Step'}</span>
          <ChevronRight size={18} />
        </button>
      </div>

    </div>
  );
}
