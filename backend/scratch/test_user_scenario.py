import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"

from main import calculate_feed_nutrition, NutritionRequest, AnimalItem, FeedItem, WeatherPayload, BreedInfo

def run_test():
    req = NutritionRequest(
        selectedBreed=BreedInfo(id='red_sindhi', name='Red Sindhi', avgWeightCow=450.0),
        weather=WeatherPayload(city='Chennai', tempC=32.0, humidity=75.0),
        lactatingData=[
            AnimalItem(weight=425.0, milkYield=7.0, milkFat=4.75, bcs=3.5, stage='Early lactation', isFirstLactation=True),
            AnimalItem(weight=425.0, milkYield=9.0, milkFat=5.5, bcs=2.5, stage='Mid lactation', isFirstLactation=False)
        ],
        pregnantCategory='both',
        firstTimeCattle=[
            AnimalItem(weight=325.0, pregMonth=7),
            AnimalItem(weight=575.0, pregMonth=3)
        ],
        repeatCattle=[
            AnimalItem(weight=525.0, pregMonth=3)
        ],
        heifersData=[
            AnimalItem(weight=225.0),
            AnimalItem(weight=275.0),
            AnimalItem(weight=325.0)
        ],
        dryCowsData=[
            AnimalItem(weight=375.0, dryDays=52),
            AnimalItem(weight=575.0, dryDays=85)
        ],
        bullsData=[
            AnimalItem(weight=550.0),
            AnimalItem(weight=850.0)
        ],
        selectedFeeds=[
            FeedItem(name='Maize Fodder', category='Green Fodder', quantityKg=5.0, dmPct=22.0),
            FeedItem(name='Cowpea Fodder (Lobia)', category='Green Fodder', quantityKg=5.0, dmPct=18.0),
            FeedItem(name='Jowar / Sorghum Stover (Kadbi)', category='Dry Fodder', quantityKg=5.0, dmPct=88.0),
            FeedItem(name='Groundnut Haulm / Vines', category='Dry Fodder', quantityKg=6.0, dmPct=85.0),
            FeedItem(name='Groundnut Cake', category='Concentrates', quantityKg=5.0, dmPct=92.0),
            FeedItem(name='Sesame / Til Cake', category='Concentrates', quantityKg=5.0, dmPct=90.0),
            FeedItem(name='Cane Molasses', category='Unconventional', quantityKg=6.0, dmPct=75.0),
            FeedItem(name='Citrus Fruit Pulp', category='Unconventional', quantityKg=6.0, dmPct=20.0)
        ],
        grazingSystem='inside_farm',
        grazingData={
            'lactating': {'location': 'inside_farm', 'hours': 4.0, 'distance': 0.0},
            'pregnant': {'location': 'inside_farm', 'hours': 4.0, 'distance': 0.0},
            'heifers': {'location': 'inside_farm', 'hours': 4.0, 'distance': 0.0},
            'dry': {'location': 'inside_farm', 'hours': 4.0, 'distance': 0.0},
            'bulls': {'location': 'inside_farm', 'hours': 4.0, 'distance': 0.0}
        },
        waterVolume=600.0
    )

    res = calculate_feed_nutrition(req)
    rep = res['practicalFeedingReport']
    rec_nut = rep.get('recommendedNutrition', {})
    cur_nut = res.get('nutritionAnalysis', {}).get('currentNutrition', {})

    print("--- DMI ---")
    print(f"Required DMI: {rep.get('totalEstimatedDmiReqKg')} kg")
    print(f"Current Trough DMI: {rep.get('currentFeedDmKg')} kg")
    print(f"Current Pasture DMI: {rep.get('totalPastureDmKg')} kg")
    print(f"Total Current DMI: {rep.get('totalCurrentDmIngestedKg')} kg")
    print(f"Recommended Total DMI: {rep.get('totalHerdDmiSuppliedKg')} kg")

    print("\n--- ME & CP ---")
    print(f"Required ME: {cur_nut.get('energy', {}).get('requiredMeMcal')} Mcal vs Rec: {rec_nut.get('energy', {}).get('suppliedMeMcal')} Mcal (Status: {rec_nut.get('energy', {}).get('status')})")
    print(f"Required CP: {cur_nut.get('protein', {}).get('requiredCpG')} g vs Rec: {rec_nut.get('protein', {}).get('suppliedCpG')} g (Status: {rec_nut.get('protein', {}).get('status')})")
    print(f"Current NDF%: {cur_nut.get('fibre', {}).get('dietNdfPct')}% vs Rec NDF%: {rec_nut.get('fibre', {}).get('dietNdfPct')}% (Status: {rec_nut.get('fibre', {}).get('status')})")

    print("\n--- MINERALS ---")
    cur_min = cur_nut.get('minerals', {})
    rec_min = rec_nut.get('minerals', {})
    print("Current Ca:", cur_min.get('calcium'))
    print("Recommended Ca:", rec_min.get('calcium'))
    print("Current P:", cur_min.get('phosphorus'))
    print("Recommended P:", rec_min.get('phosphorus'))

    print("\n--- Safety Gate ---")
    gate = rep.get('safetyGate', {})
    print("Safety Gate Passed:", gate.get('passed'))
    for chk in gate.get('checks', []):
        print(f"  [{'PASS' if chk['passed'] else 'FAIL'}] {chk['gate']}: {chk['detail']}")

if __name__ == '__main__':
    run_test()
