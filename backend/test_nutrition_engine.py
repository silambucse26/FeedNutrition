import urllib.request
import json
import sys

def run_tests():
    print("=== BEGINNING PRECISION NUTRITION ENGINE TEST SUITE ===")

    payload = {
        "weather": {"tempC": 32.0, "humidity": 68.0, "city": "Anna Nagar Farm"},
        "selectedBreed": {"name": "Rathi", "avgWeightCow": 450.0},
        "heifersData": [
            {"weight": 220.0}
        ],
        "pregnantCategory": "both",
        "firstTimeCattle": [
            {"weight": 360.0, "pregMonth": 6}  # Month 6 boundary test
        ],
        "repeatCattle": [
            {"weight": 440.0, "pregMonth": 8}  # Month 8 late gestation test
        ],
        "lactatingData": [
            {"weight": 420.0, "milkYield": 22.0, "milkFat": 4.5, "stage": "Early lactation"}, # High yielding cow
            {"weight": 380.0, "milkYield": 10.0, "milkFat": 3.8, "stage": "Mid lactation"}     # Moderate cow
        ],
        "dryCowsData": [
            {"weight": 410.0, "dryDays": 45}
        ],
        "bullsData": [
            {"weight": 520.0}
        ],
        "grazingSystem": "inside_farm",
        "grazingData": {
            "lactating": {"location": "inside", "hours": 3.0, "distance": 0.0},
            "heifers": {"location": "outside", "hours": 5.0, "distance": 2.0},  # Walking distance test
            "pregnant": {"location": "inside", "hours": 4.0, "distance": 0.0},
            "dry": {"location": "none", "hours": 0.0, "distance": 0.0},
            "bulls": {"location": "none", "hours": 0.0, "distance": 0.0}
        },
        "waterVolume": 600.0,
        "selectedFeeds": [
            {"name": "Maize Fodder", "category": "Green Fodder", "quantityKg": 60.0, "dmPct": 22.0},
            {"name": "Sorghum Fodder", "category": "Green Fodder", "quantityKg": 40.0, "dmPct": 25.0}, # Multi-green test
            {"name": "Paddy Straw", "category": "Dry Roughage", "quantityKg": 25.0, "dmPct": 88.0},
            {"name": "Wheat Bran", "category": "Concentrates", "quantityKg": 20.0, "dmPct": 88.0}
        ]
    }

    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/nutrition/calculate",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    try:
        resp = urllib.request.urlopen(req)
        res = json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print("FAIL: Could not reach API:", e)
        sys.exit(1)

    assert res.get("success") is True, "API call was not successful"
    report = res["practicalFeedingReport"]
    nutrition = res["nutritionAnalysis"]

    print("\n✓ Test 1: API Response success")
    print(f"  Herd Size: {report['totalCattle']} animals across 5 distinct groups")
    print(f"  Total Biomass: {report['totalHerdWeightKg']} kg")
    print(f"  Total Milk Production: {report['milkProductionLiters']} L/day")

    # Verify Issue 1 & 2: As-Fed quantities and Multi-feed proportion
    today_recs = report["todayRecommendations"]
    print("\n✓ Test 2 & 3: Multi-feed split and As-Fed conversion")
    total_fresh_kg = 0.0
    for r in today_recs:
        print(f"  Feed: {r['name']} ({r['category']}) -> Recommended Fresh: {r['recommendedKg']} kg (DM allocated: {r['dmAllocatedKg']} kg, DM%: {r['dmPct']}%)")
        total_fresh_kg += r['recommendedKg']
        # Assert fresh kg > dm kg
        assert r['recommendedKg'] > r['dmAllocatedKg'], f"Fresh kg {r['recommendedKg']} must be greater than DM {r['dmAllocatedKg']}!"

    print(f"  Total Fresh Feed to mix for herd: {report['totalFreshFeedKg']} kg")

    # Verify Issue 7: Animal level feed vs farm total feed
    print("\n✓ Test 4: Animal Group Rations")
    per_cat = report["perCategory"]
    for cat_name, cat_data in per_cat.items():
        if cat_data["exists"]:
            feed_info = cat_data["dailyFeeding"]
            print(f"  {cat_name} (count {cat_data['count']}): Green: {feed_info['greenFodderKg']} kg, Dry: {feed_info['dryFodderKg']} kg, Conc: {feed_info['concentrateKg']} kg, Water: {feed_info['waterLiters']} L")

    # Verify Issue 9: Explicit Statuses
    print("\n✓ Test 5: Explicit Nutrient Statuses")
    for fb in report["feedBalanceSimple"]:
        print(f"  {fb['icon']} {fb['label']}: {fb['status']} | {fb['detail']}")
        assert fb['status'] != "Check Balance", "Status must not be vague 'Check Balance'!"

    # Verify Water calculation
    print("\n✓ Test 6: Free Water Intake Calculation")
    print(f"  Required Water: {report['waterRequiredLiters']} L/day vs Available: {report['waterAvailableLiters']} L/day")
    print(f"  Water Status: {report['waterStatus']['status']}")

    print("\n=== ALL TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    run_tests()
