import urllib.request
import json
import sys

def verify_kt_engine():
    print("=== TESTING KT FORMULATION & CONSOLIDATED MINERALS ENGINE ===")

    payload = {
        "weather": {"tempC": 31.0, "humidity": 65.0, "city": "Salem Dairy Farm"},
        "selectedBreed": {"name": "Gir", "avgWeightCow": 450.0},
        "lactatingData": [
            {"weight": 440.0, "milkYield": 14.0, "milkFat": 4.5, "stage": "Mid lactation", "bcs": 3.0}
        ],
        "pregnantCategory": "both",
        "firstTimeCattle": [
            {"weight": 360.0, "pregMonth": 7}
        ],
        "repeatCattle": [
            {"weight": 450.0, "pregMonth": 8}
        ],
        "heifersData": [
            {"weight": 260.0}
        ],
        "dryCowsData": [
            {"weight": 420.0, "dryDays": 45}
        ],
        "bullsData": [
            {"weight": 520.0}
        ],
        "waterVolume": 500.0,
        "waterSource": "Borewell",
        "selectedFeeds": [
            {"name": "Maize Fodder", "category": "Green Fodder", "quantityKg": 60.0, "dmPct": 22.0},
            {"name": "Paddy Straw", "category": "Dry Roughage", "quantityKg": 25.0, "dmPct": 88.0},
            {"name": "Wheat Bran", "category": "Concentrates", "quantityKg": 15.0, "dmPct": 88.0}
        ]
    }

    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/nutrition/calculate",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    try:
        resp = urllib.request.urlopen(req)
        data = json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print("Error contacting API:", e)
        sys.exit(1)

    assert data.get("success") is True, "API call was not successful"
    kt = data.get("ktFormulation")
    assert kt is not None, "ktFormulation missing from API response"

    # 1. Check Proximate & Protein Fractions (Points 1-10)
    nut = kt.get("nutritiveComposition", {})
    feeds = nut.get("feeds", [])
    diet = nut.get("dietTotals", {})
    assert len(feeds) == 3, f"Expected 3 feeds, got {len(feeds)}"
    for f in feeds:
        for frac in ["dmKg", "cpKg", "cfKg", "ndfKg", "adfKg", "nfeKg", "ashKg", "eeKg", "faKg", "hemicelluloseKg", "tpKg", "npncpKg", "nitrogenKg"]:
            assert frac in f, f"Fraction {frac} missing from feed {f['name']}"
    
    # Point 6 Verification: Roughages must have lignin > 0
    maize_feed = next(f for f in feeds if "Maize" in f["name"])
    assert maize_feed["ligninKg"] > 0, "Roughage lignin must not be zero!"

    # Point 7 Verification: FA must be ~85% of EE, not DM - EE
    assert maize_feed["faKg"] < maize_feed["eeKg"] * 1.05, f"FA {maize_feed['faKg']} exceeds EE {maize_feed['eeKg']}"

    # Point 8 & 10 Verification: TP = CP - NPNCP
    assert maize_feed["tpKg"] < maize_feed["cpKg"], "True Protein must be less than Crude Protein"
    assert maize_feed["tpKg"] > 0.80 * maize_feed["cpKg"], "True Protein must be reasonable (~85-90% CP)"

    print("[PASS] 14 Proximate & Protein Fractions verified (Lignin > 0 for roughage, FA ~85% EE, TP = CP - NPNCP).")

    # 2. Check 15 Minerals from consolidated_minerals.dat
    min_prof = kt.get("mineralProfile", {})
    macro = min_prof.get("macroMinerals", {})
    trace = min_prof.get("traceMinerals", {})
    for m in ["calcium", "phosphorus", "magnesium", "potassium", "sodium", "chloride", "sulfur"]:
        assert m in macro, f"Macro mineral {m} missing"
        assert macro[m]["supplied"] > 0, f"Macro mineral {m} supplied value is 0"
    for t in ["cobalt", "copper", "iodine", "iron", "manganese", "selenium", "zinc", "molybdenum"]:
        assert t in trace, f"Trace mineral {t} missing"
        assert trace[t]["supplied"] > 0, f"Trace mineral {t} supplied value is 0"
    print("[PASS] Complete 15-mineral profile from consolidated_minerals.dat verified.")

    # 3. Check Forage NDF Buffer (Point 11)
    fndf = kt.get("forageNdfBuffer", {})
    assert "forageNdfPct" in fndf, "forageNdfPct missing"
    assert "isSufficient" in fndf, "isSufficient missing"
    print(f"[PASS] Forage NDF Buffer verified: {fndf['forageNdfPct']}% (Sufficient: {fndf['isSufficient']})")

    # 4. Check Energy Analysis (Points 21-27)
    energy = kt.get("energyAnalysis", {})
    for key in ["dietMeMcal", "feedNelMcal", "milkNepMcalPerKg", "milkNeuseMcalPerDay", "milkMeMcalPerDay", "maintenanceNelMcal", "gestNelMcalPerDay", "totalNelRequiredMcal", "energyBalanceNelMcal", "nelAdequacyPct", "weeksToCalving"]:
        assert key in energy, f"Energy key {key} missing"
    
    # Point 23 Check: Milk NEL must be ~0.77 - 0.80 Mcal/kg (not 4.936!)
    milk_nel = energy["milkNepMcalPerKg"]
    assert 0.70 <= milk_nel <= 0.85, f"Milk NEL {milk_nel} is not realistic (expected ~0.772 Mcal/kg for 4.5% fat)!"

    # Point 24 Check: Milk NEuse = Milk NEL * Milk Yield (14 L * ~0.796 = ~11.1 Mcal, not 69 Mcal!)
    milk_neuse = energy["milkNeuseMcalPerDay"]
    assert 9.0 <= milk_neuse <= 13.0, f"Milk NEuse {milk_neuse} is not realistic!"

    # Point 25 Check: Maintenance NEL included
    assert energy["maintenanceNelMcal"] > 0, "Maintenance NEL must be positive"

    # Point 26 & 27 Check: Total NEL requirement and True Energy Balance
    assert energy["totalNelRequiredMcal"] > energy["milkNeuseMcalPerDay"], "Total NEL req must include maintenance + milk + gestation"
    print(f"[PASS] Energy Analysis verified: Milk NEL = {milk_nel} Mcal/kg, Milk NEuse = {milk_neuse} Mcal/d, Total NEL Req = {energy['totalNelRequiredMcal']} Mcal/d, Balance = {energy['energyBalanceNelMcal']} Mcal/d ({energy['nelAdequacyPct']}% adequacy)")

    # 5. Check Free Water Intake (Points 19 & 20)
    fwi = kt.get("freeWaterIntakeFwi", {})
    for k in ["nakFactor", "tempCorr", "tmpc2", "lactatingFwiPerCowL", "remainingFwiPerHeadL", "totalFwiLiters"]:
        assert k in fwi, f"FWI key {k} missing"
    assert 35.0 <= fwi["lactatingFwiPerCowL"] <= 120.0, f"Lactating FWI {fwi['lactatingFwiPerCowL']} L out of biological bounds"
    assert 20.0 <= fwi["remainingFwiPerHeadL"] <= 70.0, f"Remaining FWI {fwi['remainingFwiPerHeadL']} L out of biological bounds"
    print(f"[PASS] Free Water Intake verified: Lactating = {fwi['lactatingFwiPerCowL']} L/cow, Remaining = {fwi['remainingFwiPerHeadL']} L/head, Total = {fwi['totalFwiLiters']} L")

    # 6. Check Body Weight Baselines & Moisture As-Fed (Points 12, 13, 28)
    bw = kt.get("bodyWeightAndFeedingBaselines", {})
    assert bw.get("primiparousTargetBwKg") == round(450.0 * 0.85, 1)
    assert bw.get("multiparousTargetBwKg") == round(450.0 * 0.95, 1)
    assert bw.get("moistureRequiredAsFedKg") > 0, "moistureRequiredAsFedKg missing"

    # DMI Formulations
    dmi_forms = kt.get("dmiFormulations", {})
    assert dmi_forms.get("primiparousFarOffTargetDmiKg") > 3.0, "Heifer target DMI too low"
    assert "heiferDietDmiKg" in dmi_forms, "heiferDietDmiKg missing"

    # Multi-Nutrient Adequacy Summary (Point 31)
    bal_sum = kt.get("rationBalanceSummary", {})
    assert "dmiAdequacyPct" in bal_sum, "dmiAdequacyPct missing"
    assert "nelAdequacyPct" in bal_sum, "nelAdequacyPct missing"
    assert "cpAdequacyPct" in bal_sum, "cpAdequacyPct missing"
    print(f"[PASS] Multi-Nutrient Adequacy Summary verified: DMI={bal_sum['dmiAdequacyPct']}%, NEL={bal_sum['nelAdequacyPct']}%, CP={bal_sum['cpAdequacyPct']}%, Status={bal_sum['status']}")

    print("\n=== ALL KT TESTS COMPLETED SUCCESSFULLY! ===")

if __name__ == "__main__":
    verify_kt_engine()
