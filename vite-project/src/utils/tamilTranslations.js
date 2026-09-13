/**
 * Comprehensive Tamil & Multi-language translation dictionary
 * Covers all inputs (wizard steps, cycle hub, feeds, grazing, water)
 * and outputs (feeding report, 5-column table, KT formulation, minerals, vitamins).
 */

export const FEED_TRANSLATIONS = {
  // 1. Green Fodder (பசுந்தீவனம்)
  'Maize Fodder': { ta: 'மக்காச்சோளத் தீவனம்', en: 'Maize Fodder' },
  'Napier Grass / CO-4': { ta: 'நேப்பியர் புல் / CO-4 (கம்பம்புல்)', en: 'Napier Grass / CO-4' },
  'Sorghum Fodder (Jowar)': { ta: 'சோளத் தட்டு / சோளத் தீவனம்', en: 'Sorghum Fodder (Jowar)' },
  'Lucerne (Alfalfa)': { ta: 'குதிரை மசால் (லூசர்ன்)', en: 'Lucerne (Alfalfa)' },
  'Berseem (Egyptian Clover)': { ta: 'பர்சீம் (எகிப்திய க்ளோவர்)', en: 'Berseem (Egyptian Clover)' },
  'Cowpea Fodder (Lobia)': { ta: 'காராமணித் தீவனம் (தட்டப்பயறு)', en: 'Cowpea Fodder (Lobia)' },
  'Rice Grass / Para Grass': { ta: 'பாரா புல் / நீர்நிலைப் புல்', en: 'Rice Grass / Para Grass' },
  'Green Pasture Grass': { ta: 'பசுமை மேய்ச்சல் புல்', en: 'Green Pasture Grass' },
  'Oats Fodder': { ta: 'ஓட்ஸ் பசுந்தீவனம்', en: 'Oats Fodder' },
  'Maize / Corn Silage': { ta: 'மக்காச்சோளப் பதனத்தீவனம் (சைலேஜ்)', en: 'Maize / Corn Silage' },

  // 2. Dry Fodder (உலர் தீவனம்)
  'Wheat Straw (Bhoosa / Turi)': { ta: 'கோதுமை வைக்கோல் (பூசா)', en: 'Wheat Straw (Bhoosa / Turi)' },
  'Paddy Straw (Rice Straw)': { ta: 'நெல் வைக்கோல்', en: 'Paddy Straw (Rice Straw)' },
  'Groundnut Haulm / Vines': { ta: 'வேர்க்கடலைக் கொடி / தழைகள்', en: 'Groundnut Haulm / Vines' },
  'Mixed Grass Hay': { ta: 'உலர்ந்த கலப்புப் புல்', en: 'Mixed Grass Hay' },
  'Jowar / Sorghum Stover (Kadbi)': { ta: 'உலர் சோளத்தட்டு (கட்பி)', en: 'Jowar / Sorghum Stover (Kadbi)' },
  'Sugarcane Bagasse / Tops': { ta: 'கரும்புச் சக்கை / கரும்புத் தோகை', en: 'Sugarcane Bagasse / Tops' },

  // 3. Concentrates (அடர்தீவனம்)
  'Wheat Bran (Choker)': { ta: 'கோதுமைத் தவிடு (சோக்கர்)', en: 'Wheat Bran (Choker)' },
  'Maize Grain Crushed (Makka)': { ta: 'உடைத்த மக்காச்சோளம் (மக்கா)', en: 'Maize Grain Crushed (Makka)' },
  'Soybean Meal (DOC)': { ta: 'சோயாபீன் புண்ணாக்கு (DOC)', en: 'Soybean Meal (DOC)' },
  'Cottonseed Cake (Khal)': { ta: 'பருத்திக் கொட்டைப் புண்ணாக்கு', en: 'Cottonseed Cake (Khal)' },
  'Mustard / Rapeseed Cake (Sarson Khal)': { ta: 'கடுகுப் புண்ணாக்கு', en: 'Mustard / Rapeseed Cake (Sarson Khal)' },
  'Groundnut Cake': { ta: 'கடலைப் புண்ணாக்கு', en: 'Groundnut Cake' },
  'De-oiled Rice Bran (DORB)': { ta: 'எண்ணெய் நீக்கப்பட்ட அரிசித் தவிடு (DORB)', en: 'De-oiled Rice Bran (DORB)' },
  'Commercial Dairy Compound Pellets': { ta: 'கலப்புத் தீவன உருண்டைகள் (பில்லட்ஸ்)', en: 'Commercial Dairy Compound Pellets' },
  'Barley Grain Crushed (Jau)': { ta: 'உடைத்த பார்லி தானியம்', en: 'Barley Grain Crushed (Jau)' },
  'Oats Grain Crushed': { ta: 'உடைத்த ஓட்ஸ் தானியம்', en: 'Oats Grain Crushed' },
  'Sesame / Til Cake': { ta: 'எள்ளுப் புண்ணாக்கு', en: 'Sesame / Til Cake' },
  'Sunflower Meal': { ta: 'சூரியகாந்தி புண்ணாக்கு', en: 'Sunflower Meal' },

  // 4. Unconventional (மரபுசாராத் தீவனம்)
  'Spent Brewer Grain (Wet)': { ta: 'ஈரப்பத வடிசாலைக் கழிவு (ஸ்பென்ட் பிரீவர் கிரைன்)', en: 'Spent Brewer Grain (Wet)' },
  'Citrus Fruit Pulp': { ta: 'சிட்ரஸ் பழக்கழிவு கூழ்', en: 'Citrus Fruit Pulp' },
  'Cane Molasses': { ta: 'கரும்பு வெல்லப்பாகு (மொலாசஸ்)', en: 'Cane Molasses' },
  'Azolla Pinnata (Fresh)': { ta: 'அசோலா பாசி (புதியது)', en: 'Azolla Pinnata (Fresh)' },
  'Pasture Grazing': { ta: 'மேய்ச்சல் புல்', en: 'Pasture Grazing' }
};

