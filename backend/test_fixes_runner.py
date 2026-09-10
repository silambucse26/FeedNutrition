"""
Automated Verification Suite for the 5 Dairy Nutrition Calculation Fixes:
1. Scientific Grazing Intake Model (4 hours = realistic ~2.2 kg DM, not 30.4 kg)
2. Constrained Ration Optimizer (ME 100-110%, CP 100-115%, NDF >= 28%)
3. Mineral Balancing (Ca & P matched to herd requirements)
4. Breed Biological Impact (Maintenance, THI, Protein turnover)
5. Milking Cattle Parity (1st Lactation +20% maternal growth vs Multiparous)
"""

import sys
import json
from nutrition_engine import (
    calculate_scientific_pasture_intake,
    get_breed_biological_parameters,
    calculate_individual_lactating_cow,
    calculate_minerals_and_vitamins,
    optimize_least_cost_ration
)
from fastapi.testclient import TestClient
from main import app

def test_grazing_intake():
    print("--- Test 1: Scientific Grazing Intake Model ---")
    intake_4h = calculate_scientific_pasture_intake(bw=450, hours=4.0)
    print(f"4 hours grazing for 450kg cow = {intake_4h:.2f} kg DM")
    assert 1.5 <= intake_4h <= 3.5, f"Expected 1.5-3.5 kg DM, got {intake_4h}"
    
    # 0 hours
    intake_0h = calculate_scientific_pasture_intake(bw=450, hours=0)
    assert intake_0h == 0.0, f"Expected 0 kg DM, got {intake_0h}"
    
    # 8 hours diminishing returns check
    intake_8h = calculate_scientific_pasture_intake(bw=450, hours=8.0)
    print(f"8 hours good grazing = {intake_8h:.2f} kg DM")
    assert intake_8h < 8.0, f"Intake {intake_8h} exceeded biological limits"
    print(">>> Test 1 PASSED!")

def test_breed_impact():
    print("\n--- Test 2: Breed Biological Impact ---")
    zebu = get_breed_biological_parameters("Gir")
    cross = get_breed_biological_parameters("Crossbred HF")
    buffalo = get_breed_biological_parameters("Murrah")
    exotic = get_breed_biological_parameters("Holstein Friesian")

    print(f"Gir (Zebu): NEm={zebu['nem_coeff']}, THI_threshold={zebu['thi_threshold']}")
    print(f"Crossbred: NEm={cross['nem_coeff']}, THI_threshold={cross['thi_threshold']}")
    print(f"Buffalo: NEm={buffalo['nem_coeff']}, THI_threshold={buffalo['thi_threshold']}")
    print(f"HF (Exotic): NEm={exotic['nem_coeff']}, THI_threshold={exotic['thi_threshold']}")

    assert zebu['nem_coeff'] < cross['nem_coeff'] < exotic['nem_coeff'] < buffalo['nem_coeff'], "Breed NEm order mismatch"
    assert exotic['thi_threshold'] < cross['thi_threshold'] < zebu['thi_threshold'], "THI heat tolerance mismatch"
    print(">>> Test 2 PASSED!")

def test_parity_impact():
    print("\n--- Test 3: Milking Cattle Parity (1st Lactation Heifer vs Multiparous) ---")
    # Same body weight, milk yield, fat
    heifer = calculate_individual_lactating_cow(
        bw=450, milk_yield=15, milk_fat_pct=4.0, stage="Early lactation",
        is_first_lactation=True
    )
    multiparous = calculate_individual_lactating_cow(
        bw=450, milk_yield=15, milk_fat_pct=4.0, stage="Early lactation",
        is_first_lactation=False
    )

    print(f"1st Lactation Heifer: ME={heifer['meMcal']:.2f} Mcal, CP={heifer['cpG']:.1f} g, Ca={heifer['caG']:.1f} g (Growth ME: +{heifer['growthMeMcal']} Mcal)")
    print(f"Multiparous Cow:      ME={multiparous['meMcal']:.2f} Mcal, CP={multiparous['cpG']:.1f} g, Ca={multiparous['caG']:.1f} g")

    assert heifer['meMcal'] > multiparous['meMcal'], "1st lactation should have higher ME requirement for growth"
    assert heifer['cpG'] > multiparous['cpG'], "1st lactation should have higher CP requirement for growth"
    assert heifer['caG'] > multiparous['caG'], "1st lactation should have higher Ca requirement for growth"
    print(">>> Test 3 PASSED!")

