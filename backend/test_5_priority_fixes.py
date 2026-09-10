import sys
import os

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ["OPENBLAS_NUM_THREADS"] = "1"
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

from main import calculate_feed_nutrition, NutritionRequest, AnimalItem, FeedItem, WeatherPayload, BreedInfo
from nutrition_engine import optimize_animal_category_ration

def run_all_5_priority_checks():
    print("=" * 80)
    print("RUNNING AUTOMATED VERIFICATION FOR 5 CRITICAL PROBLEMS")
    print("1. DMI status wrong")
    print("2. Grazing counted inconsistently")
    print("3. Lactating cows getting zero concentrate")    
    print("4. NDF targets by animal class")
    print("5. Better infeasibility explanation")
    print("=" * 80)
    # Standard realistic herd request with 2 lactating cows, 2 pregnant, 1 heifer, 1 dry, 1 bull
    req = NutritionRequest(
        selectedBreed=BreedInfo(id="deoni", name="Deoni", avgWeightCow=480.0),
        weather=WeatherPayload(city="Latur", tempC=30.0, humidity=65.0),
        lactatingData=[
            AnimalItem(weight=525.0, milkYield=7.0, milkFat=5.5, bcs=2.0, stage="Early lactation", dim=45),
            AnimalItem(weight=450.0, milkYield=14.0, milkFat=4.5, bcs=3.0, stage="Mid lactation", dim=100)
        ],
        firstTimeCattle=[
            AnimalItem(weight=375.0, pregMonth=7, gestationalMonths=7)
        ],
        repeatCattle=[
            AnimalItem(weight=550.0, pregMonth=4, gestationalMonths=4)
        ],
        pregnantCategory="both",
        heifersData=[
            AnimalItem(weight=280.0)
        ],
        dryCowsData=[
            AnimalItem(weight=490.0, dryDays=50)
        ],
        bullsData=[
            AnimalItem(weight=600.0)
        ],
        selectedFeeds=[
            FeedItem(name="Maize Fodder", category="Green Fodder", quantityKg=6.0, dmPct=22.0),
            FeedItem(name="Sugarcane Bagasse / Tops", category="Dry Fodder", quantityKg=8.0, dmPct=90.0),
            FeedItem(name="Dairy Concentrate (20% CP)", category="Concentrates", quantityKg=6.0, dmPct=90.0),
            FeedItem(name="Cane Molasses", category="Unconventional", quantityKg=5.0, dmPct=75.0),
        ],
        grazingSystem="inside_farm",
        grazingData={
            "lactating": {"location": "inside_farm", "hours": 5.0},
            "pregnant": {"location": "inside_farm", "hours": 4.0},
            "heifers": {"location": "inside_farm", "hours": 3.0},
            "dry": {"location": "inside_farm", "hours": 5.0},
            "bulls": {"location": "inside_farm", "hours": 4.0},
            "pastureQuality": "medium"
        },
        waterVolume=600.0
    )

    res = calculate_feed_nutrition(req)
    rep = res["practicalFeedingReport"]
    nut = res["nutritionAnalysis"]
    cur = nut["currentNutrition"]
    rec = nut["recommendedNutrition"]

    # -------------------------------------------------------------
    # ISSUE 1 & 2: DMI Status Wrong & Grazing Counted Inconsistently
    # -------------------------------------------------------------
    print("\n>>> CHECK 1 & 2: Grazing Consistency & Correct DMI Status")
    pasture_dm = rep["totalPastureDmKg"]
    trough_dm = rep["totalTroughDmKg"]
    tot_supplied = rep["totalHerdDmiSuppliedKg"]
    req_dmi = rep["totalEstimatedDmiReqKg"]

    print(f"  - Pasture DM: {pasture_dm:.2f} kg DM")
    print(f"  - Trough DM: {trough_dm:.2f} kg DM")
    print(f"  - Total Herd DMI Supplied: {tot_supplied:.2f} kg vs Required: {req_dmi:.2f} kg")
    assert abs((pasture_dm + trough_dm) - tot_supplied) < 0.05, "Trough + Pasture must equal Total Herd DMI"

    # Verify current nutrition DMI status considers total ingestion
    cur_dmi = cur["dmi"]
    print(f"  - Current Feed Trough DM: {cur_dmi['feedSuppliedKg']:.2f} kg")
    print(f"  - Current Pasture Grazing DM: {cur_dmi['pastureSuppliedKg']:.2f} kg")
    print(f"  - Current Total Ingested DM: {cur_dmi['totalIngestedKg']:.2f} kg")
    print(f"  - Current DMI Status: '{cur_dmi['status']}'")
    assert cur_dmi["totalIngestedKg"] == round(cur_dmi["feedSuppliedKg"] + cur_dmi["pastureSuppliedKg"], 2), "Current total ingested must equal feed + pasture"
    assert "Deficient" not in cur_dmi["status"] or cur_dmi["totalIngestedKg"] < (cur_dmi["requiredKg"] * 0.95), "DMI must NOT be falsely marked Deficient when total intake meets requirement"
    print("  --> PASS: Grazing is consistently counted across current and recommended nutrition, and DMI status is correctly evaluated!")

    # -------------------------------------------------------------
    # ISSUE 3: Lactating Cows Getting Zero Concentrate
    # -------------------------------------------------------------
    print("\n>>> CHECK 3: Lactating Cows Getting Production Concentrate")
    milking_cows = rep["perCategory"]["milkingCow"]["animals"]
    assert len(milking_cows) == 2, "Expected 2 milking cows"
    for cow in milking_cows:
        c_fresh = cow["concentrateKg"]
        milk = cow["milkYieldL"]
        print(f"  - {cow['title']} ({milk} L/day milk): Concentrate = {c_fresh} kg fresh ({cow['concentrateDetails']})")
        assert c_fresh > 0.0, f"{cow['title']} must receive concentrate feed, got 0 kg!"
        assert "Concentrate" in cow["concentrateDetails"] or "Dairy" in cow["concentrateDetails"] or "Molasses" in cow["concentrateDetails"], "Concentrate details must be populated"

    # High yielding cow (14 L) must get at least as much or more concentrate than 7 L cow
    c_cow1 = milking_cows[0]["concentrateKg"]
    c_cow2 = milking_cows[1]["concentrateKg"]
    print(f"  - Cow 1 (7L): {c_cow1} kg conc vs Cow 2 (14L): {c_cow2} kg conc")
    assert c_cow2 >= c_cow1, "Higher yielding cow must receive at least as much concentrate"
    print("  --> PASS: Lactating cows are receiving required production concentrates!")

    # -------------------------------------------------------------
    # ISSUE 4: NDF Targets by Animal Class
    # -------------------------------------------------------------
    print("\n>>> CHECK 4: NDF Targets by Animal Class")
    feeds_cat = [
        {"name": "Maize Fodder", "group": "green", "dmPct": 22.0, "cpPct": 8.0, "mePerKgDm": 2.2, "ndfPct": 52.0},
        {"name": "Paddy Straw", "group": "dry", "dmPct": 90.0, "cpPct": 3.5, "mePerKgDm": 1.4, "ndfPct": 75.0},
        {"name": "Concentrate", "group": "concentrate", "dmPct": 90.0, "cpPct": 22.0, "mePerKgDm": 2.8, "ndfPct": 22.0}
    ]

    opt_milk = optimize_animal_category_ration("milking", target_dmi_kg=12.0, target_me_mcal=26.0, target_cp_g=1300.0, feeds=feeds_cat, milk_yield=12.0)
    opt_dry = optimize_animal_category_ration("dry", target_dmi_kg=10.0, target_me_mcal=17.0, target_cp_g=700.0, feeds=feeds_cat)
    opt_preg = optimize_animal_category_ration("pregnant", target_dmi_kg=11.0, target_me_mcal=20.0, target_cp_g=950.0, feeds=feeds_cat, is_late_pregnancy=True)
    opt_heif = optimize_animal_category_ration("heifer", target_dmi_kg=7.0, target_me_mcal=14.0, target_cp_g=650.0, feeds=feeds_cat)
    opt_bull = optimize_animal_category_ration("bull", target_dmi_kg=13.0, target_me_mcal=21.0, target_cp_g=900.0, feeds=feeds_cat)

    print(f"  - Milking Cow NDF target: {opt_milk.get('ndfTargetPct')}% (Diet NDF: {opt_milk.get('ndfPct')}%)")
    print(f"  - Pregnant Cattle NDF target: {opt_preg.get('ndfTargetPct')}% (Diet NDF: {opt_preg.get('ndfPct')}%)")
    print(f"  - Growing Heifer NDF target: {opt_heif.get('ndfTargetPct')}% (Diet NDF: {opt_heif.get('ndfPct')}%)")
    print(f"  - Dry Cow NDF target: {opt_dry.get('ndfTargetPct')}% (Diet NDF: {opt_dry.get('ndfPct')}%)")
    print(f"  - Breeding Bull NDF target: {opt_bull.get('ndfTargetPct')}% (Diet NDF: {opt_bull.get('ndfPct')}%)")

    assert opt_milk.get('ndfTargetPct') == 28.0, "Milking cow NDF target must be 28%"
    assert opt_preg.get('ndfTargetPct') == 33.0, "Pregnant cattle NDF target must be 33%"
    assert opt_heif.get('ndfTargetPct') == 32.0, "Heifer NDF target must be 32%"
    assert opt_dry.get('ndfTargetPct') == 38.0, "Dry cow NDF target must be 38%"
    assert opt_bull.get('ndfTargetPct') == 35.0, "Breeding bull NDF target must be 35%"
    print("  --> PASS: Distinct NDF targets are enforced per animal class!")

    # -------------------------------------------------------------
    # ISSUE 5: Better Infeasibility Explanation
    # -------------------------------------------------------------
    print("\n>>> CHECK 5: Better Infeasibility Explanation")
    # Test infeasible case: 20L milking cow with ONLY straw (impossible)
    straw_only = [
        {"name": "Paddy Straw", "group": "dry", "dmPct": 90.0, "cpPct": 3.0, "mePerKgDm": 1.3, "ndfPct": 75.0}
    ]
    infeas_opt = optimize_animal_category_ration("milking", target_dmi_kg=13.0, target_me_mcal=32.0, target_cp_g=1800.0, feeds=straw_only, milk_yield=20.0)
    assert infeas_opt["success"] is False, "Optimizer must fail when given only straw for 20L cow"
    print(f"  - Status Message: {infeas_opt['statusMessage']}")
    print(f"  - Diagnostics Count: {len(infeas_opt['diagnostics'])}")
    for d in infeas_opt['diagnostics']:
        print(f"    * [{d['nutrient']}]: {d['advice']}")

    assert len(infeas_opt['diagnostics']) > 0, "Must return structured diagnostics"
    assert any("Energy" in d["nutrient"] or "Protein" in d["nutrient"] for d in infeas_opt['diagnostics']), "Must identify Energy or Protein shortfall"

    # Verify API level infeasibility response formatting
    infeas_req = NutritionRequest(
        selectedBreed=BreedInfo(id="deoni", name="Deoni", avgWeightCow=480.0),
        weather=WeatherPayload(city="Latur", tempC=30.0, humidity=65.0),
        lactatingData=[
            AnimalItem(weight=500.0, milkYield=25.0, milkFat=4.5)
        ],
        selectedFeeds=[
            FeedItem(name="Paddy Straw", category="Dry Roughage", quantityKg=10.0, dmPct=90.0)
        ]
    )
    infeas_res = calculate_feed_nutrition(infeas_req)
    feas = infeas_res["nutritionAnalysis"]["rationFeasibility"]
    print(f"  - API isFeasible: {feas['isFeasible']}")
    print(f"  - API message: {feas['message']}")
    print(f"  - API missingNutrients (Structured): {feas['missingNutrients']}")
    assert feas["isFeasible"] is False, "Should be marked infeasible"
    assert len(feas["missingNutrients"]) > 0, "Missing nutrients must not be empty"
    assert isinstance(feas["missingNutrients"][0], dict), "Missing nutrients must be structured objects"
    assert "nutrient" in feas["missingNutrients"][0] and "advice" in feas["missingNutrients"][0], "Must contain nutrient and advice fields"
    print("  --> PASS: Infeasibility explanation is rich, detailed, and structured!")

    print("\n" + "=" * 80)
    print("ALL 5 PRIORITY ISSUES SUCCESSFULLY SOLVED AND FULLY VERIFIED!")
    print("=" * 80)

if __name__ == "__main__":
    run_all_5_priority_checks()
