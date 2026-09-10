// Predefined Animal Weight and Production Ranges (Mid-Point / Average Used for Precision Calculations)

export const COW_WEIGHT_RANGES = [
  { label: 'Select Weight Range...', value: '', avg: '' },
  { label: '< 250 kg (Very Light / Dwarf Breeds like Vechur)', value: '<250', avg: 225 },
  { label: '250 – 300 kg (Light Indigenous Cow)', value: '250-300', avg: 275 },
  { label: '300 – 350 kg (Small Breeds like Umblachery / Hallikar)', value: '300-350', avg: 325 },
  { label: '350 – 400 kg (Medium Breeds like Kangayam / Bargur)', value: '350-400', avg: 375 },
  { label: '400 – 450 kg (Medium-Large like Rathi / Red Sindhi / Tharparkar)', value: '400-450', avg: 425 },
  { label: '450 – 500 kg (Large Indigenous like Gir / Sahiwal / Hariana)', value: '450-500', avg: 475 },
  { label: '500 – 550 kg (Crossbred Dairy Cows / Kankrej / Murrah)', value: '500-550', avg: 525 },
  { label: '550 – 600 kg (Heavy Crossbred / Jersey Cross)', value: '550-600', avg: 575 },
  { label: '600 – 650 kg (Large Exotic Dairy like HF)', value: '600-650', avg: 625 },
  { label: '> 650 kg (Very Heavy Mature Cows)', value: '>650', avg: 675 },
  { label: '✏️ Enter Exact Weight Manually...', value: 'custom', avg: '' }
];

export const HEIFER_WEIGHT_RANGES = [
  { label: 'Select Weight Range...', value: '', avg: '' },
  { label: '< 150 kg (Young Calf / Early Heifer)', value: '<150', avg: 125 },
  { label: '150 – 200 kg (Growing Heifer 6–10 months)', value: '150-200', avg: 175 },
  { label: '200 – 250 kg (Growing Heifer 10–14 months)', value: '200-250', avg: 225 },
  { label: '250 – 300 kg (Breeding Age Heifer 14–18 months)', value: '250-300', avg: 275 },
  { label: '300 – 350 kg (Near Mature / Ready to Breed)', value: '300-350', avg: 325 },
  { label: '350 – 400 kg (Heavy / Well Grown Heifer)', value: '350-400', avg: 375 },
  { label: '> 400 kg (Mature Exotic / HF Heifer)', value: '>400', avg: 425 },
  { label: '✏️ Enter Exact Weight Manually...', value: 'custom', avg: '' }
];

export const BULL_WEIGHT_RANGES = [
  { label: 'Select Weight Range...', value: '', avg: '' },
  { label: '300 – 400 kg (Small Indigenous Bull)', value: '300-400', avg: 350 },
  { label: '400 – 500 kg (Medium Indigenous Bull)', value: '400-500', avg: 450 },
  { label: '500 – 600 kg (Large Indigenous Bull like Gir / Sahiwal)', value: '500-600', avg: 550 },
  { label: '600 – 700 kg (Heavy Draft / Sire Bull like Kankrej)', value: '600-700', avg: 650 },
  { label: '700 – 800 kg (Exotic Breeding Bull like HF)', value: '700-800', avg: 750 },
  { label: '> 800 kg (Heavy Mature Breeding Sire)', value: '>800', avg: 850 },
  { label: '✏️ Enter Exact Weight Manually...', value: 'custom', avg: '' }
];

export const PREGNANCY_MONTH_OPTIONS = [
  { label: 'Select Pregnancy Month...', value: '' },
  { label: 'Month 1 (1–30 days) — Early Pregnancy', value: 1, days: 15 },
  { label: 'Month 2 (31–60 days) — Early Pregnancy', value: 2, days: 45 },
  { label: 'Month 3 (61–90 days) — Early Pregnancy', value: 3, days: 75 },
  { label: 'Month 4 (91–120 days) — Mid Pregnancy', value: 4, days: 105 },
  { label: 'Month 5 (121–150 days) — Mid Pregnancy', value: 5, days: 135 },
  { label: 'Month 6 (151–180 days) — Mid Pregnancy', value: 6, days: 165 },
  { label: 'Month 7 (181–210 days) — Late Pregnancy', value: 7, days: 195 },
  { label: 'Month 8 (211–240 days) — Late Pregnancy / Pre-Calving', value: 8, days: 225 },
  { label: 'Month 9 (241–283 days) — Late Pregnancy / Full Term', value: 9, days: 260 }
];

