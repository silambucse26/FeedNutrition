import React from 'react';
import { ChevronLeft, ChevronRight, Copy, Trash2 } from 'lucide-react';
import CattleCounter from './CattleCounter';
import WeightChipSelect from './WeightChipSelect';
import { COW_WEIGHT_RANGES } from '../data/weightRanges';

const ACCENT = '#9333ea';

// Dry period duration quick chips
const DRY_PERIOD_CHIPS = [
  { label: '< 30 days', avg: 20 },
  { label: '30–45 days', avg: 38 },
  { label: '45–60 days', avg: 52 },
  { label: '60–75 days', avg: 68 },
  { label: '> 75 days', avg: 85 },
];

// Days remaining before calving chips
const CALVING_REMAINING_CHIPS = [
  { label: '7 days (Imminent)', days: 7 },
  { label: '14 days (Close-up)', days: 14 },
  { label: '21 days (Close-up)', days: 21 },
  { label: '30 days', days: 30 },
  { label: '45 days', days: 45 },
  { label: '60 days (Far-off)', days: 60 },
];

// Body Condition Score chips
const BCS_OPTIONS = [
  { val: 2.0, label: 'Thin (2.0)' },
  { val: 3.0, label: 'Moderate (3.0)' },
  { val: 3.5, label: 'Ideal (3.5)' },
  { val: 4.0, label: 'Heavy (4.0)' },
];

// Direct quick-count buttons
const QUICK_COUNTS = [0, 1, 2, 3, 5, 8, 10];

