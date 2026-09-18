// High-Quality Verified Image Catalog for all Cattle Feeds, Fodders, Concentrates & Unconventional Feeds

export const CATEGORY_FALLBACK_IMAGES = {
  'Green Fodder': 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
  'Dry Fodder': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
  'Concentrates': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
  'Unconventional': 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80',
  'Default': 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80'
};

export const FEED_IMAGES = {
  // ==========================================
  // 1. GREEN FODDERS (பசுந்தீவனம்)
  // ==========================================
  maize_fodder: {
    id: 'maize_fodder',
    name: 'Maize Fodder',
    category: 'Green Fodder',
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',
    description: 'Succulent fresh green maize forage rich in energy and highly palatable for dairy cattle.'
  },
  napier_grass: {
    id: 'napier_grass',
    name: 'Napier Grass / CO-4',
    category: 'Green Fodder',
    image: 'https://images.unsplash.com/photo-1599818485292-1262d16eb7f7?auto=format&fit=crop&w=600&q=80',
    description: 'Fast-growing, high-yielding perennial hybrid elephant grass rich in fiber and digestible nutrients.'
  },
  sorghum_fodder: {
    id: 'sorghum_fodder',
    name: 'Sorghum Fodder (Jowar)',
    category: 'Green Fodder',
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=600&q=80',
    description: 'Drought-tolerant leafy green sorghum fodder ideal for summer feeding.'
  },
  lucerne: {
    id: 'lucerne',
    name: 'Lucerne (Alfalfa)',
    category: 'Green Fodder',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
    description: 'Queen of forages; rich in crude protein (19.5%), vitamins, and calcium for high milk producers.'
  },
  berseem: {
    id: 'berseem',
    name: 'Berseem (Egyptian Clover)',
    category: 'Green Fodder',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
    description: 'High-protein winter leguminous clover providing succulent, highly digestible green forage.'
  },
  cowpea_fodder: {
    id: 'cowpea_fodder',
    name: 'Cowpea Fodder (Lobia)',
    category: 'Green Fodder',
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb2250d?auto=format&fit=crop&w=600&q=80',
    description: 'Quick-growing nutritious legume fodder packed with natural protein and essential minerals.'
  },
  rice_grass: {
    id: 'rice_grass',
    name: 'Rice Grass / Para Grass',
    category: 'Green Fodder',
    image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=600&q=80',
    description: 'Lush semi-aquatic forage grass ideal for humid conditions and daily roughage maintenance.'
  },
  green_pasture_grass: {
    id: 'green_pasture_grass',
    name: 'Green Pasture Grass',
    category: 'Green Fodder',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
    description: 'Natural mixed meadow grazing grass providing essential bulk fiber and carotene.'
  },
  oats_fodder: {
    id: 'oats_fodder',
    name: 'Oats Fodder',
    category: 'Green Fodder',
    image: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=600&q=80',
    description: 'Tender winter cereal fodder with high sugar content and excellent digestibility for calves & milking cows.'
  },
  silage: {
    id: 'silage',
    name: 'Maize / Corn Silage',
    category: 'Green Fodder',
    image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80',
    description: 'Fermented anaerobic preserved green corn providing year-round steady energy and lactic acid.'
  },

  // ==========================================
  // 2. DRY FODDERS (உலர் தீவனம்)
  // ==========================================
  wheat_straw: {
    id: 'wheat_straw',
    name: 'Wheat Straw (Bhoosa / Turi)',
    category: 'Dry Fodder',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
    description: 'Dry golden wheat straw; essential source of rumen-scratching effective NDF fiber.'
  },
  paddy_straw: {
    id: 'paddy_straw',
    name: 'Paddy Straw (Rice Straw)',
    category: 'Dry Fodder',
    image: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=600&q=80',
    description: 'Traditional dry rice straw roughage used widely across South Asia as foundational cattle bulk.'
  },
  groundnut_haulm: {
    id: 'groundnut_haulm',
    name: 'Groundnut Haulm / Vines',
    category: 'Dry Fodder',
    image: 'https://images.unsplash.com/photo-1567892328659-478a870b92c4?auto=format&fit=crop&w=600&q=80',
    description: 'Dried peanut plant leaves & vines with high protein (13.5%) and pleasant aroma for cattle.'
  },
  mixed_grass_hay: {
    id: 'mixed_grass_hay',
    name: 'Mixed Grass Hay',
    category: 'Dry Fodder',
    image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=600&q=80',
    description: 'Sun-cured premium meadow hay bales providing clean fiber without dust or spoilage.'
  },
  jowar_hay: {
    id: 'jowar_hay',
    name: 'Jowar / Sorghum Stover (Kadbi)',
    category: 'Dry Fodder',
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=600&q=80',
    description: 'Chopped dry sorghum stover providing sturdy dry matter and digestible cell walls.'
  },
  sugarcane_bagasse: {
    id: 'sugarcane_bagasse',
    name: 'Sugarcane Bagasse / Tops',
    category: 'Dry Fodder',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    description: 'Fibrous agro-industrial byproduct providing bulk roughage and maintenance dry matter.'
  },

  // ==========================================
  // 3. CONCENTRATES & GRAINS (அடர்தீவனம்)
  // ==========================================
  wheat_bran: {
    id: 'wheat_bran',
    name: 'Wheat Bran (Choker)',
    category: 'Concentrates',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    description: 'Flaky outer layer of wheat kernel rich in phosphorus, mild laxative value, and B vitamins.'
  },
  maize_grain: {
    id: 'maize_grain',
    name: 'Maize Grain Crushed (Makka)',
    category: 'Concentrates',
    image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=600&q=80',
    description: 'Coarsely crushed yellow corn kernels; the golden standard high-energy starch grain for milk synthesis.'
  },
  soybean_meal: {
    id: 'soybean_meal',
    name: 'Soybean Meal (DOC)',
    category: 'Concentrates',
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80',
    description: 'Premier de-oiled soybean meal providing 48% crude protein with balanced amino acids for dairy cows.'
  },
  cottonseed_cake: {
    id: 'cottonseed_cake',
    name: 'Cottonseed Cake (Khal)',
    category: 'Concentrates',
    image: 'https://images.unsplash.com/photo-1599818485292-1262d16eb7f7?auto=format&fit=crop&w=600&q=80',
    description: 'Pressed cottonseed oil cake rich in bypass fat and protein, boosting milk fat percentage.'
  },
  mustard_cake: {
    id: 'mustard_cake',
    name: 'Mustard / Rapeseed Cake (Sarson Khal)',
    category: 'Concentrates',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    description: 'Traditional pungent oil cake offering 36% protein and natural rumen antimicrobial balance.'
  },
  groundnut_cake: {
    id: 'groundnut_cake',
    name: 'Groundnut Cake',
    category: 'Concentrates',
    image: 'https://images.unsplash.com/photo-1567892328659-478a870b92c4?auto=format&fit=crop&w=600&q=80',
    description: 'Sweet, highly palatable peanut oil meal containing 45% protein for rapid weight gain and milk yield.'
  },
  rice_bran: {
    id: 'rice_bran',
    name: 'De-oiled Rice Bran (DORB)',
    category: 'Concentrates',
    image: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=600&q=80',
    description: 'Fine golden rice bran providing cost-effective energy and consistent digestible fiber.'
  },
  commercial_pellets: {
    id: 'commercial_pellets',
    name: 'Commercial Dairy Compound Pellets',
    category: 'Concentrates',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=80',
    description: 'Scientifically balanced compound pellets fortified with vitamins, minerals, and 20% protein.'
  },
  barley_grain: {
    id: 'barley_grain',
    name: 'Barley Grain Crushed (Jau)',
    category: 'Concentrates',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    description: 'Slow-fermenting wholesome grain providing safe rumen starch without risk of subacute acidosis.'
  },
  oats_grain: {
    id: 'oats_grain',
    name: 'Oats Grain Crushed',
    category: 'Concentrates',
    image: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=600&q=80',
    description: 'Rolled oat groats with tender hull fiber, ideal for high-producing dairy cows and calves.'
  },
  sesame_cake: {
    id: 'sesame_cake',
    name: 'Sesame / Til Cake',
    category: 'Concentrates',
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80',
    description: 'Pressed gingelly / sesame cake packed with methionine and 38% crude protein.'
  },
  sunflower_meal: {
    id: 'sunflower_meal',
    name: 'Sunflower Meal',
    category: 'Concentrates',
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80',
    description: 'De-hulled sunflower seed meal rich in sulfur amino acids and digestive fiber.'
  },

  // ==========================================
  // 4. UNCONVENTIONAL FEEDS (மாற்று தீவனம்)
  // ==========================================
  brewer_grain: {
    id: 'brewer_grain',
    name: 'Spent Brewer Grain (Wet)',
    category: 'Unconventional',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    description: 'Moist protein-rich malted barley residue (26% CP) stimulating rumen microbes and milk letdown.'
  },
  citrus_pulp: {
    id: 'citrus_pulp',
    name: 'Citrus Fruit Pulp',
    category: 'Unconventional',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    description: 'Dried citrus fruit peel & pulp rich in digestible pectin and energy without starch overload.'
  },
  cane_molasses: {
    id: 'cane_molasses',
    name: 'Cane Molasses',
    category: 'Unconventional',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    description: 'Dense dark sugarcane syrup boosting feed intake, masking unpalatable feeds, and supplying instant energy.'
  },
  azolla: {
    id: 'azolla',
    name: 'Azolla Pinnata (Fresh)',
    category: 'Unconventional',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80',
    description: 'Fast-multiplying aquatic fern with 24% crude protein and bio-available minerals cultivated easily on farm.'
  },

  // ─── Additional Concentrates ───────────────────────────────
  sorghum_grain: {
    id: 'sorghum_grain',
    name: 'Sorghum Grain (Jowar Grain)',
    category: 'Concentrates',
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=600&q=80',
    description: 'Drought-tolerant cereal grain providing cost-effective energy and bypass starch for dairy cattle.'
  },
  bajra_grain: {
    id: 'bajra_grain',
    name: 'Bajra Grain (Pearl Millet)',
    category: 'Concentrates',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    description: 'High-energy pearl millet grain with excellent digestibility and phosphorus content.'
  },
  rice_polish: {
    id: 'rice_polish',
    name: 'Rice Polish / Rice Bran (Oily)',
    category: 'Concentrates',
    image: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=600&q=80',
    description: 'Oily rice polish rich in fat and energy, commonly used to boost milk fat percentage.'
  },
  whole_cottonseed: {
    id: 'whole_cottonseed',
    name: 'Whole Cottonseed',
    category: 'Concentrates',
    image: 'https://images.unsplash.com/photo-1599818485292-1262d16eb7f7?auto=format&fit=crop&w=600&q=80',
    description: 'Whole cottonseed with 22% protein and 17% fat; excellent bypass fat source for high milk producers.'
  },
  black_gram: {
    id: 'black_gram',
    name: 'Black Gram (Urad)',
    category: 'Concentrates',
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80',
    description: 'Protein-rich pulse grain (29% CP) providing high-quality rumen-degradable protein.'
  },
  brewers_grain_dry: {
    id: 'brewers_grain_dry',
    name: "Dried Brewer's Grain",
    category: 'Concentrates',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    description: 'Dried malted barley residue; 25% crude protein with consistent supply year-round.'
  },
  sugarcane_tops: {
    id: 'sugarcane_tops',
    name: 'Sugarcane Tops (Green)',
    category: 'Green Fodder',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    description: 'Fresh green sugarcane tops and leafy tops providing succulent bulk fiber and instant energy.'
  },

  // ─── Additional Unconventionals ─────────────────────────────
  corn_gluten_meal: {
    id: 'corn_gluten_meal',
    name: 'Corn Gluten Meal',
    category: 'Unconventional',
    image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=600&q=80',
    description: 'High-protein (58% CP) maize processing by-product rich in bypass protein and pigmenting xanthophyll.'
  },
  guar_meal: {
    id: 'guar_meal',
    name: 'Guar Meal (Cluster Bean)',
    category: 'Unconventional',
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb2250d?auto=format&fit=crop&w=600&q=80',
    description: 'Cluster bean by-product meal; 50% protein, rich in natural gum-processing residue nutrients.'
  },
  corn_steep_liquor: {
    id: 'corn_steep_liquor',
    name: 'Corn Steep Liquor',
    category: 'Unconventional',
    image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=600&q=80',
    description: 'Liquid corn wet-milling by-product; high in soluble protein and B-vitamins for rumen microbes.'
  },
  tamarind_seed: {
    id: 'tamarind_seed',
    name: 'Tamarind Seed Powder',
    category: 'Unconventional',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80',
    description: 'Dried tamarind seed powder used as energy supplement and natural binder in mixed rations.'
  },
  mango_seed: {
    id: 'mango_seed',
    name: 'Mango Seed Kernel',
    category: 'Unconventional',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80',
    description: 'Dried mango kernel providing fat-rich energy for cattle during scarcity seasons.'
  },
  babul_pods: {
    id: 'babul_pods',
    name: 'Babul Pods (Acacia)',
    category: 'Unconventional',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
    description: 'Acacia nilotica pods providing tannin-rich rumen-protective protein and energy for cattle.'
  },
  jackfruit_waste: {
    id: 'jackfruit_waste',
    name: 'Jackfruit Waste',
    category: 'Unconventional',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80',
    description: 'Jackfruit peel and seed waste; a succulent locally-available energy supplement.'
  },
  tomato_waste: {
    id: 'tomato_waste',
    name: 'Tomato Waste',
    category: 'Unconventional',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80',
    description: 'Tomato processing by-product (peel, seeds, pulp) rich in lycopene and digestible energy.'
  },
  banana_root: {
    id: 'banana_root',
    name: 'Banana Root / Pseudostem',
    category: 'Unconventional',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80',
    description: 'Banana pseudostem and root material providing bulk moisture and potassium to cattle rations.'
  },
  potato_waste: {
    id: 'potato_waste',
    name: 'Potato Waste',
    category: 'Unconventional',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80',
    description: 'Potato peel and processing waste; an energy-dense starchy supplement used in cattle feeds.'
  },
  seaweed_meal: {
    id: 'seaweed_meal',
    name: 'Seaweed Meal (Sargassum)',
    category: 'Unconventional',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80',
    description: 'Marine algae meal rich in trace minerals, iodine, and prebiotic polysaccharides for gut health.'
  },
  jowar_cake: {
    id: 'jowar_cake',
    name: 'Jowar Cake',
    category: 'Unconventional',
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=600&q=80',
    description: 'Sorghum-based industrial processing by-product used as a supplementary feed resource.'
  },
  tapioca_starch_waste: {
    id: 'tapioca_starch_waste',
    name: 'Tapioca Starch Waste',
    category: 'Unconventional',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80',
    description: 'Cassava/tapioca starch extraction residue rich in fermentable carbohydrates.'
  },
  sugarcane_bagasse_unc: {
    id: 'sugarcane_bagasse_unc',
    name: 'Sugarcane Bagasse (Pith)',
    category: 'Unconventional',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    description: 'Bagasse pith from sugar mills, used as a dry bulk roughage extender in cattle rations.'
  },
  cocoa_pods: {
    id: 'cocoa_pods',
    name: 'Cocoa Pods',
    category: 'Unconventional',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80',
    description: 'Cacao husk and shell residue providing minerals and energy in smallholder livestock systems.'
  },
  rain_tree_pods: {
    id: 'rain_tree_pods',
    name: 'Rain Tree Pods (Saman)',
    category: 'Unconventional',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
    description: 'Sweet Samanea saman pods (16.7% CP) highly palatable to cattle, rich in natural sugars and protein.'
  },
  subabul_seeds: {
    id: 'subabul_seeds',
    name: 'Subabul Seeds (Leucaena)',
    category: 'Unconventional',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
    description: 'Leucaena leucocephala seeds providing 29% crude protein; feed at limited quantities to avoid mimosine.'
  },
  niger_seed_cake: {
    id: 'niger_seed_cake',
    name: 'Niger Seed Cake (Guizotia)',
    category: 'Unconventional',
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80',
    description: 'Guizotia abyssinica oil cake; 34% crude protein, high in sulfur amino acids methionine and cystine.'
  },
  rubber_seed_cake: {
    id: 'rubber_seed_cake',
    name: 'Rubber Seed Cake',
    category: 'Unconventional',
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80',
    description: 'Hevea brasiliensis seed cake; 35% crude protein, used as a protein supplement after detoxification.'
  }
};

