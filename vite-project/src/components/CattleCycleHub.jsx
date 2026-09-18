import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, Trash2, Copy, Sparkles, ArrowRight, AlertCircle, X } from 'lucide-react';
import WeightChipSelect from './WeightChipSelect';
import {
  COW_WEIGHT_RANGES,
  HEIFER_WEIGHT_RANGES,
  BULL_WEIGHT_RANGES,
} from '../data/weightRanges';
import { ANIMAL_STAGE_TRANSLATIONS, translateTerm } from '../utils/tamilTranslations';

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
  currentLang = 'ta',
  t,
}) {
  const [activeKey, setActiveKey] = useState(initialActiveStage);
  const [tapBounce, setTapBounce] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [missingModal, setMissingModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    stageKey: null,
    isZeroCount: false,
    nextStageKey: null,
    missingElementId: null,
  });

  // Localized stages based on active language (ta, hi, en)
  const localizedStages = STAGES.map(s => {
    const tr = ANIMAL_STAGE_TRANSLATIONS[s.key];
    const rawTitle = (tr && (currentLang === 'ta' || currentLang === 'hi'))
      ? (tr.questionTitle?.[currentLang] || s.questionTitle)
      : s.questionTitle;
    const cleanTitle = String(rawTitle).replace(/^(Question|கேள்வி|प्रश्न)\s*\d+:\s*/i, '');

    if (tr && (currentLang === 'ta' || currentLang === 'hi')) {
      const l = currentLang;
      return {
        ...s,
        label: tr.label?.[l] || s.label,
        shortLabel: tr.shortLabel?.[l] || s.shortLabel,
        questionTitle: cleanTitle,
        questionSub: tr.questionSub?.[l] || s.questionSub,
        tagline: tr.tagline?.[l] || s.tagline,
        nextLabel: tr.nextLabel?.[l] || s.nextLabel,
      };
    }
    return {
      ...s,
      questionTitle: cleanTitle,
    };
  });

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

  const activeStage = localizedStages.find(s => s.key === activeKey) || localizedStages[0];

  // Combined pregnant cattle helper
  const unifiedPregnant = [
    ...firstTimeCattle.map(c => ({ ...c, category: 'firstTime' })),
    ...repeatCattle.map(c => ({ ...c, category: 'repeat' })),
  ];

  const commitPregnant = (newList) => {
    if (acknowledgeStep) acknowledgeStep();
    const first = newList
      .filter(c => c.category === 'firstTime')
      .map(({ category, ...rest }) => {
        const pDays = rest.pregDays !== '' && rest.pregDays !== undefined ? Number(rest.pregDays) : '';
        return {
          ...rest,
          pregDays: pDays,
          pregMonth: pDays !== '' ? Math.max(1, Math.min(9, Math.round(pDays / 30.4))) : '',
        };
      });
    const rep = newList
      .filter(c => c.category === 'repeat')
      .map(({ category, ...rest }) => {
        const pDays = rest.pregDays !== '' && rest.pregDays !== undefined ? Number(rest.pregDays) : '';
        return {
          ...rest,
          pregDays: pDays,
          pregMonth: pDays !== '' ? Math.max(1, Math.min(9, Math.round(pDays / 30.4))) : '',
        };
      });
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
        if (!p.pregDays || Number(p.pregDays) <= 0) {
          return { valid: false, stageKey, index: i, missingField: 'Days Pregnant', label: `Pregnant Cow #${i + 1}` };
        }
      }
    } else if (stageKey === 'lactating') {
      for (let i = 0; i < lactatingData.length; i++) {
        const l = lactatingData[i];
        if (!l.weight || Number(l.weight) <= 0) {
          return { valid: false, stageKey, index: i, missingField: 'Body Weight', label: `Milking Cow #${i + 1}` };
        }
        if (l.milkYield === '' || l.milkYield === undefined || Number(l.milkYield) <= 0) {
          return { valid: false, stageKey, index: i, missingField: 'Daily Milk Yield (L/day)', label: `Milking Cow #${i + 1}` };
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
        if (!d.dryDays || Number(d.dryDays) <= 0) {
          return { valid: false, stageKey, index: i, missingField: 'Dry Period Days', label: `Dry Cow #${i + 1}` };
        }
      }
    } else if (stageKey === 'bulls') {
      for (let i = 0; i < bullsData.length; i++) {
        const b = bullsData[i];
        if (!b.weight || Number(b.weight) <= 0) {
          return { valid: false, stageKey, index: i, missingField: 'Body Weight', label: `Bull #${i + 1}` };
        }
        if (!b.purpose) {
          return { valid: false, stageKey, index: i, missingField: 'Bull Purpose / Activity', label: `Bull #${i + 1}` };
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
      setHeifersData([...heifersData, { id: Date.now() + Math.random(), weight: '', ageMonths: '' }]);
      setVisitedStages(v => ({ ...v, heifers: true }));
    } else if (activeKey === 'pregnant') {
      if (unifiedPregnant.length >= 200) return;
      const targetCat = pregnancyTypeChoice === 'firstTime' ? 'firstTime' : 'repeat';
      const newCow = { id: Date.now() + Math.random(), weight: '', pregDays: '', category: targetCat };
      commitPregnant([...unifiedPregnant, newCow]);
      setVisitedStages(v => ({ ...v, pregnant: true }));
    } else if (activeKey === 'lactating') {
      if (lactatingData.length >= 200) return;
      const isFirst = lactationTypeChoice === 'first_lactation';
      setLactatingData([
        ...lactatingData,
        {
          id: Date.now() + Math.random(),
          weight: '',
          milkYield: '',
          milkFat: '',
          bcs: '',
          stage: '',
          dim: '',
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
          dryDays: '',
          daysToCalving: '',
          bcs: '',
        },
      ]);
      setVisitedStages(v => ({ ...v, dry: true }));
    } else if (activeKey === 'bulls') {
      if (bullsData.length >= 200) return;
      setBullsData([...bullsData, { id: Date.now() + Math.random(), weight: '', purpose: '' }]);
      setVisitedStages(v => ({ ...v, bulls: true }));
    }
  };

  // Specific tap handler for lactating when 'both' is chosen
  const handleAddLactatingSpecific = (isFirst) => {
    if (acknowledgeStep) acknowledgeStep();
    setTapBounce(true);
    setFeedbackMessage('');
    setTimeout(() => setTapBounce(false), 220);
    const newCow = {
      id: Date.now() + Math.random(),
      weight: '',
      milkYield: '',
      milkFat: '',
      bcs: '',
      stage: '',
      dim: '',
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
    const newCow = { id: Date.now() + Math.random(), weight: '', pregDays: '', category: catType };
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
          weight: '',
          ageMonths: '',
        }));
        setHeifersData([...cur, ...added]);
      } else {
        setHeifersData(cur.slice(0, target));
      }
    } else if (activeKey === 'pregnant') {
      const cur = [...unifiedPregnant];
      if (cur.length === target) return;
      const targetCat = pregnancyTypeChoice === 'firstTime' ? 'firstTime' : 'repeat';
      if (cur.length < target) {
        const added = Array.from({ length: target - cur.length }).map((_, i) => ({
          id: Date.now() + i + Math.random(),
          weight: '',
          pregDays: '',
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
          weight: '',
          milkYield: '',
          milkFat: '',
          bcs: '',
          stage: '',
          dim: '',
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
        const added = Array.from({ length: target - cur.length }).map((_, i) => ({
          id: Date.now() + i + Math.random(),
          weight: '',
          dryDays: '',
          daysToCalving: '',
          bcs: '',
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
          weight: '',
          purpose: '',
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

  // Determine sequential stage relationships
  const currentStageIndex = STAGES.findIndex(s => s.key === activeKey);
  const nextStage = currentStageIndex < STAGES.length - 1 ? STAGES[currentStageIndex + 1] : null;
  const prevStage = currentStageIndex > 0 ? STAGES[currentStageIndex - 1] : null;
  const localizedNextStage = nextStage ? localizedStages.find(s => s.key === nextStage.key) : null;
  const localizedPrevStage = prevStage ? localizedStages.find(s => s.key === prevStage.key) : null;

  // Handle Switching Cattle Stages (Gated with Modal Popup & Auto-Scroll)
  const handleSwitchStage = (targetKey) => {
    if (targetKey === activeKey) return;
    const check = checkStageValidity(activeKey);
    if (!check.valid) {
      const curStageObj = localizedStages.find(s => s.key === activeKey) || activeStage;
      setMissingModal({
        isOpen: true,
        title: currentLang === 'ta' ? 'விவரங்கள் பூர்த்தி செய்யப்படவில்லை' : currentLang === 'hi' ? 'अधूरा विवरण' : 'Incomplete Cattle Details',
        message: currentLang === 'ta'
          ? `${curStageObj.shortLabel} (${check.label}) - ${check.missingField} தேர்ந்தெடுக்கப்படவில்லை. தயவுசெய்து விவரங்களை நிரப்பவும்.`
          : currentLang === 'hi'
            ? `${curStageObj.shortLabel} (${check.label}) के लिए ${check.missingField} दर्ज करें।`
            : `Please select ${check.missingField} for ${check.label} in ${curStageObj.shortLabel}.`,
        stageKey: activeKey,
        isZeroCount: false,
        nextStageKey: null,
        missingElementId: `cattle-card-${activeKey}-${check.index}`
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setVisitedStages(v => ({ ...v, [activeKey]: true }));
    setActiveKey(targetKey);
    setFeedbackMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // ── Sequential Next Cattle Button Handler ──
  const handleNextStage = () => {
    if (acknowledgeStep) acknowledgeStep();

    const curStageObj = localizedStages.find(s => s.key === activeKey) || activeStage;
    const check = checkStageValidity(activeKey);

    // 1. Check if cattle details have missing required fields
    if (!check.valid) {
      setMissingModal({
        isOpen: true,
        title: currentLang === 'ta' ? 'விவரங்கள் பூர்த்தி செய்யப்படவில்லை' : currentLang === 'hi' ? 'अधूरा विवरण' : 'Incomplete Cattle Details',
        message: currentLang === 'ta'
          ? `${curStageObj.shortLabel} (${check.label}) - ${check.missingField} தேர்ந்தெடுக்கப்படவில்லை. தயவுசெய்து நிரப்பவும்.`
          : currentLang === 'hi'
            ? `${curStageObj.shortLabel} (${check.label}) के लिए ${check.missingField} दर्ज करें।`
            : `Please select ${check.missingField} for ${check.label} in ${curStageObj.shortLabel}.`,
        stageKey: activeKey,
        isZeroCount: false,
        nextStageKey: null,
        missingElementId: `cattle-card-${activeKey}-${check.index}`
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 2. Check if current stage has 0 cattle entered and user hasn't explicitly answered/confirmed it yet
    if (counts[activeKey] === 0 && !visitedStages[activeKey]) {
      setMissingModal({
        isOpen: true,
        title: currentLang === 'ta' ? `${curStageObj.shortLabel} விவரங்கள் தேவை` : currentLang === 'hi' ? `${curStageObj.shortLabel} विवरण आवश्यक` : `${curStageObj.shortLabel} Count Needed`,
        message: currentLang === 'ta'
          ? `நீங்கள் ${curStageObj.shortLabel} எண்ணிக்கையை உள்ளிடவில்லை. உங்களிடம் இந்த மாடுகள் இருந்தால் எண்ணிக்கையை உள்ளிடவும்; அல்லது '0 மாடுகள் - தொடரவும்' என்பதைத் தொடவும்.`
          : currentLang === 'hi'
            ? `आपने ${curStageObj.shortLabel} की संख्या दर्ज नहीं की है। यदि यह पशु हैं तो संख्या भरें, अन्यथा '0 पशु - आगे बढ़ें' चुनें।`
            : `You have not entered counts for ${curStageObj.shortLabel}. If you have this cattle, enter count and weight; otherwise tap 'Confirm 0 & Continue'.`,
        stageKey: activeKey,
        isZeroCount: true,
        nextStageKey: nextStage ? nextStage.key : null,
        missingElementId: null
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Mark current stage confirmed/visited
    setVisitedStages(prev => ({ ...prev, [activeKey]: true }));

    // Advance to next cattle category if available
    if (nextStage) {
      setActiveKey(nextStage.key);
      setFeedbackMessage('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // On Bulls (last stage) -> check total herd and proceed to Grazing
      handleProceedToGrazing();
    }
  };

  // ── Verification to Proceed to Step 3 (Grazing Management) ──
  const handleProceedToGrazing = () => {
    if (totalCattleCount === 0) {
      setMissingModal({
        isOpen: true,
        title: currentLang === 'ta' ? 'மந்தையில் மாடுகள் இல்லை' : currentLang === 'hi' ? 'झुंड में कोई मवेशी नहीं' : 'No Cattle in Herd',
        message: currentLang === 'ta'
          ? 'மேய்ச்சல் மேலாண்மைக்குச் செல்ல, உங்கள் மந்தையில் குறைந்தது 1 மாட்டையாவது பதிவு செய்ய வேண்டும் (5 பிரிவுகளில் ஏதேனும் ஒன்றில்).'
          : currentLang === 'hi'
            ? 'चराई प्रबंधन पर जाने के लिए कम से कम 1 मवेशी दर्ज करना आवश्यक है।'
            : 'Please enter at least 1 cattle in your herd across the 5 categories before proceeding to Grazing Management.',
        stageKey: 'heifers',
        isZeroCount: false,
        nextStageKey: null,
        missingElementId: null
      });
      setActiveKey('heifers');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Check all 5 stages for validity
    for (const stage of STAGES) {
      const check = checkStageValidity(stage.key);
      if (!check.valid) {
        const stageObj = localizedStages.find(s => s.key === stage.key) || stage;
        setActiveKey(stage.key);
        setMissingModal({
          isOpen: true,
          title: currentLang === 'ta' ? 'விவரங்கள் பூர்த்தி செய்யப்படவில்லை' : 'Incomplete Cattle Details',
          message: currentLang === 'ta'
            ? `${stageObj.shortLabel} (${check.label}) - ${check.missingField} தேர்ந்தெடுக்கப்படவில்லை.`
            : `Please enter ${check.missingField} for ${check.label} in ${stageObj.shortLabel}.`,
          stageKey: stage.key,
          isZeroCount: false,
          nextStageKey: null,
          missingElementId: `cattle-card-${stage.key}-${check.index}`
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setFeedbackMessage('');
    onNext();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Previous Button Handler ──
  const handlePrevStage = () => {
    if (prevStage) {
      setActiveKey(prevStage.key);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onPrev();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // SVG Geometry for Big Cycle
  const cx = 250;
  const cy = 250;
  const R = 155;

  return (
    <div className="wg-card animate-fade-in" style={{ padding: '0', overflow: 'hidden' }}>

      {/* ── MOBILE HEADER (<= 640px) ── */}
      <div className="mobile-cattle-hub-header">
        <div className="mobile-hub-title-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h2 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 900, margin: 0 }}>
              {currentLang === 'ta' ? 'கால்நடை மந்தை மேலாண்மை' : 'Cattle Herd Setup'}
            </h2>
          </div>
          <span className="mobile-hub-count-chip">
            {totalCattleCount} {currentLang === 'ta' ? 'மாடுகள்' : 'Head'}
          </span>
        </div>
      </div>

      {/* ── DESKTOP HEADER (> 640px) ── */}
      <div className="desktop-cattle-hub-header" style={{
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
            <span style={{ fontSize: '0.825rem', color: '#0369a1', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {currentLang === 'ta' ? 'மாடுகள் மந்தை & உற்பத்தி சுழற்சி' : currentLang === 'hi' ? 'मवेशी झुंड एवं उत्पादन चक्र' : 'CATTLE HERD & PRODUCTION CYCLE'}
            </span>
          </div>
          <h2 style={{ fontSize: '1.4rem', color: '#0f172a', fontWeight: 900, margin: '0 0 4px' }}>
            {currentLang === 'ta' ? 'மாடுகள் மந்தை மேலாண்மை' : currentLang === 'hi' ? 'मवेशी झुंड प्रबंधन' : 'Cattle Herd Management'}
          </h2>
          <p style={{ fontSize: '0.825rem', color: '#475569', margin: 0 }}>
            {currentLang === 'ta' 
              ? 'கீழே உள்ள சுழற்சியில் ஒவ்வொரு பருவத்தையும் தொட்டு, மாடுகளின் எண்ணிக்கையை உள்ளிட்டு, உடல் எடை மற்றும் விவரங்களை அமைக்கவும்.' 
              : currentLang === 'hi'
                ? 'नीचे दिए गए चक्र में प्रत्येक अवस्था पर क्लिक करें, संख्या दर्ज करें और शरीर का वजन व विवरण सेट करें।'
                : 'Tap each cattle stage in the cycle below, enter counts, and configure body weight & details on the right.'}
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
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, display: 'block' }}>
              {currentLang === 'ta' ? 'மொத்த மந்தை' : currentLang === 'hi' ? 'कुल झुंड' : 'TOTAL HERD'}
            </span>
            <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>
              {totalCattleCount} {currentLang === 'ta' ? 'மாடுகள்' : currentLang === 'hi' ? 'पशु' : 'animals'}
            </span>
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
              {currentLang === 'ta' ? 'மாடுகள் உற்பத்தி சுழற்சி' : currentLang === 'hi' ? 'मवेशी उत्पादन चक्र' : 'Cattle Production Cycle'}
            </span>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0' }}>
              {currentLang === 'ta' 
                ? 'அமைக்க கீழே உள்ள ஏதேனும் ஒரு பருவத்தைத் தொடுங்கள்' 
                : currentLang === 'hi'
                  ? 'विवरण दर्ज करने के लिए चक्र में किसी भी अवस्था पर क्लिक करें'
                  : 'Click any stage in the cycle below to configure'}
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
                {localizedStages.map(s => {
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
              <text x={cx} y={cy - 16} textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="800" letterSpacing={currentLang === 'ta' || currentLang === 'hi' ? '0' : '1.2'}>
                {currentLang === 'ta' 
                  ? `கேள்வி ${activeStage.questionNum} / 5` 
                  : currentLang === 'hi' 
                    ? `प्रश्न ${activeStage.questionNum} / 5` 
                    : `QUESTION ${activeStage.questionNum} OF 5`}
              </text>
              <text x={cx} y={cy + 14} textAnchor="middle" fill="#0f172a" fontSize="30" fontWeight="900">
                {totalCattleCount}
              </text>
              <text x={cx} y={cy + 30} textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="800" letterSpacing={currentLang === 'ta' || currentLang === 'hi' ? '0' : '1'}>
                {currentLang === 'ta' ? 'மொத்த மந்தை' : currentLang === 'hi' ? 'कुल झुंड' : 'TOTAL HERD'}
              </text>

              {/* Stage Nodes orbiting on the circle */}
              {localizedStages.map(s => {

                const rad = s.angle * Math.PI / 180;
                const nx = cx + R * Math.cos(rad);
                const ny = cy + R * Math.sin(rad);
                const isSelected = activeKey === s.key;
                const count = counts[s.key] || 0;
                const isDone = visitedStages[s.key] || count > 0;

                return (
                  <g
                    key={s.key}
                    onClick={() => handleSwitchStage(s.key)}
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
                    {(() => {
                      const capsuleW = currentLang === 'ta' ? 98 : 84;
                      const capsuleH = 22;
                      const capsuleX = nx - capsuleW / 2;
                      const capsuleY = s.key === 'dry' ? ny - 64 : ny + 48;
                      const textY = s.key === 'dry' ? ny - 49 : ny + 63;
                      return (
                        <>
                          <rect
                            x={capsuleX}
                            y={capsuleY}
                            width={capsuleW}
                            height={capsuleH}
                            rx="11"
                            fill={isSelected ? s.color : '#ffffff'}
                            stroke={isSelected ? s.color : '#cbd5e1'}
                            strokeWidth={isSelected ? '2' : '1.5'}
                            style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.08))' }}
                          />
                          <text
                            x={nx}
                            y={textY}
                            textAnchor="middle"
                            fill={isSelected ? '#ffffff' : '#1e293b'}
                            fontSize={currentLang === 'ta' ? '10' : '11'}
                            fontWeight="800"
                            letterSpacing={currentLang === 'ta' ? '0' : '0.2'}
                          >
                            {s.shortLabel}
                          </text>
                        </>
                      );
                    })()}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Quick Stage Pills / Buttons below Cycle */}
          <div 
            className="cattle-stage-pills-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
              width: '100%',
              marginTop: '4px',
            }}
          >
            {localizedStages.map((s, idx) => {
              const isSelected = activeKey === s.key;
              const count = counts[s.key] || 0;
              const isDone = visitedStages[s.key] || count > 0;
              const isLast = idx === STAGES.length - 1;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => handleSwitchStage(s.key)}
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
                    minWidth: 0,
                    boxSizing: 'border-box',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: isSelected ? s.color : isDone ? '#16a34a' : '#cbd5e1',
                      flexShrink: 0,
                    }} />
                    <span style={{
                      fontSize: '0.82rem',
                      fontWeight: isSelected ? 800 : 600,
                      color: isSelected ? s.color : '#334155',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      Q{s.questionNum}: {s.shortLabel}
                    </span>
                  </div>

                  <span style={{
                    flexShrink: 0,
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: count > 0 ? `${s.color}20` : isDone ? '#dcfce7' : '#f1f5f9',
                    color: count > 0 ? s.color : isDone ? '#15803d' : '#94a3b8',
                  }}>
                    {count > 0 
                      ? `${count} ${currentLang === 'ta' ? 'மாடு' : currentLang === 'hi' ? 'पशु' : 'head'}` 
                      : isDone 
                        ? '✓ 0' 
                        : currentLang === 'ta' 
                          ? 'நிலுவை' 
                          : currentLang === 'hi' 
                            ? 'बाकी' 
                            : 'Pending'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Question-by-Question Active Cattle Flow ── */}
        <div style={{ padding: 'clamp(14px, 2.5vw, 24px)', background: '#ffffff' }} className="cattle-cycle-right-col">

          {/* Modern App Segmented Stage Switcher Bar */}
          <div 
            className="cattle-question-stepper-bar"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '14px',
              padding: '6px 6px',
              background: '#f1f5f9',
              borderRadius: '16px',
              overflowX: 'auto',
              maxWidth: '100%',
              boxSizing: 'border-box',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {localizedStages.map(s => {
              const isCur = activeKey === s.key;
              const count = counts[s.key] || 0;
              const isDone = visitedStages[s.key] || count > 0;

              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => handleSwitchStage(s.key)}
                  className={`cattle-stage-tab-btn ${isCur ? 'active-stage-tab' : ''}`}
                  style={{
                    flex: '1 0 auto',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    border: 'none',
                    background: isCur ? s.color : isDone ? '#ffffff' : 'transparent',
                    color: isCur ? '#ffffff' : isDone ? '#0f172a' : '#64748b',
                    fontSize: '0.8rem',
                    fontWeight: isCur ? 900 : 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isCur ? `0 3px 10px ${s.color}40` : isDone ? '0 1px 3px rgba(0,0,0,0.04)' : 'none',
                  }}
                >
                  <span>{s.shortLabel}</span>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '1px 5px',
                    borderRadius: '8px',
                    background: isCur ? 'rgba(255,255,255,0.28)' : count > 0 ? '#dcfce7' : '#e2e8f0',
                    color: isCur ? '#ffffff' : count > 0 ? '#15803d' : '#64748b',
                    lineHeight: 1.2
                  }}>
                    {count}
                  </span>
                  {isDone && !isCur && count === 0 && (
                    <span style={{ color: '#16a34a', fontSize: '10px', fontWeight: 900 }}>✓</span>
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
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '0.72rem',
                fontWeight: 900,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                {activeStage.label}
              </span>

              {/* Stage Counter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155' }}>
                  {activeStage.label}:
                </span>
                <span style={{
                  fontSize: '1rem',
                  fontWeight: 900,
                  color: activeStage.color,
                  background: '#ffffff',
                  padding: '2px 10px',
                  borderRadius: '12px',
                  border: `1.5px solid ${activeStage.borderLight}`,
                }}>
                  {activeCount} {currentLang === 'ta' ? 'மாடுகள்' : currentLang === 'hi' ? 'पशु' : 'head'}
                </span>
              </div>
            </div>

            <h3 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: 900, margin: '0 0 4px' }}>
              {activeStage.questionTitle}
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#475569', margin: 0 }}>
              {activeStage.questionSub}
            </p>
          </div>

          {/* Pregnancy Category Choice (First-Time vs Repeat vs Both vs None) */}
          {activeKey === 'pregnant' && (
            <div style={{
              background: '#fffbeb',
              border: '1.5px solid #fde68a',
              borderRadius: '14px',
              padding: '14px 16px',
              marginBottom: '16px',
            }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#92400e', marginBottom: '8px' }}>
                {currentLang === 'ta' ? 'சினை வகை தேர்வு:' : currentLang === 'hi' ? 'गर्भावस्था श्रेणी चयन:' : 'Choose Pregnancy Category:'}
              </label>
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
                    {currentLang === 'ta' ? '1-ம் சினை' : currentLang === 'hi' ? 'प्रथम गर्भ (बछिया)' : '1st Pregnancy'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                    {currentLang === 'ta' ? 'முதல் முறை சினை கிடாரிகள்' : currentLang === 'hi' ? 'पहली बार गर्भवती हीफर' : 'Heifers pregnant for 1st time'}
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
                    {currentLang === 'ta' ? 'மறு சினை' : currentLang === 'hi' ? 'पुनः गर्भ (अनुभवी गायें)' : 'Repeat Pregnancy'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                    {currentLang === 'ta' ? 'முன்பே ஈன்ற முதிர்ந்த மாடுகள்' : currentLang === 'hi' ? 'पहले ब्याई परिपक्व गायें' : 'Cows already calved before'}
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
                    {currentLang === 'ta' ? 'இரண்டும் (கலவை)' : currentLang === 'hi' ? 'दोनों (मिश्रित)' : 'Mixed (Both)'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                    {currentLang === 'ta' ? '1-ம் மற்றும் மறு சினை இரண்டும்' : currentLang === 'hi' ? 'पहली बार और पुनः दोनों' : 'Both 1st & repeat pregnant'}
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
                    {currentLang === 'ta' ? 'சினை மாடுகள் இல்லை (0)' : currentLang === 'hi' ? 'कोई गर्भवती नहीं (0)' : 'No Pregnant (0)'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                    {currentLang === 'ta' ? 'பண்ணையில் சினை மாடுகள் இல்லை' : currentLang === 'hi' ? 'फार्म पर कोई गर्भवती पशु नहीं' : 'No pregnant cattle on farm'}
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Lactating Parity Choice (1st vs 2nd+ vs Both vs None) */}
          {activeKey === 'lactating' && (
            <div style={{
              background: '#ecfdf5',
              border: '1.5px solid #a7f3d0',
              borderRadius: '14px',
              padding: '14px 16px',
              marginBottom: '16px',
            }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#047857', marginBottom: '8px' }}>
                {currentLang === 'ta' ? 'கறவை வகை தேர்வு (ஈத்து):' : currentLang === 'hi' ? 'ब्यात / दुग्धपान प्रकार चुनें:' : 'Choose Lactation / Parity Type:'}
              </label>
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
                    {currentLang === 'ta' ? '1-ம் ஈத்து' : currentLang === 'hi' ? 'प्रथम ब्यात (1st Calver)' : '1st Lactation'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                    {currentLang === 'ta' ? 'முதல் ஈத்து மாடுகள்' : currentLang === 'hi' ? 'पहली बार ब्याई गायें' : '1st calvers / primiparous'}
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
                    {currentLang === 'ta' ? '2+ ஈத்துகள்' : currentLang === 'hi' ? '2+ ब्यात (2nd+ Calver)' : '2nd+ Lactation'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                    {currentLang === 'ta' ? '2 அல்லது அதற்கு மேற்பட்ட ஈத்துகள்' : currentLang === 'hi' ? 'दो या अधिक बार ब्याई गायें' : '2+ calvers / multiparous'}
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
                    {currentLang === 'ta' ? 'இரண்டும் (கலவை)' : currentLang === 'hi' ? 'दोनों (मिश्रित झुंड)' : 'Mixed (Both)'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                    {currentLang === 'ta' ? '1-ம் மற்றும் 2+ ஈத்துகள் இரண்டும்' : currentLang === 'hi' ? 'प्रथम और 2+ ब्यात दोनों' : 'Both 1st & 2nd+ in herd'}
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
                    {currentLang === 'ta' ? 'கறவை மாடுகள் இல்லை (0)' : currentLang === 'hi' ? 'कोई दुधारू नहीं (0)' : 'No Milking (0)'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                    {currentLang === 'ta' ? 'பண்ணையில் கறவை மாடுகள் இல்லை' : currentLang === 'hi' ? 'फार्म पर कोई दुधारू गाय नहीं' : 'No milking cows'}
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
              {currentLang === 'ta' 
                ? `1 ${activeStage.shortLabel} சேர்க்க படத்தை அழுத்தவும்` 
                : currentLang === 'hi' 
                  ? `1 ${activeStage.shortLabel} जोड़ने के लिए चित्र पर क्लिक करें` 
                  : `Tap image to add 1 ${activeStage.shortLabel}`}
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
                  {currentLang === 'ta' ? '+ 1-ம் சினை சேர்க்க' : currentLang === 'hi' ? '+ प्रथम गर्भ जोड़ें' : '+ Add 1st-Time'} ({firstTimeCattle.length})
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
                  {currentLang === 'ta' ? '+ மறு சினை சேர்க்க' : currentLang === 'hi' ? '+ पुनः गर्भ जोड़ें' : '+ Add Repeat'} ({repeatCattle.length})
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
                  {currentLang === 'ta' ? '+ 1-ம் ஈத்து சேர்க்க' : currentLang === 'hi' ? '+ प्रथम ब्यात जोड़ें' : '+ Add 1st Lactation'} ({lactatingData.filter(l => l.isFirstLactation || l.lactationType === 'first_lactation' || l.parity === 1).length})
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
                  {currentLang === 'ta' ? '+ 2+ ஈத்துகள் சேர்க்க' : currentLang === 'hi' ? '+ 2+ ब्यात जोड़ें' : '+ Add 2nd+ Lactation'} ({lactatingData.filter(l => !(l.isFirstLactation || l.lactationType === 'first_lactation' || l.parity === 1)).length})
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
                {currentLang === 'ta' ? 'விரைவு:' : currentLang === 'hi' ? 'त्वरित:' : 'Quick:'}
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
                    {qty === 0 
                      ? (currentLang === 'ta' ? '0 (இல்லை)' : currentLang === 'hi' ? '0 (कोई नहीं)' : '0 (None)') 
                      : qty}
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
                  {currentLang === 'ta' ? 'அனைத்தையும் நீக்கு' : currentLang === 'hi' ? 'सभी हटाएं' : 'Clear all'}
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
                {currentLang === 'ta' 
                  ? `${activeStage.label} உங்கள் பண்ணையில் இல்லையா?` 
                  : currentLang === 'hi'
                    ? `क्या आपके फार्म पर कोई ${activeStage.label} नहीं है?`
                    : `No ${activeStage.label} on your farm?`}
              </p>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 14px' }}>
                {currentLang === 'ta'
                  ? 'பரவாயில்லை! நீங்கள் சுழற்சியில் அடுத்த மாட்டு நிலைக்குச் செல்லலாம், அல்லது சேர்க்க மேலே உள்ள படத்தைத் தட்டலாம்.'
                  : currentLang === 'hi'
                    ? 'कोई बात नहीं! आप चक्र में अगले मवेशी चरण पर आगे बढ़ सकते हैं, या जोड़ने के लिए ऊपर दिए गए चित्र पर टैप कर सकते हैं।'
                    : "That's completely fine! You can proceed to the next cattle stage in the cycle, or tap the cartoon avatar above to add."}
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
                  <span>
                    {currentLang === 'ta'
                      ? `0 என உறுதிசெய்து கேள்வி ${activeStage.questionNum + 1}-க்குச் செல்க: ${activeStage.nextLabel}`
                      : currentLang === 'hi'
                        ? `0 की पुष्टि करें और प्रश्न ${activeStage.questionNum + 1} पर जाएं: ${activeStage.nextLabel}`
                        : `Confirm 0 & Go to Question ${activeStage.questionNum + 1}: ${activeStage.nextLabel}`}
                  </span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setVisitedStages(v => ({ ...v, [activeKey]: true }));
                    setFeedbackMessage('');
                    handleProceedToGrazing();
                  }}
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>
                    {currentLang === 'ta'
                      ? '0 என உறுதிசெய்து மந்தை அமைப்பை முடிக்கவும்'
                      : currentLang === 'hi'
                        ? '0 की पुष्टि करें और मवेशी सेटअप पूरा करें'
                        : 'Confirm 0 & Finish Herd Setup'}
                  </span>
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
                  {currentLang === 'ta'
                    ? `ஒவ்வொரு ${activeStage.shortLabel}-க்கும் விவரங்களை உள்ளிடவும் (${activeCount})`
                    : currentLang === 'hi'
                      ? `प्रत्येक ${activeStage.shortLabel} के लिए विवरण दर्ज करें (${activeCount})`
                      : `ENTER DATA FOR EACH ${activeStage.shortLabel.toUpperCase()} (${activeCount})`}
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
                    title={currentLang === 'ta' ? '#1 விவரங்களை அனைவருக்கும் நகலெடு' : currentLang === 'hi' ? '#1 का विवरण सभी में कॉपी करें' : 'Copy details from #1 to all'}
                  >
                    <Copy size={12} />
                    {currentLang === 'ta'
                      ? `#1-ன் விவரங்களை அனைவருக்கும் நகலெடு (${activeStage.shortLabel})`
                      : currentLang === 'hi'
                        ? `#1 का विवरण सभी ${activeStage.shortLabel} में कॉपी करें`
                        : `Copy #1 to all ${activeStage.shortLabel}s`}
                  </button>
                )}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
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
                                {currentLang === 'ta' ? `கிடாரி #${i + 1}` : currentLang === 'hi' ? `बछिया #${i + 1}` : `Heifer #${i + 1}`}
                              </span>
                              {hasWeight ? (
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '1px 6px', borderRadius: '6px' }}>
                                  {currentLang === 'ta' ? 'தயார்' : currentLang === 'hi' ? 'तैयार' : 'Ready'}
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#dc2626', background: '#fee2e2', padding: '1px 6px', borderRadius: '6px' }}>
                                  {currentLang === 'ta' ? 'எடை தேர்வு செய்க' : currentLang === 'hi' ? 'वजन चुनें' : 'Select Weight'}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.70rem', color: hasWeight ? '#64748b' : '#dc2626', fontWeight: 600 }}>
                              {hasWeight 
                                ? `${h.weight} kg${h.ageMonths ? ` • ${h.ageMonths} ${currentLang === 'ta' ? 'மாதங்கள்' : currentLang === 'hi' ? 'माह' : 'months'}` : ''}` 
                                : (currentLang === 'ta' ? 'உடல் எடை தேவை' : currentLang === 'hi' ? 'शारीरिक वजन आवश्यक' : 'Body weight required')}
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
                          title={currentLang === 'ta' ? 'கிடாரியை நீக்கு' : currentLang === 'hi' ? 'बछिया हटाएं' : 'Remove Heifer'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <WeightChipSelect
                        value={h.weight}
                        onChange={val => updateHeifer(i, 'weight', val)}
                        ranges={HEIFER_WEIGHT_RANGES}
                        label={currentLang === 'ta' ? 'உடல் எடை' : currentLang === 'hi' ? 'शारीरिक वजन' : 'Body Weight'}
                        accentColor={activeStage.color}
                        currentLang={currentLang}
                      />

                      {/* Age in Months Chips */}
                      <div style={{ marginTop: '7px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#334155' }}>
                            {currentLang === 'ta' ? 'வயது (12+ மாதங்கள்):' : currentLang === 'hi' ? 'उम्र (12+ माह):' : 'Age (12+ Months):'}
                          </label>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: h.ageMonths ? activeStage.color : '#dc2626' }}>
                            {h.ageMonths ? `${h.ageMonths} ${currentLang === 'ta' ? 'மாதங்கள்' : currentLang === 'hi' ? 'माह' : 'months'}` : (currentLang === 'ta' ? 'தேர்வு செய்க' : currentLang === 'hi' ? 'उम्र चुनें' : 'Select Age')}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {HEIFER_AGE_CHIPS.map(age => {
                            const isSel = h.ageMonths !== '' && h.ageMonths !== undefined && Number(h.ageMonths) === age;
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
                  const hasPregDays = Boolean(p.pregDays !== '' && p.pregDays !== undefined && Number(p.pregDays) > 0);
                  const isValid = hasWeight && hasPregDays;
                  const isRepeat = p.category === 'repeat';
                  return (
                    <div
                      key={p.id || i}
                      id={`cattle-card-pregnant-${i}`}
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
                              alt={`Pregnant Cattle #${i + 1}`}
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
                                {isRepeat 
                                  ? (currentLang === 'ta' ? `மறு சினை மாடு #${i + 1}` : currentLang === 'hi' ? `पुनः गर्भवती गाय #${i + 1}` : `Repeat Cow #${i + 1}`) 
                                  : (currentLang === 'ta' ? `1-ம் சினை கிடாரி #${i + 1}` : currentLang === 'hi' ? `पहली बार गर्भवती बछिया #${i + 1}` : `1st Time Heifer #${i + 1}`)}
                              </span>
                              {isValid ? (
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '1px 6px', borderRadius: '6px' }}>
                                  {currentLang === 'ta' ? 'தயார்' : currentLang === 'hi' ? 'तैयार' : 'Ready'}
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#dc2626', background: '#fee2e2', padding: '1px 6px', borderRadius: '6px' }}>
                                  {!hasWeight 
                                    ? (currentLang === 'ta' ? 'எடை தேர்வு செய்க' : currentLang === 'hi' ? 'वजन चुनें' : 'Select Weight') 
                                    : (currentLang === 'ta' ? 'நாட்கள் தேர்வு செய்க' : currentLang === 'hi' ? 'दिन चुनें' : 'Select Days')}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.70rem', color: isValid ? '#64748b' : '#dc2626', fontWeight: 600 }}>
                              {isValid 
                                ? `${p.weight} kg • ${p.pregDays} ${currentLang === 'ta' ? 'நாட்கள் சினை' : currentLang === 'hi' ? 'दिन का गर्भ' : 'days pregnant'}` 
                                : (hasWeight 
                                  ? `${p.weight} kg • ${currentLang === 'ta' ? 'சினை நாட்களைத் தேர்வு செய்க' : currentLang === 'hi' ? 'गर्भ के दिन चुनें' : 'Select pregnant days'}` 
                                  : (hasPregDays 
                                    ? `${p.pregDays} ${currentLang === 'ta' ? 'நாட்கள் சினை • எடை தேர்வு செய்க' : currentLang === 'hi' ? 'दिन का गर्भ • वजन चुनें' : 'days pregnant • Select weight'}` 
                                    : (currentLang === 'ta' ? 'எடை மற்றும் சினை நாட்கள் தேவை' : currentLang === 'hi' ? 'वजन और गर्भ के दिन आवश्यक' : 'Body weight & days required')))}
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
                          title={currentLang === 'ta' ? 'சினை மாட்டை நீக்கு' : currentLang === 'hi' ? 'गर्भवती पशु हटाएं' : 'Remove Pregnant Cattle'}
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
                          {currentLang === 'ta' ? 'மறு சினை' : currentLang === 'hi' ? 'पुनः गर्भ' : 'Repeat Pregnant'}
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
                          {currentLang === 'ta' ? '1-ம் சினை (கிடாரி)' : currentLang === 'hi' ? 'पहली बार (बछिया)' : '1st Time (Heifer)'}
                        </button>
                      </div>

                      <WeightChipSelect
                        value={p.weight}
                        onChange={val => updatePregnant(i, 'weight', val)}
                        ranges={COW_WEIGHT_RANGES}
                        label={currentLang === 'ta' ? 'உடல் எடை' : currentLang === 'hi' ? 'शारीरिक वजन' : 'Body Weight'}
                        accentColor={activeStage.color}
                        currentLang={currentLang}
                      />

                      {/* Days Pregnant Chips */}
                      <div style={{ marginTop: '7px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#334155' }}>
                            {currentLang === 'ta' ? 'சினை நாட்கள்:' : currentLang === 'hi' ? 'गर्भ के दिन:' : 'Days Pregnant:'}
                          </label>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: p.pregDays ? activeStage.color : '#dc2626' }}>
                            {p.pregDays ? `${p.pregDays} ${currentLang === 'ta' ? 'நாட்கள்' : currentLang === 'hi' ? 'दिन' : 'days'}` : (currentLang === 'ta' ? 'தேர்வு செய்க' : currentLang === 'hi' ? 'दिन चुनें' : 'Select Days')}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {PREG_DAYS_CHIPS.map(days => {
                            const isSel = p.pregDays !== '' && p.pregDays !== undefined && Number(p.pregDays) === days;
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
                  const curBcs = l.bcs !== undefined && l.bcs !== '' ? Number(l.bcs) : '';
                  const curStage = l.stage ? String(l.stage).toLowerCase() : '';

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
                                {currentLang === 'ta' ? `கறவை மாடு #${i + 1}` : currentLang === 'hi' ? `दुधारू गाय #${i + 1}` : `Milking Cow #${i + 1}`}
                              </span>
                              {isValid ? (
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '1px 6px', borderRadius: '6px' }}>
                                  {currentLang === 'ta' ? 'தயார்' : currentLang === 'hi' ? 'तैयार' : 'Ready'}
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#dc2626', background: '#fee2e2', padding: '1px 6px', borderRadius: '6px' }}>
                                  {!hasWeight 
                                    ? (currentLang === 'ta' ? 'எடை தேர்வு செய்க' : currentLang === 'hi' ? 'वजन चुनें' : 'Select Weight') 
                                    : !hasMilkYield 
                                      ? (currentLang === 'ta' ? 'பால் அளவு தேர்வு செய்க' : currentLang === 'hi' ? 'दूध मात्रा चुनें' : 'Select Milk Yield') 
                                      : (currentLang === 'ta' ? 'கொழுப்பு % தேர்வு செய்க' : currentLang === 'hi' ? 'फैट % चुनें' : 'Select Milk Fat')}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.70rem', color: isValid ? '#64748b' : '#dc2626', fontWeight: 600 }}>
                              {hasWeight ? `${l.weight} kg` : (currentLang === 'ta' ? 'எடை தேவை' : currentLang === 'hi' ? 'वजन आवश्यक' : 'Weight required')} • {hasMilkYield ? `${l.milkYield} ${currentLang === 'ta' ? 'லி/நாள்' : currentLang === 'hi' ? 'ली/दिन' : 'L/d'}` : (currentLang === 'ta' ? 'பால் அளவு தேவை' : currentLang === 'hi' ? 'दूध मात्रा आवश्यक' : 'Milk yield required')} • {hasMilkFat ? `${l.milkFat}% ${currentLang === 'ta' ? 'கொழுப்பு' : currentLang === 'hi' ? 'फैट' : 'Fat'}` : (currentLang === 'ta' ? 'கொழுப்பு % தேவை' : currentLang === 'hi' ? 'फैट % आवश्यक' : 'Fat % required')}
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
                          title={currentLang === 'ta' ? 'கறவை மாட்டை நீக்கு' : currentLang === 'hi' ? 'दुधारू गाय हटाएं' : 'Remove Milking Cow'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* 1st Lactation vs 2nd+ Lactation Toggle */}
                      <div style={{ marginBottom: '7px' }}>
                        <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', marginBottom: '3px' }}>
                          {currentLang === 'ta' ? 'கறவை ஈத்து வகை:' : currentLang === 'hi' ? 'ब्यात प्रकार:' : 'Lactation Number / Calver:'}
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
                            <span>{currentLang === 'ta' ? '1-ம் ஈத்து' : currentLang === 'hi' ? 'प्रथम ब्यात' : '1st Lactation'}</span>
                            <span style={{ fontSize: '0.64rem', opacity: 0.8 }}>({currentLang === 'ta' ? 'முதல் ஈத்து' : currentLang === 'hi' ? 'प्रथम ब्यात' : '1st Calver'})</span>
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
                            <span>{currentLang === 'ta' ? '2+ ஈத்துகள்' : currentLang === 'hi' ? '2+ ब्यात' : '2nd+ Lactation'}</span>
                            <span style={{ fontSize: '0.64rem', opacity: 0.8 }}>({currentLang === 'ta' ? 'மறு ஈத்து' : currentLang === 'hi' ? 'पुनः ब्यात' : '2+ Calver'})</span>
                          </button>
                        </div>
                      </div>

                      <WeightChipSelect
                        value={l.weight}
                        onChange={val => updateLactating(i, 'weight', val)}
                        ranges={COW_WEIGHT_RANGES}
                        label={currentLang === 'ta' ? 'உடல் எடை' : currentLang === 'hi' ? 'शारीरिक वजन' : 'Body Weight'}
                        accentColor={activeStage.color}
                        currentLang={currentLang}
                      />

                      {/* Daily Milk Yield */}
                      <div style={{ marginTop: '7px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#334155' }}>
                            {currentLang === 'ta' ? 'தினசரி பால் அளவு (லி/நாள்):' : currentLang === 'hi' ? 'दैनिक दूध उत्पादन (लीटर/दिन):' : 'Daily Milk Yield (L/day):'}
                          </label>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: hasMilkYield ? activeStage.color : '#dc2626' }}>
                            {hasMilkYield ? `${l.milkYield} ${currentLang === 'ta' ? 'லிட்டர்/நாள்' : currentLang === 'hi' ? 'लीटर/दिन' : 'Litres/day'}` : (currentLang === 'ta' ? 'தேர்வு செய்க' : currentLang === 'hi' ? 'दूध चुनें' : 'Select Milk Yield')}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {MILK_YIELD_CHIPS.map(yieldVal => {
                            const isSel = l.milkYield !== '' && l.milkYield !== undefined && Number(l.milkYield) === yieldVal;
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
                                {yieldVal} L/d
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Milk Fat % */}
                      <div style={{ marginTop: '7px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#334155' }}>
                            {currentLang === 'ta' ? 'பால் கொழுப்பு சதவீதம் (%):' : currentLang === 'hi' ? 'दूध फैट प्रतिशत (%):' : 'Milk Fat Percentage (%):'}
                          </label>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: hasMilkFat ? activeStage.color : '#dc2626' }}>
                            {hasMilkFat ? `${l.milkFat}% ${currentLang === 'ta' ? 'கொழுப்பு' : currentLang === 'hi' ? 'फैट' : 'Fat'}` : (currentLang === 'ta' ? 'தேர்வு செய்க' : currentLang === 'hi' ? 'फैट चुनें' : 'Select Fat %')}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {MILK_FAT_CHIPS.map(fatVal => {
                            const isSel = l.milkFat !== '' && l.milkFat !== undefined && Number(l.milkFat) === fatVal;
                            return (
                              <button
                                key={fatVal}
                                type="button"
                                onClick={() => updateLactating(i, 'milkFat', fatVal)}
                                style={{
                                  padding: '3px 8px', borderRadius: '10px',
                                  border: `1.5px solid ${isSel ? activeStage.color : '#e2e8f0'}`,
                                  background: isSel ? activeStage.color : '#ffffff',
                                  color: isSel ? '#ffffff' : '#475569',
                                  fontSize: '0.72rem', fontWeight: isSel ? 800 : 600, cursor: 'pointer',
                                }}
                              >
                                {fatVal}%
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
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: curBcs !== '' ? activeStage.color : '#dc2626' }}>
                            {curBcs !== '' ? `BCS ${curBcs}` : (currentLang === 'ta' ? 'தேர்வு செய்க' : currentLang === 'hi' ? 'BCS चुनें' : 'Select BCS')}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {BCS_OPTIONS.map(opt => {
                            const isSel = curBcs !== '' && Math.abs(Number(curBcs) - opt.val) < 0.1;
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
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: curStage ? activeStage.color : '#dc2626' }}>
                            {curStage ? (curStage === 'early' ? 'Early (<100d)' : curStage === 'late' ? 'Late (>200d)' : 'Mid (100–200d)') : (currentLang === 'ta' ? 'தேர்வு செய்க' : 'Select Stage')}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {LACTATION_STAGE_CHIPS.map(chip => {
                            const isSel = Boolean(curStage && curStage === chip.val);
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
                  const hasDryDays = Boolean(d.dryDays !== '' && d.dryDays !== undefined && Number(d.dryDays) > 0);
                  const isValid = hasWeight && hasDryDays;

                  return (
                    <div
                      key={d.id || i}
                      id={`cattle-card-dry-${i}`}
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
                              alt={`Dry Cow #${i + 1}`}
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
                                {currentLang === 'ta' ? `வற்றிய மாடு #${i + 1}` : currentLang === 'hi' ? `सूखी गाय #${i + 1}` : `Dry Cow #${i + 1}`}
                              </span>
                              {isValid ? (
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '1px 6px', borderRadius: '6px' }}>
                                  {currentLang === 'ta' ? 'தயார்' : currentLang === 'hi' ? 'तैयार' : 'Ready'}
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#dc2626', background: '#fee2e2', padding: '1px 6px', borderRadius: '6px' }}>
                                  {!hasWeight 
                                    ? (currentLang === 'ta' ? 'எடை தேர்வு செய்க' : currentLang === 'hi' ? 'वजन चुनें' : 'Select Weight') 
                                    : (currentLang === 'ta' ? 'நாட்கள் தேர்வு செய்க' : currentLang === 'hi' ? 'दिन चुनें' : 'Select Days')}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.70rem', color: isValid ? '#64748b' : '#dc2626', fontWeight: 600 }}>
                              {isValid 
                                ? `${d.weight} kg • ${d.dryDays} ${currentLang === 'ta' ? 'நாட்கள் வற்றியது' : currentLang === 'hi' ? 'दिन सूखी' : 'days dry'}` 
                                : (hasWeight 
                                  ? `${d.weight} kg • ${currentLang === 'ta' ? 'வற்றிய நாட்களைத் தேர்வு செய்க' : currentLang === 'hi' ? 'सूखे दिन चुनें' : 'Select dry days'}` 
                                  : (hasDryDays 
                                    ? `${d.dryDays} ${currentLang === 'ta' ? 'நாட்கள் வற்றியது • எடை தேர்வு செய்க' : currentLang === 'hi' ? 'दिन सूखी • वजन चुनें' : 'days dry • Select weight'}` 
                                    : (currentLang === 'ta' ? 'எடை மற்றும் வற்றிய நாட்கள் தேவை' : currentLang === 'hi' ? 'वजन और सूखे दिन आवश्यक' : 'Body weight & days required')))}
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
                          title={currentLang === 'ta' ? 'வற்றிய மாட்டை நீக்கு' : currentLang === 'hi' ? 'सूखी गाय हटाएं' : 'Remove Dry Cow'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <WeightChipSelect
                        value={d.weight}
                        onChange={val => updateDryCow(i, 'weight', val)}
                        ranges={COW_WEIGHT_RANGES}
                        label={currentLang === 'ta' ? 'உடல் எடை' : currentLang === 'hi' ? 'शारीरिक वजन' : 'Body Weight'}
                        accentColor={activeStage.color}
                        currentLang={currentLang}
                      />

                      {/* Dry Period Duration */}
                      <div style={{ marginTop: '7px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#334155' }}>
                            {currentLang === 'ta' ? 'வற்றிய நாட்கள்:' : currentLang === 'hi' ? 'सूखे काल की अवधि:' : 'Dry Period Duration:'}
                          </label>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: hasDryDays ? activeStage.color : '#dc2626' }}>
                            {hasDryDays ? `${d.dryDays} ${currentLang === 'ta' ? 'நாட்கள்' : currentLang === 'hi' ? 'दिन' : 'days'}` : (currentLang === 'ta' ? 'தேர்வு செய்க' : currentLang === 'hi' ? 'दिन चुनें' : 'Select Days')}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {DRY_PERIOD_CHIPS.map(chip => {
                            const isSel = hasDryDays && Number(d.dryDays) === chip.avg;
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
                  const hasPurpose = Boolean(b.purpose && b.purpose !== '');
                  const isValid = hasWeight && hasPurpose;
                  return (
                    <div
                      key={b.id || i}
                      id={`cattle-card-bulls-${i}`}
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
                              alt={`Bull #${i + 1}`}
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
                                {currentLang === 'ta' ? `காளை #${i + 1}` : currentLang === 'hi' ? `सांड / बैल #${i + 1}` : `Bull #${i + 1}`}
                              </span>
                              {isValid ? (
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '1px 6px', borderRadius: '6px' }}>
                                  {currentLang === 'ta' ? 'தயார்' : currentLang === 'hi' ? 'तैयार' : 'Ready'}
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#dc2626', background: '#fee2e2', padding: '1px 6px', borderRadius: '6px' }}>
                                  {!hasWeight 
                                    ? (currentLang === 'ta' ? 'எடை தேர்வு செய்க' : currentLang === 'hi' ? 'वजन चुनें' : 'Select Weight') 
                                    : (currentLang === 'ta' ? 'பயன்பாடு தேர்வு செய்க' : currentLang === 'hi' ? 'उद्देश्य चुनें' : 'Select Purpose')}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.70rem', color: isValid ? '#64748b' : '#dc2626', fontWeight: 600 }}>
                              {isValid 
                                ? `${b.weight} kg • ${b.purpose === 'Breeding Bull' ? (currentLang === 'ta' ? 'இனப்பெருக்கக் காளை' : currentLang === 'hi' ? 'प्रजनन सांड' : 'Breeding Bull') : (currentLang === 'ta' ? 'உழவு / வேலைக் காளை' : currentLang === 'hi' ? 'कामकाजी बैल' : 'Draft / Working')}` 
                                : (hasWeight 
                                  ? `${b.weight} kg • ${currentLang === 'ta' ? 'பயன்பாடு தேர்வு செய்க' : currentLang === 'hi' ? 'उद्देश्य चुनें' : 'Select purpose'}` 
                                  : (hasPurpose 
                                    ? `${b.purpose === 'Breeding Bull' ? (currentLang === 'ta' ? 'இனப்பெருக்கக் காளை' : currentLang === 'hi' ? 'प्रजनन सांड' : 'Breeding Bull') : (currentLang === 'ta' ? 'உழவு / வேலைக் காளை' : currentLang === 'hi' ? 'कामकाजी बैल' : 'Draft / Working')} • ${currentLang === 'ta' ? 'எடை தேர்வு செய்க' : currentLang === 'hi' ? 'वजन चुनें' : 'Select weight'}` 
                                    : (currentLang === 'ta' ? 'எடை மற்றும் பயன்பாடு தேவை' : currentLang === 'hi' ? 'वजन और उद्देश्य आवश्यक' : 'Body weight & purpose required')))}
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
                          title={currentLang === 'ta' ? 'காளையை நீக்கு' : currentLang === 'hi' ? 'सांड / बैल हटाएं' : 'Remove Bull'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <WeightChipSelect
                        value={b.weight}
                        onChange={val => updateBull(i, 'weight', val)}
                        ranges={BULL_WEIGHT_RANGES}
                        label={currentLang === 'ta' ? 'உடல் எடை' : currentLang === 'hi' ? 'शारीरिक वजन' : 'Body Weight'}
                        accentColor={activeStage.color}
                        currentLang={currentLang}
                      />

                      {/* Bull Purpose / Activity */}
                      <div style={{ marginTop: '7px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#334155' }}>
                            {currentLang === 'ta' ? 'காளை பயன்பாடு / வேலை:' : currentLang === 'hi' ? 'सांड / बैल का उपयोग:' : 'Bull Purpose / Activity:'}
                          </label>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: hasPurpose ? activeStage.color : '#dc2626' }}>
                            {hasPurpose ? (b.purpose === 'Breeding Bull' ? (currentLang === 'ta' ? 'இனப்பெருக்கக் காளை' : currentLang === 'hi' ? 'प्रजनन सांड' : 'Breeding Bull') : (currentLang === 'ta' ? 'உழவு / வேலைக் காளை' : currentLang === 'hi' ? 'कामकाजी बैल' : 'Draft / Working')) : (currentLang === 'ta' ? 'தேர்வு செய்க' : currentLang === 'hi' ? 'कार्य चुनें' : 'Select Purpose')}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {BULL_PURPOSE_CHIPS.map(purp => {
                            const isSel = hasPurpose && b.purpose === purp;
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
                                {purp === 'Breeding Bull' 
                                  ? (currentLang === 'ta' ? 'இனப்பெருக்கக் காளை' : currentLang === 'hi' ? 'प्रजनन सांड' : 'Breeding Bull') 
                                  : (currentLang === 'ta' ? 'உழவு / வேலைக் காளை' : currentLang === 'hi' ? 'कामकाजी बैल' : 'Draft / Working')}
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
                  setFeedbackMessage(`Please select ${check.missingField} for ${check.label} before proceeding to the next question.`);
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
              <span>
                {currentLang === 'ta'
                  ? `கேள்வி ${activeStage.questionNum} (${activeStage.shortLabel}) முடிந்தது — கேள்வி ${activeStage.questionNum + 1}-க்குச் செல்லவும்: ${activeStage.nextLabel}`
                  : currentLang === 'hi'
                    ? `प्रश्न ${activeStage.questionNum} (${activeStage.shortLabel}) पूरा हुआ — प्रश्न ${activeStage.questionNum + 1} पर जाएं: ${activeStage.nextLabel}`
                    : `Done with Q${activeStage.questionNum} (${activeStage.shortLabel}) — Go to Q${activeStage.questionNum + 1}: ${activeStage.nextLabel}`}
              </span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleProceedToGrazing}
              className="btn-primary"
              style={{ width: '100%', padding: '14px 20px', fontSize: '0.92rem', justifyContent: 'center' }}
            >
              <span>
                {currentLang === 'ta'
                  ? 'அனைத்து 5 கேள்விகளும் பூர்த்தி செய்யப்பட்டன — படி 3-க்குச் செல்லவும் (மேய்ச்சல்)'
                  : currentLang === 'hi'
                    ? 'सभी 5 प्रश्न पूरे हुए — चरण 3 (चराई प्रबंधन) पर जाएं'
                    : 'All 5 Questions Answered — Proceed to Step 3 (Grazing)'}
              </span>
              <ArrowRight size={16} />
            </button>
          )}

        </div>
      </div>

      {/* ── Bottom Step Navigation ── */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1.5px solid #e2e8f0',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Herd questions status chips bar */}
        <div 
          className="horizontal-scroll"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            overflowX: 'auto',
            paddingBottom: '4px',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, whiteSpace: 'nowrap' }}>
            {currentLang === 'ta' ? 'மந்தைக் கேள்விகள்:' : currentLang === 'hi' ? 'मवेशी प्रश्न:' : 'Herd Questions:'}
          </span>
          {localizedStages.map(s => {
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
              icon = isInvalid ? '!' : hasCattle ? '✓' : '●';
            } else if (isInvalid) {
              badgeBg = '#fee2e2';
              badgeColor = '#dc2626';
              badgeBorder = '#fca5a5';
              icon = '!';
            } else if (isDone) {
              badgeBg = '#dcfce7';
              badgeColor = '#15803d';
              badgeBorder = '#86efac';
              icon = '✓';
            }

            const headUnit = currentLang === 'ta' ? 'மாடு' : currentLang === 'hi' ? 'पशु' : 'head';

            return (
              <span
                key={s.key}
                onClick={() => handleSwitchStage(s.key)}
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
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  flexShrink: 0
                }}
                title={`Q${s.questionNum}: ${s.shortLabel} (${counts[s.key]} ${headUnit})`}
              >
                {icon} Q{s.questionNum}: {s.shortLabel} ({counts[s.key]})
              </span>
            );
          })}
        </div>

        {/* Buttons Row */}
        <div className="responsive-nav-actions">
          <button type="button" onClick={handlePrevStage} className="btn-secondary">
            <ChevronLeft size={18} />
            <span>
              {prevStage ? (
                currentLang === 'ta' 
                  ? `முந்தையது (${localizedPrevStage?.shortLabel || prevStage.shortLabel})` 
                  : currentLang === 'hi'
                    ? `पिछला (${localizedPrevStage?.shortLabel || prevStage.shortLabel})`
                    : `Previous (${localizedPrevStage?.shortLabel || prevStage.shortLabel})`
              ) : (
                currentLang === 'ta' 
                  ? 'முந்தைய படி (இனம்)' 
                  : currentLang === 'hi'
                    ? 'पिछला चरण (नस्ल)'
                    : 'Previous (Breed)'
              )}
            </span>
          </button>

          <button
            type="button"
            onClick={handleNextStage}
            className="btn-primary"
          >
            <span>
              {nextStage ? (
                currentLang === 'ta' 
                  ? `அடுத்தது: ${localizedNextStage?.shortLabel || nextStage.shortLabel} →` 
                  : currentLang === 'hi'
                    ? `अगला: ${localizedNextStage?.shortLabel || nextStage.shortLabel} →`
                    : `Next: ${localizedNextStage?.shortLabel || nextStage.shortLabel} →`
              ) : (
                currentLang === 'ta' 
                  ? 'அடுத்த படி: மேய்ச்சல் மேலாண்மை →' 
                  : currentLang === 'hi'
                    ? 'अगला चरण: चराई प्रबंधन →'
                    : 'Next Step: Grazing Management →'
              )}
            </span>
            <ChevronRight size={18} />
          </button>
        </div>

      </div>

      {/* ── CATTLE DETAILS REQUIRED / INCOMPLETE DATA POPUP MODAL ── */}
      {missingModal.isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 9999
        }}>
          <div 
            className="wg-card animate-fade-in" 
            style={{ 
              maxWidth: '460px', 
              width: '100%', 
              padding: '24px', 
              position: 'relative', 
              borderRadius: '20px',
              border: '1.5px solid #fed7aa',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <button 
              type="button"
              onClick={() => setMissingModal({ isOpen: false })}
              style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
              <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '14px', border: '1.5px solid #fde68a', flexShrink: 0 }}>
                <AlertCircle size={26} color="#d97706" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 900, margin: '0 0 4px' }}>
                  {missingModal.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  {missingModal.message}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '18px' }}>
              <button
                type="button"
                onClick={() => {
                  const elId = missingModal.missingElementId;
                  setMissingModal({ isOpen: false });
                  if (elId) {
                    setTimeout(() => {
                      const el = document.getElementById(elId);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 120);
                  }
                }}
                className="btn-primary"
                style={{ width: '100%', padding: '11px', justifyContent: 'center', fontSize: '0.9rem' }}
              >
                <span>
                  {currentLang === 'ta' ? 'விவரங்களை உள்ளிடவும்' : currentLang === 'hi' ? 'विवरण भरें' : 'Fill Cattle Details'}
                </span>
                <ChevronRight size={18} />
              </button>

              {missingModal.isZeroCount && (
                <button
                  type="button"
                  onClick={() => {
                    const targetKey = missingModal.stageKey || activeKey;
                    setVisitedStages(prev => ({ ...prev, [targetKey]: true }));
                    const nxt = missingModal.nextStageKey;
                    setMissingModal({ isOpen: false });
                    if (nxt) {
                      setActiveKey(nxt);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      handleProceedToGrazing();
                    }
                  }}
                  className="btn-secondary"
                  style={{ width: '100%', padding: '10px', justifyContent: 'center', fontSize: '0.84rem' }}
                >
                  <Check size={16} color="#16a34a" />
                  <span>
                    {currentLang === 'ta' 
                      ? '0 மாடுகள் - தொடரவும் (Skip / 0 Head)' 
                      : currentLang === 'hi' 
                        ? '0 पशु - आगे बढ़ें' 
                        : 'Confirm 0 & Continue'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
