import React from 'react';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import CattleCounter from './CattleCounter';
import WeightChipSelect from './WeightChipSelect';
import { COW_WEIGHT_RANGES } from '../data/weightRanges';

const ACCENT = '#0284c7'; // Vibrant dairy blue

// Popular numeric milk yield chips (L/day)
const MILK_YIELD_CHIPS = [4, 6, 8, 10, 12, 15, 18, 22, 26];

// Popular numeric fat percentage chips
const MILK_FAT_CHIPS = [3.5, 4.0, 4.5, 5.0, 6.0, 7.0];

export default function Step4Lactation({
  lactatingData,
  setLactatingData,
  defaultBreed,
  acknowledgeStep,
  onNext,
  onPrev,
  t,
}) {
  const count = lactatingData.length;

  const handleAddOne = () => {
    if (acknowledgeStep) acknowledgeStep();
    if (count >= 200) return;
    setLactatingData([
      ...lactatingData,
      {
        id: Date.now() + Math.random(),
        weight: '',
        bcs: 3.5,
        milkYield: 10,
        milkFat: 4.2,
        stage: 'Mid lactation',
        lactationType: 'second_plus',
        isFirstLactation: false,
      },
    ]);
  };

  const handleRemoveOne = () => {
    if (acknowledgeStep) acknowledgeStep();
    if (count === 0) return;
    setLactatingData(lactatingData.slice(0, -1));
  };

  const handleRemoveIndex = (idx) => {
    if (acknowledgeStep) acknowledgeStep();
    const updated = [...lactatingData];
    updated.splice(idx, 1);
    setLactatingData(updated);
  };

  const handleClearAll = () => {
    if (acknowledgeStep) acknowledgeStep();
    setLactatingData([]);
  };

  const handleSetExactCount = (newCount) => {
    if (acknowledgeStep) acknowledgeStep();
    if (newCount === 0) {
      handleClearAll();
      return;
    }
    if (count === newCount) return;
    if (count < newCount) {
      const needed = newCount - count;
      const base = lactatingData[0] || {};
      const added = Array.from({ length: needed }).map((_, i) => ({
        id: Date.now() + i + Math.random(),
        weight: base.weight || '',
        milkYield: base.milkYield || 10,
        milkFat: base.milkFat || 4.2,
        bcs: base.bcs || 3.0,
        stage: base.stage || 'Mid lactation',
        dim: base.dim || 90,
        isFirstLactation: false,
      }));
      setLactatingData([...lactatingData, ...added]);
    } else {
      setLactatingData(lactatingData.slice(0, newCount));
    }
  };

  const handleUpdateCow = (idx, fieldOrUpdates, value) => {
    if (acknowledgeStep) acknowledgeStep();
    const updated = [...lactatingData];
    if (typeof fieldOrUpdates === 'object' && fieldOrUpdates !== null) {
      updated[idx] = { ...updated[idx], ...fieldOrUpdates };
    } else {
      updated[idx] = { ...updated[idx], [fieldOrUpdates]: value };
    }
    setLactatingData(updated);
  };

  // Step milk yield by delta
  const handleStepMilk = (idx, delta) => {
    const current = Number(lactatingData[idx].milkYield) || 10;
    const clamped = Math.max(1, Math.min(60, Math.round((current + delta) * 10) / 10));
    handleUpdateCow(idx, 'milkYield', clamped);
  };

  // Step milk fat by delta
  const handleStepFat = (idx, delta) => {
    const current = Number(lactatingData[idx].milkFat) || 4.2;
    const clamped = Math.max(2.5, Math.min(10.0, Math.round((current + delta) * 10) / 10));
    handleUpdateCow(idx, 'milkFat', clamped);
  };

  const getBcsLabel = (bcs) => {
    if (bcs <= 1.5) return '1 - Very Thin';
    if (bcs <= 2.5) return '2 - Thin';
    if (bcs <= 3.5) return '3 - Good';
    if (bcs <= 4.5) return '4 - Heavy';
    return '5 - Very Heavy';
  };

  const totalMilk = lactatingData.reduce((acc, cow) => acc + (Number(cow.milkYield) || 0), 0);
  const allConfigured = count > 0 && lactatingData.every(c =>
    c.weight && Number(c.weight) > 0 &&
    c.milkYield !== '' && Number(c.milkYield) > 0 &&
    c.milkFat !== '' && Number(c.milkFat) > 0
  );
  const unconfiguredCount = lactatingData.filter(c =>
    !c.weight || Number(c.weight) <= 0 ||
    c.milkYield === '' || Number(c.milkYield) <= 0 ||
    c.milkFat === '' || Number(c.milkFat) <= 0
  ).length;

  return (
    <div className="wg-card animate-fade-in">

      {/* Visual Header Banner */}
      <div
        className="step-banner"
        style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          border: '1.5px solid #7dd3fc',
        }}
      >
        <div className="step-banner-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ background: ACCENT, color: '#ffffff', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>
              {t ? t('step4.badge') : 'STEP 4 OF 10'}
            </span>
            <span style={{ fontSize: '0.825rem', color: '#0369a1', fontWeight: 800 }}>
              {t ? t('step4.tag') : 'MILK PRODUCING HERD'}
            </span>
          </div>
          <h2 className="step-banner-title" style={{ color: '#0c4a6e' }}>
            {t ? t('step4.title') : 'Lactating Cattle Management'}
          </h2>
          <p className="step-banner-subtitle" style={{ color: '#334155' }}>
            Record body weight, daily milk production (L/day), and milk fat % for each milking cow.
          </p>
        </div>

        <img
          src="/cattle_art/cartoon_lactating.jpg"
          alt="Milking Cow"
          className="step-banner-img"
          onError={e => { e.target.style.display = 'none'; }}
        />
      </div>

      {/* ── Question & Quick Count Selection ── */}
      <div style={{
        background: '#ffffff',
        border: '1.5px solid #bae6fd',
        borderRadius: '16px',
        padding: '16px 20px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(2, 132, 199, 0.04)',
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
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0c4a6e', margin: '0 0 4px' }}>
              How many Lactating Cows are on your farm?
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
              Currently in-milk cows on the farm. Tap a quick number or use the counter button.
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#f0f9ff',
            padding: '6px 14px',
            borderRadius: '12px',
            border: `1.5px solid ${ACCENT}30`,
          }}>
            <span style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: 700 }}>Total Milking:</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: ACCENT }}>{count}</span>
          </div>
        </div>

        {/* Quick Count Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', marginRight: '4px' }}>
            Quick Select:
          </span>
          {[0, 1, 2, 3, 5, 8, 10].map((qty) => {
            const isSelected = count === qty;
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
                {qty === 0 ? '0 Milking (None)' : `${qty} Cow${qty > 1 ? 's' : ''}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tap Counter Component with Cartoon Avatar */}
      <CattleCounter
        count={count}
        onAdd={handleAddOne}
        onRemove={handleRemoveOne}
        onClear={handleClearAll}
        cattleType="lactating"
        accentColor={ACCENT}
        label="Milking Cow"
        description="Currently in-milk cows on the farm"
        showCycle={true}
      />

      {/* Empty State Prompt */}
      {count === 0 && (
        <div style={{
          padding: '18px',
          borderRadius: '14px',
          background: '#f0f9ff',
          border: '1.5px dashed #7dd3fc',
          textAlign: 'center',
          marginBottom: '24px',
        }}>
          <p style={{ fontSize: '0.9rem', color: '#0369a1', fontWeight: 700, margin: '0 0 6px' }}>
            No milking cows currently on your farm?
          </p>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
            Click <strong>"Next Step"</strong> below to proceed to Dry Cows, or tap above to add milking cows.
          </p>
        </div>
      )}

      {/* Summary Stat when Cows > 0 */}
      {count > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f0f9ff',
          border: '1.5px solid #bae6fd',
          borderRadius: '12px',
          padding: '12px 18px',
          marginBottom: '20px',
        }}>
          <div>
            <span style={{ fontSize: '0.82rem', color: '#0369a1', fontWeight: 700 }}>
              Total Daily Milk Production:
            </span>
            <span style={{ fontSize: '1.15rem', fontWeight: 900, color: ACCENT, marginLeft: '8px' }}>
              {totalMilk.toFixed(1)} Litres/day
            </span>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>
            Avg: {(totalMilk / count).toFixed(1)} L/cow
          </span>
        </div>
      )}

      {/* List of Lactating Cows */}
      {count > 0 && (
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
              background: 'linear-gradient(90deg, #bae6fd, transparent)',
              borderRadius: '2px',
            }} />
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              color: ACCENT,
              whiteSpace: 'nowrap',
            }}>
              CONFIGURE EACH MILKING COW ({count})
            </span>
            <div style={{
              height: '2px',
              flex: 1,
              background: 'linear-gradient(270deg, #bae6fd, transparent)',
              borderRadius: '2px',
            }} />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))',
            gap: '16px',
          }}>
            {lactatingData.map((cow, idx) => {
              const hasWeight = cow.weight && Number(cow.weight) > 0;
              const yieldNum = Number(cow.milkYield) || 0;
              const fatNum = Number(cow.milkFat) || 0;
              const isReady = hasWeight && yieldNum > 0 && fatNum > 0;

              return (
                <div
                  key={cow.id || idx}
                  className="cattle-icon-anim"
                  style={{
                    background: '#ffffff',
                    border: `1.5px solid ${isReady ? '#7dd3fc' : '#fca5a5'}`,
                    borderRadius: '16px',
                    padding: '16px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    animationDelay: `${idx * 0.04}s`,
                  }}
                >
                  {/* Card Header: Cow #, Status Badge, Delete */}
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
                        background: isReady ? ACCENT : '#f1f5f9',
                        color: isReady ? '#ffffff' : '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 900,
                      }}>
                        {idx + 1}
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                        Milking Cow #{idx + 1}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isReady && (
                        <span style={{
                          fontSize: '0.7rem',
                          background: '#f0f9ff',
                          color: '#0369a1',
                          border: '1px solid #bae6fd',
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
                        title="Remove this cow"
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

                  {/* Parity Toggle (1st Lactation vs 2nd+ Lactation) */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.76rem',
                      color: '#64748b',
                      fontWeight: 700,
                      marginBottom: '6px',
                    }}>
                      Lactation Type
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
                        onClick={() => handleUpdateCow(idx, { lactationType: 'first_lactation', isFirstLactation: true })}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '8px',
                          border: 'none',
                          background: cow.isFirstLactation || cow.lactationType === 'first_lactation' ? ACCENT : 'transparent',
                          color: cow.isFirstLactation || cow.lactationType === 'first_lactation' ? '#ffffff' : '#64748b',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        1st Lactation (+20% Growth)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateCow(idx, { lactationType: 'second_plus', isFirstLactation: false })}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '8px',
                          border: 'none',
                          background: !cow.isFirstLactation && cow.lactationType !== 'first_lactation' ? ACCENT : 'transparent',
                          color: !cow.isFirstLactation && cow.lactationType !== 'first_lactation' ? '#ffffff' : '#64748b',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        2nd+ Lactation (Mature)
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

                  {/* Daily Milk Yield (Numeric Stepper & Chips) */}
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
                        Daily Milk Yield *
                      </label>
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: ACCENT,
                        background: '#f0f9ff',
                        padding: '2px 8px',
                        borderRadius: '12px',
                      }}>
                        {yieldNum} Litres/day
                      </span>
                    </div>

                    {/* Numeric Stepper [-] [Litres Input] [+] */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                    }}>
                      <button
                        type="button"
                        onClick={() => handleStepMilk(idx, -1)}
                        disabled={yieldNum <= 1}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          border: '1.5px solid #e2e8f0',
                          background: '#ffffff',
                          color: '#0f172a',
                          fontWeight: 800,
                          fontSize: '1.2rem',
                          cursor: yieldNum <= 1 ? 'not-allowed' : 'pointer',
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
                          max="60"
                          step="0.5"
                          value={yieldNum}
                          onChange={e => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) {
                              handleUpdateCow(idx, 'milkYield', Math.max(0, Math.min(60, val)));
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
                          L/day
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleStepMilk(idx, 1)}
                        disabled={yieldNum >= 60}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          border: '1.5px solid #e2e8f0',
                          background: '#ffffff',
                          color: '#0f172a',
                          fontWeight: 800,
                          fontSize: '1.2rem',
                          cursor: yieldNum >= 60 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        +
                      </button>
                    </div>

                    {/* Quick-tap Milk Yield Chips */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                    }}>
                      {MILK_YIELD_CHIPS.map(litres => {
                        const isSelected = Math.abs(yieldNum - litres) < 0.2;
                        return (
                          <button
                            key={litres}
                            type="button"
                            onClick={() => handleUpdateCow(idx, 'milkYield', litres)}
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
                            {litres} L
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Milk Fat % (Numeric Stepper & Chips) */}
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
                        Milk Fat % *
                      </label>
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: ACCENT,
                        background: '#f0f9ff',
                        padding: '2px 8px',
                        borderRadius: '12px',
                      }}>
                        {fatNum}% Fat
                      </span>
                    </div>

                    {/* Numeric Stepper [-] [Fat Input] [+] */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                    }}>
                      <button
                        type="button"
                        onClick={() => handleStepFat(idx, -0.1)}
                        disabled={fatNum <= 2.5}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          border: '1.5px solid #e2e8f0',
                          background: '#ffffff',
                          color: '#0f172a',
                          fontWeight: 800,
                          fontSize: '1.2rem',
                          cursor: fatNum <= 2.5 ? 'not-allowed' : 'pointer',
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
                          min="2.5"
                          max="10.0"
                          step="0.1"
                          value={fatNum}
                          onChange={e => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) {
                              handleUpdateCow(idx, 'milkFat', Math.max(2.5, Math.min(10.0, val)));
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
                          %
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleStepFat(idx, 0.1)}
                        disabled={fatNum >= 10.0}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          border: '1.5px solid #e2e8f0',
                          background: '#ffffff',
                          color: '#0f172a',
                          fontWeight: 800,
                          fontSize: '1.2rem',
                          cursor: fatNum >= 10.0 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        +
                      </button>
                    </div>

                    {/* Quick-tap Fat Chips */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                    }}>
                      {MILK_FAT_CHIPS.map(fat => {
                        const isSelected = Math.abs(fatNum - fat) < 0.1;
                        return (
                          <button
                            key={fat}
                            type="button"
                            onClick={() => handleUpdateCow(idx, 'milkFat', fat)}
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
                            {fat}%
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Body Condition Score Slider */}
                  <div style={{
                    background: '#f8fafc',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px',
                    }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                        Body Condition: <strong style={{ color: ACCENT }}>{getBcsLabel(cow.bcs)}</strong>
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 900, color: ACCENT }}>
                        BCS {cow.bcs}
                      </span>
                    </div>

                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="0.5"
                      value={cow.bcs || 3.5}
                      onChange={e => handleUpdateCow(idx, 'bcs', parseFloat(e.target.value) || 3.5)}
                      style={{ width: '100%', accentColor: ACCENT }}
                    />
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Progress & Validation Alert */}
      {count > 0 && (
        <div style={{
          padding: '10px 14px',
          borderRadius: '10px',
          background: allConfigured ? '#f0f9ff' : '#fff1f2',
          border: `1px solid ${allConfigured ? '#bae6fd' : '#fecdd3'}`,
          marginBottom: '20px',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: allConfigured ? '#0369a1' : '#be123c',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontSize: '1rem' }}>{allConfigured ? '✅' : '⚠️'}</span>
          {allConfigured
            ? `All ${count} milking cows configured — ready to proceed!`
            : `${unconfiguredCount} cow${unconfiguredCount > 1 ? 's' : ''} still need weight, milk yield, or fat % specified.`
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
            if (unconfiguredCount > 0) {
              alert('Please specify weight, milk yield, and fat % for all milking cows before proceeding.');
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