export const CATEGORY_TRANSLATIONS = {
  'Green Fodder': { ta: 'பசுந்தீவனம்', en: 'Green Fodder' },
  'green': { ta: 'பசுந்தீவனம்', en: 'Green Fodder' },
  'Dry Fodder': { ta: 'உலர் தீவனம்', en: 'Dry Fodder' },
  'Dry Roughage': { ta: 'உலர் தீவனம்', en: 'Dry Roughage' },
  'dry': { ta: 'உலர் தீவனம்', en: 'Dry Fodder' },
  'Concentrates': { ta: 'அடர்தீவனம்', en: 'Concentrates' },
  'concentrate': { ta: 'அடர்தீவனம்', en: 'Concentrate' },
  'Unconventional': { ta: 'மரபுசாராத் தீவனம்', en: 'Unconventional' },
  'unconventional': { ta: 'மரபுசாராத் தீவனம்', en: 'Unconventional' },
  'pasture': { ta: 'மேய்ச்சல் புல்', en: 'Pasture Grazing' }
};

export const ANIMAL_STAGE_TRANSLATIONS = {
  'heifers': {
    label: { ta: 'கிடாரிகள் (12+ மாதங்கள்)', en: 'Heifers (12+ mo)' },
    shortLabel: { ta: 'கிடாரிகள்', en: 'Heifers' },
    questionTitle: { ta: 'கேள்வி 1: உங்கள் பண்ணையில் எத்தனை கிடாரிகள் உள்ளன?', en: 'Question 1: How many Heifers do you have on your farm?' },
    questionSub: { ta: '12 மாதங்களுக்கு மேற்பட்ட, இன்னும் ஈனாத இளம் பெண் மாடுகள்.', en: 'Young growing female cattle above 12 months that have not yet calved.' },
    tagline: { ta: '12 மாதங்களுக்கு மேற்பட்ட பெண் கன்றுகள் - முதல் சினைக்கு முந்தைய பருவம்.', en: 'Above 12 months old cattle only — young female cattle before first calving.' },
    nextLabel: { ta: 'சினை மாடுகள்', en: 'Pregnant Cattle' }
  },
  'pregnant': {
    label: { ta: 'சினை மாடுகள்', en: 'Pregnant Cattle' },
    shortLabel: { ta: 'சினை மாடுகள்', en: 'Pregnant' },
    questionTitle: { ta: 'கேள்வி 2: உங்கள் பண்ணையில் சினை மாடுகள் உள்ளதா?', en: 'Question 2: Do you have Pregnant Cattle on your farm?' },
    questionSub: { ta: 'முதல் முறை சினை கிடாரிகள், மறுமுறை சினை மாடுகள் அல்லது இரண்டும் உள்ளதா என்பதைத் தேர்வு செய்க.', en: 'Choose whether you have first-time pregnant heifers, repeat pregnant cows, or both.' },
    tagline: { ta: 'கருவுற்ற மாடுகள் & கிடாரிகள். சினை நாட்களைப் பதிவு செய்யவும்.', en: 'Expectant cows and heifers in gestation. Record exact days pregnant.' },
    nextLabel: { ta: 'கறவை மாடுகள்', en: 'Lactating Cows' }
  },
  'lactating': {
    label: { ta: 'கறவை மாடுகள்', en: 'Lactating Cows' },
    shortLabel: { ta: 'கறவை மாடுகள்', en: 'Lactating' },
    questionTitle: { ta: 'கேள்வி 3: உங்கள் பண்ணையில் எத்தனை கறவை மாடுகள் உள்ளன?', en: 'Question 3: How many Lactating (Milking) Cows do you have?' },
    questionSub: { ta: 'தினசரி பால் கறக்கும் முதிர்ந்த பசு மாடுகள்.', en: 'Adult female cows currently being milked daily.' },
    tagline: { ta: 'தற்போது பால் கறக்கும் மாடுகள். தினசரி பால் அளவு (லிட்டர்/நாள்) மற்றும் கொழுப்பு சதவீதத்தைப் பதிவு செய்க.', en: 'Currently milking dairy cows. Record daily milk yield (L/day) and fat %.' },
    nextLabel: { ta: 'வற்றிய மாடுகள்', en: 'Dry Cows' }
  },
  'dry': {
    label: { ta: 'வற்றிய மாடுகள் (ஓய்வு மாடுகள்)', en: 'Dry Cows' },
    shortLabel: { ta: 'வற்றிய மாடுகள்', en: 'Dry Cows' },
    questionTitle: { ta: 'கேள்வி 4: உங்கள் பண்ணையில் எத்தனை வற்றிய மாடுகள் உள்ளன?', en: 'Question 4: How many Dry (Resting) Cows do you have?' },
    questionSub: { ta: 'அடுத்த பிரசவத்திற்கு முன் ஓய்வெடுக்கும் மாடுகள் (~60 நாட்கள் வற்றல் காலம்).', en: 'Mature cows resting before next calving (~60 days dry period).' },
    tagline: { ta: 'பால் கறக்காமல் ஓய்வில் உள்ள முதிர்ந்த மாடுகள் (~60 நாட்கள்).', en: 'Non-lactating mature cows resting before calving (~60 days dry).' },
    nextLabel: { ta: 'காளை மாடுகள்', en: 'Bulls' }
  },
  'bulls': {
    label: { ta: 'காளை மாடுகள்', en: 'Bull Cattle' },
    shortLabel: { ta: 'காளைகள்', en: 'Bulls' },
    questionTitle: { ta: 'கேள்வி 5: உங்கள் பண்ணையில் எத்தனை காளை மாடுகள் உள்ளன?', en: 'Question 5: How many Bulls do you have on your farm?' },
    questionSub: { ta: 'இனப்பெருக்கம் அல்லது பண்ணை உழவு வேலைக்கான ஆண் மாடுகள்.', en: 'Adult male cattle kept for breeding or draft farm activities.' },
    tagline: { ta: 'இனப்பெருக்கம் அல்லது உழவு வேலைக்கான ஆண் மாடுகள்.', en: 'Adult male cattle for breeding or farm draft work.' },
    nextLabel: { ta: 'மந்தை அமைப்பை நிறைவு செய்', en: 'Finish Herd Setup' }
  }
};