export default function Step5DryCows({
  dryCowsData = [],
  setDryCowsData,
  defaultBreed,
  acknowledgeStep,
  onNext,
  onPrev,
  t,
}) {
  // ── helpers ──────────────────────────────────────────────────────
  const addOne = () => {
    if (acknowledgeStep) acknowledgeStep();
    if (dryCowsData.length >= 200) return;
    setDryCowsData([
      ...dryCowsData,
      {
        id: Date.now() + Math.random(),
        weight: '',
        dryDays: 60,
        daysToCalving: 21,
        bcs: 3.5,
      },
    ]);
  };

  const removeOne = () => {
    if (acknowledgeStep) acknowledgeStep();
    if (dryCowsData.length === 0) return;
    setDryCowsData(dryCowsData.slice(0, -1));
  };

  const removeIndex = (idx) => {
    if (acknowledgeStep) acknowledgeStep();
    const updated = [...dryCowsData];
    updated.splice(idx, 1);
    setDryCowsData(updated);
  };

  const clearAll = () => {
    if (acknowledgeStep) acknowledgeStep();
    setDryCowsData([]);
  };

  const setExactCount = (count) => {
    if (acknowledgeStep) acknowledgeStep();
    if (count === 0) {
      setDryCowsData([]);
      return;
    }
    const current = [...dryCowsData];
    if (current.length === count) return;
    if (current.length < count) {
      const needed = count - current.length;
      const added = Array.from({ length: needed }).map((_, i) => ({
        id: Date.now() + i + Math.random(),
        weight: current[0]?.weight || '',
        dryDays: current[0]?.dryDays || 60,
        daysToCalving: current[0]?.daysToCalving || 21,
        bcs: current[0]?.bcs || 3.5,
      }));
      setDryCowsData([...current, ...added]);
    } else {
      setDryCowsData(current.slice(0, count));
    }
  };

  const update = (idx, field, val) => {
    if (acknowledgeStep) acknowledgeStep();
    const updated = [...dryCowsData];
    updated[idx] = { ...updated[idx], [field]: val };
    setDryCowsData(updated);
  };

  const copyToAll = (sourceIdx) => {
    if (acknowledgeStep) acknowledgeStep();
    const source = dryCowsData[sourceIdx];
    if (!source) return;
    const updated = dryCowsData.map(c => ({
      ...c,
      weight: source.weight,
      dryDays: source.dryDays,
      daysToCalving: source.daysToCalving,
      bcs: source.bcs,
    }));
    setDryCowsData(updated);
  };

  const allReady = dryCowsData.length > 0 && dryCowsData.every(c => c.weight && Number(c.weight) > 0);
  const needsWeight = dryCowsData.filter(c => !c.weight || Number(c.weight) <= 0).length;

  // ── render ────────────────────────────────────────────────────────
  return (
    <div className="wg-card animate-fade-in">

      {/* ── Header banner ── */}
      <div className="step-banner" style={{
        background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
        border: '1.5px solid #d8b4fe',
      }}>
        <div className="step-banner-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ background: ACCENT, color: '#fff', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>
              {t ? t('step5.badge') : 'STEP 5 OF 10'}
            </span>
            <span style={{ fontSize: '0.825rem', color: '#7e22ce', fontWeight: 800 }}>
              {t ? t('step5.tag') : 'REST & RECOVERY'}
            </span>
          </div>
          <h2 className="step-banner-title" style={{ color: '#581c87' }}>
            {t ? t('step5.title') : 'Dry Cows Management'}
          </h2>
          <p className="step-banner-subtitle" style={{ color: '#334155' }}>
            <strong>Dry cows</strong> are non-lactating mature cows resting and recovering before their next calving (~60 days dry). They require tailored rations for body condition restoration and fetal development.
          </p>
        </div>
        <img
          src="/cattle_art/cartoon_dry_cow.jpg"
          alt="Dry Cow"
          className="step-banner-img"
          onError={e => { e.target.style.display = 'none'; }}
        />
      </div>

      {/* ── Prominent Question & Quick Count Selection ── */}
      <div style={{
        background: '#ffffff',
        border: '1.5px solid #e9d5ff',
        borderRadius: '16px',
        padding: '16px 20px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(147, 51, 234, 0.04)',
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
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#581c87', margin: '0 0 4px' }}>
              How many Dry Cows are on your farm?
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
              Tap a quick number below or use the tap counter button to set your total dry cows.
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#faf5ff',
            padding: '6px 14px',
            borderRadius: '12px',
            border: `1.5px solid ${ACCENT}30`,
          }}>
            <span style={{ fontSize: '0.8rem', color: '#7e22ce', fontWeight: 700 }}>Total Dry Cows:</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: ACCENT }}>{dryCowsData.length}</span>
          </div>
        </div>

        {/* Quick Count Chip Steppers */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', marginRight: '4px' }}>
            Quick Select:
          </span>
          {QUICK_COUNTS.map((qty) => {
            const isSelected = dryCowsData.length === qty;
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
                {qty === 0 ? '0 Cows (None)' : `${qty} Cow${qty > 1 ? 's' : ''}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tap counter ── */}
      <CattleCounter
        count={dryCowsData.length}
        onAdd={addOne}
        onRemove={removeOne}
        onClear={clearAll}
        cattleType="dry"
        accentColor={ACCENT}
        label="Dry Cow"
        description="Non-lactating mature cows resting before calving"
        showCycle={true}
      />

      {/* ── Empty State Prompt ── */}
      {dryCowsData.length === 0 && (
        <div style={{
          padding: '18px',
          borderRadius: '14px',
          background: '#faf5ff',
          border: '1.5px dashed #d8b4fe',
          textAlign: 'center',
          marginBottom: '24px',
        }}>
          <p style={{ fontSize: '0.9rem', color: '#6b21a8', fontWeight: 700, margin: '0 0 6px' }}>
            No Dry Cows currently on your farm?
          </p>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
            That's completely fine! Click <strong>"Next Step"</strong> below to proceed to Bulls, or tap the button above to add dry cows if you have any.
          </p>
        </div>
      )}

      {/* ── Detail cards for each Dry Cow ── */}
      {dryCowsData.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            marginBottom: '16px',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 900, color: ACCENT }}>
                ENTER DATA FOR EACH DRY COW ({dryCowsData.length})
              </span>
            </div>

            {dryCowsData.length > 1 && (
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
                  borderColor: '#d8b4fe',
                }}
                title="Copy body weight & dry days from Cow #1 to all dry cows"
              >
                <Copy size={13} />
                Copy Cow #1 details to all
              </button>
            )}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 350px), 1fr))',
            gap: '16px',
          }}>
            {dryCowsData.map((cow, idx) => {
              const hasWeight = cow.weight && Number(cow.weight) > 0;
              return (
                <div
                  key={cow.id || idx}
                  className="cattle-icon-anim"
                  style={{
                    background: '#ffffff',
                    border: `1.5px solid ${hasWeight ? '#d8b4fe' : '#fca5a5'}`,
                    borderRadius: '16px',
                    padding: '16px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                    animationDelay: `${idx * 0.05}s`,
                    position: 'relative',
                  }}
                >
                  {/* Card header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '50%',
                      background: hasWeight ? ACCENT : '#f1f5f9',
                      color: hasWeight ? '#ffffff' : '#94a3b8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 900, flexShrink: 0,
                    }}>
                      {idx + 1}
                    </div>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                      Dry Cow #{idx + 1}
                    </span>

                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {hasWeight && (
                        <span style={{
                          fontSize: '0.72rem', background: '#faf5ff',
                          color: ACCENT, border: '1px solid #d8b4fe', borderRadius: '20px',
                          padding: '2px 8px', fontWeight: 800,
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
                        title="Delete this dry cow"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Weight chips */}
                  <WeightChipSelect
                    value={cow.weight}
                    onChange={val => update(idx, 'weight', val)}
                    ranges={COW_WEIGHT_RANGES}
                    label={t ? t('step5.body_weight') : 'Body Weight'}
                    accentColor={ACCENT}
                  />

                  {/* Dry Period Duration */}
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <label style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 800 }}>
                        Dry Period Duration (Days)
                      </label>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: 800,
                        color: ACCENT, background: `${ACCENT}15`,
                        padding: '2px 8px', borderRadius: '20px',
                      }}>
                        {cow.dryDays || 60} days
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                      {DRY_PERIOD_CHIPS.map((chip, ci) => {
                        const isSelected = Number(cow.dryDays) === chip.avg;
                        return (
                          <button
                            key={ci}
                            type="button"
                            onClick={() => update(idx, 'dryDays', chip.avg)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '16px',
                              border: `1.5px solid ${isSelected ? ACCENT : '#e2e8f0'}`,
                              background: isSelected ? ACCENT : '#ffffff',
                              color: isSelected ? '#ffffff' : '#475569',
                              fontSize: '0.74rem',
                              fontWeight: isSelected ? 800 : 600,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              boxShadow: isSelected ? `0 2px 6px ${ACCENT}30` : 'none',
                            }}
                          >
                            {chip.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Direct Day Stepper */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => update(idx, 'dryDays', Math.max(10, (Number(cow.dryDays) || 60) - 5))}
                        className="btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.85rem', fontWeight: 800 }}
                      >
                        −5d
                      </button>
                      <input
                        type="number"
                        min="10"
                        max="150"
                        value={cow.dryDays || ''}
                        onChange={e => update(idx, 'dryDays', Number(e.target.value) || '')}
                        style={{
                          width: '80px',
                          textAlign: 'center',
                          padding: '4px 8px',
                          borderRadius: '8px',
                          border: '1.5px solid #cbd5e1',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                        }}
                      />
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>days dry</span>
                      <button
                        type="button"
                        onClick={() => update(idx, 'dryDays', Math.min(150, (Number(cow.dryDays) || 60) + 5))}
                        className="btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.85rem', fontWeight: 800 }}
                      >
                        +5d
                      </button>
                    </div>
                  </div>

                  {/* Days Remaining Before Calving */}
                  <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <label style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 800 }}>
                        Days to Calving (Close-Up Period)
                      </label>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: 800,
                        color: '#7e22ce', background: '#faf5ff',
                        border: '1px solid #d8b4fe',
                        padding: '2px 8px', borderRadius: '20px',
                      }}>
                        {cow.daysToCalving || 21} days
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {CALVING_REMAINING_CHIPS.map((chip, ci) => {
                        const isSelected = Number(cow.daysToCalving || 21) === chip.days;
                        return (
                          <button
                            key={ci}
                            type="button"
                            onClick={() => update(idx, 'daysToCalving', chip.days)}
                            style={{
                              padding: '5px 9px',
                              borderRadius: '16px',
                              border: `1.5px solid ${isSelected ? '#7e22ce' : '#e2e8f0'}`,
                              background: isSelected ? '#7e22ce' : '#ffffff',
                              color: isSelected ? '#ffffff' : '#475569',
                              fontSize: '0.72rem',
                              fontWeight: isSelected ? 800 : 600,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {chip.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Body Condition Score (BCS) */}
                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
                    <label style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 800, display: 'block', marginBottom: '6px' }}>
                      Body Condition Score (BCS)
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {BCS_OPTIONS.map((bcsOpt, bi) => {
                        const isSelected = Number(cow.bcs || 3.5) === bcsOpt.val;
                        return (
                          <button
                            key={bi}
                            type="button"
                            onClick={() => update(idx, 'bcs', bcsOpt.val)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '14px',
                              border: `1.5px solid ${isSelected ? '#6b21a8' : '#e2e8f0'}`,
                              background: isSelected ? '#6b21a8' : '#ffffff',
                              color: isSelected ? '#ffffff' : '#475569',
                              fontSize: '0.72rem',
                              fontWeight: isSelected ? 800 : 600,
                              cursor: 'pointer',
                            }}
                          >
                            {bcsOpt.label}
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

      {/* ── Progress ── */}
      {dryCowsData.length > 0 && (
        <div style={{
          padding: '12px 16px', borderRadius: '12px',
          background: allReady ? '#faf5ff' : '#fffbeb',
          border: `1px solid ${allReady ? '#d8b4fe' : '#fde68a'}`,
          marginBottom: '20px', fontSize: '0.82rem', fontWeight: 700,
          color: allReady ? '#7e22ce' : '#92400e',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{ fontSize: '1.1rem' }}>{allReady ? '✅' : '⚠️'}</span>
          {allReady
            ? `All ${dryCowsData.length} dry cow${dryCowsData.length > 1 ? 's' : ''} configured with body weight & dry days — ready to proceed!`
            : `${needsWeight} dry cow${needsWeight > 1 ? 's' : ''} still need a body weight selected.`
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
            if (dryCowsData.length > 0 && dryCowsData.some(c => !c.weight || Number(c.weight) <= 0)) {
              alert('Please select body weights for all dry cows before proceeding.');
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