def test_ration_optimizer_and_minerals():
    print("\n--- Test 4: Constrained Ration Optimizer & Mineral Balancing ---")
    # Test optimizer directly
    feeds_catalog = [
        {"name": "Maize Silage", "group": "green", "dmPct": 30.0, "cpPct": 8.0, "mePerKgDm": 2.2, "ndfPct": 45.0},
        {"name": "Hybrid Napier", "group": "green", "dmPct": 20.0, "cpPct": 9.0, "mePerKgDm": 2.0, "ndfPct": 55.0},
        {"name": "Paddy Straw", "group": "dry", "dmPct": 90.0, "cpPct": 3.5, "mePerKgDm": 1.5, "ndfPct": 72.0},
        {"name": "Dairy Concentrate (20% CP)", "group": "concentrate", "dmPct": 90.0, "cpPct": 20.0, "mePerKgDm": 2.8, "ndfPct": 22.0}
    ]
    # Requirements for a 15L cow: target DMI 12 kg, ME 26 Mcal, CP 1300 g
    target_dmi = 12.0
    target_me = 26.0
    target_cp = 1300.0

    res = optimize_least_cost_ration(
        feeds=feeds_catalog,
        target_dmi_kg=target_dmi,
        target_me_mcal=target_me,
        target_cp_g=target_cp
    )

    print(f"Optimizer Success: {res['success']}")
    print(f"Provided ME: {res['meSuppliedMcal']:.1f} Mcal (Target: {target_me} Mcal)")
    print(f"Provided CP: {res['cpSuppliedG']:.1f} g (Target: {target_cp} g)")
    print(f"Provided NDF: {res['ndfPct']:.1f}%")
    print(f"Allocations (kg DM): {res['allocations']}")

    assert res['success'] is True, "Linear programming optimization failed"
    me_pct = (res['meSuppliedMcal'] / target_me) * 100.0
    cp_pct = (res['cpSuppliedG'] / target_cp) * 100.0
    print(f"ME Adequacy: {me_pct:.1f}% | CP Adequacy: {cp_pct:.1f}%")
    assert 98.0 <= me_pct <= 112.0, f"ME excess outside safe bounds: {me_pct}%"
    assert 98.0 <= cp_pct <= 118.0, f"CP excess outside safe bounds: {cp_pct}%"
    assert res['ndfPct'] >= 25.0, f"NDF too low: {res['ndfPct']}%"
    print(">>> Test 4 PASSED!")

