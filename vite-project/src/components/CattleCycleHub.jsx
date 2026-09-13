import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, Trash2, Copy, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import WeightChipSelect from './WeightChipSelect';
import {
  COW_WEIGHT_RANGES,
  HEIFER_WEIGHT_RANGES,
  BULL_WEIGHT_RANGES,
} from '../data/weightRanges';

// 5 Stages in the Cattle Production Cycle with Cartoon Images & Theme Colors
const STAGES = [
  {
    questionNum: 1,
    key: 'heifers',
    label: 'Heifers (12+ mo)',
    shortLabel: 'Heifers',
    questionTitle: 'Question 1: How many Heifers do you have on your farm?',
    questionSub: 'Young growing female cattle above 12 months that have not yet calved.',
    angle: 126,
    color: '#16a34a',
    bgLight: '#f0fdf4',
    borderLight: '#86efac',
    img: '/cattle_art/cartoon_heifer.jpg',
    tagline: 'Above 12 months old cattle only — young female cattle before first calving.',
    nextKey: 'pregnant',
    nextLabel: 'Pregnant Cattle',
  },
  {
    questionNum: 2,
    key: 'pregnant',
    label: 'Pregnant Cattle',
    shortLabel: 'Pregnant',
    questionTitle: 'Question 2: Do you have Pregnant Cattle on your farm?',
    questionSub: 'Choose whether you have first-time pregnant heifers, repeat pregnant cows, or both.',
    angle: 54,
    color: '#d97706',
    bgLight: '#fffbeb',
    borderLight: '#fde68a',
    img: '/cattle_art/cartoon_pregnant.jpg',
    tagline: 'Expectant cows and heifers in gestation. Record exact days pregnant.',
    nextKey: 'lactating',
    nextLabel: 'Lactating Cows',
  },
  {
    questionNum: 3,
    key: 'lactating',
    label: 'Lactating Cows',
    shortLabel: 'Lactating',
    questionTitle: 'Question 3: How many Lactating (Milking) Cows do you have?',
    questionSub: 'Adult female cows currently being milked daily.',
    angle: -18,
    color: '#0284c7',
    bgLight: '#f0f9ff',
    borderLight: '#7dd3fc',
    img: '/cattle_art/cartoon_lactating.jpg',
    tagline: 'Currently milking dairy cows. Record daily milk yield (L/day) and fat %.',
    nextKey: 'dry',
    nextLabel: 'Dry Cows',
  },
  {
    questionNum: 4,
    key: 'dry',
    label: 'Dry Cows',
    shortLabel: 'Dry Cows',
    questionTitle: 'Question 4: How many Dry (Resting) Cows do you have?',
    questionSub: 'Mature cows resting before next calving (~60 days dry period).',
    angle: -90,
    color: '#9333ea',
    bgLight: '#faf5ff',
    borderLight: '#d8b4fe',
    img: '/cattle_art/cartoon_dry_cow.jpg',
    tagline: 'Non-lactating mature cows resting before calving (~60 days dry).',
    nextKey: 'bulls',
    nextLabel: 'Bulls',
  },
  {
    questionNum: 5,
    key: 'bulls',
    label: 'Bull Cattle',
    shortLabel: 'Bulls',
    questionTitle: 'Question 5: How many Bulls do you have on your farm?',
    questionSub: 'Adult male cattle kept for breeding or draft farm activities.',
    angle: 198,
    color: '#dc2626',
    bgLight: '#fef2f2',
    borderLight: '#fca5a5',
    img: '/cattle_art/cartoon_bull.jpg',
    tagline: 'Adult male cattle for breeding or farm draft work.',
    nextKey: null,
    nextLabel: 'Finish Herd Setup',
  },
];

const QUICK_COUNTS = [0, 1, 2, 3, 5, 8, 10];
const PREG_DAYS_CHIPS = [30, 60, 90, 120, 150, 180, 210, 240, 270];
const MILK_YIELD_CHIPS = [4, 6, 8, 10, 12, 15, 18, 22, 25];
const MILK_FAT_CHIPS = [3.5, 4.0, 4.2, 4.5, 5.0, 6.0, 7.0];
const DRY_PERIOD_CHIPS = [
  { label: '< 30 days', avg: 20 },
  { label: '30–45 days', avg: 38 },
  { label: '45–60 days', avg: 52 },
  { label: '60–75 days', avg: 68 },
  { label: '> 75 days', avg: 85 },
];
const CALVING_REMAINING_CHIPS = [
  { label: '7 days', days: 7 },
  { label: '14 days', days: 14 },
  { label: '21 days', days: 21 },
  { label: '30 days', days: 30 },
  { label: '45 days', days: 45 },
  { label: '60 days', days: 60 },
];
const BCS_OPTIONS = [
  { val: 2.0, label: 'Thin (2.0)' },
  { val: 3.0, label: 'Moderate (3.0)' },
  { val: 3.5, label: 'Ideal (3.5)' },
  { val: 4.0, label: 'Heavy (4.0)' },
];
const LACTATION_STAGE_CHIPS = [
  { val: 'early', dim: 60, label: 'Early (<100d)' },
  { val: 'mid', dim: 150, label: 'Mid (100–200d)' },
  { val: 'late', dim: 240, label: 'Late (>200d)' },
];
const HEIFER_AGE_CHIPS = [12, 14, 16, 18, 20, 24];
const BULL_PURPOSE_CHIPS = ['Breeding Bull', 'Draft / Working'];

