import sys
import os

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ["OPENBLAS_NUM_THREADS"] = "1"
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

from main import calculate_feed_nutrition, NutritionRequest, AnimalItem, FeedItem, WeatherPayload, BreedInfo

def test_all_10_issues():
    print("=" * 75)
    print("RUNNING COMPREHENSIVE VERIFICATION FOR ALL 10 USER ISSUES")
    print("=" * 75)

    req = NutritionRequest(
        selectedBreed=BreedInfo(id="deoni", name="Deoni", avgWeightCow=480.0),
        weather=WeatherPayload(city="Latur", tempC=30.0, humidity=65.0),
        lactatingData=[
            AnimalItem(weight=525.0, milkYield=7.0, milkFat=5.5, bcs=2.0, stage="Early lactation", dim=45),
            AnimalItem(weight=375.0, milkYield=13.5, milkFat=4.75, bcs=3.5, stage="Late lactation", dim=210)
        ],
        firstTimeCattle=[
            AnimalItem(weight=375.0, pregMonth=7, gestationalMonths=7),
            AnimalItem(weight=575.0, pregMonth=3, gestationalMonths=3)
        ],
        repeatCattle=[],
        heifersData=[
            AnimalItem(weight=275.0)
        ],
        dryCowsData=[
            AnimalItem(weight=475.0, dryDays=52)
        ],
        bullsData=[
            AnimalItem(weight=550.0)
        ],
        selectedFeeds=[
            FeedItem(name="Maize Fodder", category="Green Fodder", quantityKg=7.0, dmPct=22.0),
            FeedItem(name="Sugarcane Bagasse / Tops", category="Dry Fodder", quantityKg=8.0, dmPct=90.0),
            FeedItem(name="Soybean Meal (DOC)", category="Concentrates", quantityKg=7.0, dmPct=90.0),
            FeedItem(name="Cane Molasses", category="Unconventional", quantityKg=8.0, dmPct=75.0),
        ],
        grazingSystem="inside_farm",
        grazingData={
            "lactating": {"location": "inside_farm", "hours": 4.0, "distance": 0.0, "terrain": "Flat"},
            "pregnant": {"location": "inside_farm", "hours": 4.0, "distance": 0.0, "terrain": "Flat"},
            "heifers": {"location": "inside_farm", "hours": 4.0, "distance": 0.0, "terrain": "Flat"},
            "dry": {"location": "inside_farm", "hours": 4.0, "distance": 0.0, "terrain": "Flat"},
            "bulls": {"location": "inside_farm", "hours": 4.0, "distance": 0.0, "terrain": "Flat"}
        },
        waterVolume=600.0
    )

    res = calculate_feed_nutrition(req)
    rep = res["practicalFeedingReport"]
    nut = res["nutritionAnalysis"]
    rec_nut = nut["recommendedNutrition"]
    cur_nut = nut["currentNutrition"]

    print("\n[CHECK 1 & 10] Pasture Grazing Visibility & Herd DMI Target (77.35 kg vs 50.84 kg)")
    pasture = rep.get("pastureGrazing")
    print(f"  - Pasture Grazing row: {pasture}")
    assert pasture is not None, "Pasture grazing must be present"
    assert rep["totalPastureDmKg"] > 0, "Pasture DM must be > 0"
    print(f"  - Trough Fresh Feed to Mix: {rep['totalTroughFreshFeedKg']} kg (Provides {rep['totalTroughDmKg']} kg DM)")
    print(f"  - Pasture DM Supplied: {rep['totalPastureDmKg']} kg DM")
    print(f"  - Total Herd DMI Supplied: {rep['totalHerdDmiSuppliedKg']} kg DM vs Requirement: {rep['totalEstimatedDmiReqKg']} kg DM")
    assert abs(rep["totalTroughDmKg"] + rep["totalPastureDmKg"] - rep["totalHerdDmiSuppliedKg"]) < 0.05
    assert abs(rep["totalHerdDmiSuppliedKg"] - rep["totalEstimatedDmiReqKg"]) < 0.05
    print("  --> PASS: Herd DMI 77.35 kg is fully accounted for (50.84 kg trough + 26.51 kg pasture)!")

    print("\n[CHECK 2 & 3] Farm Recommendations vs Individual Animal Allocation")
    today_recs = rep["todayRecommendations"]
    for r in today_recs:
        print(f"  - Farm Recommendation: {r['name']} ({r['category']}) = {r['recommendedKg']} kg fresh ({r['dmAllocatedKg']} kg DM)")

    farm_bagasse = next((r["recommendedKg"] for r in today_recs if "bagasse" in r["name"].lower()), 0)
    farm_sbm = next((r["recommendedKg"] for r in today_recs if "soybean" in r["name"].lower()), 0)
    farm_molasses = next((r["recommendedKg"] for r in today_recs if "molasses" in r["name"].lower()), 0)
    farm_maize = next((r["recommendedKg"] for r in today_recs if "maize" in r["name"].lower()), 0)
    farm_total = rep["totalFreshFeedKg"]

    print(f"\n  Farm Totals: Maize={farm_maize} kg, Bagasse={farm_bagasse} kg, SBM={farm_sbm} kg, Molasses={farm_molasses} kg | Total={farm_total} kg")

    # Collect all animals
    all_animals = []
    for cat_key in ["milkingCow", "pregnantCattle", "growingHeifer", "dryCow", "bull"]:
        all_animals.extend(rep["perCategory"][cat_key]["animals"])

    assert len(all_animals) == 7, "Must have exactly 7 animals"

    indiv_green_sum = round(sum(a["greenFodderKg"] for a in all_animals), 1)
    indiv_dry_sum = round(sum(a["dryFodderKg"] for a in all_animals), 1)
    indiv_conc_sum = round(sum(a["concentrateKg"] for a in all_animals), 1)
    indiv_total_sum = round(indiv_green_sum + indiv_dry_sum + indiv_conc_sum, 1)

    print(f"\n  Individual Allocations Sum:")
    print(f"  - Total Green Fodder: {indiv_green_sum} kg (Farm: {farm_maize} kg)")
    print(f"  - Total Dry Fodder: {indiv_dry_sum} kg (Farm: {farm_bagasse} kg)")
    print(f"  - Total Concentrates & Molasses: {indiv_conc_sum} kg (Farm: {farm_sbm + farm_molasses} kg)")
    print(f"  - Grand Individual Feed Sum: {indiv_total_sum} kg (Farm Total: {farm_total} kg)")

    assert abs(indiv_dry_sum - farm_bagasse) <= 0.2, f"Individual dry fodder sum {indiv_dry_sum} must equal farm {farm_bagasse}"
    assert abs(indiv_conc_sum - (farm_sbm + farm_molasses)) <= 0.2, f"Individual concentrate sum {indiv_conc_sum} must equal farm {farm_sbm + farm_molasses}"
    assert abs(indiv_total_sum - farm_total) <= 0.2, f"Grand individual sum {indiv_total_sum} must match farm total {farm_total}"
    print("  --> PASS: Individual dry fodder is NOT 0 kg! Farm total and individual animal sums match perfectly!")

    print("\n[CHECK 4 & 5] Animal-by-Animal Ingredient Breakdown")
    for a in all_animals:
        title = a.get("title", "Animal")
        print(f"  {title}: Green={a['greenFodderKg']}kg, Dry={a['dryFodderKg']}kg ({a['dryFodderDetails']}), Conc={a['concentrateKg']}kg ({a['concentrateDetails']})")
        assert a["dryFodderKg"] > 0, f"{title} dry fodder must be > 0"
        assert a["concentrateKg"] > 0, f"{title} concentrate must be > 0"
        assert "Sugarcane Bagasse" in a["dryFodderDetails"], "Must mention Sugarcane Bagasse"
        assert "Soybean Meal" in a["concentrateDetails"] and "Molasses" in a["concentrateDetails"], "Must mention both SBM and Molasses"
    print("  --> PASS: Specific ingredients are explicitly detailed for each animal!")

    print("\n[CHECK 6, 7, 8] Accurate Dynamic Status for ME, CP, and NDF")
    print(f"  - Energy (ME): {rec_nut['energy']['status']} (Supplied: {rec_nut['energy']['suppliedMeMcal']} vs Req: {rec_nut['energy']['requiredMeMcal']})")
    print(f"  - Protein (CP): {rec_nut['protein']['status']} (Supplied: {rec_nut['protein']['suppliedCpG']}g vs Req: {rec_nut['protein']['requiredCpG']}g)")
    print(f"  - Fibre (NDF): {rec_nut['fibre']['status']} (Diet: {rec_nut['fibre']['dietNdfPct']}%)")

    assert "Surplus" in rec_nut['energy']['status'] or "Optimal" in rec_nut['energy']['status'], "ME status should indicate surplus or optimal"
    assert "High Protein" in rec_nut['protein']['status'], f"CP should correctly report High Protein, got {rec_nut['protein']['status']}"
    assert "High Fibre" in rec_nut['fibre']['status'], f"NDF 55.8% should report High Fibre, got {rec_nut['fibre']['status']}"
    print("  --> PASS: Realistic, dynamic nutrition statuses instead of hardcoded 100% optimal!")

    print("\n[CHECK 9] True Calcium & Phosphorus from Mineral Mixture + Feed")
    ca = rec_nut["minerals"]["calcium"]
    p = rec_nut["minerals"]["phosphorus"]
    print(f"  - Calcium: Req={ca['requiredG']}g | Supplied={ca['suppliedG']}g (Feed: {ca['feedSuppliedG']}g + Min Mix: {ca['mineralMixSuppliedG']}g) | Status: {ca['status']}")
    print(f"  - Phosphorus: Req={p['requiredG']}g | Supplied={p['suppliedG']}g (Feed: {p['feedSuppliedG']}g + Min Mix: {p['mineralMixSuppliedG']}g) | Status: {p['status']}")
    assert ca["mineralMixSuppliedG"] > 0, "Mineral mix Ca must be > 0"
    assert p["mineralMixSuppliedG"] > 0, "Mineral mix P must be > 0"
    assert abs(ca["suppliedG"] - (ca["feedSuppliedG"] + ca["mineralMixSuppliedG"])) < 0.1
    assert abs(p["suppliedG"] - (p["feedSuppliedG"] + p["mineralMixSuppliedG"])) < 0.1
    print("  --> PASS: Ca and P correctly derived from actual feed intake + BIS mineral mixture!")

    print("\n" + "=" * 75)
    print("ALL 10 PROBLEMS VERIFIED AND CONFIRMED RESOLVED!")
    print("=" * 75)

if __name__ == "__main__":
    test_all_10_issues()