export const PREGNANCY_DAYS_OPTIONS = [
  { label: 'Select Pregnancy Days...', value: '' },
  { label: '1 – 30 days (Month 1)', value: 15 },
  { label: '31 – 60 days (Month 2)', value: 45 },
  { label: '61 – 90 days (Month 3)', value: 75 },
  { label: '91 – 120 days (Month 4)', value: 105 },
  { label: '121 – 150 days (Month 5)', value: 135 },
  { label: '151 – 180 days (Month 6)', value: 165 },
  { label: '181 – 210 days (Month 7)', value: 195 },
  { label: '211 – 240 days (Month 8 - Steaming Up)', value: 225 },
  { label: '241 – 283 days (Month 9 - Imminent Calving)', value: 260 },
  { label: '✏️ Enter Exact Days Manually...', value: 'custom' }
];

export const MILK_YIELD_RANGES = [
  { label: 'Select Milk Yield Range...', value: '', avg: '' },
  { label: '< 4 L/day (Low yield / Late lactation)', value: '<4', avg: 3.0 },
  { label: '4 – 6 L/day', value: '4-6', avg: 5.0 },
  { label: '6 – 8 L/day (Desi Cow Average)', value: '6-8', avg: 7.0 },
  { label: '8 – 10 L/day (Good Indigenous Cow)', value: '8-10', avg: 9.0 },
  { label: '10 – 12 L/day (Gir / Sahiwal standard)', value: '10-12', avg: 11.0 },
  { label: '12 – 15 L/day (Crossbred Cow)', value: '12-15', avg: 13.5 },
  { label: '15 – 18 L/day (High Yielding Crossbred)', value: '15-18', avg: 16.5 },
  { label: '18 – 22 L/day (Elite Dairy Cow)', value: '18-22', avg: 20.0 },
  { label: '22 – 26 L/day (High Producing HF)', value: '22-26', avg: 24.0 },
  { label: '> 26 L/day (Commercial High Yielding)', value: '>26', avg: 28.0 },
  { label: '✏️ Enter Exact Litres Manually...', value: 'custom', avg: '' }
];

export const MILK_FAT_RANGES = [
  { label: 'Select Milk Fat %...', value: '', avg: '' },
  { label: '3.0% – 3.5% (Standard HF Milk)', value: '3.0-3.5', avg: 3.25 },
  { label: '3.5% – 4.0% (Crossbred Cow Standard)', value: '3.5-4.0', avg: 3.75 },
  { label: '4.0% – 4.5% (Desi / Indigenous Cow Milk)', value: '4.0-4.5', avg: 4.25 },
  { label: '4.5% – 5.0% (Jersey / Rich Cow Milk)', value: '4.5-5.0', avg: 4.75 },
  { label: '5.0% – 6.0% (High Fat Indigenous Milk)', value: '5.0-6.0', avg: 5.5 },
  { label: '6.0% – 7.5% (Buffalo Milk Standard - Murrah)', value: '6.0-7.5', avg: 6.75 },
  { label: '> 7.5% (Bhadawari / Very High Fat Buffalo)', value: '>7.5', avg: 8.0 },
  { label: '✏️ Enter Exact Fat % Manually...', value: 'custom', avg: '' }
];

export const DRY_DAYS_RANGES = [
  { label: 'Select Dry Period Range...', value: '', avg: '' },
  { label: '< 30 days (Recently dried off)', value: '<30', avg: 20 },
  { label: '30 – 45 days (Mid-dry period)', value: '30-45', avg: 38 },
  { label: '45 – 60 days (Standard recommended 60-day dry period)', value: '45-60', avg: 52 },
  { label: '60 – 75 days (Close-up transition period)', value: '60-75', avg: 68 },
  { label: '> 75 days (Extended dry period)', value: '>75', avg: 85 },
  { label: '✏️ Enter Exact Days Manually...', value: 'custom', avg: '' }
];

/**
 * Helper to match an existing numeric value to a range option, or return 'custom'
 */
export function getMatchingRangeValue(val, ranges) {
  if (val === '' || val === undefined || val === null) return '';
  const num = Number(val);
  const match = ranges.find(r => r.avg === num);
  if (match) return match.value;
  return 'custom';
}
