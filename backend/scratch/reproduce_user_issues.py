import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ["OPENBLAS_NUM_THREADS"] = "1"

from main import calculate_feed_nutrition, NutritionRequest, AnimalItem, FeedItem, WeatherPayload, BreedInfo

def test_mixed_grass_hay():
    # User's scenario: Mixed Grass Hay + Green Fodder + Concentrate
    req = NutritionRequest(
        selectedBreed=BreedInfo(id="gir", name="Gir", avgWeightCow=420.0),
        weather=WeatherPayload(city="Anand", tempC=30.0, humidity=60.0),
        lactatingData=[
            AnimalItem(weight=420.0, milkYield=10.0, milkFat=4.5, bcs=3.0, stage="Mid lactation", dim=90)
        ],
        heifersData=[],
        firstTimeCattle=[],
        repeatCattle=[],
        dryCowsData=[],
        bullsData=[],
        selectedFeeds=[
            FeedItem(name="Mixed Grass Hay", category="Dry Fodder", quantityKg=15.0, dmPct=88.0),
            FeedItem(name="Maize Fodder", category="Green Fodder", quantityKg=25.0, dmPct=22.0),
            FeedItem(name="Dairy Concentrate (20% CP)", category="Concentrates", quantityKg=6.0, dmPct=90.0)
        ],
        grazingSystem="none",
        waterVolume=500.0
    )

    res = calculate_feed_nutrition(req)
    rep = res["practicalFeedingReport"]
    today_recs = rep["todayRecommendations"]
    print("--- TODAY'S RECOMMENDATIONS ---")
    for r in today_recs:
        print(f"  {r['name']} ({r['category']}): {r['recommendedKg']} kg fresh, {r['dmAllocatedKg']} kg DM")

    print("\n--- ANIMAL ALLOCATIONS ---")
    milking = rep["perCategory"]["milkingCow"]["animals"]
    for cow in milking:
        print(f"  {cow['title']}: Green = {cow['greenFodderKg']} kg, Dry = {cow['dryFodderKg']} kg ({cow.get('dryFodderDetails')}), Conc = {cow['concentrateKg']} kg ({cow.get('concentrateDetails')})")
        print(f"  NDF: {cow.get('ndfPct')}% | NDF Status: {cow.get('ndfStatus')}")

    print("\n--- SAFETY GATES & OVERALL ---")
    print(f"  isApproved: {rep.get('isApproved')}")
    print(f"  approvalBadge: {rep.get('approvalBadge')}")
    print(f"  Overall Status: {rep['overallResult']['status']}")
    print(f"  Overall Reason: {rep['overallResult']['reason']}")
    for chk in rep.get("safetyGate", {}).get("checks", []):
        print(f"    - {chk['gate']}: {chk['passed']} ({chk['detail']})")

if __name__ == "__main__":
    test_mixed_grass_hay()
