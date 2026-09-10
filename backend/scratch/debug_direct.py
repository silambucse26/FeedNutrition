import sys
sys.path.append('.')
from main import calculate_feed_nutrition, NutritionRequest

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

req = NutritionRequest(**payload)
res = calculate_feed_nutrition(req)
print("SUCCESS!")
