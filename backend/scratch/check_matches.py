import sys
sys.path.append('.')
from nutrition_engine import load_mineral_dataset
df = load_mineral_dataset()
feeds = ["Napier", "Napier Grass", "Green Pasture", "Sugarcane Bagasse", "Mustard Cake", "Commercial Dairy Pellets"]
for f in feeds:
    f_name_lower = f.lower()
    matched_min = None
    for _, r in df.iterrows():
        ing = str(r["Ingredient"]).strip().lower()
        if ing == f_name_lower or (len(ing) > 3 and (ing in f_name_lower or f_name_lower in ing)):
            matched_min = r
            break
    if matched_min is not None:
        print(f, "-> matched:", matched_min["Ingredient"], "Ca%:", matched_min.get("Ca (%)"), "P%:", matched_min.get("P (%)"))
    else:
        print(f, "-> NOT MATCHED")