export const REPORT_TERMS = {
  // Headings
  'My Farm Feeding Report': { ta: 'எனது பண்ணை தீவன அறிக்கை', en: 'My Farm Feeding Report' },
  'Download Report (PDF)': { ta: 'அறிக்கையைப் பதிவிறக்கு (PDF)', en: 'Download Report (PDF)' },
  'Download Inputs (PDF)': { ta: 'உள்ளீடுகளைப் பதிவிறக்கு (PDF)', en: 'Download Inputs (PDF)' },
  'Calculate Your Nutrition Values': { ta: 'தீவன ஊட்டச்சத்து தேவைகளைக் கணக்கிடுக', en: 'Calculate Your Nutrition Values' },
  'Recalculate Nutrition Values': { ta: 'மீண்டும் ஊட்டச்சத்தைக் கணக்கிடுக', en: 'Recalculate Nutrition Values' },
  'Calculating Nutrition Values...': { ta: 'ஊட்டச்சத்து தேவைகள் கணக்கிடப்படுகிறது...', en: 'Calculating Nutrition Values...' },
  'Practical Feeding Recommendation': { ta: 'நடைமுறை தீவனப் பரிந்துரை', en: 'Practical Feeding Recommendation' },

  // Table Columns
  'Feed Ingredient': { ta: 'தீவனப் பொருள்', en: 'Feed Ingredient' },
  'Feed Type': { ta: 'தீவன வகை', en: 'Feed Type' },
  'What You Put (Input)': { ta: 'நீங்கள் இடும் தீவனம் (உள்ளீடு)', en: 'What You Put (Input)' },
  'What Herd Needs (Recommendation)': { ta: 'மந்தைக்குத் தேவையான பரிந்துரை', en: 'What Herd Needs (Recommendation)' },
  'Shortage / Extra Feed You Need': { ta: 'பற்றாக்குறை / கூடுதல் தேவை', en: 'Shortage / Extra Feed You Need' },
  'Balanced & Covered': { ta: 'போதுமானது & சமநிலையில் உள்ளது', en: 'Balanced & Covered' },
  'kg extra needed': { ta: 'கிலோ கூடுதலாகத் தேவை', en: 'kg extra needed' },
  'kg surplus': { ta: 'கிலோ உபரி', en: 'kg surplus' },

  // KPI Metrics
  'Total Daily Herd Dry Matter (DM) Intake': { ta: 'மொத்த தினசரி உலர் சத்து உட்கொள்ளல் (DMI)', en: 'Total Daily Herd Dry Matter (DM) Intake' },
  'Total Daily Herd Milk Production': { ta: 'மொத்த தினசரி பால் உற்பத்தி', en: 'Total Daily Herd Milk Production' },
  'Total Herd Water Demand': { ta: 'மந்தையின் மொத்த குடிநீர் தேவை', en: 'Total Herd Water Demand' },
  'Average BCS': { ta: 'சராசரி உடல் தகுதி (BCS)', en: 'Average BCS' },
  'THI Heat Stress': { ta: 'வெப்ப அழுத்தக் குறியீடு (THI)', en: 'THI Heat Stress' },
  'No Heat Stress': { ta: 'வெப்ப அழுத்தம் இல்லை', en: 'No Heat Stress' },
  'Mild Stress': { ta: 'மிதமான வெப்ப அழுத்தம்', en: 'Mild Stress' },
  'Moderate Stress': { ta: 'நடுத்தர வெப்ப அழுத்தம்', en: 'Moderate Stress' },
  'Severe Stress': { ta: 'கடுமையான வெப்ப அழுத்தம்', en: 'Severe Stress' },

  // Tabs
  'Practical Feeding': { ta: 'நடைமுறை தீவனம்', en: 'Practical Feeding' },
  'KT Formulation': { ta: 'KT சமச்சீர் தீவன விகிதம்', en: 'KT Formulation' },
  'Energy & Protein': { ta: 'ஆற்றல் & புரதம்', en: 'Energy & Protein' },
  'Minerals & Vitamins': { ta: 'தாதுக்கள் & வைட்டமின்கள்', en: 'Minerals & Vitamins' },
  'Individual Animals': { ta: 'தனிநபர் மாடுகள்', en: 'Individual Animals' },
  'Water & Health': { ta: 'தண்ணீர் & ஆரோக்கியம்', en: 'Water & Health' },

  // Animal Types
  'Milking Cow': { ta: 'கறவை மாடு', en: 'Milking Cow' },
  '1st Lactation': { ta: 'முதல் கறவைப் பருவம்', en: '1st Lactation' },
  '2nd+ Lactation': { ta: '2வது+ கறவைப் பருவம்', en: '2nd+ Lactation' },
  'Pregnant Heifer': { ta: 'முதல் சினை கிடாரி', en: 'Pregnant Heifer' },
  'Repeat Pregnant Cow': { ta: 'மறு சினை மாடு', en: 'Repeat Pregnant Cow' },
  'Heifer': { ta: 'கிடாரி', en: 'Heifer' },
  'Dry Cow': { ta: 'வற்றிய மாடு (ஓய்வு மாடு)', en: 'Dry Cow' },
  'Bull': { ta: 'காளை மாடு', en: 'Bull' },
  'Breeding Bull': { ta: 'இனப்பெருக்கக் காளை', en: 'Breeding Bull' },
  'Draft / Working': { ta: 'உழவு / வேலைக் காளை', en: 'Draft / Working' },

  // Safety Gate & Verdicts
  'Safety Gate: PASSED': { ta: 'பாதுகாப்பு சோதனை: தேர்ச்சி பெற்றது', en: 'Safety Gate: PASSED' },
  'Safety Gate: ADJUSTMENT NEEDED': { ta: 'பாதுகாப்பு சோதனை: சரிசெய்தல் தேவை', en: 'Safety Gate: ADJUSTMENT NEEDED' },
  'Safety Gate: REJECTED (INFEASIBLE)': { ta: 'பாதுகாப்பு சோதனை: நிராகரிக்கப்பட்டது (சாத்தியமற்றது)', en: 'Safety Gate: REJECTED (INFEASIBLE)' },
  'Scientific Feeding Verdict': { ta: 'அறிவியல் தீவன இறுதி முடிவு', en: 'Scientific Feeding Verdict' },
  'Why is this ration approved?': { ta: 'இந்த தீவன விகிதம் ஏன் அங்கீகரிக்கப்பட்டது?', en: 'Why is this ration approved?' },
  'Identified Safety & Nutritional Flags:': { ta: 'கண்டறியப்பட்ட ஊட்டச்சத்து எச்சரிக்கைகள்:', en: 'Identified Safety & Nutritional Flags:' },
  'PRE-REPORT SAFETY GATE VERIFICATION:': { ta: 'அறிக்கைக்கு முந்தைய பாதுகாப்பு சரிபார்ப்பு:', en: 'PRE-REPORT SAFETY GATE VERIFICATION:' },
  'PASSED': { ta: 'தேர்ச்சி', en: 'PASSED' },
  'FLAGGED': { ta: 'கவனம் தேவை', en: 'FLAGGED' },
  'All Okay! Feeding Plan for Today': { ta: 'அனைத்தும் சரி! இன்றைய தீவனத் திட்டம்', en: 'All Okay! Feeding Plan for Today' },
  "Today's Feeding Advice (Simple English Guide)": { ta: 'இன்றைய தீவன வழிகாட்டல் (விவசாயிகளுக்கான எளிய விளக்கம்)', en: "Today's Feeding Advice (Simple English Guide)" },
  'All feed amounts match what your herd needs. Keep feeding as planned today!': { ta: 'அனைத்து தீவன அளவுகளும் உங்கள் மந்தைக்குத் தேவையான அளவிற்கு சரியாக உள்ளன. இன்று திட்டமிட்டபடி தொடர்ந்து வழங்கவும்!', en: 'All feed amounts match what your herd needs. Keep feeding as planned today!' },
  'Here is what you should increase or decrease today in simple words:': { ta: 'இன்று நீங்கள் எவற்றை அதிகரிக்க அல்லது குறைக்க வேண்டும் என்ற எளிய விவரம்:', en: 'Here is what you should increase or decrease today in simple words:' },
  'FEED MORE TODAY': { ta: 'இன்று கூடுதலாக அளிக்க வேண்டும்', en: 'FEED MORE TODAY' },
  'DECREASE THIS': { ta: 'அளவைக் குறைக்கலாம்', en: 'DECREASE THIS' },
  'ALL OKAY': { ta: 'சரியான அளவு', en: 'ALL OKAY' },
  'Covered': { ta: 'போதுமானது', en: 'Covered' },
  'Adequate': { ta: 'போதுமானது', en: 'Adequate' },
  'Covered by Grazing': { ta: 'மேய்ச்சல் மூலம் பெறப்படுகிறது', en: 'Covered by Grazing' },
  '100% Fully covered': { ta: '100% முழுமையாக நிறைவடைந்தது', en: '100% Fully covered' },
  'shortage': { ta: 'பற்றாக்குறை', en: 'shortage' },
  'surplus': { ta: 'உபரி', en: 'surplus' },
  'Total Trough Fresh Feed To Mix Today': { ta: 'இன்று தொட்டியில் கலந்து வைக்க வேண்டிய மொத்த தீவனம்', en: 'Total Trough Fresh Feed To Mix Today' },
  'Total Herd Needs:': { ta: 'மந்தையின் மொத்தத் தேவை:', en: 'Total Herd Needs:' },
  'Total You Provided:': { ta: 'நீங்கள் வழங்கிய மொத்த அளவு:', en: 'Total You Provided:' },
  'Action:': { ta: 'நடவடிக்கை:', en: 'Action:' },
  'Farmer Quick Understanding:': { ta: 'விவசாயிகளுக்கான எளிய வழிகாட்டி:', en: 'Farmer Quick Understanding:' },
  'What You Put (Input):': { ta: 'நீங்கள் இடும் தீவனம் (உள்ளீடு):', en: 'What You Put (Input):' },
  'What Herd Needs (Recommendation):': { ta: 'மந்தைக்குத் தேவையான பரிந்துரை:', en: 'What Herd Needs (Recommendation):' },
  'Shortage / Extra Needed:': { ta: 'பற்றாக்குறை / கூடுதல் தேவை:', en: 'Shortage / Extra Needed:' },
  'Exact Daily Feeding for Each Individual Milking Cow:': { ta: 'ஒவ்வொரு கறவை மாட்டிற்கும் தனிப்பட்ட தினசரி தீவன அளவு:', en: 'Exact Daily Feeding for Each Individual Milking Cow:' },
  'Exact Daily Feeding for Each Individual Pregnant Cattle:': { ta: 'ஒவ்வொரு சினை மாட்டிற்கும் தனிப்பட்ட தினசரி தீவன அளவு:', en: 'Exact Daily Feeding for Each Individual Pregnant Cattle:' },
  'Exact Daily Feeding for Each Individual Heifer:': { ta: 'ஒவ்வொரு கிடாரிக்கும் தனிப்பட்ட தினசரி தீவன அளவு:', en: 'Exact Daily Feeding for Each Individual Heifer:' },
  'Exact Daily Feeding for Each Individual Dry Cow:': { ta: 'ஒவ்வொரு வற்றிய மாட்டிற்கும் தனிப்பட்ட தினசரி தீவன அளவு:', en: 'Exact Daily Feeding for Each Individual Dry Cow:' },
  'Exact Daily Feeding for Each Individual Bull:': { ta: 'ஒவ்வொரு காளைக்கும் தனிப்பட்ட தினசரி தீவன அளவு:', en: 'Exact Daily Feeding for Each Individual Bull:' },
  'Milking Cow Feeding Rules (Simple Daily Guide):': { ta: 'கறவை மாடு தீவன வழிகாட்டுதல்கள் (தினசரி எளிய வழிகாட்டல்):', en: 'Milking Cow Feeding Rules (Simple Daily Guide):' },
  'Pregnant Cattle Feeding Rules (Simple Daily Guide):': { ta: 'சினை மாடு தீவன வழிகாட்டுதல்கள் (தினசரி எளிய வழிகாட்டல்):', en: 'Pregnant Cattle Feeding Rules (Simple Daily Guide):' },
  'Heifer Feeding Rules (Simple Daily Guide):': { ta: 'கிடாரிகள் தீவன வழிகாட்டுதல்கள் (தினசரி எளிய வழிகாட்டல்):', en: 'Heifer Feeding Rules (Simple Daily Guide):' },
  'Dry Cow Feeding Rules (Simple Daily Guide):': { ta: 'வற்றிய மாடுகள் தீவன வழிகாட்டுதல்கள் (தினசரி எளிய வழிகாட்டல்):', en: 'Dry Cow Feeding Rules (Simple Daily Guide):' },
  'Bull Feeding Rules (Simple Daily Guide):': { ta: 'காளை மாடுகள் தீவன வழிகாட்டுதல்கள் (தினசரி எளிய வழிகாட்டல்):', en: 'Bull Feeding Rules (Simple Daily Guide):' },
  '14 Nutritive & Protein Fractions': { ta: '14 ஊட்டச்சத்து & புரத கூறுகள்', en: '14 Nutritive & Protein Fractions' },
  '15 Minerals Profile': { ta: '15 தாதுக்கள் விவரம்', en: '15 Minerals Profile' },
  'Net Energy (NEL) Matrix': { ta: 'நிகர ஆற்றல் (NEL) அட்டவணை', en: 'Net Energy (NEL) Matrix' },
  'Forage NDF Buffer (>21%)': { ta: 'தீவன NDF காரத்தன்மை (>21%)', en: 'Forage NDF Buffer (>21%)' },
  'Free Water Intake': { ta: 'குடிநீர் தேவை விவரம்', en: 'Free Water Intake' },
  'Body Weight Targets': { ta: 'உடல் எடை இலக்குகள்', en: 'Body Weight Targets' },

  // General Actions
  'Proceed to Step 2 (Cattle Herd)': { ta: 'படி 2-க்குச் செல்லவும் (மாடுகள் மந்தை)', en: 'Proceed to Step 2 (Cattle Herd)' },
  'Finish Herd Setup': { ta: 'மந்தை அமைப்பை நிறைவு செய்', en: 'Finish Herd Setup' },
  'Next: Grazing Management': { ta: 'அடுத்தது: மேய்ச்சல் மேலாண்மை', en: 'Next: Grazing Management' },
  'Next: Water Availability': { ta: 'அடுத்தது: தண்ணீர் மேலாண்மை', en: 'Next: Water Availability' },
  'Next: Feed & Fodder': { ta: 'அடுத்தது: தீவன இருப்பு', en: 'Next: Feed & Fodder' },
  'Next: Review & Results': { ta: 'அடுத்தது: இறுதிச் சுருக்கம் & முடிவுகள்', en: 'Next: Review & Results' },
  'Previous': { ta: 'முந்தையது', en: 'Previous' },
  'Total Herd': { ta: 'மொத்த மந்தை', en: 'Total Herd' },
  'animals': { ta: 'மாடுகள்', en: 'animals' },
  'head on farm': { ta: 'மாடுகள் பண்ணையில் உள்ளன', en: 'head on farm' },
  'Quick select kg:': { ta: 'விரைவுத் தேர்வு (கிலோ):', en: 'Quick select kg:' },
  'Save to Farm Inventory': { ta: 'பண்ணை இருப்பில் சேமி', en: 'Save to Farm Inventory' },
  'Tap to add quantity': { ta: '+ அளவை உள்ளிட தொடவும்', en: '+ Tap to add quantity' },
  'Add Custom Feed': { ta: 'புதிய தீவனம் சேர்', en: 'Add Custom Feed' },
  'Feed Name': { ta: 'தீவனப் பெயர்', en: 'Feed Name' },
  'Category': { ta: 'பிரிவு / வகை', en: 'Category' },
  'Cancel': { ta: 'ரத்து', en: 'Cancel' },
  'Add': { ta: 'சேர்', en: 'Add' },
  'kg/day': { ta: 'கிலோ/நாள்', en: 'kg/day' },
  'Litres / day': { ta: 'லிட்டர் / நாள்', en: 'Litres / day' },
  'hrs/day': { ta: 'மணி/நாள்', en: 'hrs/day' },
  'km': { ta: 'கி.மீ', en: 'km' },
  'Inside Farm': { ta: 'பண்ணைக்குள்', en: 'Inside Farm' },
  'Outside Farm': { ta: 'பண்ணைக்கு வெளியே', en: 'Outside Farm' },
  'Stall-fed': { ta: 'தொழுவப் பராமரிப்பு', en: 'Stall-fed' }
};