def test_full_api_endpoint():
    print("\n--- Test 5: Full API /api/nutrition/calculate Integration ---")
    client = TestClient(app)
    payload = {
        "weather": {
            "tempC": 30.0,
            "humidity": 65.0
        },
        "selectedBreed": {
            "id": "crossbred_hf",
            "name": "Crossbred HF",
            "category": "Cattle",
            "subCategory": "Dairy",
            "avgWeightCow": 450.0
        },
        "lactatingData": [
            {
                "id": "cow-1",
                "weight": 420.0,
                "milkYield": 14.0,
                "milkFat": 4.0,
                "dim": 45,
                "stage": "Early lactation",
                "lactationType": "first",
                "isFirstLactation": True
            },
            {
                "id": "cow-2",
                "weight": 480.0,
                "milkYield": 18.0,
                "milkFat": 4.2,
                "dim": 120,
                "stage": "Mid lactation",
                "lactationType": "second_plus",
                "isFirstLactation": False
            }
        ],
        "grazingSystem": "inside_farm",
        "grazingData": {
            "lactating": {
                "location": "inside",
                "hours": 4.0,
                "distance": 0.0
            }
        },
        "selectedFeeds": [
            {"name": "Maize Silage", "category": "Green Fodder", "quantityKg": 25.0, "dmPct": 30.0},
            {"name": "Paddy Straw", "category": "Dry Roughage", "quantityKg": 8.0, "dmPct": 90.0},
            {"name": "Commercial Dairy Pellets", "category": "Concentrate", "quantityKg": 10.0, "dmPct": 90.0},
            {"name": "Mineral Mixture", "category": "Mineral", "quantityKg": 0.2, "dmPct": 95.0}
        ]
    }

    response = client.post("/api/nutrition/calculate", json=payload)
    assert response.status_code == 200, f"API failed with {response.status_code}: {response.text}"
    data = response.json()

    print("API Response Top-Level Keys:", list(data.keys()))
    herd_summary = data.get("herdSummary", {})
    nutrition_analysis = data.get("nutritionAnalysis", {})
    rec_nut = nutrition_analysis.get("recommendedNutrition", {})
    breed_impact = data.get("breedImpact", {})

    pasture_dm = rec_nut.get("dmi", {}).get("pastureSuppliedKg", 0.0)
    rec_energy = rec_nut.get("energy", {})
    rec_protein = rec_nut.get("protein", {})
    rec_fibre = rec_nut.get("fibre", {})
    rec_minerals = rec_nut.get("minerals", {})

    print(f"Total Herd Animals: {herd_summary.get('totalHead')}")
    print(f"Grazing Total Pasture DM: {pasture_dm} kg (Per head: {pasture_dm / max(1, herd_summary.get('totalHead', 1)):.2f} kg DM)")
    print(f"Recommended ME: {rec_energy.get('suppliedMeMcal')} Mcal (Required: {rec_energy.get('requiredMeMcal')} Mcal, Status: {rec_energy.get('status')})")
    print(f"Recommended CP: {rec_protein.get('suppliedCpG')} g (Required: {rec_protein.get('requiredCpG')} g, Status: {rec_protein.get('status')})")
    print(f"Recommended NDF: {rec_fibre.get('dietNdfPct')}% (Status: {rec_fibre.get('status')})")
    print(f"Calcium: {rec_minerals.get('calcium', {}).get('status')}")
    print(f"Phosphorus: {rec_minerals.get('phosphorus', {}).get('status')}")
    print(f"Breed Impact: {breed_impact.get('breed')} (NEm={breed_impact.get('nemCoeff')}, THI threshold={breed_impact.get('thiThreshold')})")

    # 1. Verify grazing intake is scientific (2 cows x ~2.2kg = ~4.4kg DM total, not 60+ kg!)
    assert 3.0 <= pasture_dm <= 7.0, f"Grazing intake {pasture_dm} kg DM is not scientific"

    # 2. Verify energy & protein are balanced within safe limits without 40-70% excess
    me_req = rec_energy.get('requiredMeMcal', 1.0)
    me_sup = rec_energy.get('suppliedMeMcal', 0.0)
    me_pct = (me_sup / me_req) * 100.0 if me_req > 0 else 100.0

    cp_req = rec_protein.get('requiredCpG', 1.0)
    cp_sup = rec_protein.get('suppliedCpG', 0.0)
    cp_pct = (cp_sup / cp_req) * 100.0 if cp_req > 0 else 100.0

    print(f" Herd Energy Adequacy: {me_pct:.1f}% | Herd Protein Adequacy: {cp_pct:.1f}%")
    assert 95.0 <= me_pct <= 115.0, f"Energy adequacy {me_pct}% outside safe limits"
    assert 95.0 <= cp_pct <= 120.0, f"Protein adequacy {cp_pct}% outside safe limits"

    # 3. Verify fiber NDF >= 28%
    assert rec_fibre.get('dietNdfPct', 0) >= 28.0, "Dietary NDF is below 28%"

    # 4. Verify minerals (Ca & P balanced via feed + mineral mix)
    assert "Adequate" in rec_minerals.get('calcium', {}).get('status', ""), "Calcium is not balanced"
    assert "Adequate" in rec_minerals.get('phosphorus', {}).get('status', ""), "Phosphorus is not balanced"

    # 5. Verify breed impact
    assert breed_impact.get('breed') == "Crossbred HF", "Breed name mismatch"
    assert breed_impact.get('nemCoeff') == 0.078, "Crossbred NEm coefficient mismatch"
    assert breed_impact.get('thiThreshold') == 72.0, "Crossbred THI threshold mismatch"

    print(">>> Test 5 (Full API Integration) PASSED!")

if __name__ == "__main__":
    test_grazing_intake()
    test_breed_impact()
    test_parity_impact()
    test_ration_optimizer_and_minerals()
    test_full_api_endpoint()
    print("\n=======================================================")
    print("ALL 5 CRITICAL NUTRITION CALCULATION TESTS PASSED 100%!")
    print("=======================================================")
