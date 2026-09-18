/**
 * Trilingual translations and helpers for Step10Review (Summary & Feed Calculations)
 * Provides comprehensive Hindi (हिन्दी), Tamil (தமிழ்), and English translation support
 * without any emojis, using simple farmer-friendly vocabulary.
 */
import { translateFeed, translateCategory, translateTerm } from './tamilTranslations.js';

export const STEP10_HINDI_MAP = {
  // Farm & Weather review
  'Recorded Farm Data Review (Steps 1 to 9)': 'दर्ज किए गए फार्म डेटा की समीक्षा (चरण 1 से 9)',
  '1. Farm Location & Climate': '1. फार्म स्थान एवं मौसम',
  'Location:': 'स्थान:',
  'No location detected': 'स्थान का पता नहीं चला',
  'Air Temperature:': 'हवा का तापमान:',
  'Relative Humidity:': 'सापेक्ष आर्द्रता:',
  'THI Climate Index:': 'THI जलवायु सूचकांक:',
  '2. Breed Selection': '2. नस्ल चयन',
  'Selected Breed:': 'चयनित नस्ल:',
  'No breed selected.': 'कोई नस्ल नहीं चुनी गई।',
  '3. Cattle Herd Inventory': '3. मवेशी झुंड सूची',
  'Only showing categories and live weights recorded on this farm.': 'केवल इस फार्म पर दर्ज की गई श्रेणियां और शारीरिक वजन दिखाए जा रहे हैं।',
  'Total Herd:': 'कुल मवेशी:',
  'head': 'पशु',
  '0 head (None on farm)': '0 पशु (फार्म पर कोई नहीं)',
  'Edit': 'बदलें',
  'Heifers:': 'बछिया:',
  'mo': 'माह',
  'No heifers recorded': 'कोई बछिया दर्ज नहीं की गई',
  'Pregnant Cattle:': 'गर्भवती पशु:',
  'd preg': 'दिन का गर्भ',
  'No pregnant cattle recorded': 'कोई गर्भवती पशु दर्ज नहीं किया गया',
  'Lactating Cows:': 'दुधारू गायें:',
  'L/day total': 'लीटर/दिन कुल',
  'L/d': 'लीटर/दिन',
  'Fat': 'फैट',
  'Early (<100d)': 'शुरुआती चरण (<100 दिन)',
  'Late (>200d)': 'अंतिम चरण (>200 दिन)',
  'Mid (100–200d)': 'मध्य चरण (100–200 दिन)',
  'No lactating cattle recorded': 'कोई दुधारू गाय दर्ज नहीं की गई',
  'Dry Cows:': 'सूखी गायें:',
  'd dry': 'दिन का सूखा काल',
  'No dry cows recorded': 'कोई सूखी गाय दर्ज नहीं की गई',
  'Bulls:': 'सांड / बैल:',
  'Breeding Bull': 'प्रजनन सांड',
  'No bulls recorded': 'कोई सांड दर्ज नहीं किया गया',
  '4. Grazing System': '4. चराई प्रणाली',
  'Grazing System:': 'चराई प्रणाली:',
  'Outside Farm': 'फार्म के बाहर',
  'Stall-Fed': 'खूंटे पर (जीरो चराई)',
  'Inside Farm': 'फार्म के अंदर',
  'Daily Grazing:': 'दैनिक चराई:',
  '0 hrs (Stall-fed)': '0 घंटे (खूंटे पर)',
  'hrs/day': 'घंटे/दिन',
  'km walk': 'किमी चलना',
  'Standard zero-grazing recorded.': 'मानक जीरो-चराई (खूंटे पर) दर्ज किया गया है।',
  '5. Water Supply': '5. पानी की आपूर्ति',
  'Daily Volume:': 'दैनिक मात्रा:',
  'Litres / day': 'लीटर / दिन',
  'Primary Source:': 'मुख्य स्रोत:',
  'Not specified': 'निर्दिष्ट नहीं',
  'Water Quality:': 'पानी की गुणवत्ता:',
  'Good': 'अच्छा (स्वच्छ)',
  'Average': 'औसत',
  'Poor': 'खराब',
  '6. Feed Ingredients': '6. चारा एवं दाना सामग्री',
  'Inventory Items:': 'फार्म भंडार में कुल सामग्री:',
  'Total Inventory:': 'कुल दैनिक मात्रा:',
  'kg / day': 'किग्रा / दिन',
  'kg/day': 'किग्रा/दिन',
  'No feed ingredients selected yet.': 'अभी तक कोई चारा सामग्री नहीं चुनी गई है।',
  
  // Gate banner / Pre-calculation
  'Today': 'आज',
  'Calculates the exact daily green grass, dry fodder, feed mixture, and water needed for your cattle.': 'आपके मवेशियों के लिए आवश्यक दैनिक हरा चारा, सूखा भूसा, दाना मिश्रण और पानी की सटीक मात्रा की गणना करता है।',
  'Please Complete All Steps Before Calculating Feed': 'चारा गणना करने से पहले कृपया सभी चरण पूरे करें',
  'To accurately calculate your cattle daily feed ration, please complete steps 1 to 5 and ensure your location is set.': 'सटीक दैनिक चारा राशन की गणना के लिए, कृपया चरण 1 से 5 पूरे करें और स्थान निर्धारित करें।',
  'Farm Location & Climate:': 'फार्म स्थान एवं जलवायु:',
  'Missing': 'अधूरा',
  'Local temperature and humidity are essential to determine water and daily feed needs.': 'पानी और दैनिक चारे की आवश्यकता निर्धारित करने के लिए स्थानीय तापमान और आर्द्रता आवश्यक हैं।',
  'Auto-Detect GPS': 'जीपीएस से स्वतः पता करें',
  'Enter Manually': 'स्वयं दर्ज करें',
  'City / District:': 'शहर / जिला:',
  'Temp (°C):': 'तापमान (°C):',
  'Humidity (%):': 'आर्द्रता (%):',
  'Save Location': 'स्थान सहेजें',
  'Cancel': 'रद्द करें',
  'Save': 'सहेजें',
  'Breed Selection:': 'नस्ल चयन:',
  'Cattle Herd Details:': 'मवेशी झुंड विवरण:',
  'Grazing Management:': 'चराई प्रबंधन:',
  'Feed & Fodder Library:': 'चारा एवं दाना भंडार:',
  'No Cattle Recorded. Record at least one animal to calculate feed.': 'कोई मवेशी दर्ज नहीं है। चारा गणना के लिए कम से कम एक पशु दर्ज करें।',
  'Go to Cattle': 'मवेशी जोड़ें',
  'Required': 'आवश्यक',
  'All Farm Details Ready to Calculate': 'फार्म के सभी विवरण गणना के लिए तैयार हैं',
  'All cattle and feeds are recorded. Click below to calculate today': 'सभी मवेशी और चारा भंडार दर्ज हैं। आज का चारा राशन जानने के लिए नीचे क्लिक करें:',
  'Calculating Today': 'आज के पोषण की गणना हो रही है...',
  'Recalculate Today': 'आज की चारा आवश्यकता पुनः गणना करें',
  'Calculate Today': 'आज की चारा आवश्यकता की गणना करें',
  'Python Backend is currently not responding.': 'पायथन बैकएंड वर्तमान में उत्तर नहीं दे रहा है।',
  'Retrying...': 'पुनः प्रयास हो रहा है...',
  'Retry Connection': 'पुनः कनेक्ट करें',
  'Calculation Notice:': 'गणना सूचना:',
  
  // Farm Header & Baseline
  'My Farm Feeding Report': 'मेरी फार्म आहार रिपोर्ट',
  'Download Report (PDF)': 'रिपोर्ट डाउनलोड करें (PDF)',
  'Download Inputs (PDF)': 'इनपुट डाउनलोड करें (PDF)',
  'MOOPOSHAQ Farm': 'मूपोषक डेयरी फार्म',
  'Cattle Reference & Genetic Baseline': 'मवेशी संदर्भ एवं आनुवंशिक मानक',
  'Dairy Cattle': 'दुधारू गोवंश',
  'Mature Cow Weight Target:': 'परिपक्व गाय का मानक वजन:',
  'Mature Cow Weight Target: ': 'परिपक्व गाय का मानक वजन: ',
  'Reference Baseline:': 'दैनिक संदर्भ आधार:',
  ' Reference Baseline: ': ' दैनिक संदर्भ आधार: ',
  'fat': 'फैट',
  'Breed:': 'नस्ल:',
  'Total cattle:': 'कुल पशु:',
  'Head': 'पशु',
  'Total herd weight:': 'झुंड का कुल वजन:',
  'Milk production:': 'दूध उत्पादन:',
  'Dry-matter required:': 'आवश्यक शुष्क पदार्थ (DM):',
  'Temperature:': 'तापमान:',
  'Humidity:': 'आर्द्रता:',
  'Water available:': 'उपलब्ध पानी:',
  'Selected farm feeds inventory:': 'चयनित फार्म चारा भंडार:',
  'kg': 'किग्रा',
  'L/day': 'लीटर/दिन',
  
  // Balance status chips & cards
  'Feed Quantities Perfectly Balanced': 'चारे की मात्रा पूरी तरह संतुलित है',
  'Target Met': 'लक्ष्य पूर्ण',
  'Drinking Water': 'पीने का पानी',
  'Minerals & Salt': 'खनिज लवण एवं नमक',
  'Mix': 'मिश्रण',
  'Salt': 'नमक',
  'DM': 'शुष्क पदार्थ (DM)',
  'kg needed': 'किग्रा आवश्यक',
  'kg surplus': 'किग्रा अतिरिक्त',
  'kg extra needed': 'किग्रा अतिरिक्त आवश्यक',
  'You entered:': 'आपने दर्ज किया:',
  'Herd needs:': 'मवेशियों की जरूरत:',
  '0.0 kg/day': '0.0 किग्रा/दिन',
  '0.0 kg / day': '0.0 किग्रा / दिन',
  'Total Fresh Trough Feed Today:': 'आज नाद में देने योग्य कुल ताजा चारा:',
  'Grazing Forage (22% DM · Estimated)': 'चराई चारा (22% DM · अनुमानित)',
  'Grazing Access · Estimated': 'चराई से प्राप्त · अनुमानित',
  'kg DM': 'किग्रा DM',
  'Total Herd Dry Matter Intake (Trough + Grazing):': 'झुंड का कुल शुष्क पदार्थ सेवन (नाद + चराई):',
  'kg DM / day': 'किग्रा DM / दिन',
  'Mineral mixture (DCP / Calcite)': 'खनिज मिश्रण (DCP / कैल्साइट)',
  'Macro/Micro minerals': 'प्रमुख एवं सूक्ष्म खनिज',
  '0 grams / day': '0 ग्राम / दिन',
  'grams / day': 'ग्राम / दिन',
  'g needed': 'ग्राम आवश्यक',
  'Common Iodized Salt': 'साधारण आयोडाइज्ड नमक',
  'Electrolytes & buffer': 'इलेक्ट्रोलाइट्स एवं बफर',
  'Clean Drinking Water': 'स्वच्छ पेयजल',
  'Ad-libitum in troughs': 'नाद में चौबीसों घंटे पर्याप्त',
  'litres / day': 'लीटर / दिन',
  'L shortage': 'लीटर की कमी',
  'What you currently have or provide to the farm daily.': 'वर्तमान में आपके फार्म पर उपलब्ध या प्रतिदिन दी जाने वाली मात्रा।',
  'The total scientifically calculated feed your whole herd needs today.': 'वैज्ञानिक रूप से गणना की गई वह कुल मात्रा जो आज आपके पूरे झुंड को चाहिए।',
  'The additional feed you need to bring or buy today so your cattle do not suffer health decline or milk drop.': 'वह अतिरिक्त चारा जो आज आपको बढ़ाना चाहिए ताकि दूध में गिरावट या पशु के स्वास्थ्य में कमी न आए।',
  'All physiological and safety constraints (DMI, Energy, Protein, NDF, Ca, P, and water) are balanced.': 'सभी शारीरिक और सुरक्षा मानक (DMI, ऊर्जा, प्रोटीन, NDF, कैल्शियम, फॉस्फोरस और पानी) संतुलित हैं।',
  
  // Feeding table columns & status
  'Feed Ingredient': 'चारा सामग्री',
  'Feed Type': 'चारे का प्रकार',
  'What You Put (Input)': 'आप जो दे रहे हैं (इनपुट)',
  'What Herd Needs (Recommendation)': 'झुंड की जरूरत (सिफारिश)',
  'Shortage / Extra Feed You Need': 'कमी / अतिरिक्त आवश्यकता',
  'Covered': 'पर्याप्त',
  'Covered by Grazing': 'चराई से पूरा हुआ',
  '100% Fully covered': '100% पूरी तरह संतुष्ट',
  'Adequate': 'संतोषजनक',
  'Farmer Quick Understanding:': 'किसानों के लिए सरल समझ:',
  'What You Put (Input):': 'आप जो खिला रहे हैं (इनपुट):',
  'What Herd Needs (Recommendation):': 'मवेशियों को जितनी जरूरत है:',
  'Shortage / Extra Needed:': 'कमी / अतिरिक्त आवश्यकता:',
  'Scientific Feeding Verdict': 'वैज्ञानिक पोषण निर्णय',
  'Safety Gate: REJECTED (INFEASIBLE)': 'सुरक्षा मानक: अस्वीकृत (असंभव)',
  'Safety Gate: PASSED': 'सुरक्षा मानक: पास (स्वीकृत)',
  'Safety Gate: ADJUSTMENT NEEDED': 'सुरक्षा मानक: बदलाव आवश्यक',
  'Why is this ration approved?': 'यह राशन क्यों स्वीकृत है?',
  'Identified Safety & Nutritional Flags:': 'पहचानी गई पोषण चेतावनियां:',
  'PRE-REPORT SAFETY GATE VERIFICATION:': 'रिपोर्ट-पूर्व सुरक्षा सत्यापन:',
  'PASSED': 'पास (स्वीकृत)',
  'FLAGGED': 'ध्यान दें',
  'DMI within target?': 'शुष्क पदार्थ सेवन (DMI) लक्ष्य में है?',
  'ME within range?': 'ऊर्जा (ME) सीमा के भीतर है?',
  'CP within range?': 'क्रूड प्रोटीन (CP) सीमा के भीतर है?',
  'NDF within range?': 'फाइबर (NDF) सुरक्षित सीमा में है?',
  'Ca/P adequate?': 'कैल्शियम/फॉस्फोरस (Ca/P) पर्याप्त है?',
  'Ingredient limits safe?': 'आहार सामग्री सीमा सुरक्षित है?',
  'Animal totals = farm totals?': 'पशु कुल = फार्म कुल सही है?',
  'Water adequate?': 'पेयजल पर्याप्त है?',
  
  // Milking cattle section & rules
  'Milking Cow Feeding Rules (Simple Daily Guide):': 'दुधारू गायों के लिए चारा नियम (दैनिक सरल मार्गदर्शिका):',
  'Exact Daily Feeding for Each Individual Milking Cow:': 'प्रत्येक दुधारू गाय के लिए सटीक दैनिक चारा खुराक:',
  'Cattle Reference:': 'पशु संदर्भ:',
  'High-producing dairy cows require prioritized feed energy and bypass protein to sustain peak milk yield without losing body condition.': 'उच्च दुग्ध उत्पादक गायों को वजन बनाए रखने और अधिकतम दूध उत्पादन के लिए ऊर्जा एवं बाईपास प्रोटीन की प्राथमिकता आवश्यक है।',
  'Concentrate Rule:': 'दाना मिश्रण नियम:',
  'Feed 1 kg cattle feed for every 2 to 2.5 Litres of milk produced daily.': 'दैनिक उत्पादित प्रत्येक 2 से 2.5 लीटर दूध के लिए 1 किग्रा दाना मिश्रण दें।',
  'Green Fodder:': 'हरा चारा:',
  'Give 20–25 kg fresh green fodder daily for vitamins and milk flow.': 'विटामिन और दुग्ध प्रवाह के लिए प्रतिदिन 20–25 किग्रा ताजा हरा चारा दें।',
  'Dry Straw / Hay:': 'सूखा भूसा / पुआल:',
  'Feed 3–5 kg dry straw daily to support rumination and butterfat.': 'जुगाली और दूध फैट बढ़ाने के लिए प्रतिदिन 3–5 किग्रा सूखा भूसा खिलाएं।',
  'Clean Water:': 'स्वच्छ पानी:',
  'Milking cows need 70–90 Litres of fresh water daily. Lack of water drops milk.': 'दुधारू गायों को रोजाना 70–90 लीटर साफ पानी चाहिए। पानी की कमी से तुरंत दूध घटता है।',
  'Minerals & Salt:': 'खनिज एवं नमक:',
  'Add 60–80 grams mineral mixture daily to prevent milk fever.': 'मिल्क फीवर से बचाव के लिए रोजाना 60–80 ग्राम मिनरल मिक्स्चर जरूर दें।',
  'Mid lactation': 'मध्य दुग्धकाल',
  'Green': 'हरा',
  'Dry': 'सूखा',
  'Concentrate': 'दाना',
  'Minerals:': 'खनिज:',
  'Salt:': 'नमक:',
  'Water:': 'पानी:',
  'L': 'लीटर',
  'Cattle': 'पशु',
  'Weight': 'वजन',
  'Lactation & BCS': 'दुग्धकाल एवं BCS',
  'Milk Yield': 'दूध उत्पादन',
  'Green Fodder (kg)': 'हरा चारा (किग्रा)',
  'Dry Fodder (kg)': 'सूखा चारा (किग्रा)',
  'Concentrate (kg)': 'दाना मिश्रण (किग्रा)',
  'Mineral Mix (g)': 'खनिज मिश्रण (ग्रा)',
  'Salt (g)': 'नमक (ग्रा)',
  'Water (L)': 'पानी (ली)',
  '(Thin)': '(कमजोर / पतली)',
  'Max safe 40%': 'अधिकतम सुरक्षित 40%',
  'g': 'ग्राम',
  'Average per Cow:': 'प्रति गाय औसत:',
  'Green fodder': 'हरा चारा',
  'Dry fodder': 'सूखा चारा',
  'Mineral mixture': 'खनिज मिश्रण',
  'Water': 'पानी',
  'Herd Nutrition Balance:': 'झुंड पोषण संतुलन:',
  'Energy:': 'ऊर्जा:',
  'Protein:': 'प्रोटीन:',
  'Fibre:': 'फाइबर (रेषा):',
  'Calcium:': 'कैल्शियम:',
  'Phosphorus:': 'फॉस्फोरस:',
  
  // Gestation / Pregnant cattle
  'Gestation Stages: Months 1–9': 'गर्भावस्था के चरण: 1 से 9 माह',
  'Late gestation (months 7–9) requires steaming up with energy concentrates to build calf birthweight and colostrum. Months 1–6 need maintenance-level forage.': 'अंतिम गर्भावस्था (7–9 माह) में बछड़े के उचित वजन और खीस (कोलोस्ट्रम) के लिए स्टीमिंग अप (ऊर्जा दाना) आवश्यक है। 1–6 माह में सामान्य रखरखाव चारा चाहिए।',
  'Exact Daily Feeding for Each Pregnant Animal:': 'प्रत्येक गर्भवती पशु के लिए सटीक दैनिक खुराक:',
  'Animal': 'पशु',
  'Type': 'प्रकार',
  'Gestation Stage': 'गर्भावस्था चरण',
  'Average per Animal:': 'प्रति पशु औसत:',
  'Why Pregnancy Stage Matters:': 'गर्भावस्था चरण का महत्व क्यों है:',
  'A cow that is 5 months pregnant has lower fetal requirements and needs mostly fiber/green fodder. A cow in month 9 has rapid calf growth and needs higher concentrate density (steaming up) because rumen capacity decreases.': '5 माह की गर्भवती गाय को मुख्य रूप से चारा/फाइबर चाहिए। 9वें माह में बछड़े का तेजी से विकास होता है और पेट में जगह कम होने के कारण अधिक ऊर्जा वाले दाने (स्टीमिंग अप) की जरूरत होती है।',
  
  // Heifers
  'Daily Gain & Target': 'दैनिक वजन वृद्धि एवं गर्भाधान लक्ष्य',
  'Target AI:': 'गर्भाधान लक्ष्य:',
  'Milk Yield & Production Target': 'दूध उत्पादन एवं संभावित लक्ष्य',
  'Fetal Growth & Calf Projection': 'भ्रूण विकास एवं बछड़ा जन्म वजन',
  'Birth Wt': 'जन्म वजन',
  'fetal gain': 'दैनिक भ्रूण विकास',
  'potential boost with this feed': 'इस संतुलित आहार से संभावित वृद्धि',
  'Target Gain: 500–600 g/day': 'दैनिक वजन वृद्धि लक्ष्य: 500–600 ग्राम/दिन',
  'Growing replacement heifers require balanced protein and minerals for skeletal frame growth without excess body fat deposition.': 'बढ़ती बछियों को उचित शारीरिक ढांचे के विकास के लिए संतुलित प्रोटीन और खनिजों की आवश्यकता होती है ताकि अत्यधिक चर्बी न जमे।',
  'Exact Daily Feeding for Each Heifer:': 'प्रत्येक बछिया के लिए सटीक दैनिक खुराक:',
  'Growing stage': 'विकासशील अवस्था',
  'Growing': 'बढ़ती बछिया',
  'Heifer': 'बछिया',
  'Average per Heifer:': 'प्रति बछिया औसत:',
  'Result & Care:': 'देखभाल एवं परिणाम:',
  'Maintain steady daily growth': 'दैनिक स्थिर शारीरिक वृद्धि बनाए रखें',
  'Avoid overfeeding heavy concentrates': 'अत्यधिक भारी दाना देने से बचें ताकि चर्बी न चढ़े',
  'Check mineral mixture balance': 'खनिज मिश्रण की नियमित खुराक सुनिश्चित करें',
  
  // Dry cows
  'Dry Period: 45–60 Days': 'सूखा काल: 45–60 दिन',
  'Mammary gland involution and rumen rest period before next calving. Feed mostly high fiber forage and restrict heavy concentrates.': 'अगले प्रसव से पहले अयन और पेट के विश्राम की अवधि। मुख्य रूप से उच्च फाइबर चारा दें और अत्यधिक दाने से बचें।',
  'Exact Daily Feeding for Each Dry Cow:': 'प्रत्येक सूखी गाय के लिए सटीक दैनिक खुराक:',
  'days dry': 'दिन सूखा काल',
  'Dry Period': 'सूखा काल (विश्राम)',
  'Far-off (Rumen rest)': 'शुरुआती सूखा काल (विश्राम)',
  'Close-up (Transition)': 'प्रसव पूर्व संक्रमण काल',
  'Status:': 'स्थिति:',
  'Dry Cow': 'सूखी गाय',
  'Maintenance feeding required': 'सामान्य पोषण आहार पर्याप्त है',
  'Avoid excessive grains during dry period to prevent fat cow syndrome and metabolic disorders at calving.': 'प्रसव के समय फैट काउ सिंड्रोम और चयापचय विकारों से बचने के लिए सूखे काल में अत्यधिक अनाज न दें।',
  
  // Bulls
  'Basal Metabolism: +10%': 'आधारभूत चयापचय: +10%',
  'Breeding bulls and working oxen have higher basal metabolic rates. Feed balanced green roughage with moderate energy concentrate for reproductive vigor.': 'प्रजनन सांडों और कामकाजी बैलों की चयापचय दर अधिक होती है। प्रजनन क्षमता और स्फूर्ति के लिए संतुलित हरा चारा और मध्यम दाना दें।',
  'Exact Daily Feeding for Each Bull:': 'प्रत्येक सांड / बैल के लिए सटीक दैनिक खुराक:',
  'Bull / Draught': 'सांड / कामकाजी बैल',
  'Bull': 'सांड / बैल',
  'Average per Bull:': 'प्रति सांड औसत:',
  '* The bull should not receive the same high-energy concentrate level as the lactating cow.': '* सांड को दुधारू गाय जितना अत्यधिक ऊर्जा वाला दाना नहीं देना चाहिए।',
  
  // Water status card
  'Water Status & Hydration': 'पानी की स्थिति एवं जलयोजन',
  'Available:': 'उपलब्ध:',
  'Calculated herd requirement:': 'झुंड की कुल गणना की गई आवश्यकता:',
  'Shortage:': 'कमी:',
  'Farmer action:': 'किसान के लिए सुझाव:',
  'Warm Weather Today': 'आज का मौसम गर्म है',
  'humidity': 'आर्द्रता',
  'Recommended action:': 'अनुशंसित उपाय:',
  
  // Scientific view & toggles
  'Feed Balance (Are These Feeds Enough?)': 'चारा संतुलन (क्या यह चारा पर्याप्त है?)',
  'Technical & Laboratory View': 'तकनीकी एवं प्रयोगशाला विश्लेषण',
  'Scientific Nutritive Fractions & Consolidated Minerals Matrix': 'वैज्ञानिक पोषण घटक एवं खनिज संतुलन मैट्रिक्स',
  'Detailed 14 nutritive and protein fractions, 15 minerals profile, and Net Energy (NEL) calculations (available in full in the downloadable PDF report).': 'विस्तृत 14 पोषण एवं प्रोटीन घटक, 15 खनिज प्रोफाइल और शुद्ध ऊर्जा (NEL) गणना (डाउनलोड करने योग्य PDF रिपोर्ट में पूर्ण उपलब्ध)।',
  'Hide Laboratory Details': 'तकनीकी विवरण छिपाएं',
  'Show Advanced Laboratory Analysis': 'उन्नत प्रयोगशाला विश्लेषण देखें',
  'Diet DM:': 'आहार शुष्क पदार्थ (DM):',
  'Diet ME:': 'पाचन ऊर्जा (ME):',
  'Forage NDF:': 'चारा NDF:',
  '>= 21% OK': '>= 21% सही',
  '< 21% Low': '< 21% कम (बफर चाहिए)',
  'Multiparous Target Weight:': 'परिपक्व गाय लक्ष्य वजन:',
  'Moisture-Derived As-Fed:': 'ताजा चारा आवश्यकता (As-Fed):',
  'day': 'दिन',
  'NRC DMI Equations Benchmarks:': 'NRC DMI मानक समीकरण:',
  'Heifer Target DMI (Eq 20-10):': 'बछिया लक्ष्य DMI (समीकरण 20-10):',
  'Heifer Diet-Based DMI (Eq 20-11):': 'बछिया आहार-आधारित DMI (समीकरण 20-11):',
  'Lactating Target DMI (Eq 20-18):': 'दुधारू लक्ष्य DMI (समीकरण 20-18):',
  '4% FCM & Parity corrected': '4% FCM एवं ब्यात संशोधित',
  'Total Ingested DM:': 'कुल खाया गया शुष्क पदार्थ (DM):',
  'Feed Shortage & Nutrition Alert': 'चारा कमी एवं पोषण चेतावनी',
  'Feed Quantity & Safety Notes': 'चारा मात्रा एवं सुरक्षा निर्देश',
  'Shortage': 'कमी',
  'Notice': 'सूचना',
  'Limit:': 'सीमा:',
  'Rumen Fiber Health & Acidosis Prevention (NRC & ICAR)': 'रूमेन स्वास्थ्य एवं एसिडोसिस रोकथाम (NRC एवं ICAR)',
  'Forage NDF (fNDF)': 'चारा NDF (fNDF)',
  'Min 19%': 'न्यूनतम 19%',
  'Protects rumen buffering': 'पेट के प्राकृतिक बफर को बनाए रखता है',
  'Effective NDF (peNDF)': 'प्रभावी NDF (peNDF)',
  'Min 21%': 'न्यूनतम 21%',
  'Stimulates cud chewing': 'जुगाली को उत्तेजित करता है',
  'Total Dietary NDF': 'आहार का कुल NDF',
  'Max 48%': 'अधिकतम 48%',
  'Prevents rumen gut-fill limit': 'पेट भरने की सीमा रोकता है',
  'Est. Cud Chews': 'अनुमानित जुगाली',
  'Chews / herd / day': 'जुगाली / झुंड / दिन',
  '14 Nutritive & Protein Fractions': '14 पोषक एवं प्रोटीन घटक',
  '15 Minerals Profile': '15 खनिज लवण प्रोफाइल',
  'Net Energy (NEL) Matrix': 'शुद्ध ऊर्जा (NEL) मैट्रिक्स',
  'Forage NDF Buffer (>21%)': 'चारा NDF बफर (>21%)',
  'Free Water Intake': 'दैनिक पेयजल खपत',
  'Body Weight Targets': 'शरीर भार लक्ष्य',
  
  // Regional intelligence & PDF buttons
  'Top Regional Greens': 'क्षेत्रीय प्रमुख हरा चारा',
  'Top Dry Roughages': 'क्षेत्रीय प्रमुख सूखा भूसा',
  'Top Oil Cakes & Byproducts': 'प्रमुख खली एवं उप-उत्पाद',
  'Scientifically recommended regional feeds and agro-byproducts suited for your local climate to optimize costs and milk solids.': 'आपके स्थानीय मौसम के अनुकूल अनुशंसित क्षेत्रीय चारे व कृषि उप-उत्पाद जो लागत घटाकर दूध उत्पादन बढ़ाते हैं।',
  'Are you sure you want to clear all recorded farm data and start fresh?': 'क्या आप वाकई सारा दर्ज डेटा हटाकर नया रिकॉर्ड शुरू करना चाहते हैं?',
  'Reset & Start New Record': 'डेटा रीसेट करें और नया रिकॉर्ड शुरू करें',
  'Download recorded farm inputs in colorful PDF format': 'दर्ज किए गए फार्म इनपुट रंगीन PDF में डाउनलोड करें',
  'Download generated feeding report in colorful PDF format': 'तैयार चारा रिपोर्ट रंगीन PDF में डाउनलोड करें',
  'Download Feeding Report (PDF)': 'चारा रिपोर्ट डाउनलोड करें (PDF)',
  'Download Inputs (PDF)': 'इनपुट डाउनलोड करें (PDF)'
};