export default function CattleCycleHub({
  heifersData = [],
  setHeifersData,
  firstTimeCattle = [],
  setFirstTimeCattle,
  repeatCattle = [],
  setRepeatCattle,
  pregnantCategory = 'both',
  setPregnantCategory,
  lactatingData = [],
  setLactatingData,
  dryCowsData = [],
  setDryCowsData,
  bullsData = [],
  setBullsData,
  defaultBreed,
  initialActiveStage = 'heifers',
  acknowledgeStep,
  onNext,
  onPrev,
  t,
}) {
  const [activeKey, setActiveKey] = useState(initialActiveStage);
  const [tapBounce, setTapBounce] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Track which stages the user has reviewed / answered (even if 0)
  const [visitedStages, setVisitedStages] = useState(() => {
    return {
      heifers: Boolean(heifersData && heifersData.length > 0),
      pregnant: Boolean((firstTimeCattle && firstTimeCattle.length > 0) || (repeatCattle && repeatCattle.length > 0)),
      lactating: Boolean(lactatingData && lactatingData.length > 0),
      dry: Boolean(dryCowsData && dryCowsData.length > 0),
      bulls: Boolean(bullsData && bullsData.length > 0),
    };
  });

  // Pregnancy question type: 'firstTime' | 'repeat' | 'both' | 'none'
  const [pregnancyTypeChoice, setPregnancyTypeChoice] = useState(() => {
    if (firstTimeCattle.length > 0 && repeatCattle.length > 0) return 'both';
    if (firstTimeCattle.length > 0) return 'firstTime';
    if (repeatCattle.length > 0) return 'repeat';
    return pregnantCategory || 'repeat';
  });

  // Lactation question type: 'second_plus' | 'first_lactation' | 'both' | 'none'
  const [lactationTypeChoice, setLactationTypeChoice] = useState(() => {
    const hasFirst = lactatingData.some(l => l.isFirstLactation === true || l.lactationType === 'first_lactation' || l.parity === 1);
    const hasSecondPlus = lactatingData.some(l => !(l.isFirstLactation === true || l.lactationType === 'first_lactation' || l.parity === 1));
    if (hasFirst && hasSecondPlus) return 'both';
    if (hasFirst) return 'first_lactation';
    if (hasSecondPlus) return 'second_plus';
    return 'both';
  });

  const activeStage = STAGES.find(s => s.key === activeKey) || STAGES[0];

  // Combined pregnant cattle helper
  const unifiedPregnant = [
    ...firstTimeCattle.map(c => ({ ...c, category: 'firstTime' })),
    ...repeatCattle.map(c => ({ ...c, category: 'repeat' })),
  ];

  const commitPregnant = (newList) => {
    if (acknowledgeStep) acknowledgeStep();
    const first = newList
      .filter(c => c.category === 'firstTime')
      .map(({ category, ...rest }) => ({
        ...rest,
        pregDays: Number(rest.pregDays) || 150,
        pregMonth: Math.max(1, Math.min(9, Math.round((Number(rest.pregDays) || 150) / 30.4))),
      }));
    const rep = newList
      .filter(c => c.category === 'repeat')
      .map(({ category, ...rest }) => ({
        ...rest,
        pregDays: Number(rest.pregDays) || 210,
        pregMonth: Math.max(1, Math.min(9, Math.round((Number(rest.pregDays) || 210) / 30.4))),
      }));
    setFirstTimeCattle(first);
    setRepeatCattle(rep);
    if (first.length > 0 && rep.length > 0) setPregnantCategory('both');
    else if (first.length > 0) setPregnantCategory('firstTime');
    else if (rep.length > 0) setPregnantCategory('repeat');
    else setPregnantCategory('both');
  };

  // Counts across all stages
  const counts = {
    heifers: heifersData.length,
    pregnant: unifiedPregnant.length,
    lactating: lactatingData.length,
    dry: dryCowsData.length,
    bulls: bullsData.length,
  };
  const totalCattleCount = Object.values(counts).reduce((a, b) => a + b, 0);

  // Sync active question tab if initialActiveStage changes (e.g. clicking Edit in Summary)
  useEffect(() => {
    if (initialActiveStage) {
      setActiveKey(initialActiveStage);
    }
  }, [initialActiveStage]);

  // Validate any stage to verify all animals have required fields
  const checkStageValidity = (stageKey) => {
    if (stageKey === 'heifers') {
      for (let i = 0; i < heifersData.length; i++) {
        const h = heifersData[i];
        if (!h.weight || Number(h.weight) <= 0) {
          return { valid: false, stageKey, index: i, missingField: 'Body Weight', label: `Heifer #${i + 1}` };
        }
      }
    } else if (stageKey === 'pregnant') {
      for (let i = 0; i < unifiedPregnant.length; i++) {
        const p = unifiedPregnant[i];
        if (!p.weight || Number(p.weight) <= 0) {
          return { valid: false, stageKey, index: i, missingField: 'Body Weight', label: `Pregnant Cow #${i + 1}` };
        }
      }
    } else if (stageKey === 'lactating') {
      for (let i = 0; i < lactatingData.length; i++) {
        const l = lactatingData[i];
        if (!l.weight || Number(l.weight) <= 0) {
          return { valid: false, stageKey, index: i, missingField: 'Body Weight', label: `Milking Cow #${i + 1}` };
        }
        if (l.milkYield === '' || l.milkYield === undefined || Number(l.milkYield) <= 0) {
          return { valid: false, stageKey, index: i, missingField: 'Daily Milk Yield', label: `Milking Cow #${i + 1}` };
        }
        if (l.milkFat === '' || l.milkFat === undefined || Number(l.milkFat) <= 0) {
          return { valid: false, stageKey, index: i, missingField: 'Milk Fat %', label: `Milking Cow #${i + 1}` };
        }
      }
    } else if (stageKey === 'dry') {
      for (let i = 0; i < dryCowsData.length; i++) {
        const d = dryCowsData[i];
        if (!d.weight || Number(d.weight) <= 0) {
          return { valid: false, stageKey, index: i, missingField: 'Body Weight', label: `Dry Cow #${i + 1}` };
        }
      }
    } else if (stageKey === 'bulls') {
      for (let i = 0; i < bullsData.length; i++) {
        const b = bullsData[i];
        if (!b.weight || Number(b.weight) <= 0) {
          return { valid: false, stageKey, index: i, missingField: 'Body Weight', label: `Bull #${i + 1}` };
        }
      }
    }
    return { valid: true };
  };

  // Active stage count
  const activeCount = counts[activeKey] || 0;

  // ── Tap to Add Handler for Active Stage ──
  const handleTapAddOne = () => {
    if (acknowledgeStep) acknowledgeStep();
    setTapBounce(true);
    setFeedbackMessage('');
    setTimeout(() => setTapBounce(false), 220);

    if (activeKey === 'heifers') {
      if (heifersData.length >= 200) return;
      setHeifersData([...heifersData, { id: Date.now() + Math.random(), weight: '', ageMonths: 18 }]);
      setVisitedStages(v => ({ ...v, heifers: true }));
    } else if (activeKey === 'pregnant') {
      if (unifiedPregnant.length >= 200) return;
      const targetCat = pregnancyTypeChoice === 'firstTime' ? 'firstTime' : 'repeat';
      const defaultDays = targetCat === 'firstTime' ? 150 : 210;
      const newCow = { id: Date.now() + Math.random(), weight: '', pregDays: defaultDays, category: targetCat };
      commitPregnant([...unifiedPregnant, newCow]);
      setVisitedStages(v => ({ ...v, pregnant: true }));
    } else if (activeKey === 'lactating') {
      if (lactatingData.length >= 200) return;
      const defaultMilk = defaultBreed?.avgDailyMilk || 10;
      const isFirst = lactationTypeChoice === 'first_lactation';
      setLactatingData([
        ...lactatingData,
        {
          id: Date.now() + Math.random(),
          weight: '',
          milkYield: defaultMilk,
          milkFat: 4.2,
          bcs: 3.0,
          stage: 'mid',
          dim: 150,
          isFirstLactation: isFirst,
          lactationType: isFirst ? 'first_lactation' : 'second_plus',
          parity: isFirst ? 1 : 2,
        },
      ]);
      setVisitedStages(v => ({ ...v, lactating: true }));
    } else if (activeKey === 'dry') {
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
      setVisitedStages(v => ({ ...v, dry: true }));
    } else if (activeKey === 'bulls') {
      if (bullsData.length >= 200) return;
      setBullsData([...bullsData, { id: Date.now() + Math.random(), weight: '', purpose: 'Breeding Bull' }]);
      setVisitedStages(v => ({ ...v, bulls: true }));
    }
  };

  // Specific tap handler for lactating when 'both' is chosen
  const handleAddLactatingSpecific = (isFirst) => {
    if (acknowledgeStep) acknowledgeStep();
    setTapBounce(true);
    setFeedbackMessage('');
    setTimeout(() => setTapBounce(false), 220);
    const defaultMilk = defaultBreed?.avgDailyMilk || 10;
    const newCow = {
      id: Date.now() + Math.random(),
      weight: '',
      milkYield: defaultMilk,
      milkFat: 4.2,
      bcs: 3.0,
      stage: 'mid',
      dim: 150,
      isFirstLactation: isFirst,
      lactationType: isFirst ? 'first_lactation' : 'second_plus',
      parity: isFirst ? 1 : 2,
    };
    setLactatingData([...lactatingData, newCow]);
    setVisitedStages(v => ({ ...v, lactating: true }));
  };

  // Specific tap handler for pregnant when 'both' is chosen
  const handleAddPregnantSpecific = (catType) => {
    if (acknowledgeStep) acknowledgeStep();
    setTapBounce(true);
    setFeedbackMessage('');
    setTimeout(() => setTapBounce(false), 220);
    const defaultDays = catType === 'firstTime' ? 150 : 210;
    const newCow = { id: Date.now() + Math.random(), weight: '', pregDays: defaultDays, category: catType };
    commitPregnant([...unifiedPregnant, newCow]);
    setVisitedStages(v => ({ ...v, pregnant: true }));
  };

  // ── Remove One Handler ──
  const handleRemoveOne = () => {
    if (acknowledgeStep) acknowledgeStep();
    if (activeKey === 'heifers') {
      if (heifersData.length > 0) setHeifersData(heifersData.slice(0, -1));
    } else if (activeKey === 'pregnant') {
      if (unifiedPregnant.length > 0) commitPregnant(unifiedPregnant.slice(0, -1));
    } else if (activeKey === 'lactating') {
      if (lactatingData.length > 0) setLactatingData(lactatingData.slice(0, -1));
    } else if (activeKey === 'dry') {
      if (dryCowsData.length > 0) setDryCowsData(dryCowsData.slice(0, -1));
    } else if (activeKey === 'bulls') {
      if (bullsData.length > 0) setBullsData(bullsData.slice(0, -1));
    }
  };

  // ── Clear Active Category Handler ──
  const handleClearActive = () => {
    if (acknowledgeStep) acknowledgeStep();
    if (activeKey === 'heifers') setHeifersData([]);
    else if (activeKey === 'pregnant') {
      setFirstTimeCattle([]);
      setRepeatCattle([]);
    } else if (activeKey === 'lactating') setLactatingData([]);
    else if (activeKey === 'dry') setDryCowsData([]);
    else if (activeKey === 'bulls') setBullsData([]);
  };

  // ── Quick Select Exact Count ──
  const handleSetExactCount = (target) => {
    if (acknowledgeStep) acknowledgeStep();
    setFeedbackMessage('');
    setVisitedStages(v => ({ ...v, [activeKey]: true }));

    if (target === 0) {
      handleClearActive();
      return;
    }

    if (activeKey === 'heifers') {
      const cur = [...heifersData];
      if (cur.length === target) return;
      if (cur.length < target) {
        const added = Array.from({ length: target - cur.length }).map((_, i) => ({
          id: Date.now() + i + Math.random(),
          weight: cur[0]?.weight || '',
          ageMonths: cur[0]?.ageMonths || 18,
        }));
        setHeifersData([...cur, ...added]);
      } else {
        setHeifersData(cur.slice(0, target));
      }
    } else if (activeKey === 'pregnant') {
      const cur = [...unifiedPregnant];
      if (cur.length === target) return;
      const targetCat = pregnancyTypeChoice === 'firstTime' ? 'firstTime' : 'repeat';
      const targetDays = targetCat === 'firstTime' ? 150 : 210;
      if (cur.length < target) {
        const added = Array.from({ length: target - cur.length }).map((_, i) => ({
          id: Date.now() + i + Math.random(),
          weight: cur[0]?.weight || '',
          pregDays: cur[0]?.pregDays || targetDays,
          category: targetCat,
        }));
        commitPregnant([...cur, ...added]);
      } else {
        commitPregnant(cur.slice(0, target));
      }
    } else if (activeKey === 'lactating') {
      const cur = [...lactatingData];
      if (cur.length === target) return;
      if (cur.length < target) {
        const base = cur[0] || {};
        const isFirst = lactationTypeChoice === 'first_lactation' ? true : (typeof base.isFirstLactation === 'boolean' ? base.isFirstLactation : false);
        const added = Array.from({ length: target - cur.length }).map((_, i) => ({
          id: Date.now() + i + Math.random(),
          weight: base.weight || '',
          milkYield: base.milkYield || 10,
          milkFat: base.milkFat || 4.2,
          bcs: base.bcs || 3.0,
          stage: base.stage || 'mid',
          dim: base.dim || 150,
          isFirstLactation: isFirst,
          lactationType: isFirst ? 'first_lactation' : 'second_plus',
          parity: isFirst ? 1 : 2,
        }));
        setLactatingData([...cur, ...added]);
      } else {
        setLactatingData(cur.slice(0, target));
      }
    } else if (activeKey === 'dry') {
      const cur = [...dryCowsData];
      if (cur.length === target) return;
      if (cur.length < target) {
        const base = cur[0] || {};
        const added = Array.from({ length: target - cur.length }).map((_, i) => ({
          id: Date.now() + i + Math.random(),
          weight: base.weight || '',
          dryDays: base.dryDays || 60,
          daysToCalving: base.daysToCalving || 21,
          bcs: base.bcs || 3.5,
        }));
        setDryCowsData([...cur, ...added]);
      } else {
        setDryCowsData(cur.slice(0, target));
      }
    } else if (activeKey === 'bulls') {
      const cur = [...bullsData];
      if (cur.length === target) return;
      if (cur.length < target) {
        const added = Array.from({ length: target - cur.length }).map((_, i) => ({
          id: Date.now() + i + Math.random(),
          weight: cur[0]?.weight || '',
          purpose: cur[0]?.purpose || 'Breeding Bull',
        }));
        setBullsData([...cur, ...added]);
      } else {
        setBullsData(cur.slice(0, target));
      }
    }
  };

  // ── Update Single Animal Helpers ──
  const updateHeifer = (idx, fieldOrWeight, maybeVal) => {
    if (acknowledgeStep) acknowledgeStep();
    const updated = [...heifersData];
    if (typeof maybeVal !== 'undefined') {
      updated[idx] = { ...updated[idx], [fieldOrWeight]: maybeVal };
    } else {
      updated[idx] = { ...updated[idx], weight: fieldOrWeight };
    }
    setHeifersData(updated);
    setVisitedStages(v => ({ ...v, heifers: true }));
  };

  const updatePregnant = (idx, field, val) => {
    if (acknowledgeStep) acknowledgeStep();
    const updated = [...unifiedPregnant];
    updated[idx] = { ...updated[idx], [field]: val };
    commitPregnant(updated);
    setVisitedStages(v => ({ ...v, pregnant: true }));
  };

  const updateLactating = (idx, fieldOrObj, maybeVal) => {
    if (acknowledgeStep) acknowledgeStep();
    setLactatingData(prev => {
      const updated = [...prev];
      if (typeof fieldOrObj === 'object' && fieldOrObj !== null) {
        updated[idx] = { ...updated[idx], ...fieldOrObj };
      } else {
        updated[idx] = { ...updated[idx], [fieldOrObj]: maybeVal };
      }
      if (fieldOrObj === 'isFirstLactation' || (typeof fieldOrObj === 'object' && 'isFirstLactation' in fieldOrObj)) {
        const val = typeof fieldOrObj === 'object' ? fieldOrObj.isFirstLactation : maybeVal;
        updated[idx].lactationType = val ? 'first_lactation' : 'second_plus';
        updated[idx].parity = val ? 1 : 2;
      }
      return updated;
    });
    setVisitedStages(v => ({ ...v, lactating: true }));
  };

  const updateDryCow = (idx, fieldOrObj, maybeVal) => {
    if (acknowledgeStep) acknowledgeStep();
    setDryCowsData(prev => {
      const updated = [...prev];
      if (typeof fieldOrObj === 'object' && fieldOrObj !== null) {
        updated[idx] = { ...updated[idx], ...fieldOrObj };
      } else {
        updated[idx] = { ...updated[idx], [fieldOrObj]: maybeVal };
      }
      return updated;
    });
    setVisitedStages(v => ({ ...v, dry: true }));
  };

  const updateBull = (idx, fieldOrWeight, maybeVal) => {
    if (acknowledgeStep) acknowledgeStep();
    setBullsData(prev => {
      const updated = [...prev];
      if (typeof maybeVal !== 'undefined') {
        updated[idx] = { ...updated[idx], [fieldOrWeight]: maybeVal };
      } else if (typeof fieldOrWeight === 'object' && fieldOrWeight !== null) {
        updated[idx] = { ...updated[idx], ...fieldOrWeight };
      } else {
        updated[idx] = { ...updated[idx], weight: fieldOrWeight };
      }
      return updated;
    });
    setVisitedStages(v => ({ ...v, bulls: true }));
  };

  // Copy to all in active category
  const handleCopyFirstToAll = () => {
    if (acknowledgeStep) acknowledgeStep();
    if (activeKey === 'heifers' && heifersData.length > 1) {
      const src = heifersData[0];
      if (!src?.weight) return;
      setHeifersData(heifersData.map(h => ({ ...h, weight: src.weight, ageMonths: src.ageMonths || 18 })));
    } else if (activeKey === 'pregnant' && unifiedPregnant.length > 1) {
      const src = unifiedPregnant[0];
      if (!src?.weight) return;
      commitPregnant(unifiedPregnant.map(p => ({ ...p, weight: src.weight, pregDays: src.pregDays, category: src.category })));
    } else if (activeKey === 'lactating' && lactatingData.length > 1) {
      const src = lactatingData[0];
      if (!src?.weight) return;
      setLactatingData(lactatingData.map(l => ({
        ...l,
        weight: src.weight,
        milkYield: src.milkYield,
        milkFat: src.milkFat,
        bcs: src.bcs,
        stage: src.stage,
        dim: src.dim,
        isFirstLactation: src.isFirstLactation,
        lactationType: src.lactationType,
        parity: src.parity,
      })));
    } else if (activeKey === 'dry' && dryCowsData.length > 1) {
      const src = dryCowsData[0];
      if (!src?.weight) return;
      setDryCowsData(dryCowsData.map(d => ({ ...d, weight: src.weight, dryDays: src.dryDays })));
    } else if (activeKey === 'bulls' && bullsData.length > 1) {
      const src = bullsData[0];
      if (!src?.weight) return;
      setBullsData(bullsData.map(b => ({ ...b, weight: src.weight, purpose: src.purpose || 'Breeding Bull' })));
    }
  };

  // ── Gated Navigation to Step 3: Verify All 5 Categories Answered & Valid ──
  const handleAttemptNext = () => {
    if (acknowledgeStep) acknowledgeStep();

    // Check total herd count across all stages
    if (totalCattleCount === 0) {
      setFeedbackMessage('⚠️ Please record at least 1 cattle in your herd across the 5 categories (or tap to add count).');
      return;
    }

    // Check all 5 stages in order to verify all required data is filled
    for (const stage of STAGES) {
      const check = checkStageValidity(stage.key);
      if (!check.valid) {
        setActiveKey(stage.key);
        setFeedbackMessage(`⚠️ Incomplete details in Question ${stage.questionNum} (${stage.shortLabel}): Please select ${check.missingField} for ${check.label}.`);
        setTimeout(() => {
          const el = document.getElementById(`cattle-card-${stage.key}-${check.index}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 120);
        return;
      }
    }

    // Check if any stage was never answered/visited
    const missing = STAGES.find(s => !visitedStages[s.key] && counts[s.key] === 0);
    if (missing) {
      setFeedbackMessage(`Please answer Question ${missing.questionNum}: ${missing.label} before proceeding to Grazing.`);
      setActiveKey(missing.key);
      return;
    }

    setFeedbackMessage('');
    onNext();
  };

  // SVG Geometry for Big Cycle
  const cx = 250;
  const cy = 250;
  const R = 155;

  return (
    <div className="wg-card animate-fade-in" style={{ padding: '0', overflow: 'hidden' }}>

      {/* ── Top Header Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 50%, #fef3c7 100%)',
        borderBottom: '1.5px solid #cbd5e1',
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ background: '#0f172a', color: '#ffffff', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>
              STEP 2 OF 6
            </span>
            <span style={{ fontSize: '0.825rem', color: '#0369a1', fontWeight: 800 }}>
              CATTLE HERD & PRODUCTION CYCLE
            </span>
          </div>
          <h2 style={{ fontSize: '1.4rem', color: '#0f172a', fontWeight: 900, margin: '0 0 4px' }}>
            Cattle Herd Management
          </h2>
          <p style={{ fontSize: '0.825rem', color: '#475569', margin: 0 }}>
            Tap each cattle stage in the cycle below, enter counts, and configure body weight & details on the right.
          </p>
        </div>

        {/* Total Herd Count Chip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#ffffff',
          padding: '8px 16px',
          borderRadius: '16px',
          border: '1.5px solid #cbd5e1',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, display: 'block' }}>TOTAL HERD</span>
            <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>{totalCattleCount} animals</span>
          </div>
        </div>
      </div>

      {/* ── Main Two-Column Layout (Big Cycle on Left, Active Form on Right) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(440px, 500px) 1fr',
        gap: '0',
        minHeight: '680px',
      }} className="cattle-cycle-grid">

        {/* ── LEFT COLUMN: The Big Interactive Cycle ── */}
        <div style={{
          background: '#f8fafc',
          borderRight: '1.5px solid #e2e8f0',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
        }} className="cattle-cycle-left-col">
          <div style={{ textAlign: 'center', width: '100%' }}>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 900,
              letterSpacing: '0.08em',
              color: '#475569',
              textTransform: 'uppercase',
            }}>
              Cattle Production Cycle
            </span>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0' }}>
              Click any stage in the cycle below to configure
            </p>
          </div>

          {/* Big Interactive SVG Cycle (viewBox 500x500) */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '480px', aspectRatio: '1 / 1' }}>
            <svg 
              width="100%" 
              height="100%" 
              viewBox="0 0 500 500"
              style={{ display: 'block', overflow: 'visible', filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.06))' }}
            >
              <defs>
                {STAGES.map(s => {
                  const rad = s.angle * Math.PI / 180;
                  const nx = cx + R * Math.cos(rad);
                  const ny = cy + R * Math.sin(rad);
                  return (
                    <clipPath key={`hub-clip-${s.key}`} id={`cycle-clip-${s.key}`}>
                      <circle
                        cx={nx}
                        cy={ny}
                        r="38"
                      />
                    </clipPath>
                  );
                })}
              </defs>

              {/* Orbit track */}
              <circle cx={cx} cy={cy} r={R} fill="none" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="8 6" />

              {/* Center Hub */}
              <circle cx={cx} cy={cy} r={60} fill="#ffffff" stroke="#e2e8f0" strokeWidth="2.5" />
              <text x={cx} y={cy - 16} textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="800" letterSpacing="1.2">
                QUESTION {activeStage.questionNum} OF 5
              </text>
              <text x={cx} y={cy + 14} textAnchor="middle" fill="#0f172a" fontSize="30" fontWeight="900">
                {totalCattleCount}
              </text>
              <text x={cx} y={cy + 30} textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="800" letterSpacing="1">
                TOTAL HERD
              </text>

              {/* Stage Nodes orbiting on the circle */}
              {STAGES.map(s => {
                const rad = s.angle * Math.PI / 180;
                const nx = cx + R * Math.cos(rad);
                const ny = cy + R * Math.sin(rad);
                const isSelected = activeKey === s.key;
                const count = counts[s.key] || 0;
                const isDone = visitedStages[s.key] || count > 0;

                return (
                  <g
                    key={s.key}
                    onClick={() => {
                      setVisitedStages(v => ({ ...v, [activeKey]: true }));
                      setActiveKey(s.key);
                      setFeedbackMessage('');
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Pulsing ring if selected */}
                    {isSelected && (
                      <circle
                        cx={nx}
                        cy={ny}
                        r="52"
                        fill={s.color}
                        opacity="0.22"
                      />
                    )}

                    {/* Outer border ring */}
                    <circle
                      cx={nx}
                      cy={ny}
                      r="44"
                      fill="#ffffff"
                      stroke={isSelected ? s.color : count > 0 ? s.borderLight : '#e2e8f0'}
                      strokeWidth={isSelected ? '4' : '2.5'}
                    />

                    {/* Cartoon Image Node (Diameter 76px) */}
                    <image
                      href={s.img}
                      x={nx - 38}
                      y={ny - 38}
                      width="76"
                      height="76"
                      clipPath={`url(#cycle-clip-${s.key})`}
                      preserveAspectRatio="xMidYMid slice"
                    />

                    {/* Count badge on node (top right) */}
                    <circle
                      cx={nx + 28}
                      cy={ny - 28}
                      r="14"
                      fill={count > 0 ? s.color : '#94a3b8'}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                    />
                    <text
                      x={nx + 28}
                      y={ny - 23}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="12"
                      fontWeight="900"
                    >
                      {count}
                    </text>

                    {/* Answered / Completed checkmark badge (top left) */}
                    {isDone && (
                      <g>
                        <circle
                          cx={nx - 28}
                          cy={ny - 28}
                          r="13"
                          fill="#16a34a"
                          stroke="#ffffff"
                          strokeWidth="2.5"
                        />
                        <text
                          x={nx - 28}
                          y={ny - 23}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="12"
                          fontWeight="900"
                        >
                          ✓
                        </text>
                      </g>
                    )}

                    {/* Stage Name Capsule */}
                    <rect
                      x={nx - 42}
                      y={s.key === 'dry' ? ny - 64 : ny + 48}
                      width="84"
                      height="22"
                      rx="11"
                      fill={isSelected ? s.color : '#ffffff'}
                      stroke={isSelected ? s.color : '#cbd5e1'}
                      strokeWidth={isSelected ? '2' : '1.5'}
                      style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.08))' }}
                    />
                    <text
                      x={nx}
                      y={s.key === 'dry' ? ny - 49 : ny + 63}
                      textAnchor="middle"
                      fill={isSelected ? '#ffffff' : '#1e293b'}
                      fontSize="11"
                      fontWeight="800"
                      letterSpacing="0.2"
                    >
                      {s.shortLabel}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Quick Stage Pills / Buttons below Cycle */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
            width: '100%',
            marginTop: '4px',
          }}>
            {STAGES.map((s, idx) => {
              const isSelected = activeKey === s.key;
              const count = counts[s.key] || 0;
              const isDone = visitedStages[s.key] || count > 0;
              const isLast = idx === STAGES.length - 1;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => {
                    setVisitedStages(v => ({ ...v, [activeKey]: true }));
                    setActiveKey(s.key);
                    setFeedbackMessage('');
                  }}
                  style={{
                    gridColumn: isLast ? 'span 2' : 'span 1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    border: `1.5px solid ${isSelected ? s.color : isDone ? '#86efac' : '#e2e8f0'}`,
                    background: isSelected ? s.bgLight : isDone ? '#f0fdf4' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? `0 2px 8px ${s.color}30` : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: isSelected ? s.color : isDone ? '#16a34a' : '#cbd5e1',
                    }} />
                    <span style={{
                      fontSize: '0.82rem',
                      fontWeight: isSelected ? 800 : 600,
                      color: isSelected ? s.color : '#334155',
                    }}>
                      Q{s.questionNum}: {s.shortLabel}
                    </span>
                  </div>

                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: count > 0 ? `${s.color}20` : isDone ? '#dcfce7' : '#f1f5f9',
                    color: count > 0 ? s.color : isDone ? '#15803d' : '#94a3b8',
                  }}>
                    {count > 0 ? `${count} head` : isDone ? '✓ 0' : 'Pending'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Question-by-Question Active Cattle Flow ── */}
        <div style={{ padding: 'clamp(14px, 2.5vw, 24px)', background: '#ffffff', overflowY: 'auto' }} className="cattle-cycle-right-col">

          {/* Question Stepper Bar (Questions 1 to 5) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '6px',
            marginBottom: '16px',
            padding: '8px 10px',
            background: '#f8fafc',
            borderRadius: '14px',
            border: '1.5px solid #e2e8f0',
            overflowX: 'auto',
          }}>
            {STAGES.map(s => {
              const isCur = activeKey === s.key;
              const isDone = visitedStages[s.key] || counts[s.key] > 0;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => {
                    setVisitedStages(v => ({ ...v, [activeKey]: true }));
                    setActiveKey(s.key);
                    setFeedbackMessage('');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 10px',
                    borderRadius: '10px',
                    border: `1.5px solid ${isCur ? s.color : isDone ? '#86efac' : '#e2e8f0'}`,
                    background: isCur ? s.color : isDone ? '#f0fdf4' : '#ffffff',
                    color: isCur ? '#ffffff' : isDone ? '#15803d' : '#64748b',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>Q{s.questionNum}: {s.shortLabel}</span>
                  {isDone && !isCur && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '13px', height: '13px', borderRadius: '50%', background: '#16a34a', color: '#fff', fontSize: '9px' }}>✓</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback / Validation Message */}
          {feedbackMessage && (
            <div style={{
              background: '#fef2f2',
              border: '1.5px solid #fca5a5',
              color: '#991b1b',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '0.825rem',
              fontWeight: 700,
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <AlertCircle size={16} color="#dc2626" />
              <span>{feedbackMessage}</span>
            </div>
          )}

          {/* Active Question Box */}
          <div style={{
            background: activeStage.bgLight,
            border: `1.5px solid ${activeStage.borderLight}`,
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '18px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{
                background: activeStage.color,
                color: '#ffffff',
                padding: '2px 10px',
                borderRadius: '20px',
                fontSize: '0.72rem',
                fontWeight: 900,
                letterSpacing: '0.04em',
              }}>
                QUESTION {activeStage.questionNum} OF 5
              </span>
              <span style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                color: activeCount > 0 ? activeStage.color : '#94a3b8',
                background: '#ffffff',
                padding: '3px 10px',
                borderRadius: '10px',
                border: `1px solid ${activeStage.borderLight}`,
              }}>
                {activeCount} {activeStage.shortLabel} Recorded
              </span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }}>
              {activeStage.questionTitle}
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#475569', margin: 0 }}>
              {activeStage.questionSub}
            </p>
          </div>

          {/* Special Pregnancy Question Type Selector (Question 2) */}
          {activeKey === 'pregnant' && (
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #fde68a',
              borderRadius: '16px',
              padding: '14px 16px',
              marginBottom: '18px',
              boxShadow: '0 2px 8px rgba(217, 119, 6, 0.08)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 900, color: '#92400e' }}>
                  What type of pregnant cattle do you have?
                </span>
                <span style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: 800, background: '#fef3c7', padding: '2px 8px', borderRadius: '8px' }}>
                  Click to choose
                </span>
              </div>
              <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '0 0 10px' }}>
                Select whether they are first-time pregnant heifers, repeat pregnant cows, or both:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setPregnancyTypeChoice('firstTime');
                    setVisitedStages(v => ({ ...v, pregnant: true }));
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: `2px solid ${pregnancyTypeChoice === 'firstTime' ? '#d97706' : '#e2e8f0'}`,
                    background: pregnancyTypeChoice === 'firstTime' ? '#fffbeb' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: 900, color: pregnancyTypeChoice === 'firstTime' ? '#92400e' : '#1e293b' }}>
                    First-Time
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                    Heifers pregnant 1st time
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPregnancyTypeChoice('repeat');
                    setVisitedStages(v => ({ ...v, pregnant: true }));
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: `2px solid ${pregnancyTypeChoice === 'repeat' ? '#d97706' : '#e2e8f0'}`,
                    background: pregnancyTypeChoice === 'repeat' ? '#fffbeb' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: 900, color: pregnancyTypeChoice === 'repeat' ? '#92400e' : '#1e293b' }}>
                    Repeat Pregnant
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                    Cows with prior calvings
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPregnancyTypeChoice('both');
                    setVisitedStages(v => ({ ...v, pregnant: true }));
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: `2px solid ${pregnancyTypeChoice === 'both' ? '#d97706' : '#e2e8f0'}`,
                    background: pregnancyTypeChoice === 'both' ? '#fffbeb' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: 900, color: pregnancyTypeChoice === 'both' ? '#92400e' : '#1e293b' }}>
                    Both Types
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                    Both in farm herd
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPregnancyTypeChoice('none');
                    commitPregnant([]);
                    setVisitedStages(v => ({ ...v, pregnant: true }));
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: `2px solid ${pregnancyTypeChoice === 'none' && unifiedPregnant.length === 0 ? '#16a34a' : '#e2e8f0'}`,
                    background: pregnancyTypeChoice === 'none' && unifiedPregnant.length === 0 ? '#f0fdf4' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: 900, color: pregnancyTypeChoice === 'none' && unifiedPregnant.length === 0 ? '#15803d' : '#1e293b' }}>
                    No Pregnant (0)
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                    No pregnant cattle
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Special Lactation Question Type Selector (Question 3) */}
          {activeKey === 'lactating' && (
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #bbf7d0',
              borderRadius: '16px',
              padding: '14px 16px',
              marginBottom: '18px',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 900, color: '#065f46' }}>
                  What type of milking / lactating cattle do you have?
                </span>
                <span style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 800, background: '#d1fae5', padding: '2px 8px', borderRadius: '8px' }}>
                  Click to choose
                </span>
              </div>
              <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '0 0 10px' }}>
                Select whether your cows are in their 1st lactation (1st calvers), 2nd+ lactation (multiparous), or both:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setLactationTypeChoice('first_lactation');
                    setVisitedStages(v => ({ ...v, lactating: true }));
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: `2px solid ${lactationTypeChoice === 'first_lactation' ? '#059669' : '#e2e8f0'}`,
                    background: lactationTypeChoice === 'first_lactation' ? '#ecfdf5' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: 900, color: lactationTypeChoice === 'first_lactation' ? '#047857' : '#1e293b' }}>
                    🌱 1st Lactation
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                    1st calvers / primiparous
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLactationTypeChoice('second_plus');
                    setVisitedStages(v => ({ ...v, lactating: true }));
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: `2px solid ${lactationTypeChoice === 'second_plus' ? '#059669' : '#e2e8f0'}`,
                    background: lactationTypeChoice === 'second_plus' ? '#ecfdf5' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: 900, color: lactationTypeChoice === 'second_plus' ? '#047857' : '#1e293b' }}>
                    🥛 2nd+ Lactation
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                    2+ calvers / multiparous
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLactationTypeChoice('both');
                    setVisitedStages(v => ({ ...v, lactating: true }));
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: `2px solid ${lactationTypeChoice === 'both' ? '#059669' : '#e2e8f0'}`,
                    background: lactationTypeChoice === 'both' ? '#ecfdf5' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: 900, color: lactationTypeChoice === 'both' ? '#047857' : '#1e293b' }}>
                    Mixed (Both)
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                    Both 1st & 2nd+ in herd
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLactationTypeChoice('none');
                    setLactatingData([]);
                    setVisitedStages(v => ({ ...v, lactating: true }));
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: `2px solid ${lactationTypeChoice === 'none' && lactatingData.length === 0 ? '#16a34a' : '#e2e8f0'}`,
                    background: lactationTypeChoice === 'none' && lactatingData.length === 0 ? '#f0fdf4' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: 900, color: lactationTypeChoice === 'none' && lactatingData.length === 0 ? '#15803d' : '#1e293b' }}>
                    No Milking (0)
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                    No milking cows
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Prominent Tap-to-Add Cartoon Avatar & Stepper Box */}
          <div style={{
            background: activeStage.bgLight,
            border: `1.5px solid ${activeStage.borderLight}`,
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: `0 4px 16px ${activeStage.color}15`,
          }}>

            {/* Clickable Cartoon Avatar Button ("little big to click it") */}
            <button
              type="button"
              onClick={handleTapAddOne}
              style={{
                background: '#ffffff',
                border: `3px solid ${activeStage.color}`,
                borderRadius: '50%',
                width: '100px',
                height: '100px',
                padding: '4px',
                cursor: 'pointer',
                overflow: 'hidden',
                boxShadow: `0 6px 20px ${activeStage.color}35`,
                transform: tapBounce ? 'scale(0.92)' : 'scale(1)',
                transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
                outline: 'none',
                marginBottom: '8px',
              }}
              title={`Tap to add 1 ${activeStage.shortLabel}`}
            >
              <img
                src={activeStage.img}
                alt={activeStage.label}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            </button>

            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: activeStage.color, marginBottom: '12px' }}>
              👆 Tap image to add 1 {activeStage.shortLabel}
            </span>

            {/* Special Sub-Buttons when Both pregnancy types chosen */}
            {activeKey === 'pregnant' && pregnancyTypeChoice === 'both' && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => handleAddPregnantSpecific('firstTime')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #d97706',
                    background: '#ffffff',
                    color: '#92400e',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  + Add 1st-Time ({firstTimeCattle.length})
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPregnantSpecific('repeat')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #d97706',
                    background: '#ffffff',
                    color: '#92400e',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  + Add Repeat ({repeatCattle.length})
                </button>
              </div>
            )}

            {/* Special Sub-Buttons when Both lactation types chosen */}
            {activeKey === 'lactating' && lactationTypeChoice === 'both' && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => handleAddLactatingSpecific(true)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #059669',
                    background: '#ffffff',
                    color: '#065f46',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  + Add 1st Lactation ({lactatingData.filter(l => l.isFirstLactation || l.lactationType === 'first_lactation' || l.parity === 1).length})
                </button>
                <button
                  type="button"
                  onClick={() => handleAddLactatingSpecific(false)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #059669',
                    background: '#ffffff',
                    color: '#065f46',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  + Add 2nd+ Lactation ({lactatingData.filter(l => !(l.isFirstLactation || l.lactationType === 'first_lactation' || l.parity === 1)).length})
                </button>
              </div>
            )}

            {/* Simple Counter Row with Left [-] and Right [+] */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
              <button
                type="button"
                onClick={handleRemoveOne}
                disabled={activeCount === 0}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  border: `2px solid ${activeCount === 0 ? '#cbd5e1' : activeStage.color}`,
                  background: activeCount === 0 ? '#f1f5f9' : '#ffffff',
                  color: activeCount === 0 ? '#94a3b8' : activeStage.color,
                  fontSize: '1.6rem',
                  fontWeight: 900,
                  cursor: activeCount === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                  transition: 'all 0.15s ease',
                }}
              >
                −
              </button>

              <div style={{ minWidth: '90px', textAlign: 'center' }}>
                <div style={{
                  fontSize: '2.2rem',
                  fontWeight: 900,
                  color: activeCount === 0 ? '#94a3b8' : activeStage.color,
                  lineHeight: 1,
                }}>
                  {activeCount}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>
                  {activeStage.shortLabel}{activeCount !== 1 ? 's' : ''}
                </div>
              </div>

              <button
                type="button"
                onClick={handleTapAddOne}
                disabled={activeCount >= 200}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  border: `2px solid ${activeStage.color}`,
                  background: activeStage.color,
                  color: '#ffffff',
                  fontSize: '1.6rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                  boxShadow: `0 4px 10px ${activeStage.color}40`,
                  transition: 'all 0.15s ease',
                }}
              >
                +
              </button>
            </div>

            {/* Quick Count Select Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', marginRight: '4px' }}>
                Quick:
              </span>
              {QUICK_COUNTS.map(qty => {
                const isSelected = activeCount === qty;
                return (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => handleSetExactCount(qty)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '16px',
                      border: `1.5px solid ${isSelected ? activeStage.color : '#cbd5e1'}`,
                      background: isSelected ? activeStage.color : '#ffffff',
                      color: isSelected ? '#ffffff' : '#475569',
                      fontSize: '0.74rem',
                      fontWeight: isSelected ? 800 : 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {qty === 0 ? '0 (None)' : qty}
                  </button>
                );
              })}

              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearActive}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    marginLeft: '8px',
                  }}
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* ── DETAIL INPUTS PER CATTLE ── */}

          {/* 0 Cattle Prompt */}
          {activeCount === 0 && (
            <div style={{
              padding: '20px',
              borderRadius: '14px',
              background: '#f8fafc',
              border: '1.5px dashed #cbd5e1',
              textAlign: 'center',
              marginBottom: '20px',
            }}>
              <p style={{ fontSize: '0.88rem', color: '#475569', fontWeight: 700, margin: '0 0 8px' }}>
                No {activeStage.label} on your farm?
              </p>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 14px' }}>
                That's completely fine! You can proceed to the next cattle stage in the cycle, or tap the cartoon avatar above to add.
              </p>
              {activeStage.nextKey ? (
                <button
                  type="button"
                  onClick={() => {
                    setVisitedStages(v => ({ ...v, [activeKey]: true }));
                    setFeedbackMessage('');
                    setActiveKey(activeStage.nextKey);
                  }}
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 800 }}
                >
                  <span>Confirm 0 & Go to Question {activeStage.questionNum + 1}: {activeStage.nextLabel}</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setVisitedStages(v => ({ ...v, [activeKey]: true }));
                    setFeedbackMessage('');
                    handleAttemptNext();
                  }}
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>Confirm 0 & Finish Herd Setup</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          )}

          {/* Detail Cards List */}
          {activeCount > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
                flexWrap: 'wrap',
                gap: '8px',
              }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 900, color: activeStage.color }}>
                  ENTER DATA FOR EACH {activeStage.shortLabel.toUpperCase()} ({activeCount})
                </span>

                {activeCount > 1 && (
                  <button
                    type="button"
                    onClick={handleCopyFirstToAll}
                    className="btn-secondary"
                    style={{
                      fontSize: '0.72rem',
                      padding: '4px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: activeStage.color,
                      borderColor: activeStage.borderLight,
                    }}
                    title="Copy details from #1 to all"
                  >
                    <Copy size={12} />
                    Copy #1 to all {activeStage.shortLabel}s
                  </button>
                )}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
                gap: '14px',
              }}>
                {/* 1. HEIFERS CARDS */}
                {activeKey === 'heifers' && heifersData.map((h, i) => {
                  const hasWeight = Boolean(h.weight && Number(h.weight) > 0);
                  return (
                    <div
                      key={h.id || i}
                      id={`cattle-card-heifers-${i}`}
                      className="cattle-icon-anim"
                      style={{
                        background: '#ffffff',
                        border: `1.5px solid ${hasWeight ? activeStage.borderLight : '#f87171'}`,
                        borderRadius: '14px',
                        padding: '12px 14px',
                        boxShadow: hasWeight ? '0 2px 8px rgba(0,0,0,0.04)' : '0 2px 10px rgba(239, 68, 68, 0.15)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {/* Cartoon Cattle Image with Cattle Number Badge */}
                          <div style={{
                            position: 'relative',
                            width: '46px',
                            height: '46px',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: `2px solid ${hasWeight ? activeStage.color : '#ef4444'}`,
                            flexShrink: 0,
                            background: '#f8fafc',
                          }}>
                            <img
                              src={activeStage.img}
                              alt={`Heifer #${i + 1}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: hasWeight ? activeStage.color : '#ef4444',
                              color: '#ffffff',
                              fontSize: '0.62rem',
                              fontWeight: 900,
                              textAlign: 'center',
                              lineHeight: '13px',
                              letterSpacing: '0.3px',
                            }}>
                              #{i + 1}
                            </div>
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                                Heifer #{i + 1}
                              </span>
                              {hasWeight ? (
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '1px 6px', borderRadius: '6px' }}>
                                  ✓ Ready
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#dc2626', background: '#fee2e2', padding: '1px 6px', borderRadius: '6px' }}>
                                  ⚠️ Select Weight
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.70rem', color: hasWeight ? '#64748b' : '#dc2626', fontWeight: 600 }}>
                              {hasWeight ? `${h.weight} kg • ${h.ageMonths || 18} months` : 'Body weight required'}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...heifersData];
                            updated.splice(i, 1);
                            setHeifersData(updated);
                          }}
                          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                          title="Remove Heifer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <WeightChipSelect
                        value={h.weight}
                        onChange={val => updateHeifer(i, 'weight', val)}
                        ranges={HEIFER_WEIGHT_RANGES}
                        label="Body Weight"
                        accentColor={activeStage.color}
                      />

                      {/* Age in Months Chips */}
                      <div style={{ marginTop: '7px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#334155' }}>
                            Age (12+ Months)
                          </label>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: activeStage.color }}>
                            {h.ageMonths || 18} months
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {HEIFER_AGE_CHIPS.map(age => {
                            const isSel = Number(h.ageMonths || 18) === age;
                            return (
                              <button
                                key={age}
                                type="button"
                                onClick={() => updateHeifer(i, 'ageMonths', age)}
                                style={{
                                  padding: '3px 8px', borderRadius: '10px',
                                  border: `1.5px solid ${isSel ? activeStage.color : '#e2e8f0'}`,
                                  background: isSel ? activeStage.color : '#ffffff',
                                  color: isSel ? '#ffffff' : '#475569',
                                  fontSize: '0.72rem', fontWeight: isSel ? 800 : 600, cursor: 'pointer',
                                }}
                              >
                                {age} mo
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* 2. PREGNANT CARDS */}
                {activeKey === 'pregnant' && unifiedPregnant.map((p, i) => {
                  const hasWeight = Boolean(p.weight && Number(p.weight) > 0);
                  const isRepeat = p.category === 'repeat';
                  return (
                    <div
                      key={p.id || i}
                      id={`cattle-card-pregnant-${i}`}
                      className="cattle-icon-anim"
                      style={{
                        background: '#ffffff',
                        border: `1.5px solid ${hasWeight ? activeStage.borderLight : '#f87171'}`,
                        borderRadius: '14px',
                        padding: '12px 14px',
                        boxShadow: hasWeight ? '0 2px 8px rgba(0,0,0,0.04)' : '0 2px 10px rgba(239, 68, 68, 0.15)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {/* Cartoon Cattle Image with Cattle Number Badge */}
                          <div style={{
                            position: 'relative',
                            width: '46px',
                            height: '46px',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: `2px solid ${hasWeight ? activeStage.color : '#ef4444'}`,
                            flexShrink: 0,
                            background: '#f8fafc',
                          }}>
                            <img
                              src={activeStage.img}
                              alt={`Pregnant Cattle #${i + 1}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: hasWeight ? activeStage.color : '#ef4444',
                              color: '#ffffff',
                              fontSize: '0.62rem',
                              fontWeight: 900,
                              textAlign: 'center',
                              lineHeight: '13px',
                              letterSpacing: '0.3px',
                            }}>
                              #{i + 1}
                            </div>
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                                {isRepeat ? 'Repeat Cow' : '1st Time Heifer'} #{i + 1}
                              </span>
                              {hasWeight ? (
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '1px 6px', borderRadius: '6px' }}>
                                  ✓ Ready
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#dc2626', background: '#fee2e2', padding: '1px 6px', borderRadius: '6px' }}>
                                  ⚠️ Select Weight
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.70rem', color: hasWeight ? '#64748b' : '#dc2626', fontWeight: 600 }}>
                              {hasWeight ? `${p.weight} kg • ${p.pregDays || 150} days pregnant` : 'Body weight required'}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...unifiedPregnant];
                            updated.splice(i, 1);
                            commitPregnant(updated);
                          }}
                          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                          title="Remove Pregnant Cattle"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* First-time vs Repeat Toggle */}
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '7px' }}>
                        <button
                          type="button"
                          onClick={() => updatePregnant(i, 'category', 'repeat')}
                          style={{
                            flex: 1, padding: '4px 8px', borderRadius: '10px',
                            border: `1.5px solid ${isRepeat ? activeStage.color : '#e2e8f0'}`,
                            background: isRepeat ? activeStage.bgLight : '#ffffff',
                            color: isRepeat ? activeStage.color : '#64748b',
                            fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer',
                          }}
                        >
                          Repeat Pregnant
                        </button>
                        <button
                          type="button"
                          onClick={() => updatePregnant(i, 'category', 'firstTime')}
                          style={{
                            flex: 1, padding: '4px 8px', borderRadius: '10px',
                            border: `1.5px solid ${!isRepeat ? activeStage.color : '#e2e8f0'}`,
                            background: !isRepeat ? activeStage.bgLight : '#ffffff',
                            color: !isRepeat ? activeStage.color : '#64748b',
                            fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer',
                          }}
                        >
                          1st Time (Heifer)
                        </button>
                      </div>

                      <WeightChipSelect
                        value={p.weight}
                        onChange={val => updatePregnant(i, 'weight', val)}
                        ranges={COW_WEIGHT_RANGES}
                        label="Body Weight"
                        accentColor={activeStage.color}
                      />

                      {/* Days Pregnant Chips */}
                      <div style={{ marginTop: '7px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#334155' }}>
                            Days Pregnant
                          </label>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: activeStage.color }}>
                            {p.pregDays || 150} days
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {PREG_DAYS_CHIPS.map(days => {
                            const isSel = Number(p.pregDays || 150) === days;
                            return (
                              <button
                                key={days}
                                type="button"
                                onClick={() => updatePregnant(i, 'pregDays', days)}
                                style={{
                                  padding: '3px 8px', borderRadius: '10px',
                                  border: `1.5px solid ${isSel ? activeStage.color : '#e2e8f0'}`,
                                  background: isSel ? activeStage.color : '#ffffff',
                                  color: isSel ? '#ffffff' : '#475569',
                                  fontSize: '0.72rem', fontWeight: isSel ? 800 : 600, cursor: 'pointer',
                                }}
                              >
                                {days}d
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* 3. LACTATING CARDS */}
                {activeKey === 'lactating' && lactatingData.map((l, i) => {
                  const isFirstLact = l.isFirstLactation === true || l.lactationType === 'first_lactation' || l.parity === 1;
                  const curBcs = l.bcs !== undefined && l.bcs !== '' ? Number(l.bcs) : 3.0;
                  const rawStage = String(l.stage || 'mid').toLowerCase();
                  const curStage = rawStage.includes('early') ? 'early' : rawStage.includes('late') ? 'late' : 'mid';

                  const hasWeight = Boolean(l.weight && Number(l.weight) > 0);
                  const hasMilkYield = Boolean(l.milkYield !== '' && l.milkYield !== undefined && Number(l.milkYield) > 0);
                  const hasMilkFat = Boolean(l.milkFat !== '' && l.milkFat !== undefined && Number(l.milkFat) > 0);
                  const isValid = hasWeight && hasMilkYield && hasMilkFat;

                  return (
                    <div
                      key={l.id || i}
                      id={`cattle-card-lactating-${i}`}
                      className="cattle-icon-anim"
                      style={{
                        background: '#ffffff',
                        border: `1.5px solid ${isValid ? activeStage.borderLight : '#f87171'}`,
                        borderRadius: '14px',
                        padding: '12px 14px',
                        boxShadow: isValid ? '0 2px 8px rgba(0,0,0,0.04)' : '0 2px 10px rgba(239, 68, 68, 0.15)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {/* Cartoon Cattle Image with Cattle Number Badge */}
                          <div style={{
                            position: 'relative',
                            width: '46px',
                            height: '46px',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: `2px solid ${isValid ? activeStage.color : '#ef4444'}`,
                            flexShrink: 0,
                            background: '#f8fafc',
                          }}>
                            <img
                              src={activeStage.img}
                              alt={`Milking Cow #${i + 1}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: isValid ? activeStage.color : '#ef4444',
                              color: '#ffffff',
                              fontSize: '0.62rem',
                              fontWeight: 900,
                              textAlign: 'center',
                              lineHeight: '13px',
                              letterSpacing: '0.3px',
                            }}>
                              #{i + 1}
                            </div>
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                                Milking Cow #{i + 1}
                              </span>
                              {isValid ? (
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '1px 6px', borderRadius: '6px' }}>
                                  ✓ Ready
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#dc2626', background: '#fee2e2', padding: '1px 6px', borderRadius: '6px' }}>
                                  ⚠️ {!hasWeight ? 'Weight' : !hasMilkYield ? 'Milk Yield' : 'Milk Fat'}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.70rem', color: isValid ? '#64748b' : '#dc2626', fontWeight: 600 }}>
                              {hasWeight ? `${l.weight} kg` : 'Weight required'} • {l.milkYield || 10} L/d • {l.milkFat || 4.2}% Fat
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...lactatingData];
                            updated.splice(i, 1);
                            setLactatingData(updated);
                          }}
                          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                          title="Remove Milking Cow"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* 1st Lactation vs 2nd+ Lactation Toggle */}
                      <div style={{ marginBottom: '7px' }}>
                        <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', marginBottom: '3px' }}>
                          Lactation Number / Calver
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => updateLactating(i, 'isFirstLactation', true)}
                            style={{
                              flex: 1, padding: '5px 8px', borderRadius: '10px',
                              border: `1.5px solid ${isFirstLact ? activeStage.color : '#e2e8f0'}`,
                              background: isFirstLact ? activeStage.bgLight : '#ffffff',
                              color: isFirstLact ? activeStage.color : '#64748b',
                              fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                            }}
                          >
                            <span>🌱 1st Lactation</span>
                            <span style={{ fontSize: '0.64rem', opacity: 0.8 }}>(1st Calver)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => updateLactating(i, 'isFirstLactation', false)}
                            style={{
                              flex: 1, padding: '5px 8px', borderRadius: '10px',
                              border: `1.5px solid ${!isFirstLact ? activeStage.color : '#e2e8f0'}`,
                              background: !isFirstLact ? activeStage.bgLight : '#ffffff',
                              color: !isFirstLact ? activeStage.color : '#64748b',
                              fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                            }}
                          >
                            <span>🥛 2nd+ Lactation</span>
                            <span style={{ fontSize: '0.64rem', opacity: 0.8 }}>(2+ Calver)</span>
                          </button>
                        </div>
                      </div>

                      <WeightChipSelect
                        value={l.weight}
                        onChange={val => updateLactating(i, 'weight', val)}
                        ranges={COW_WEIGHT_RANGES}
                        label="Body Weight"
                        accentColor={activeStage.color}
                      />

                      {/* Daily Milk Yield */}
                      <div style={{ marginTop: '7px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#334155' }}>
                            Daily Milk Yield (L/day)
                          </label>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: activeStage.color }}>
                            {l.milkYield || 10} Litres/day
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {MILK_YIELD_CHIPS.map(yieldVal => {
                            const isSel = Number(l.milkYield) === yieldVal;
                            return (
                              <button
                                key={yieldVal}
                                type="button"
                                onClick={() => updateLactating(i, 'milkYield', yieldVal)}
                                style={{
                                  padding: '3px 8px', borderRadius: '10px',
                                  border: `1.5px solid ${isSel ? activeStage.color : '#e2e8f0'}`,
                                  background: isSel ? activeStage.color : '#ffffff',
                                  color: isSel ? '#ffffff' : '#475569',
                                  fontSize: '0.72rem', fontWeight: isSel ? 800 : 600, cursor: 'pointer',
                                }}
                              >
                                {yieldVal} L
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Milk Fat % */}
                      <div style={{ marginTop: '7px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#334155' }}>
                            Milk Fat %
                          </label>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: activeStage.color }}>
                            {l.milkFat || 4.2}%
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {MILK_FAT_CHIPS.map(fat => {
                            const isSel = Number(l.milkFat) === fat;
                            return (
                              <button
                                key={fat}
                                type="button"
                                onClick={() => updateLactating(i, 'milkFat', fat)}
                                style={{
                                  padding: '3px 8px', borderRadius: '10px',
                                  border: `1.5px solid ${isSel ? activeStage.color : '#e2e8f0'}`,
                                  background: isSel ? activeStage.color : '#ffffff',
                                  color: isSel ? '#ffffff' : '#475569',
                                  fontSize: '0.72rem', fontWeight: isSel ? 800 : 600, cursor: 'pointer',
                                }}
                              >
                                {fat}%
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Body Condition Score (BCS) */}
                      <div style={{ marginTop: '7px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#334155' }}>
                            Body Condition Score (BCS)
                          </label>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: activeStage.color }}>
                            BCS {curBcs}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {BCS_OPTIONS.map(opt => {
                            const isSel = Math.abs(curBcs - opt.val) < 0.1;
                            return (
                              <button
                                key={opt.val}
                                type="button"
                                onClick={() => updateLactating(i, 'bcs', opt.val)}
                                style={{
                                  padding: '3px 8px', borderRadius: '10px',
                                  border: `1.5px solid ${isSel ? activeStage.color : '#e2e8f0'}`,
                                  background: isSel ? activeStage.color : '#ffffff',
                                  color: isSel ? '#ffffff' : '#475569',
                                  fontSize: '0.72rem', fontWeight: isSel ? 800 : 600, cursor: 'pointer',
                                }}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Lactation Stage / DIM */}
                      <div style={{ marginTop: '7px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#334155' }}>
                            Lactation Stage / DIM
                          </label>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: activeStage.color }}>
                            {curStage === 'early' ? 'Early (<100d)' : curStage === 'late' ? 'Late (>200d)' : 'Mid (100–200d)'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {LACTATION_STAGE_CHIPS.map(chip => {
                            const isSel = curStage === chip.val;
                            return (
                              <button
                                key={chip.val}
                                type="button"
                                onClick={() => updateLactating(i, { stage: chip.val, dim: chip.dim })}
                                style={{
                                  padding: '3px 8px', borderRadius: '10px',
                                  border: `1.5px solid ${isSel ? activeStage.color : '#e2e8f0'}`,
                                  background: isSel ? activeStage.color : '#ffffff',
                                  color: isSel ? '#ffffff' : '#475569',
                                  fontSize: '0.72rem', fontWeight: isSel ? 800 : 600, cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                {chip.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  );
                })}

                {/* 4. DRY COWS CARDS */}
                {activeKey === 'dry' && dryCowsData.map((d, i) => {
                  const hasWeight = Boolean(d.weight && Number(d.weight) > 0);
                  return (
                    <div
                      key={d.id || i}
                      id={`cattle-card-dry-${i}`}
                      className="cattle-icon-anim"
                      style={{
                        background: '#ffffff',
                        border: `1.5px solid ${hasWeight ? activeStage.borderLight : '#f87171'}`,
                        borderRadius: '14px',
                        padding: '12px 14px',
                        boxShadow: hasWeight ? '0 2px 8px rgba(0,0,0,0.04)' : '0 2px 10px rgba(239, 68, 68, 0.15)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {/* Cartoon Cattle Image with Cattle Number Badge */}
                          <div style={{
                            position: 'relative',
                            width: '46px',
                            height: '46px',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: `2px solid ${hasWeight ? activeStage.color : '#ef4444'}`,
                            flexShrink: 0,
                            background: '#f8fafc',
                          }}>
                            <img
                              src={activeStage.img}
                              alt={`Dry Cow #${i + 1}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: hasWeight ? activeStage.color : '#ef4444',
                              color: '#ffffff',
                              fontSize: '0.62rem',
                              fontWeight: 900,
                              textAlign: 'center',
                              lineHeight: '13px',
                              letterSpacing: '0.3px',
                            }}>
                              #{i + 1}
                            </div>
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                                Dry Cow #{i + 1}
                              </span>
                              {hasWeight ? (
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '1px 6px', borderRadius: '6px' }}>
                                  ✓ Ready
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#dc2626', background: '#fee2e2', padding: '1px 6px', borderRadius: '6px' }}>
                                  ⚠️ Select Weight
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.70rem', color: hasWeight ? '#64748b' : '#dc2626', fontWeight: 600 }}>
                              {hasWeight ? `${d.weight} kg • ${d.dryDays || 60} days dry` : 'Body weight required'}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...dryCowsData];
                            updated.splice(i, 1);
                            setDryCowsData(updated);
                          }}
                          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                          title="Remove Dry Cow"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <WeightChipSelect
                        value={d.weight}
                        onChange={val => updateDryCow(i, 'weight', val)}
                        ranges={COW_WEIGHT_RANGES}
                        label="Body Weight"
                        accentColor={activeStage.color}
                      />

                      {/* Dry Period Duration */}
                      <div style={{ marginTop: '7px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#334155' }}>
                            Dry Period Duration
                          </label>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: activeStage.color }}>
                            {d.dryDays || 60} days
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {DRY_PERIOD_CHIPS.map(chip => {
                            const isSel = Number(d.dryDays || 60) === chip.avg;
                            return (
                              <button
                                key={chip.label}
                                type="button"
                                onClick={() => updateDryCow(i, 'dryDays', chip.avg)}
                                style={{
                                  padding: '3px 8px', borderRadius: '10px',
                                  border: `1.5px solid ${isSel ? activeStage.color : '#e2e8f0'}`,
                                  background: isSel ? activeStage.color : '#ffffff',
                                  color: isSel ? '#ffffff' : '#475569',
                                  fontSize: '0.72rem', fontWeight: isSel ? 800 : 600, cursor: 'pointer',
                                }}
                              >
                                {chip.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* 5. BULLS CARDS */}
                {activeKey === 'bulls' && bullsData.map((b, i) => {
                  const hasWeight = Boolean(b.weight && Number(b.weight) > 0);
                  return (
                    <div
                      key={b.id || i}
                      id={`cattle-card-bulls-${i}`}
                      className="cattle-icon-anim"
                      style={{
                        background: '#ffffff',
                        border: `1.5px solid ${hasWeight ? activeStage.borderLight : '#f87171'}`,
                        borderRadius: '14px',
                        padding: '12px 14px',
                        boxShadow: hasWeight ? '0 2px 8px rgba(0,0,0,0.04)' : '0 2px 10px rgba(239, 68, 68, 0.15)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {/* Cartoon Cattle Image with Cattle Number Badge */}
                          <div style={{
                            position: 'relative',
                            width: '46px',
                            height: '46px',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: `2px solid ${hasWeight ? activeStage.color : '#ef4444'}`,
                            flexShrink: 0,
                            background: '#f8fafc',
                          }}>
                            <img
                              src={activeStage.img}
                              alt={`Bull #${i + 1}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: hasWeight ? activeStage.color : '#ef4444',
                              color: '#ffffff',
                              fontSize: '0.62rem',
                              fontWeight: 900,
                              textAlign: 'center',
                              lineHeight: '13px',
                              letterSpacing: '0.3px',
                            }}>
                              #{i + 1}
                            </div>
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                                Bull #{i + 1}
                              </span>
                              {hasWeight ? (
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '1px 6px', borderRadius: '6px' }}>
                                  ✓ Ready
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#dc2626', background: '#fee2e2', padding: '1px 6px', borderRadius: '6px' }}>
                                  ⚠️ Select Weight
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.70rem', color: hasWeight ? '#64748b' : '#dc2626', fontWeight: 600 }}>
                              {hasWeight ? `${b.weight} kg • ${b.purpose || 'Breeding Bull'}` : 'Body weight required'}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...bullsData];
                            updated.splice(i, 1);
                            setBullsData(updated);
                          }}
                          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                          title="Remove Bull"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <WeightChipSelect
                        value={b.weight}
                        onChange={val => updateBull(i, 'weight', val)}
                        ranges={BULL_WEIGHT_RANGES}
                        label="Body Weight"
                        accentColor={activeStage.color}
                      />

                      {/* Bull Purpose / Activity */}
                      <div style={{ marginTop: '7px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#334155' }}>
                            Bull Purpose / Activity
                          </label>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: activeStage.color }}>
                            {b.purpose || 'Breeding Bull'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {BULL_PURPOSE_CHIPS.map(purp => {
                            const isSel = (b.purpose || 'Breeding Bull') === purp;
                            return (
                              <button
                                key={purp}
                                type="button"
                                onClick={() => updateBull(i, 'purpose', purp)}
                                style={{
                                  padding: '3px 9px', borderRadius: '10px',
                                  border: `1.5px solid ${isSel ? activeStage.color : '#e2e8f0'}`,
                                  background: isSel ? activeStage.color : '#ffffff',
                                  color: isSel ? '#ffffff' : '#475569',
                                  fontSize: '0.72rem', fontWeight: isSel ? 800 : 600, cursor: 'pointer',
                                }}
                              >
                                {purp === 'Breeding Bull' ? '🐂 Breeding Bull' : '🚜 Draft / Working'}
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

          {/* Next Stage / Finish Action Button */}
          {activeStage.nextKey ? (
            <button
              type="button"
              onClick={() => {
                const check = checkStageValidity(activeKey);
                if (!check.valid) {
                  setFeedbackMessage(`⚠️ Please select ${check.missingField} for ${check.label} before proceeding to the next question.`);
                  const el = document.getElementById(`cattle-card-${activeKey}-${check.index}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  return;
                }
                setVisitedStages(v => ({ ...v, [activeKey]: true }));
                setFeedbackMessage('');
                setActiveKey(activeStage.nextKey);
              }}
              style={{
                width: '100%',
                padding: '13px 20px',
                borderRadius: '12px',
                border: `1.5px solid ${activeStage.color}`,
                background: activeStage.bgLight,
                color: activeStage.color,
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>Done with Q{activeStage.questionNum} ({activeStage.shortLabel}) — Go to Q{activeStage.questionNum + 1}: {activeStage.nextLabel}</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAttemptNext}
              className="btn-primary"
              style={{ width: '100%', padding: '14px 20px', fontSize: '0.92rem', justifyContent: 'center' }}
            >
              <span>All 5 Questions Answered — Proceed to Step 3 (Grazing)</span>
              <ArrowRight size={16} />
            </button>
          )}

        </div>
      </div>

      {/* ── Bottom Step Navigation ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderTop: '1.5px solid #e2e8f0',
        background: '#ffffff',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <button onClick={onPrev} className="btn-secondary">
          <ChevronLeft size={18} />
          <span>Previous (Breed)</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>
            Herd Questions:
          </span>
          {STAGES.map(s => {
            const isCur = activeKey === s.key;
            const stageCheck = checkStageValidity(s.key);
            const hasCattle = counts[s.key] > 0;
            const isVisited = visitedStages[s.key];
            const isInvalid = hasCattle && !stageCheck.valid;
            const isDone = (isVisited || hasCattle) && !isInvalid;

            let badgeBg = '#f1f5f9';
            let badgeColor = '#64748b';
            let badgeBorder = '#e2e8f0';
            let icon = '○';

            if (isCur) {
              badgeBg = s.color;
              badgeColor = '#ffffff';
              badgeBorder = s.color;
              icon = isInvalid ? '⚠️' : hasCattle ? '✓' : '●';
            } else if (isInvalid) {
              badgeBg = '#fee2e2';
              badgeColor = '#dc2626';
              badgeBorder = '#fca5a5';
              icon = '⚠️';
            } else if (isDone) {
              badgeBg = '#dcfce7';
              badgeColor = '#15803d';
              badgeBorder = '#86efac';
              icon = '✓';
            }

            return (
              <span
                key={s.key}
                onClick={() => {
                  setVisitedStages(v => ({ ...v, [activeKey]: true }));
                  setActiveKey(s.key);
                  setFeedbackMessage('');
                }}
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  padding: '4px 9px',
                  borderRadius: '8px',
                  background: badgeBg,
                  color: badgeColor,
                  border: `1px solid ${badgeBorder}`,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
                title={`Question ${s.questionNum}: ${s.shortLabel} (${counts[s.key]} head)`}
              >
                {icon} Q{s.questionNum}: {s.shortLabel} ({counts[s.key]})
              </span>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleAttemptNext}
          className="btn-primary"
        >
          <span>Next Step (Grazing Management)</span>
          <ChevronRight size={18} />
        </button>
      </div>

    </div>
  );
}