/**
 * Helper function to retrieve high-resolution photo URL for any feed name or ID
 */
export function getFeedImage(feedOrName, category = '') {
  if (!feedOrName) return CATEGORY_FALLBACK_IMAGES.Default;

  const idOrName = typeof feedOrName === 'string' ? feedOrName : (feedOrName.id || feedOrName.name || '');
  const cleanKey = String(idOrName).toLowerCase().replace(/[^a-z0-9]/g, '_');

  // Exact ID match
  if (FEED_IMAGES[cleanKey]) {
    return FEED_IMAGES[cleanKey].image;
  }

  // Exact key match from entries
  const directMatch = Object.values(FEED_IMAGES).find(item => 
    item.id.toLowerCase() === cleanKey || 
    item.name.toLowerCase() === String(idOrName).toLowerCase()
  );
  if (directMatch) return directMatch.image;

  // Fuzzy Keyword Matching
  const lower = String(idOrName).toLowerCase();
  if (lower.includes('maize') || lower.includes('corn') || lower.includes('makka')) {
    return lower.includes('grain') || lower.includes('crushed') 
      ? FEED_IMAGES.maize_grain.image 
      : lower.includes('silage') 
        ? FEED_IMAGES.silage.image 
        : FEED_IMAGES.maize_fodder.image;
  }
  if (lower.includes('napier') || lower.includes('co-4') || lower.includes('co4') || lower.includes('elephant')) return FEED_IMAGES.napier_grass.image;
  if (lower.includes('sorghum') || lower.includes('jowar') || lower.includes('kadbi') || lower.includes('cholam')) {
    return lower.includes('straw') || lower.includes('stover') || lower.includes('hay') 
      ? FEED_IMAGES.jowar_hay.image 
      : FEED_IMAGES.sorghum_fodder.image;
  }
  if (lower.includes('lucerne') || lower.includes('alfalfa') || lower.includes('kuthirai')) return FEED_IMAGES.lucerne.image;
  if (lower.includes('berseem') || lower.includes('clover')) return FEED_IMAGES.berseem.image;
  if (lower.includes('cowpea') || lower.includes('lobia') || lower.includes('thattapayaru')) return FEED_IMAGES.cowpea_fodder.image;
  if (lower.includes('rice grass') || lower.includes('para grass') || lower.includes('pasture') || lower.includes('grass')) return FEED_IMAGES.rice_grass.image;
  if (lower.includes('oat')) return lower.includes('grain') ? FEED_IMAGES.oats_grain.image : FEED_IMAGES.oats_fodder.image;
  if (lower.includes('silage')) return FEED_IMAGES.silage.image;

  // Dry Fodder Keywords
  if (lower.includes('wheat straw') || lower.includes('bhoosa') || lower.includes('turi')) return FEED_IMAGES.wheat_straw.image;
  if (lower.includes('paddy straw') || lower.includes('rice straw') || lower.includes('vaikkol') || lower.includes('straw')) return FEED_IMAGES.paddy_straw.image;
  if (lower.includes('groundnut haulm') || lower.includes('peanut vine')) return FEED_IMAGES.groundnut_haulm.image;
  if (lower.includes('hay')) return FEED_IMAGES.mixed_grass_hay.image;
  if (lower.includes('bagasse') || lower.includes('sugarcane')) return lower.includes('molasses') ? FEED_IMAGES.cane_molasses.image : FEED_IMAGES.sugarcane_bagasse.image;

  // Concentrates Keywords
  if (lower.includes('wheat bran') || lower.includes('choker') || lower.includes('thavidu')) return FEED_IMAGES.wheat_bran.image;
  if (lower.includes('soybean') || lower.includes('soya')) return FEED_IMAGES.soybean_meal.image;
  if (lower.includes('cottonseed') || lower.includes('paruthi') || lower.includes('khal')) return FEED_IMAGES.cottonseed_cake.image;
  if (lower.includes('mustard') || lower.includes('sarson')) return FEED_IMAGES.mustard_cake.image;
  if (lower.includes('groundnut cake') || lower.includes('kadalai')) return FEED_IMAGES.groundnut_cake.image;
  if (lower.includes('rice bran') || lower.includes('dorb')) return FEED_IMAGES.rice_bran.image;
  if (lower.includes('pellet') || lower.includes('commercial') || lower.includes('compound')) return FEED_IMAGES.commercial_pellets.image;
  if (lower.includes('barley') || lower.includes('jau')) return FEED_IMAGES.barley_grain.image;
  if (lower.includes('sesame') || lower.includes('til') || lower.includes('ellu')) return FEED_IMAGES.sesame_cake.image;
  if (lower.includes('sunflower')) return FEED_IMAGES.sunflower_meal.image;

  // Unconventional Keywords
  if (lower.includes('brewer') || lower.includes('spent grain')) return lower.includes('dry') ? FEED_IMAGES.brewers_grain_dry.image : FEED_IMAGES.brewer_grain.image;
  if (lower.includes('citrus') || lower.includes('orange') || lower.includes('pulp')) return FEED_IMAGES.citrus_pulp.image;
  if (lower.includes('molasses') || lower.includes('sugar syrup')) return FEED_IMAGES.cane_molasses.image;
  if (lower.includes('azolla') || lower.includes('fern')) return FEED_IMAGES.azolla.image;
  if (lower.includes('corn gluten') || lower.includes('maize gluten')) return FEED_IMAGES.corn_gluten_meal?.image || FEED_IMAGES.maize_grain.image;
  if (lower.includes('guar') || lower.includes('cluster bean')) return FEED_IMAGES.guar_meal?.image || CATEGORY_FALLBACK_IMAGES['Unconventional'];
  if (lower.includes('corn steep') || lower.includes('steep liquor')) return FEED_IMAGES.corn_steep_liquor?.image || FEED_IMAGES.maize_grain.image;
  if (lower.includes('tamarind')) return FEED_IMAGES.tamarind_seed?.image || CATEGORY_FALLBACK_IMAGES['Unconventional'];
  if (lower.includes('mango seed') || lower.includes('mango kernel')) return FEED_IMAGES.mango_seed?.image || CATEGORY_FALLBACK_IMAGES['Unconventional'];
  if (lower.includes('babul') || lower.includes('acacia')) return FEED_IMAGES.babul_pods?.image || CATEGORY_FALLBACK_IMAGES['Unconventional'];
  if (lower.includes('jackfruit') || lower.includes('jack fruit')) return FEED_IMAGES.jackfruit_waste?.image || CATEGORY_FALLBACK_IMAGES['Unconventional'];
  if (lower.includes('tomato')) return FEED_IMAGES.tomato_waste?.image || CATEGORY_FALLBACK_IMAGES['Unconventional'];
  if (lower.includes('banana') || lower.includes('pseudostem')) return FEED_IMAGES.banana_root?.image || CATEGORY_FALLBACK_IMAGES['Unconventional'];
  if (lower.includes('potato')) return FEED_IMAGES.potato_waste?.image || CATEGORY_FALLBACK_IMAGES['Unconventional'];
  if (lower.includes('seaweed') || lower.includes('algae') || lower.includes('sargassum')) return FEED_IMAGES.seaweed_meal?.image || CATEGORY_FALLBACK_IMAGES['Unconventional'];
  if (lower.includes('tapioca') || lower.includes('cassava')) return FEED_IMAGES.tapioca_starch_waste?.image || CATEGORY_FALLBACK_IMAGES['Unconventional'];
  if (lower.includes('cocoa') || lower.includes('cacao')) return FEED_IMAGES.cocoa_pods?.image || CATEGORY_FALLBACK_IMAGES['Unconventional'];
  if (lower.includes('rain tree') || lower.includes('saman') || lower.includes('monkey pod')) return FEED_IMAGES.rain_tree_pods?.image || CATEGORY_FALLBACK_IMAGES['Unconventional'];
  if (lower.includes('subabul') || lower.includes('leucaena') || lower.includes('ipil')) return FEED_IMAGES.subabul_seeds?.image || CATEGORY_FALLBACK_IMAGES['Unconventional'];
  if (lower.includes('niger') || lower.includes('guizotia')) return FEED_IMAGES.niger_seed_cake?.image || CATEGORY_FALLBACK_IMAGES['Unconventional'];
  if (lower.includes('rubber seed') || lower.includes('hevea')) return FEED_IMAGES.rubber_seed_cake?.image || CATEGORY_FALLBACK_IMAGES['Unconventional'];
  if (lower.includes('bajra') || lower.includes('pearl millet')) return FEED_IMAGES.bajra_grain?.image || CATEGORY_FALLBACK_IMAGES['Concentrates'];
  if (lower.includes('rice polish')) return FEED_IMAGES.rice_polish?.image || FEED_IMAGES.rice_bran.image;
  if (lower.includes('black gram') || lower.includes('urad')) return FEED_IMAGES.black_gram?.image || FEED_IMAGES.soybean_meal.image;
  if (lower.includes('jowar cake') || lower.includes('jowar_cake')) return FEED_IMAGES.jowar_cake?.image || FEED_IMAGES.sorghum_grain?.image || CATEGORY_FALLBACK_IMAGES['Unconventional'];
  if (lower.includes('sugarcane top') || lower.includes('cane top')) return FEED_IMAGES.sugarcane_tops?.image || FEED_IMAGES.sugarcane_bagasse.image;

  // Category level fallback
  const cat = typeof feedOrName === 'object' ? (feedOrName.category || category) : category;
  return CATEGORY_FALLBACK_IMAGES[cat] || CATEGORY_FALLBACK_IMAGES.Default;
}
