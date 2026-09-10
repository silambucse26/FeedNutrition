import urllib.request
import json

payload = {
    "weather": {"tempC": 31.0, "humidity": 65.0, "city": "Chennai"},
    "selectedBreed": {"name": "Gir", "avgWeightCow": 450.0},
    "lactatingData": [{"weight": 440.0, "milkYield": 14.0, "milkFat": 4.5, "stage": "Mid lactation", "bcs": 3.0}],
    "pregnantCategory": "both",
    "firstTimeCattle": [{"weight": 360.0, "pregMonth": 7}],
    "repeatCattle": [{"weight": 450.0, "pregMonth": 8}],
    "heifersData": [{"weight": 260.0}],
    "dryCowsData": [{"weight": 420.0, "dryDays": 45}],
    "bullsData": [{"weight": 520.0}],
    "waterVolume": 600.0,
    "waterSource": "Borewell",
    "selectedFeeds": [
        {"name": "Napier", "category": "Green Fodder", "quantityKg": 10.0, "dmPct": 20.0},
        {"name": "Green Pasture", "category": "Green Fodder", "quantityKg": 10.0, "dmPct": 22.0},
        {"name": "Sugarcane Bagasse", "category": "Dry Roughage", "quantityKg": 10.0, "dmPct": 90.0},
        {"name": "Mustard Cake", "category": "Concentrates", "quantityKg": 10.0, "dmPct": 90.0},
        {"name": "Commercial Dairy Pellets", "category": "Concentrates", "quantityKg": 10.0, "dmPct": 89.0}
    ]
}

req = urllib.request.Request(
    "http://127.0.0.1:8000/api/nutrition/calculate",
    data=json.dumps(payload).encode("utf-8"),
    headers={"Content-Type": "application/json"}
)
resp = urllib.request.urlopen(req)
data = json.loads(resp.read().decode("utf-8"))

print("SUCCESS:", data.get("success"))
nut = data.get("nutritionAnalysis", {})
fbd = nut.get("feedBreakdown", [])
print("\n--- FEED BREAKDOWN ---")
for f in fbd:
    print(f["name"], "DM:", f.get("dmKg"), "Ca%:", f.get("caPct"), "Ca(g):", f.get("caG"), "P%:", f.get("pPct"), "P(g):", f.get("pG"))
pfr = data.get("practicalFeedingReport", {})
recs = pfr.get("todayRecommendations", [])
print("\n--- TODAY RECOMMENDATIONS ---")
for r in recs:
    print(r.get("name"), "RecKg:", r.get("recommendedKg"), "DM%:", r.get("dmPct"), "DMAlloc:", r.get("dmAllocatedKg"))
print("Mineral mixture G:", pfr.get("mineralMixtureGrams"))
cur_min = nut.get("currentNutrition", {}).get("minerals", {})
rec_min = nut.get("recommendedNutrition", {}).get("minerals", {})
kt = data.get("ktFormulation", {})

print("\n--- CURRENT MINERALS ---")
print("Current Ca supplied:", cur_min.get("calcium", {}).get("suppliedG"), "(Expected: 95.2)")
print("Current Ca feed:", cur_min.get("calcium", {}).get("feedSuppliedG"))
print("Current Ca pasture:", cur_min.get("calcium", {}).get("pastureSuppliedG"))
print("Current P supplied:", cur_min.get("phosphorus", {}).get("suppliedG"))

print("\n--- RECOMMENDED MINERALS ---")
print("Rec Ca supplied:", rec_min.get("calcium", {}).get("suppliedG"))
print("Rec Ca feed:", rec_min.get("calcium", {}).get("feedSuppliedG"))
print("Rec Ca mix:", rec_min.get("calcium", {}).get("mineralMixSuppliedG"))
print("Rec P supplied:", rec_min.get("phosphorus", {}).get("suppliedG"), "(Expected: ~256.8 - 256.9)")
print("Rec P feed:", rec_min.get("phosphorus", {}).get("feedSuppliedG"), "(Expected: ~225.2)")
print("Rec P mix:", rec_min.get("phosphorus", {}).get("mineralMixSuppliedG"), "(Expected: 31.6)")

print("\n--- KT FORMULATION MACRO MINERALS ---")
macro = kt.get("mineralProfile", {}).get("macroMinerals", {})
print("KT Ca supplied:", macro.get("calcium", {}).get("supplied"), "(Expected: 95.2)")
print("KT P supplied:", macro.get("phosphorus", {}).get("supplied"))

print("\n--- ENERGY FORMULA ---")
print("KT NEL formula:", kt.get("energyAnalysis", {}).get("totalNelFormula"))
print("KT Growth NEL:", kt.get("energyAnalysis", {}).get("growthNelMcal"))

print("\n--- WATER INTAKE ---")
fwi = kt.get("freeWaterIntakeFwi", {})
print("KT Water Herd Total:", fwi.get("totalFwiLiters"), "(Expected: 348.9)")