/**
 * Translates a feed name according to active language (defaults to Tamil if 'ta')
 */
export function translateFeed(name, lang = 'ta') {
  if (!name) return '';
  const item = FEED_TRANSLATIONS[name.trim()];
  if (item && item[lang]) return item[lang];

  // Try case-insensitive lookup
  const lower = name.toLowerCase().trim();
  for (const [key, val] of Object.entries(FEED_TRANSLATIONS)) {
    if (key.toLowerCase() === lower) {
      return val[lang] || name;
    }
  }
  return name;
}

/**
 * Translates a category name according to active language
 */
export function translateCategory(cat, lang = 'ta') {
  if (!cat) return '';
  const item = CATEGORY_TRANSLATIONS[cat.trim()];
  if (item && item[lang]) return item[lang];

  const lower = cat.toLowerCase().trim();
  for (const [key, val] of Object.entries(CATEGORY_TRANSLATIONS)) {
    if (key.toLowerCase() === lower) {
      return val[lang] || cat;
    }
  }
  return cat;
}

/**
 * Translates report output terms according to active language
 */
export function translateTerm(term, lang = 'ta') {
  if (!term) return '';
  const item = REPORT_TERMS[term.trim()];
  if (item && item[lang]) return item[lang];

  const lower = term.toLowerCase().trim();
  for (const [key, val] of Object.entries(REPORT_TERMS)) {
    if (key.toLowerCase() === lower) {
      return val[lang] || term;
    }
  }
  return term;
}