/**
 * Dynamic pattern translator for parameterized strings in Step 10
 */
export function translateReviewToHindi(enStr, taStr = '') {
  if (!enStr || typeof enStr !== 'string') return enStr;
  const trimmed = enStr.trim();

  // 1. Direct dictionary lookup
  if (STEP10_HINDI_MAP[trimmed]) {
    return STEP10_HINDI_MAP[trimmed];
  }
  if (STEP10_HINDI_MAP[enStr]) {
    return STEP10_HINDI_MAP[enStr];
  }

  // 2. Feed & Category lookup
  const feed = translateFeed(trimmed, 'hi');
  if (feed && feed !== trimmed) return feed;
  const cat = translateCategory(trimmed, 'hi');
  if (cat && cat !== trimmed) return cat;
  const term = translateTerm(trimmed, 'hi');
  if (term && term !== trimmed) return term;

  // 3. Regex pattern matchers for dynamic template literals
  // Heifer #1 -> बछिया #1
  let m = trimmed.match(/^Heifer\s*#(\d+)/i);
  if (m) return `बछिया #${m[1]}`;

  // 1st-Preg #1 -> 1-म गर्भ #1
  m = trimmed.match(/^1st-Preg\s*#(\d+)/i);
  if (m) return `पहली बार गर्भवती #${m[1]}`;

  // Repeat #1 -> पुनः गर्भवती #1
  m = trimmed.match(/^Repeat\s*#(\d+)/i);
  if (m) return `दोबारा गर्भवती #${m[1]}`;

  // Cow #1 -> गाय #1
  m = trimmed.match(/^Cow\s*#(\d+)(.*)/i);
  if (m) {
    let suffix = m[2] || '';
    if (suffix.includes('1st Lact')) suffix = suffix.replace('1st Lact', 'प्रथम ब्यात');
    if (suffix.includes('2nd+')) suffix = suffix.replace('2nd+', '2+ ब्यात');
    return `गाय #${m[1]}${suffix}`;
  }

  // Dry Cow #1 -> सूखी गाय #1
  m = trimmed.match(/^Dry\s*Cow\s*#(\d+)/i);
  if (m) return `सूखी गाय #${m[1]}`;

  // Bull #1 -> सांड #1
  m = trimmed.match(/^Bull\s*#(\d+)/i);
  if (m) return `सांड #${m[1]}`;

  // Pregnant #1 -> गर्भवती #1
  m = trimmed.match(/^Pregnant\s*#(\d+)/i);
  if (m) return `गर्भवती #${m[1]}`;

  // Milking Cows (X Head) -> दुधारू गायें (X पशु)
  m = trimmed.match(/^Milking\s*Cows\s*\((.*)\)/i);
  if (m) return `दुधारू गायें (${m[1].replace('Head', 'पशु')})`;

  // Growing Heifers (X Head) -> बढ़ती बछिया (X पशु)
  m = trimmed.match(/^Growing\s*Heifers\s*\((.*)\)/i);
  if (m) return `बढ़ती बछिया (${m[1].replace('Head', 'पशु')})`;

  // Dry Cows (X Head) -> सूखी गायें (X पशु)
  m = trimmed.match(/^Dry\s*Cows\s*\((.*)\)/i);
  if (m) return `सूखी गायें (${m[1].replace('Head', 'पशु')})`;

  // Breeding Bulls & Draught Cattle (X Head) -> प्रजनन सांड एवं बैल (X पशु)
  m = trimmed.match(/^Breeding\s*Bulls\s*&\s*Draught\s*Cattle\s*\((.*)\)/i);
  if (m) return `प्रजनन सांड एवं बैल (${m[1].replace('Head', 'पशु')})`;

  // Pregnant Cattle (X Animals: Y First Pregnancy, Z Repeat) -> गर्भवती पशु (X पशु: ...)
  m = trimmed.match(/^Pregnant\s*Cattle\s*\((.*)\)/i);
  if (m) {
    let inner = m[1]
      .replace('Animals:', 'पशु:')
      .replace('First Pregnancy,', 'प्रथम गर्भ,')
      .replace('Repeat', 'दोबारा गर्भ');
    return `गर्भवती पशु (${inner})`;
  }

  // Steaming Up (Month X) -> स्टीमिंग अप (माह X)
  m = trimmed.match(/^Steaming\s*Up\s*\(Month\s*(\d+)\)/i);
  if (m) return `स्टीमिंग अप (माह ${m[1]})`;

  // Month X -> माह X
  m = trimmed.match(/^Month\s*(\d+)/i);
  if (m) return `माह ${m[1]}`;

  // First-Time Pregnant (X): -> प्रथम बार गर्भवती (X):
  m = trimmed.match(/^First-Time\s*Pregnant\s*\((.*)\):/i);
  if (m) return `प्रथम बार गर्भवती (${m[1]}):`;

  // Repeat / Multiparous (X): -> दोबारा गर्भवती (X):
  m = trimmed.match(/^Repeat\s*\/\s*Multiparous\s*\((.*)\):/i);
  if (m) return `दोबारा / बहुप्रसवी (${m[1]}):`;

  // Go to Step X -> चरण X पर जाएं
  m = trimmed.match(/^Go\s*to\s*Step\s*(\d+)\s*→/i);
  if (m) return `चरण ${m[1]} पर जाएं →`;

  // +X kg Needed -> +X किग्रा आवश्यक
  m = trimmed.match(/^\+?([\d.]+)\s*kg\s*Needed/i);
  if (m) return `+${m[1]} किग्रा आवश्यक`;

  // -X kg Surplus -> -X किग्रा अतिरिक्त
  m = trimmed.match(/^-?([\d.]+)\s*kg\s*Surplus/i);
  if (m) return `-${m[1]} किग्रा अतिरिक्त`;

  // Covered (X kg) -> संतुष्ट (X किग्रा)
  m = trimmed.match(/^Covered\s*\(([\d.]+)\s*kg\)/i);
  if (m) return `संतुष्ट (${m[1]} किग्रा)`;

  // Total Milk: X Litres/day • Avg Weight: Y kg -> कुल दूध: X लीटर/दिन • औसत वजन: Y किग्रा
  m = trimmed.match(/^Total\s*Milk:\s*([\d.]+)\s*Litres\/day\s*•\s*Avg\s*Weight:\s*([\d.]+)\s*kg/i);
  if (m) return `कुल दूध: ${m[1]} लीटर/दिन • औसत वजन: ${m[2]} किग्रा`;

  // DMI Target Met (X / Y kg DM) -> DMI लक्ष्य पूर्ण (X / Y किग्रा DM)
  m = trimmed.match(/^DMI\s*Target\s*Met\s*\((.*)\)/i);
  if (m) return `DMI लक्ष्य पूर्ण (${m[1].replace('kg DM', 'किग्रा DM')})`;

  // Deficient (-X kg DM / Incomplete) -> कमी (-X किग्रा DM / अपूर्ण)
  m = trimmed.match(/^Deficient\s*\((.*)\)/i);
  if (m) return `कमी (${m[1].replace('kg DM', 'किग्रा DM').replace('Incomplete', 'अपूर्ण')})`;

  // Surplus (+X kg DM excess) -> अतिरिक्त (+X किग्रा DM बचत)
  m = trimmed.match(/^Surplus\s*\((.*)\)/i);
  if (m) return `अतिरिक्त (${m[1].replace('kg DM excess', 'किग्रा DM बचत')})`;

  // Agro-Climatic Feed Intelligence: Zone -> कृषि-जलवायु चारा परामर्श: Zone
  m = trimmed.match(/^Agro-Climatic\s*Feed\s*Intelligence:\s*(.*)/i);
  if (m) return `कृषि-जलवायु चारा परामर्श: ${m[1]}`;

  // Total Trough Fresh Feed To Mix Today (Harvested: X kg DM): -> आज नाद में मिलाकर देने योग्य कुल ताजा चारा (शुष्क पदार्थ: X किग्रा DM):
  m = trimmed.match(/^Total\s*Trough\s*Fresh\s*Feed\s*To\s*Mix\s*Today\s*\(Harvested:\s*(.*)\):/i);
  if (m) return `आज नाद में मिलाकर देने योग्य कुल ताजा चारा (शुष्क पदार्थ: ${m[1]}):`;

  // City Dairy Farm -> City डेयरी फार्म
  m = trimmed.match(/^(.*)\s+Dairy\s+Farm$/i);
  if (m) return `${m[1]} डेयरी फार्म`;

  // True requirement = ...
  if (trimmed.startsWith('True requirement =')) {
    return trimmed
      .replace('True requirement', 'वास्तविक आवश्यकता')
      .replace('Thumb-rule 4.5% BW:', 'अंगूठा नियम 4.5% शरीर भार:');
  }

  // Mature BW x 95% ...
  if (trimmed.startsWith('Mature BW x 95%')) {
    return trimmed
      .replace('Mature BW x 95%', 'परिपक्व शरीर भार x 95%')
      .replace('4.5% BW Ref:', '4.5% शरीर भार मानक:');
  }

  // Trough: X kg + Grazing: Y kg
  if (trimmed.includes('Trough:') && trimmed.includes('Grazing:')) {
    return trimmed
      .replace(/Trough:/g, 'नाद:')
      .replace(/Grazing:/g, 'चराई:')
      .replace(/\(Est\.\)/g, '(अनुमानित)');
  }

  return enStr;
}

/**
 * Universal helper for Step10Review component
 * @param {string} taStr Tamil translation
 * @param {string} enStr English original / fallback
 * @param {string} currentLang Active app language ('ta', 'hi', 'en')
 */
export function tReview(taStr, enStr, currentLang = 'ta') {
  if (currentLang === 'ta') return taStr;
  if (currentLang === 'hi') {
    return translateReviewToHindi(enStr, taStr);
  }
  return enStr;
}

export const SAFETY_GATE_MAP = {
  'DMI within target?': {
    ta: 'உலர் தீவனம் (DMI) இலக்கில் உள்ளதா?',
    hi: 'शुष्क पदार्थ सेवन (DMI) लक्ष्य में है?',
    en: 'DMI within target?'
  },
  'ME within range?': {
    ta: 'வளர்சிதை மாற்ற ஆற்றல் (ME) வரம்பிற்குள் உள்ளதா?',
    hi: 'ऊर्जा (ME) सीमा के भीतर है?',
    en: 'ME within range?'
  },
  'CP within range?': {
    ta: 'கச்சா புரதம் (CP) வரம்பிற்குள் உள்ளதா?',
    hi: 'क्रूड प्रोटीन (CP) सीमा के भीतर है?',
    en: 'CP within range?'
  },
  'NDF within range?': {
    ta: 'நார்ச்சத்து (NDF) உகந்த அளவில் உள்ளதா?',
    hi: 'फाइबर (NDF) सुरक्षित सीमा में है?',
    en: 'NDF within range?'
  },
  'Ca/P adequate?': {
    ta: 'சுண்ணாம்பு/மணிச்சத்து (Ca/P) போதுமானதா?',
    hi: 'कैल्शियम/फॉस्फोरस (Ca/P) पर्याप्त है?',
    en: 'Ca/P adequate?'
  },
  'Ingredient limits safe?': {
    ta: 'தீவனப் பொருட்கள் வரம்பு பாதுகாப்பானதா?',
    hi: 'आहार सामग्री सीमा सुरक्षित है?',
    en: 'Ingredient limits safe?'
  },
  'Animal totals = farm totals?': {
    ta: 'மாடுகள் மொத்தம் = பண்ணை மொத்தம்?',
    hi: 'पशु कुल = फार्म कुल सही है?',
    en: 'Animal totals = farm totals?'
  },
  'Water adequate?': {
    ta: 'குடிநீர் அளவு போதுமானதா?',
    hi: 'पेयजल पर्याप्त है?',
    en: 'Water adequate?'
  }
};

/**
 * Translates safety gate checklist check names
 */
export function translateSafetyGate(gateName, lang = 'ta') {
  if (!gateName) return '';
  const clean = gateName.trim();
  if (SAFETY_GATE_MAP[clean]) {
    return SAFETY_GATE_MAP[clean][lang] || SAFETY_GATE_MAP[clean].en || clean;
  }
  return clean;
}

/**
 * Translates safety failure and warning messages for Step 10 into native Tamil / Hindi
 */
export function translateSafetyReason(reason, lang = 'ta') {
  if (!reason || typeof reason !== 'string') return reason;
  if (lang === 'en') return reason;

  let r = reason;

  if (lang === 'ta') {
    r = r
      .replace(/Concentrate Overload:/g, 'அடர்தீவனம் மிகைப்பு:')
      .replace(/Toxic Limit:/g, 'நச்சு வரம்பு எச்சரிக்கை:')
      .replace(/Cow #/g, 'கறவை மாடு #')
      .replace(/Growing Heifer #/g, 'வளரும் கிடாரி #')
      .replace(/Heifer #/g, 'கிடாரி #')
      .replace(/Dry Cow #/g, 'வறண்ட மாடு #')
      .replace(/Bull #/g, 'காளை #')
      .replace(/\(1st Lactation\)/g, '(1வது ஈற்று)')
      .replace(/\(2nd\+ Lactation\)/g, '(2+ ஈற்று)')
      .replace(/\(Mid Lactation\)/g, '(நடுப்பருவம்)')
      .replace(/\(Early Lactation\)/g, '(தொடக்கப்பருவம்)')
      .replace(/\(Late Lactation\)/g, '(கடைசிப்பருவம்)')
      .replace(/concentrate ratio/g, 'அடர்தீவன விகிதம்')
      .replace(/exceeds safe 40% DMI limit \(Acidosis Risk\)/g, 'பாதுகாப்பான 40% உலர் தீவன வரம்பை விட அதிகம் (அசிடோசிஸ் ஆபத்து)')
      .replace(/DMI Deficient: Total DM/g, 'உலர் தீவனப் பற்றாக்குறை: மொத்த DM')
      .replace(/is below 95% requirement/g, 'தேவைப்படும் 95% அளவை விடக் குறைவு')
      .replace(/shortfall/g, 'பற்றாக்குறை')
      .replace(/DMI Surplus: Total DM/g, 'உலர் தீவனம் கூடுதல்: மொத்த DM')
      .replace(/exceeds herd capacity/g, 'கொள்ளளவை விட அதிகம்')
      .replace(/ME Surplus: Energy is/g, 'ஆற்றல் கூடுதல்: ஆற்றல்')
      .replace(/ME Deficit: Energy is/g, 'ஆற்றல் பற்றாக்குறை: ஆற்றல்')
      .replace(/above requirement/g, 'தேவைக்கு மேல் உள்ளது')
      .replace(/below requirement/g, 'தேவையை விட குறைவு')
      .replace(/CP Surplus: Protein is/g, 'புரதம் கூடுதல்: புரதம்')
      .replace(/CP Deficit: Protein is/g, 'புரதம் பற்றாக்குறை: புரதம்')
      .replace(/Calcium Deficit: Supply is/g, 'சுண்ணாம்புச்சத்து பற்றாக்குறை: வழங்கல்')
      .replace(/Phosphorus Deficit: Supply is/g, 'மணிச்சத்து பற்றாக்குறை: வழங்கல்')
      .replace(/Water Shortage: Available water/g, 'குடிநீர் தட்டுப்பாடு: கிடைக்கும் நீர்')
      .replace(/is less than required/g, 'தேவைப்படும் அளவை விடக் குறைவு')
      .replace(/Animal totals mismatch: Animal sum is/g, 'மாடுகளின் மொத்த கூட்டு வேறுபாடு: மாடுகளின் கூட்டு')
      .replace(/vs farm total/g, 'பண்ணை மொத்தம்:')
      .replace(/by/g, 'பற்றாக்குறை:')
      .replace(/L\/day/g, 'லிட்டர்/நாள்')
      .replace(/allocated/g, 'வழங்கப்பட்டது');
  } else if (lang === 'hi') {
    r = r
      .replace(/Concentrate Overload:/g, 'दाना मिश्रण अत्यधिक:')
      .replace(/Toxic Limit:/g, 'विषाक्तता सीमा चेतावनी:')
      .replace(/Cow #/g, 'दुधारू गाय #')
      .replace(/Growing Heifer #/g, 'बछिया (हीफर) #')
      .replace(/Heifer #/g, 'हीफर #')
      .replace(/Dry Cow #/g, 'सूखी गाय #')
      .replace(/Bull #/g, 'सांड #')
      .replace(/\(1st Lactation\)/g, '(1st ब्यात)')
      .replace(/\(2nd\+ Lactation\)/g, '(2+ ब्यात)')
      .replace(/\(Mid Lactation\)/g, '(मध्य दुग्धकाल)')
      .replace(/\(Early Lactation\)/g, '(शुरुआती दुग्धकाल)')
      .replace(/\(Late Lactation\)/g, '(अंतिम दुग्धकाल)')
      .replace(/concentrate ratio/g, 'दाना अनुपात')
      .replace(/exceeds safe 40% DMI limit \(Acidosis Risk\)/g, 'सुरक्षित 40% DMI सीमा से अधिक है (एसिडोसिस का खतरा)')
      .replace(/DMI Deficient: Total DM/g, 'शुष्क पदार्थ कमी: कुल DM')
      .replace(/is below 95% requirement/g, '95% आवश्यकता से कम है')
      .replace(/shortfall/g, 'कमी')
      .replace(/DMI Surplus: Total DM/g, 'शुष्क पदार्थ अधिक: कुल DM')
      .replace(/exceeds herd capacity/g, 'क्षमता से अधिक है')
      .replace(/ME Surplus: Energy is/g, 'ऊर्जा अधिक: ऊर्जा')
      .replace(/ME Deficit: Energy is/g, 'ऊर्जा कमी: ऊर्जा')
      .replace(/above requirement/g, 'आवश्यकता से अधिक है')
      .replace(/below requirement/g, 'आवश्यकता से कम है')
      .replace(/CP Surplus: Protein is/g, 'प्रोटीन अधिक: प्रोटीन')
      .replace(/CP Deficit: Protein is/g, 'प्रोटीन कमी: प्रोटीन')
      .replace(/Calcium Deficit: Supply is/g, 'कैल्शियम कमी: आपूर्ति')
      .replace(/Phosphorus Deficit: Supply is/g, 'फॉस्फोरस कमी: आपूर्ति')
      .replace(/Water Shortage: Available water/g, 'पानी की कमी: उपलब्ध पानी')
      .replace(/is less than required/g, 'आवश्यक मात्रा से कम है')
      .replace(/Animal totals mismatch: Animal sum is/g, 'पशु योग बेमेल: पशुओं का योग')
      .replace(/vs farm total/g, 'बनाम फार्म कुल:')
      .replace(/by/g, 'कमी:')
      .replace(/L\/day/g, 'लीटर/दिन')
      .replace(/allocated/g, 'दी गई मात्रा');
  }

  return r;
}

/**
 * Format string feed details into translated name with quantity
 */
export function formatFeedDetails(detailsStr, lang = 'en') {
  if (!detailsStr || typeof detailsStr !== 'string') return '';
  const parts = detailsStr.split('+').map(p => p.trim()).filter(Boolean);
  const formatted = parts.map(part => {
    const match = part.match(/^([\d.]+)\s*(?:kg|g)?\s*(.+)$/i);
    if (match) {
      const qty = match[1];
      const feedName = match[2].trim();
      const trFeed = translateFeed(feedName, lang) || feedName;
      const unit = lang === 'ta' ? 'கிலோ' : lang === 'hi' ? 'किग्रा' : 'kg';
      return `${trFeed} (${qty} ${unit})`;
    }
    return translateFeed(part, lang) || part;
  });
  return formatted.join(' + ');
}

/**
 * Get exact feed name(s) with quantity for green fodder
 */
export function getAnimalGreenDetails(cow, selectedFeeds = [], lang = 'en') {
  if (!cow) return '';
  if (cow.greenFodderDetails && !cow.greenFodderDetails.toLowerCase().includes('green fodder')) {
    return formatFeedDetails(cow.greenFodderDetails, lang);
  }
  if (cow.feedIngredients && typeof cow.feedIngredients === 'object') {
    const greenParts = [];
    for (const [fname, fkg] of Object.entries(cow.feedIngredients)) {
      const feedObj = selectedFeeds.find(f => f.name?.toLowerCase() === fname.toLowerCase());
      const cat = (feedObj?.category || '').toLowerCase();
      if ((cat.includes('green') || cat.includes('fodder') || cat.includes('silage') || cat.includes('grass')) && Number(fkg) > 0) {
        const trFeed = translateFeed(fname, lang) || fname;
        const unit = lang === 'ta' ? 'கிலோ' : lang === 'hi' ? 'किग्रा' : 'kg';
        greenParts.push(`${trFeed} (${Number(fkg).toFixed(1)} ${unit})`);
      }
    }
    if (greenParts.length > 0) return greenParts.join(' + ');
  }
  const greenFeeds = selectedFeeds.filter(f => {
    const cat = (f.category || '').toLowerCase();
    return (cat.includes('green') || cat.includes('fodder') || cat.includes('silage') || cat.includes('grass')) && Number(f.quantityKg) > 0;
  });
  if (greenFeeds.length === 1 && (cow.greenFodderKg || 0) > 0) {
    const trFeed = translateFeed(greenFeeds[0].name, lang) || greenFeeds[0].name;
    const unit = lang === 'ta' ? 'கிலோ' : lang === 'hi' ? 'किग्रा' : 'kg';
    return `${trFeed} (${Number(cow.greenFodderKg).toFixed(1)} ${unit})`;
  }
  return '';
}

/**
 * Get exact feed name(s) with quantity for dry fodder
 */
export function getAnimalDryDetails(cow, selectedFeeds = [], lang = 'en') {
  if (!cow) return '';
  if (cow.dryFodderDetails && !cow.dryFodderDetails.toLowerCase().includes('dry fodder')) {
    return formatFeedDetails(cow.dryFodderDetails, lang);
  }
  if (cow.feedIngredients && typeof cow.feedIngredients === 'object') {
    const dryParts = [];
    for (const [fname, fkg] of Object.entries(cow.feedIngredients)) {
      const feedObj = selectedFeeds.find(f => f.name?.toLowerCase() === fname.toLowerCase());
      const cat = (feedObj?.category || '').toLowerCase();
      if ((cat.includes('dry') || cat.includes('straw') || cat.includes('hay') || cat.includes('stover')) && Number(fkg) > 0) {
        const trFeed = translateFeed(fname, lang) || fname;
        const unit = lang === 'ta' ? 'கிலோ' : lang === 'hi' ? 'किग्रा' : 'kg';
        dryParts.push(`${trFeed} (${Number(fkg).toFixed(1)} ${unit})`);
      }
    }
    if (dryParts.length > 0) return dryParts.join(' + ');
  }
  const dryFeeds = selectedFeeds.filter(f => {
    const cat = (f.category || '').toLowerCase();
    return (cat.includes('dry') || cat.includes('straw') || cat.includes('hay') || cat.includes('stover')) && Number(f.quantityKg) > 0;
  });
  if (dryFeeds.length === 1 && (cow.dryFodderKg || 0) > 0) {
    const trFeed = translateFeed(dryFeeds[0].name, lang) || dryFeeds[0].name;
    const unit = lang === 'ta' ? 'கிலோ' : lang === 'hi' ? 'किग्रा' : 'kg';
    return `${trFeed} (${Number(cow.dryFodderKg).toFixed(1)} ${unit})`;
  }
  return '';
}

/**
 * Get exact feed name(s) with quantity for concentrate
 */
export function getAnimalConcDetails(cow, selectedFeeds = [], lang = 'en') {
  if (!cow) return '';
  if (cow.concentrateDetails && !cow.concentrateDetails.toLowerCase().includes('concentrate')) {
    return formatFeedDetails(cow.concentrateDetails, lang);
  }
  if (cow.feedIngredients && typeof cow.feedIngredients === 'object') {
    const concParts = [];
    for (const [fname, fkg] of Object.entries(cow.feedIngredients)) {
      const feedObj = selectedFeeds.find(f => f.name?.toLowerCase() === fname.toLowerCase());
      const cat = (feedObj?.category || '').toLowerCase();
      if ((cat.includes('concentrate') || cat.includes('mash') || cat.includes('cake') || cat.includes('bran') || cat.includes('grain')) && Number(fkg) > 0) {
        const trFeed = translateFeed(fname, lang) || fname;
        const unit = lang === 'ta' ? 'கிலோ' : lang === 'hi' ? 'किग्रा' : 'kg';
        concParts.push(`${trFeed} (${Number(fkg).toFixed(1)} ${unit})`);
      }
    }
    if (concParts.length > 0) return concParts.join(' + ');
  }
  const concFeeds = selectedFeeds.filter(f => {
    const cat = (f.category || '').toLowerCase();
    return (cat.includes('concentrate') || cat.includes('mash') || cat.includes('cake') || cat.includes('bran') || cat.includes('grain')) && Number(f.quantityKg) > 0;
  });
  if (concFeeds.length === 1 && (cow.concentrateKg || 0) > 0) {
    const trFeed = translateFeed(concFeeds[0].name, lang) || concFeeds[0].name;
    const unit = lang === 'ta' ? 'கிலோ' : lang === 'hi' ? 'किग्रा' : 'kg';
    return `${trFeed} (${Number(cow.concentrateKg).toFixed(1)} ${unit})`;
  }
  return '';
}
