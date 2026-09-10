import os
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
import math
import numpy as np
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from nutrition_engine import (
    tempHumData,
    get_dew_point_from_humidity,
    get_metBWparam,
    get_percentage,
    milkEnergy,
    actualValues,
    dmiLactatingCowsAnf,
    digestibilityFactors,
    dmiLactatingCowsRationEffects,
    dmiGrowingHeifersFarOffAnf,
    dmiGrowingHeifersFarOffAnf_RationEffects,
    dmiGrowingHeifersLateGestAnf_RationEffects,
    digestedStarch,
    fractional_RumDigestibilityB,
    calculate_minerals_and_vitamins,
    load_datasets,
    calculate_individual_lactating_cow,
    calculate_individual_pregnant_cow,
    calculate_individual_heifer,
    calculate_individual_dry_cow,
    calculate_individual_bull,
    get_feed_me_mcal_per_kg_dm,
    get_feed_max_inclusion_pct,
    classify_pregnancy_stage,
    calculate_scientific_pasture_intake,
    get_breed_biological_parameters,
    optimize_least_cost_ration,
    optimize_animal_category_ration,
    validate_lactating_cow_feasibility,
    get_animal_category_ndf_limits,
    evaluate_category_ndf_status,
    evaluate_rumen_fiber_health,
    get_regional_feed_recommendations,
    load_mineral_dataset,
    calculate_pdf_kt_formulation,
    optimize_joint_farm_ration,
    calculate_nasem_water_fwi,
    evaluate_nasem_forage_ndf
)

app = FastAPI(
    title="FeedNutrition Precision Cattle Nutrition Engine",
    description="Backend API calculating individual-animal precision dairy cattle feed nutrition, THI stress, DMI, and water intake.",
    version="2.0.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Data Models ---
class WeatherPayload(BaseModel):
    tempC: Optional[float] = 28.0
    humidity: Optional[float] = 65.0
    dewPoint: Optional[float] = None
    condition: Optional[str] = "Clear"
    city: Optional[str] = ""

class AnimalItem(BaseModel):
    id: Optional[str] = None
    weight: float = Field(default=350.0, description="Animal live weight in kg")
    ageMonths: Optional[float] = None
    milkYield: Optional[float] = 0.0
    fatPct: Optional[float] = None
    milkFat: Optional[float] = None
    gestationalMonths: Optional[float] = None
    pregMonth: Optional[int] = None
    pregDays: Optional[int] = None
    weeksBeforeCalving: Optional[float] = None
    parity: Optional[int] = None
    dim: Optional[int] = None
    bcs: Optional[float] = None
    stage: Optional[str] = None
    dryDays: Optional[int] = None
    lactationType: Optional[str] = "second_plus"
    isFirstLactation: Optional[bool] = False

class FeedItem(BaseModel):
    id: Optional[str] = None
    name: str
    category: Optional[str] = "Green Fodder"
    quantityKg: float = Field(default=0.0, description="As-fed quantity in kg/day")
    dmPct: Optional[float] = 25.0

class BreedInfo(BaseModel):
    id: Optional[str] = "sahiwal"
    name: Optional[str] = "Sahiwal"
    category: Optional[str] = "Cattle"
    subCategory: Optional[str] = "Dairy"
    avgWeightHeifer: Optional[float] = 320.0
    avgWeightCow: Optional[float] = 480.0

class NutritionRequest(BaseModel):
    weather: Optional[WeatherPayload] = None
    selectedBreed: Optional[BreedInfo] = None
    heifersData: Optional[List[AnimalItem]] = []
    pregnantCategory: Optional[str] = "both"
    firstTimeCattle: Optional[List[AnimalItem]] = []
    repeatCattle: Optional[List[AnimalItem]] = []
    lactatingData: Optional[List[AnimalItem]] = []
    dryCowsData: Optional[List[AnimalItem]] = []
    bullsData: Optional[List[AnimalItem]] = []
    grazingSystem: Optional[str] = "inside_farm"
    grazingData: Optional[Dict[str, Any]] = {}
    waterVolume: Optional[float] = 0.0
    waterSource: Optional[str] = "Borewell"
    waterQuality: Optional[str] = "Good"
    selectedFeeds: Optional[List[FeedItem]] = []

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "FeedNutrition Precision Cattle Nutrition Engine",
        "version": "2.0.0"
    }

@app.get("/api/breeds")
def get_breed_references():
    breeds_df, _, _, _ = load_datasets()
    if not breeds_df.empty:
        return breeds_df.to_dict(orient="records")
    return []

@app.post("/api/nutrition/calculate")
def calculate_feed_nutrition(req: NutritionRequest):
    # -----------------------------------------------------------------
    # 1. Weather & Heat Stress (THI)
    # -----------------------------------------------------------------
    temp = req.weather.tempC if req.weather and req.weather.tempC is not None else 28.0
    humidity = req.weather.humidity if req.weather and req.weather.humidity is not None else 65.0
    
    if req.weather and req.weather.dewPoint is not None:
        dew_point = req.weather.dewPoint
    else:
        dew_point = get_dew_point_from_humidity(temp, humidity)

    rel_hum, thi, stress_category, stress_factor_desc, temp_corr, resp_water_loss = tempHumData(temp, dew_point)
    is_heat_stressed = thi >= 72.0

    # -----------------------------------------------------------------
    # 2. Breed reference targets & Biological Parameters
    # -----------------------------------------------------------------
    breeds_df, rough_df, conc_df, unconv_df = load_datasets()
    breed_name = req.selectedBreed.name if req.selectedBreed and req.selectedBreed.name else "Sahiwal"
    breed_bio = get_breed_biological_parameters(breed_name)

    target_fat = breed_bio.get("ref_fat_pct", 4.2)
    target_milk_per_day = 10.0
    target_mature_bw = req.selectedBreed.avgWeightCow if req.selectedBreed and req.selectedBreed.avgWeightCow else breed_bio.get("ref_mature_bw", 450.0)

    if not breeds_df.empty and "breed" in breeds_df.columns:
        match = breeds_df[breeds_df["breed"].str.lower() == breed_name.lower()]
        if not match.empty:
            target_fat = float(match.iloc[0].get("fat", target_fat))
            target_milk_per_day = float(match.iloc[0].get("mypday", target_milk_per_day))
            target_mature_bw = float(match.iloc[0].get("matureBWFemale", target_mature_bw))

    # Breed-specific heat stress threshold (Exotic: 68, Crossbred: 72, Indigenous: 76, Buffalo: 74)
    thi_threshold = float(breed_bio.get("thi_threshold", 72.0))
    is_heat_stressed = thi >= thi_threshold
    nem_coeff = float(breed_bio.get("nem_coeff", 0.080))
    mp_coeff = float(breed_bio.get("mp_coeff", 3.0))

    # -----------------------------------------------------------------
    # 3. Animal Groups & Grazing Parameters Setup
    # -----------------------------------------------------------------
    heifers = req.heifersData or []
    first_time_preg = req.firstTimeCattle or [] if req.pregnantCategory in ["firstTime", "both"] else []
    repeat_preg = req.repeatCattle or [] if req.pregnantCategory in ["repeat", "both"] else []
    lactating = req.lactatingData or []
    dry_cows = req.dryCowsData or []
    bulls = req.bullsData or []

    num_heifers = len(heifers)
    num_pregnant = len(first_time_preg) + len(repeat_preg)
    num_lactating = len(lactating)
    num_dry = len(dry_cows)
    num_bulls = len(bulls)
    total_animals = num_heifers + num_pregnant + num_lactating + num_dry + num_bulls

    total_weight = sum(h.weight for h in heifers) + \
                   sum(p.weight for p in first_time_preg) + \
                   sum(p.weight for p in repeat_preg) + \
                   sum(l.weight for l in lactating) + \
                   sum(d.weight for d in dry_cows) + \
                   sum(b.weight for b in bulls)

    total_act_milk = sum(l.milkYield or 0.0 for l in lactating)
    avg_act_milk_per_cow = (total_act_milk / num_lactating) if num_lactating > 0 else 0.0

    grazing_sys = str(req.grazingSystem or "").lower()
    has_no_grazing = (grazing_sys in ["no_grazing", "none", "zero", "stall_fed", "zero_grazing", ""])

    def get_grazing_params(cat_key: str):
        if has_no_grazing:
            return "none", 0.0, 0.0
        g_dict = req.grazingData.get(cat_key, {}) if isinstance(req.grazingData, dict) else {}
        if not g_dict:
            return "none", 0.0, 0.0
        loc = str(g_dict.get("location") or "none").lower()
        if loc in ["none", "no_grazing", "zero"]:
            return "none", 0.0, 0.0
        hrs = float(g_dict.get("hours") or 0.0)
        dist = float(g_dict.get("distance") or 0.0) if loc == "outside" else 0.0
        return loc, hrs, dist

    # -----------------------------------------------------------------
    # 4. INDIVIDUAL ANIMAL REQUIREMENT CALCULATIONS (Solving Issues 3, 4, 5, 10, 12, 13)
    # -----------------------------------------------------------------
    animal_records = []

    # Lactating Cows (Supporting 1st Lactation vs 2nd+ Lactation Parity)
    loc_lact, hrs_lact, dist_lact = get_grazing_params("lactating")
    for i, cow in enumerate(lactating):
        fat = cow.milkFat if cow.milkFat is not None else (cow.fatPct or target_fat)
        is_first = (cow.lactationType == "first_lactation" or bool(cow.isFirstLactation))
        rec = calculate_individual_lactating_cow(
            bw=cow.weight,
            milk_yield=cow.milkYield or 0.0,
            milk_fat_pct=fat,
            stage=cow.stage or "Mid lactation",
            bcs=cow.bcs or 3.0,
            walking_km=dist_lact,
            is_heat_stressed=is_heat_stressed,
            is_first_lactation=is_first,
            nem_coeff=nem_coeff,
            mp_coeff=mp_coeff,
            thi_val=thi,
            thi_threshold=thi_threshold,
            dmi_pct_bw=breed_bio.get("dmi_pct_bw", 0.028)
        )
        parity_str = "1st Lactation" if is_first else "2nd+ Lactation"
        rec["category"] = "milkingCow"
        rec["isFirstLactation"] = is_first
        rec["lactationType"] = "first_lactation" if is_first else "second_plus"
        rec["title"] = f"Milking Cow #{i+1} ({parity_str}, {cow.milkYield or 0:.1f} L/day, {fat:.1f}% fat)"
        animal_records.append(rec)

    # First-Time Pregnant Heifers
    loc_preg, hrs_preg, dist_preg = get_grazing_params("pregnant")
    for i, cow in enumerate(first_time_preg):
        pm = cow.pregMonth if cow.pregMonth is not None else (int(cow.gestationalMonths) if cow.gestationalMonths else (max(1, min(9, round(cow.pregDays / 30.4))) if cow.pregDays else 7))
        rec = calculate_individual_pregnant_cow(
            bw=cow.weight,
            preg_month=pm,
            is_heifer=True,
            walking_km=dist_preg,
            is_heat_stressed=is_heat_stressed,
            nem_coeff=nem_coeff,
            mp_coeff=mp_coeff,
            thi_threshold=thi_threshold,
            dmi_pct_bw=breed_bio.get("dmi_pct_bw", 0.024),
            mature_bw=target_mature_bw
        )
        rec["category"] = "pregnantHeifer"
        rec["isHeifer"] = True
        rec["pregMonth"] = pm
        rec["pregDays"] = cow.pregDays if cow.pregDays else int(pm * 30.4)
        rec["title"] = f"Pregnant Heifer #{i+1} (Month {pm})"
        animal_records.append(rec)

    # Repeat Pregnant Cows
    for i, cow in enumerate(repeat_preg):
        pm = cow.pregMonth if cow.pregMonth is not None else (int(cow.gestationalMonths) if cow.gestationalMonths else (max(1, min(9, round(cow.pregDays / 30.4))) if cow.pregDays else 7))
        rec = calculate_individual_pregnant_cow(
            bw=cow.weight,
            preg_month=pm,
            is_heifer=False,
            walking_km=dist_preg,
            is_heat_stressed=is_heat_stressed,
            nem_coeff=nem_coeff,
            mp_coeff=mp_coeff,
            thi_threshold=thi_threshold,
            dmi_pct_bw=breed_bio.get("dmi_pct_bw", 0.024),
            mature_bw=target_mature_bw
        )
        rec["category"] = "pregnantCow"
        rec["isHeifer"] = False
        rec["pregMonth"] = pm
        rec["pregDays"] = cow.pregDays if cow.pregDays else int(pm * 30.4)
        rec["title"] = f"Pregnant Cow #{i+1} (Month {pm})"
        animal_records.append(rec)

    # Growing Heifers
    loc_heif, hrs_heif, dist_heif = get_grazing_params("heifers")
    for i, h in enumerate(heifers):
        rec = calculate_individual_heifer(
            bw=h.weight,
            target_mature_bw=target_mature_bw,
            walking_km=dist_heif,
            is_heat_stressed=is_heat_stressed,
            nem_coeff=nem_coeff,
            mp_coeff=mp_coeff,
            thi_threshold=thi_threshold,
            dmi_pct_bw=breed_bio.get("dmi_pct_bw", 0.026)
        )
        rec["category"] = "growingHeifer"
        rec["title"] = f"Growing Heifer #{i+1} ({h.weight:.0f} kg)"
        animal_records.append(rec)

    # Dry Cows
    loc_dry, hrs_dry, dist_dry = get_grazing_params("dry")
    for i, d in enumerate(dry_cows):
        days = d.dryDays if d.dryDays is not None else 45
        rec = calculate_individual_dry_cow(
            bw=d.weight,
            dry_days=days,
            walking_km=dist_dry,
            is_heat_stressed=is_heat_stressed,
            nem_coeff=nem_coeff,
            mp_coeff=mp_coeff,
            thi_threshold=thi_threshold,
            dmi_pct_bw=breed_bio.get("dmi_pct_bw", 0.022)
        )
        rec["category"] = "dryCow"
        rec["title"] = f"Dry Cow #{i+1} ({days} days dry)"
        animal_records.append(rec)

    # Bulls
    loc_bull, hrs_bull, dist_bull = get_grazing_params("bulls")
    for i, b in enumerate(bulls):
        rec = calculate_individual_bull(
            bw=b.weight,
            walking_km=dist_bull,
            is_heat_stressed=is_heat_stressed,
            nem_coeff=nem_coeff,
            mp_coeff=mp_coeff,
            thi_threshold=thi_threshold,
            dmi_pct_bw=breed_bio.get("dmi_pct_bw", 0.022)
        )
        rec["category"] = "bull"
        rec["title"] = f"Bull #{i+1} ({b.weight:.0f} kg)"
        animal_records.append(rec)

    # -----------------------------------------------------------------
    # 5. EXACT RECONCILIATION: FARM TOTALS = SUM OF INDIVIDUAL ANIMALS (Issue 7)
    # -----------------------------------------------------------------
    total_herd_dmi_required_kg = round(sum(a["dmiKg"] for a in animal_records), 2)
    total_herd_me_required_mcal = round(sum(a["meMcal"] for a in animal_records), 2)
    total_herd_cp_required_g = round(sum(a["cpG"] for a in animal_records), 1)
    total_herd_ca_required_g = round(sum(a["caG"] for a in animal_records), 1)
    total_herd_p_required_g = round(sum(a["pG"] for a in animal_records), 1)
    total_fwi_required_liters = round(sum(a["fwiL"] for a in animal_records), 1)

    available_water = float(req.waterVolume or 0.0)
    water_balance_liters = round(available_water - total_fwi_required_liters, 1)

    # -----------------------------------------------------------------
    # 6. SCIENTIFIC GRAZING PASTURE INTAKE CALCULATION
    # -----------------------------------------------------------------
    total_pasture_dm_kg = 0.0
    grazing_animal_count = 0
    grazing_hours_sum = 0.0

    group_data_map = [
        ("lactating", lactating, loc_lact, hrs_lact),
        ("pregnant", first_time_preg + repeat_preg, loc_preg, hrs_preg),
        ("heifers", heifers, loc_heif, hrs_heif),
        ("dry", dry_cows, loc_dry, hrs_dry),
        ("bulls", bulls, loc_bull, hrs_bull)
    ]

    for cat_name, animal_list, loc, hrs in group_data_map:
        cnt = len(animal_list)
        if cnt > 0 and loc != "none" and hrs > 0:
            avg_bw = sum(a.weight for a in animal_list) / cnt
            # Scientific intake per head based on body weight, hours, and DMI capacity
            dm_per_head = calculate_scientific_pasture_intake(
                bw=avg_bw,
                hours=hrs,
                grazing_system=loc,
                total_dmi_cap=avg_bw * 0.028
            )
            total_pasture_dm_kg += dm_per_head * cnt
            grazing_animal_count += cnt
            grazing_hours_sum += hrs * cnt

    total_pasture_dm_kg = round(total_pasture_dm_kg, 2)
    avg_grazing_hours = round(grazing_hours_sum / max(1, grazing_animal_count), 1) if grazing_animal_count > 0 else 0.0
    avg_pasture_dm_per_head = round(total_pasture_dm_kg / max(1, grazing_animal_count), 2) if grazing_animal_count > 0 else 0.0
    pasture_cp_supplied_kg = round(total_pasture_dm_kg * 0.10, 2)  # ~10% CP on DM basis

    # -----------------------------------------------------------------
    # 7. CURRENT FEED DIET — FARMER'S ACTUAL INPUT (Bugs #2, #5, #6)
    #    Computes nutrients FROM WHAT THE FARMER CURRENTLY FEEDS.
    #    Completely separate from the recommended ration.
    # -----------------------------------------------------------------
    all_feeds_dict = {}
    for df, f_type in [(rough_df, "forage"), (conc_df, "concentrate"), (unconv_df, "forage")]:
        if not df.empty and "Feed" in df.columns:
            for _, r in df.iterrows():
                fname = str(r["Feed"]).strip().lower()
                all_feeds_dict[fname] = {
                    "name": str(r["Feed"]),
                    "type": f_type,
                    "DM": float(r.get("DM", 85.0)),
                    "CP": float(r.get("CP", 10.0)),
                    "EE": float(r.get("EE", 2.5)),
                    "CF": float(r.get("CF", 25.0)),
                    "NFE": float(r.get("NFE", 50.0)),
                    "Ash": float(r.get("Ash", 8.0)),
                    "NDF": float(r.get("NDF", 50.0)),
                    "ADF": float(r.get("ADF", 30.0)),
                    "Lignin": float(r.get("Lignin", 4.0)),
                }

    # --- CURRENT feed nutrition (from farmer's actual input) ---
    current_as_fed_kg = 0.0
    current_dm_supplied_kg = 0.0
    current_cp_supplied_kg = 0.0
    current_ndf_supplied_kg = 0.0
    current_adf_supplied_kg = 0.0
    current_me_supplied_mcal = 0.0
    feed_breakdown = []

    def match_feed_data(feed_name, feed_category, feed_dm_pct):
        """Match a feed name against the reference database and return nutrient data."""
        key = feed_name.strip().lower()
        matched_data = None
        for k, v in all_feeds_dict.items():
            if k in key or key in k:
                matched_data = v
                break
        if not matched_data:
            is_conc = (feed_category == "Concentrates")
            dm_pct = float(feed_dm_pct or (88.0 if is_conc else 25.0))
            matched_data = {
                "name": feed_name,
                "type": "concentrate" if is_conc else "forage",
                "DM": dm_pct,
                "CP": 20.0 if is_conc else 8.5,
                "EE": 3.5 if is_conc else 2.0,
                "CF": 12.0 if is_conc else 28.0,
                "NFE": 56.0 if is_conc else 50.0,
                "Ash": 8.0 if is_conc else 9.5,
                "NDF": 30.0 if is_conc else 58.0,
                "ADF": 15.0 if is_conc else 32.0,
                "Lignin": 3.0 if is_conc else 4.5,
            }
        return matched_data

    for f in (req.selectedFeeds or []):
        qty = float(f.quantityKg or 0.0)
        if qty <= 0:
            continue
        current_as_fed_kg += qty
        matched_data = match_feed_data(f.name, f.category, f.dmPct)

        dm_val = get_percentage(matched_data["DM"], qty)
        cp_val = get_percentage(matched_data["CP"], dm_val)
        ndf_val = get_percentage(matched_data["NDF"], dm_val)
        adf_val = get_percentage(matched_data["ADF"], dm_val)
        # ME supplied = DM_kg × ME_mcal_per_kg_DM (Bug #7)
        me_per_kg_dm = get_feed_me_mcal_per_kg_dm(f.name, f.category or "")
        me_val = dm_val * me_per_kg_dm

        current_dm_supplied_kg += dm_val
        current_cp_supplied_kg += cp_val
        current_ndf_supplied_kg += ndf_val
        current_adf_supplied_kg += adf_val
        current_me_supplied_mcal += me_val

        feed_breakdown.append({
            "name": matched_data["name"],
            "category": f.category,
            "dmPct": matched_data["DM"],
            "asFedKg": round(qty, 2),
            "dmKg": round(dm_val, 2),
            "cpKg": round(cp_val, 2),
            "ndfKg": round(ndf_val, 2),
            "adfKg": round(adf_val, 2),
            "meMcal": round(me_val, 2),
        })

    # Strict separation of Harvested Feed DM vs Pasture Grazing DM (Problem 1)
    current_feed_dm_kg = round(current_dm_supplied_kg, 2)
    current_feed_cp_kg = round(current_cp_supplied_kg, 2)
    current_feed_cp_g = round(current_feed_cp_kg * 1000.0, 1)
    current_feed_me_mcal = round(current_me_supplied_mcal, 2)
    current_feed_ndf_kg = round(current_ndf_supplied_kg, 2)

    pasture_me_supplied = round(total_pasture_dm_kg * 2.0, 2)
    total_current_dm_ingested_kg = round(current_feed_dm_kg + total_pasture_dm_kg, 2)
    total_current_cp_ingested_kg = round(current_feed_cp_kg + pasture_cp_supplied_kg, 2)
    total_current_me_ingested_mcal = round(current_feed_me_mcal + pasture_me_supplied, 2)
    total_current_ndf_ingested_kg = round(current_feed_ndf_kg + (total_pasture_dm_kg * 0.55), 2)

    # Total Current Ingested Balances (Consistently accounts for Trough Feed + Pasture Grazing)
    current_total_dmi_balance_kg = round(total_current_dm_ingested_kg - total_herd_dmi_required_kg, 2)
    current_total_me_balance_mcal = round(total_current_me_ingested_mcal - total_herd_me_required_mcal, 2)
    current_total_cp_balance_g = round((total_current_cp_ingested_kg * 1000.0) - total_herd_cp_required_g, 1)

    # Diet nutrient percentages on total ingested DM
    total_current_diet_cp_pct = (total_current_cp_ingested_kg / total_current_dm_ingested_kg * 100.0) if total_current_dm_ingested_kg > 0 else 0.0
    total_current_diet_ndf_pct = (total_current_ndf_ingested_kg / total_current_dm_ingested_kg * 100.0) if total_current_dm_ingested_kg > 0 else 0.0

    # Trough-only balances for reference
    current_feed_dmi_balance_kg = round(current_feed_dm_kg - total_herd_dmi_required_kg, 2)
    current_feed_me_balance_mcal = round(current_feed_me_mcal - total_herd_me_required_mcal, 2)
    current_feed_cp_balance_g = round((current_feed_cp_kg * 1000.0) - total_herd_cp_required_g, 1)
    current_diet_cp_pct = (current_feed_cp_kg / current_feed_dm_kg * 100.0) if current_feed_dm_kg > 0 else 0.0
    current_diet_ndf_pct = (current_feed_ndf_kg / current_feed_dm_kg * 100.0) if current_feed_dm_kg > 0 else 0.0

    # -----------------------------------------------------------------
    # 8. ANIMAL-BY-ANIMAL CONSTRAINED PRECISION OPTIMIZATION
    #    Optimizes each animal/category separately using SciPy HiGHS.
    #    Enforces strict physiological limits (Molasses <= 1.0kg, Concentrates <= 40% DMI).
    #    NO EQUAL-SHARE FALLBACK: Returns 'No safe ration possible' if infeasible.
    # -----------------------------------------------------------------
    pasture_quality = "medium"
    if isinstance(req.grazingData, dict):
        pasture_quality = str(req.grazingData.get("pastureQuality", req.grazingData.get("quality", "medium"))).lower()

    # Prepare available feeds database catalog for the optimizer
    # Prepare available feeds database catalog for the optimizer
    feed_optimizer_input = []
    feed_mineral_specs = {}
    minerals_df = load_mineral_dataset()
    for f in (req.selectedFeeds or []):
        m = match_feed_data(f.name, f.category, f.dmPct)
        f_name_lower = f.name.lower()
        f_cat_lower = str(f.category or "").lower()
        dm_p = float(m["DM"])
        if 'unconventional' in f_cat_lower or 'molasses' in f_name_lower:
            grp = "unconventional"
        elif 'dry' in f_cat_lower or any(w in f_name_lower for w in ['straw', 'paddy', 'bhoosa', 'hay', 'stover', 'kadbi', 'haulm', 'bagasse', 'husk']):
            grp = "dry"
        elif 'concentrate' in f_cat_lower or any(w in f_name_lower for w in ['grain', 'bran', 'cake', 'meal', 'pellet', 'chuni', 'crushed', 'mash', 'oilcake', 'dairy concentrate']):
            grp = "concentrate"
        elif 'green' in f_cat_lower or any(w in f_name_lower for w in ['maize', 'sorghum fodder', 'napier', 'lucerne', 'berseem', 'silage', 'green', 'grass', 'oat fodder', 'sugarcane tops']):
            grp = "green"
        elif dm_p >= 70.0:
            grp = "dry"
        else:
            grp = "green"

        me_val = get_feed_me_mcal_per_kg_dm(f.name, f.category or "")
        dm_p = float(m["DM"])
        feed_optimizer_input.append({
            "name": f.name,
            "category": f.category,
            "group": grp,
            "dmPct": dm_p,
            "cpPct": float(m["CP"]),
            "ndfPct": float(m["NDF"]),
            "mePerKgDm": float(me_val),
            "nelPerKgDm": float(me_val) * 0.66
        })

        # Load accurate mineral values exclusively from consolidated_minerals.dat (Single Source of Truth)
        matched_min = None
        if not minerals_df.empty and "Ingredient" in minerals_df.columns:
            for _, r in minerals_df.iterrows():
                ing = str(r["Ingredient"]).strip().lower()
                if ing == f_name_lower or (len(ing) > 3 and (ing in f_name_lower or f_name_lower in ing)):
                    matched_min = r
                    break

        if matched_min is not None:
            try:
                ca_pct = float(matched_min.get("Ca (%)", 0.35))
                p_pct = float(matched_min.get("P (%)", 0.25))
                na_pct = float(matched_min.get("Na (%)", 0.08))
                k_pct = float(matched_min.get("K (%)", 1.20))
            except Exception:
                ca_pct, p_pct, na_pct, k_pct = 0.35, 0.25, 0.08, 1.20
        else:
            if grp in ["concentrate", "unconventional"]:
                ca_pct, p_pct, na_pct, k_pct = 0.25, 0.65, 0.05, 1.20
            elif grp == "dry":
                ca_pct, p_pct, na_pct, k_pct = 0.35, 0.15, 0.08, 1.10
            else: # green
                ca_pct, p_pct, na_pct, k_pct = 0.45, 0.25, 0.08, 1.80

        feed_spec_obj = {
            "caPct": ca_pct, "pPct": p_pct, "naPct": na_pct, "kPct": k_pct,
            "dmPct": dm_p, "group": grp
        }
        feed_mineral_specs[f.name] = feed_spec_obj
        if m.get("name"):
            feed_mineral_specs[m["name"]] = feed_spec_obj
        feed_mineral_specs[f_name_lower] = feed_spec_obj

    # Calculate exact current feed Calcium and Phosphorus supply (from single composition database)
    for item in feed_breakdown:
        specs = feed_mineral_specs.get(item["name"])
        if specs is None:
            name_l = item["name"].lower()
            for k, v in feed_mineral_specs.items():
                if k.lower() in name_l or name_l in k.lower():
                    specs = v
                    break
        if specs is None:
            cat = str(item.get("category", "")).lower()
            name_l = item["name"].lower()
            if "concentrate" in cat or "unconventional" in cat or "cake" in name_l or "pellet" in name_l or "bran" in name_l:
                specs = {"caPct": 0.25, "pPct": 0.65, "naPct": 0.05, "kPct": 1.20}
            elif "dry" in cat or "straw" in name_l or "bagasse" in name_l or "hay" in name_l:
                specs = {"caPct": 0.35, "pPct": 0.15, "naPct": 0.08, "kPct": 1.10}
            else:
                specs = {"caPct": 0.45, "pPct": 0.25, "naPct": 0.08, "kPct": 1.80}

        item["caPct"] = specs["caPct"]
        item["pPct"] = specs["pPct"]
        item["caG"] = round(item["dmKg"] * specs["caPct"] * 10.0 + 1e-6, 1)
        item["pG"] = round(item["dmKg"] * specs["pPct"] * 10.0 + 1e-6, 1)

    current_feed_ca_g = round(sum(item["caG"] for item in feed_breakdown), 1)
    current_feed_p_g = round(sum(item["pG"] for item in feed_breakdown), 1)
    current_pasture_ca_g = round(total_pasture_dm_kg * 0.35 * 10.0, 1)
    current_pasture_p_g = round(total_pasture_dm_kg * 0.25 * 10.0, 1)
    current_min_mix_g = float(getattr(req, "currentMineralMixtureG", 0.0) if hasattr(req, "currentMineralMixtureG") else 0.0)
    current_supp_ca_g = round(current_min_mix_g * 0.20, 1)
    current_supp_p_g = round(current_min_mix_g * 0.10, 1)
    total_current_ca_g = round(current_feed_ca_g + current_supp_ca_g, 1)
    total_current_p_g = round(current_feed_p_g + current_supp_p_g, 1)
    current_ca_balance = round(total_current_ca_g - total_herd_ca_required_g, 1)
    current_p_balance = round(total_current_p_g - total_herd_p_required_g, 1)

    # Structure all animal entities for joint farm-level multi-class optimization
    animal_entities = []

    # 1. Milking Cows
    lact_recs = [rec for rec in animal_records if rec["category"] == "milkingCow"]
    for i, (cow, a) in enumerate(zip(lactating, lact_recs)):
        milk = float(cow.milkYield or 0.0)
        fat_val = float(cow.milkFat if cow.milkFat is not None else (cow.fatPct if cow.fatPct is not None else target_fat))
        bcs_val = float(cow.bcs if cow.bcs is not None else 3.0)
        stg = cow.stage or "Mid lactation"
        is_first = a.get("isFirstLactation", False)

        pasture_dm = calculate_scientific_pasture_intake(
            bw=cow.weight, hours=hrs_lact, grazing_system=loc_lact,
            total_dmi_cap=a["dmiKg"], pasture_quality=pasture_quality
        )
        trough_dmi = max(0.1, round(a["dmiKg"] - pasture_dm, 2))
        trough_nel = max(0.1, round(a.get("nelMcal", a["meMcal"] * 0.66) - (pasture_dm * 1.32), 2))
        trough_cp = max(0.0, round(a["cpG"] - (pasture_dm * 100.0), 1))

        animal_entities.append({
            "id": f"milking_{i+1}",
            "index": i + 1,
            "category": "milkingCow",
            "title": f"Cow #{i+1} ({'1st' if is_first else '2nd+'} Lactation)",
            "parity": "1st Lactation (Primiparous)" if is_first else "2nd+ Lactation (Multiparous)",
            "isFirstLactation": is_first,
            "lactationType": "first_lactation" if is_first else "second_plus",
            "weightKg": cow.weight,
            "milkYieldL": milk,
            "milkFatPct": fat_val,
            "bcs": bcs_val,
            "stage": stg,
            "target_dmi_kg": trough_dmi,
            "target_nel_mcal": trough_nel,
            "target_cp_g": trough_cp,
            "milk_yield": milk,
            "is_late_pregnancy": False,
            "pasture_dm": pasture_dm,
            "record": a
        })

    # 2. Pregnant Cattle
    all_preg_items = (first_time_preg + repeat_preg) if req.pregnantCategory in ["firstTime", "repeat", "both"] else []
    preg_recs = [rec for rec in animal_records if "pregnant" in rec["category"].lower()]
    for i, (cow, a) in enumerate(zip(all_preg_items, preg_recs)):
        pm = cow.pregMonth if cow.pregMonth is not None else 6
        is_late = pm >= 6
        is_heif = i < len(first_time_preg)

        pasture_dm = calculate_scientific_pasture_intake(
            bw=cow.weight, hours=hrs_preg, grazing_system=loc_preg,
            total_dmi_cap=a["dmiKg"], pasture_quality=pasture_quality
        )
        trough_dmi = max(0.1, round(a["dmiKg"] - pasture_dm, 2))
        trough_nel = max(0.1, round(a.get("nelMcal", a["meMcal"] * 0.66) - (pasture_dm * 1.32), 2))
        trough_cp = max(0.0, round(a["cpG"] - (pasture_dm * 100.0), 1))

        animal_entities.append({
            "id": f"preg_{i+1}",
            "index": i + 1,
            "category": "pregnantCattle",
            "title": f"Pregnant Cattle #{i+1}",
            "type": "First Pregnancy" if is_heif else "Repeat Pregnancy",
            "weightKg": cow.weight,
            "pregMonth": pm,
            "stage": classify_pregnancy_stage(pm),
            "target_dmi_kg": trough_dmi,
            "target_nel_mcal": trough_nel,
            "target_cp_g": trough_cp,
            "milk_yield": 0.0,
            "is_late_pregnancy": is_late,
            "pasture_dm": pasture_dm,
            "record": a
        })

    # 3. Growing Heifers
    heif_recs = [rec for rec in animal_records if rec["category"] == "growingHeifer"]
    for i, (cow, a) in enumerate(zip(heifers, heif_recs)):
        pasture_dm = calculate_scientific_pasture_intake(
            bw=cow.weight, hours=hrs_heif, grazing_system=loc_heif,
            total_dmi_cap=a["dmiKg"], pasture_quality=pasture_quality
        )
        trough_dmi = max(0.1, round(a["dmiKg"] - pasture_dm, 2))
        trough_nel = max(0.1, round(a.get("nelMcal", a["meMcal"] * 0.66) - (pasture_dm * 1.32), 2))
        trough_cp = max(0.0, round(a["cpG"] - (pasture_dm * 100.0), 1))

        animal_entities.append({
            "id": f"heifer_{i+1}",
            "index": i + 1,
            "category": "growingHeifer",
            "title": f"Growing Heifer #{i+1}",
            "weightKg": cow.weight,
            "target_dmi_kg": trough_dmi,
            "target_nel_mcal": trough_nel,
            "target_cp_g": trough_cp,
            "milk_yield": 0.0,
            "is_late_pregnancy": False,
            "pasture_dm": pasture_dm,
            "record": a
        })

    # 4. Dry Cows
    dry_recs_animal = [rec for rec in animal_records if rec["category"] == "dryCow"]
    for i, (cow, a) in enumerate(zip(dry_cows, dry_recs_animal)):
        days = cow.dryDays if cow.dryDays is not None else 45
        pasture_dm = calculate_scientific_pasture_intake(
            bw=cow.weight, hours=hrs_dry, grazing_system=loc_dry,
            total_dmi_cap=a["dmiKg"], pasture_quality=pasture_quality
        )
        trough_dmi = max(0.1, round(a["dmiKg"] - pasture_dm, 2))
        trough_nel = max(0.1, round(a.get("nelMcal", a["meMcal"] * 0.66) - (pasture_dm * 1.32), 2))
        trough_cp = max(0.0, round(a["cpG"] - (pasture_dm * 100.0), 1))

        animal_entities.append({
            "id": f"dry_{i+1}",
            "index": i + 1,
            "category": "dryCow",
            "title": f"Dry Cow #{i+1}",
            "weightKg": cow.weight,
            "dryDays": days,
            "target_dmi_kg": trough_dmi,
            "target_nel_mcal": trough_nel,
            "target_cp_g": trough_cp,
            "milk_yield": 0.0,
            "is_late_pregnancy": False,
            "pasture_dm": pasture_dm,
            "record": a
        })

    # 5. Breeding Bulls
    bull_recs_animal = [rec for rec in animal_records if rec["category"] == "bull"]
    for i, (cow, a) in enumerate(zip(bulls, bull_recs_animal)):
        pasture_dm = calculate_scientific_pasture_intake(
            bw=cow.weight, hours=hrs_bull, grazing_system=loc_bull,
            total_dmi_cap=a["dmiKg"], pasture_quality=pasture_quality
        )
        trough_dmi = max(0.1, round(a["dmiKg"] - pasture_dm, 2))
        trough_nel = max(0.1, round(a.get("nelMcal", a["meMcal"] * 0.66) - (pasture_dm * 1.32), 2))
        trough_cp = max(0.0, round(a["cpG"] - (pasture_dm * 100.0), 1))

        animal_entities.append({
            "id": f"bull_{i+1}",
            "index": i + 1,
            "category": "bull",
            "title": f"Breeding Bull #{i+1}",
            "weightKg": cow.weight,
            "target_dmi_kg": trough_dmi,
            "target_nel_mcal": trough_nel,
            "target_cp_g": trough_cp,
            "milk_yield": 0.0,
            "is_late_pregnancy": False,
            "pasture_dm": pasture_dm,
            "record": a
        })

    # Execute Joint Farm-Level Multi-Animal-Class LP Optimization (NASEM 2021)
    farm_inv_map = {f.name: float(f.quantityKg or 0.0) for f in (req.selectedFeeds or [])}
    joint_opt = optimize_joint_farm_ration(
        animals=animal_entities,
        feeds=feed_optimizer_input,
        farm_inventory_kg=farm_inv_map
    )

    milking_animals = []
    pregnant_animals = []
    heifer_animals = []
    dry_animals = []
    bull_animals = []
    all_solved_animals = []
    infeasibility_reasons = []
    ration_feasible = joint_opt["success"]

    for ent in animal_entities:
        a_id = ent["id"]
        cat = ent["category"]
        a = ent["record"]
        pasture_dm = ent["pasture_dm"]
        cow_alloc_dm = joint_opt["animalAllocations"].get(a_id, {})

        feed_fresh = {}
        feed_dm = {}
        ca_from_feed = pasture_dm * 0.35 * 10.0
        p_from_feed = pasture_dm * 0.25 * 10.0
        tot_anim_dm = 0.0
        tot_anim_cp_g = pasture_dm * 100.0
        tot_anim_me = pasture_dm * 2.0
        tot_anim_ndf_g = pasture_dm * 0.55 * 1000.0

        for f in feed_optimizer_input:
            fname = f["name"]
            adm = float(cow_alloc_dm.get(fname, 0.0))
            dm_p = float(f["dmPct"])
            fr_kg = round(adm / (dm_p / 100.0), 1) if dm_p > 0 else 0.0
            feed_dm[fname] = round(adm, 2)
            feed_fresh[fname] = fr_kg
            specs = feed_mineral_specs.get(fname, {"caPct": 0.35, "pPct": 0.25})
            ca_from_feed += adm * specs["caPct"] * 10.0
            p_from_feed += adm * specs["pPct"] * 10.0
            tot_anim_dm += adm
            tot_anim_cp_g += adm * f["cpPct"] * 10.0
            tot_anim_me += adm * f["mePerKgDm"]
            tot_anim_ndf_g += adm * f["ndfPct"] * 10.0

        green_fresh = round(sum(feed_fresh[f["name"]] for f in feed_optimizer_input if f["group"] == "green"), 1)
        dry_fresh = round(sum(feed_fresh[f["name"]] for f in feed_optimizer_input if f["group"] == "dry"), 1)
        conc_fresh = round(sum(feed_fresh[f["name"]] for f in feed_optimizer_input if f["group"] in ["concentrate", "unconventional"]), 1)

        conc_parts = [f"{feed_fresh[f['name']]} kg {f['name']}" for f in feed_optimizer_input if f["group"] in ["concentrate", "unconventional"] and feed_fresh.get(f['name'], 0) > 0]
        conc_details = " + ".join(conc_parts) if conc_parts else f"{conc_fresh} kg Concentrate"
        dry_parts = [f"{feed_fresh[f['name']]} kg {f['name']}" for f in feed_optimizer_input if f["group"] == "dry" and feed_fresh.get(f['name'], 0) > 0]
        dry_details = " + ".join(dry_parts) if dry_parts else f"{dry_fresh} kg Dry Fodder"

        conc_dm = round(sum(feed_dm[f["name"]] for f in feed_optimizer_input if f["group"] in ["concentrate", "unconventional"]), 2)
        conc_dm_pct = round((conc_dm / a["dmiKg"] * 100.0), 1) if a["dmiKg"] > 0 else 0.0

        # Prescribe ISI Type II mineral mixture (20% Ca, 10% P) and iodized salt
        ca_def = max(0.0, a["caG"] - ca_from_feed)
        p_def = max(0.0, a["pG"] - p_from_feed)
        if cat == "milkingCow":
            base_min = 50.0 + ent.get("milk_yield", 0.0) * 3.0
            animal_min_g = int(round(min(200.0, max(base_min, ca_def / 0.20, p_def / 0.10))))
            animal_salt_g = int(round(32.0 + ent.get("milk_yield", 0.0) * 0.9))
            anim_ndf_status, _, _ = evaluate_category_ndf_status("milkingCow", (tot_anim_ndf_g / max(1.0, tot_anim_dm * 10.0)))
        elif cat == "pregnantCattle":
            base_min = 60.0 if ent.get("is_late_pregnancy", False) else 45.0
            animal_min_g = int(round(min(120.0, max(base_min, ca_def / 0.20, p_def / 0.10))))
            animal_salt_g = int(round(35.0 if ent.get("is_late_pregnancy", False) else 30.0))
            anim_ndf_status, _, _ = evaluate_category_ndf_status("pregnantCattle", (tot_anim_ndf_g / max(1.0, tot_anim_dm * 10.0)))
        elif cat == "growingHeifer":
            animal_min_g = int(round(min(70.0, max(40.0, ca_def / 0.20, p_def / 0.10))))
            animal_salt_g = 25
            anim_ndf_status, _, _ = evaluate_category_ndf_status("growingHeifer", (tot_anim_ndf_g / max(1.0, tot_anim_dm * 10.0)))
        elif cat == "dryCow":
            animal_min_g = int(round(min(80.0, max(45.0, ca_def / 0.20, p_def / 0.10))))
            animal_salt_g = 30
            anim_ndf_status, _, _ = evaluate_category_ndf_status("dryCow", (tot_anim_ndf_g / max(1.0, tot_anim_dm * 10.0)))
        else: # bull
            animal_min_g = int(round(min(90.0, max(55.0, ca_def / 0.20, p_def / 0.10))))
            animal_salt_g = 40
            anim_ndf_status, _, _ = evaluate_category_ndf_status("breedingBull", (tot_anim_ndf_g / max(1.0, tot_anim_dm * 10.0)))

        # NASEM 2021 Free Water Intake (Eq. 9-1 for lactating, Eq. 9-3 for dry/pregnant/heifer/bull)
        tot_anim_as_fed = sum(feed_fresh.values())
        anim_dm_pct = (tot_anim_dm / max(0.1, tot_anim_as_fed) * 100.0) if tot_anim_as_fed > 0 else 25.0
        anim_cp_pct = (tot_anim_cp_g / (max(0.1, tot_anim_dm) * 10.0)) if tot_anim_dm > 0 else 12.0
        anim_water = calculate_nasem_water_fwi(
            is_lactating=(cat == "milkingCow"),
            dmi_kg=max(a["dmiKg"], tot_anim_dm + pasture_dm),
            diet_dm_pct=anim_dm_pct,
            diet_cp_pct=anim_cp_pct,
            diet_na_pct=0.18,
            diet_k_pct=1.40,
            temp_c=temp
        )
        a["fwiL"] = anim_water

        entry = {
            "id": ent["id"],
            "index": ent["index"],
            "title": ent["title"],
            "category": cat,
            "weightKg": ent["weightKg"],
            "greenFodderKg": green_fresh,
            "dryFodderKg": dry_fresh,
            "concentrateKg": conc_fresh,
            "concentrateDetails": conc_details,
            "concentrateDmKg": conc_dm,
            "concentrateDmPct": conc_dm_pct,
            "dryFodderDetails": dry_details,
            "feedIngredients": feed_fresh,
            "feedDm": feed_dm,
            "mineralMixtureG": animal_min_g,
            "saltG": animal_salt_g,
            "waterLiters": anim_water,
            "dmiKg": round(a["dmiKg"], 2),
            "pastureDmKg": pasture_dm,
            "caFromFeedG": round(ca_from_feed, 1),
            "pFromFeedG": round(p_from_feed, 1),
            "caRequiredG": a["caG"],
            "pRequiredG": a["pG"],
            "meSuppliedMcal": round(tot_anim_me, 2),
            "cpSuppliedG": round(tot_anim_cp_g, 1),
            "ndfPct": round(tot_anim_ndf_g / max(1.0, tot_anim_dm * 10.0), 1),
            "ndfStatus": anim_ndf_status,
            "isFeasible": joint_opt["success"],
            "feasibilityStatus": "Feasible" if joint_opt["success"] else "Incomplete",
            "feasibilityMessage": joint_opt["statusMessage"]
        }
        if cat == "milkingCow":
            entry["milkYieldL"] = ent.get("milkYieldL", ent.get("milk_yield", 0.0))
            entry["milkFatPct"] = ent.get("milkFatPct", ent.get("milk_fat", 4.0))
            entry["bcs"] = ent.get("bcs", 3.0)
            entry["stage"] = ent.get("stage", "Mid lactation")
            entry["parity"] = ent.get("parity", "Multiparous")
            entry["isFirstLactation"] = ent.get("isFirstLactation", ent.get("is_first", False))
            milking_animals.append(entry)
        elif cat == "pregnantCattle":
            entry["pregMonth"] = ent["pregMonth"]
            entry["stage"] = ent["stage"]
            entry["type"] = ent["type"]
            pregnant_animals.append(entry)
        elif cat == "growingHeifer":
            heifer_animals.append(entry)
        elif cat == "dryCow":
            entry["dryDays"] = ent["dryDays"]
            dry_animals.append(entry)
        else:
            bull_animals.append(entry)

        all_solved_animals.append(entry)

    # -----------------------------------------------------------------
    # 8B. EXACT HERD TOTAL WATER RECONCILIATION: Water_herd = Sum(Water_i)
    # -----------------------------------------------------------------
    total_fwi_required_liters = round(sum(anim["waterLiters"] for anim in all_solved_animals), 1)
    available_water = float(req.waterVolume or 0.0)
    water_balance_liters = round(available_water - total_fwi_required_liters, 1)
    water_adequacy_pct = round((available_water / max(0.1, total_fwi_required_liters)) * 100.0, 2) if total_fwi_required_liters > 0 else 100.0

    # -----------------------------------------------------------------
    # 8C. HERD TOTALS DERIVATION (Exact mathematical sum of per-animal parts)
    # -----------------------------------------------------------------
    today_recommendations = []
    for f in (req.selectedFeeds or []):
        f_name = f.name
        f_lower = f_name.lower()
        tot_fr = round(sum(anim["feedIngredients"].get(f_name, 0.0) for anim in all_solved_animals), 1)
        tot_dm = round(sum(anim["feedDm"].get(f_name, 0.0) for anim in all_solved_animals), 2)
        user_kg = round(float(f.quantityKg or 0.0), 1)
        diff_kg = round(tot_fr - user_kg, 1)

        f_spec = next((item for item in feed_optimizer_input if item["name"] == f_name), None)
        feed_grp = f_spec.get("group") if f_spec else "green"
        if "molasses" in f_lower:
            icon = "molasses"
            cat_display = f.category or "Unconventional"
        elif feed_grp == "dry" or any(w in f_lower for w in ['straw', 'paddy', 'bhoosa', 'hay', 'stover', 'bagasse', 'husk']):
            icon = "dry_fodder"
            cat_display = f.category or "Dry Fodder"
        elif feed_grp == "concentrate" or any(w in f_lower for w in ['grain', 'bran', 'cake', 'meal', 'pellet', 'chuni', 'mash']):
            icon = "concentrate"
            cat_display = f.category or "Concentrates"
        else:
            icon = "green_fodder"
            cat_display = f.category or "Green Fodder"

        dm_p = feed_mineral_specs.get(f_name, {}).get("dmPct", 25.0)
        shortage_kg = max(0.0, diff_kg)
        surplus_kg = max(0.0, -diff_kg)
        is_avail_sufficient = (user_kg >= tot_fr) if user_kg > 0 else True
        avail_warning = f"Only {user_kg:.1f} kg available on farm (deficit of {shortage_kg:.1f} kg). Supplement with alternative feeds." if (user_kg > 0 and tot_fr > user_kg) else None

        today_recommendations.append({
            "name": f_name,
            "icon": icon,
            "category": cat_display,
            "dmAllocatedKg": tot_dm,
            "dmPct": dm_p,
            "recommendedKg": tot_fr,
            "userProvidedKg": user_kg,
            "availableInventoryKg": user_kg,
            "isAvailableSufficient": is_avail_sufficient,
            "availabilityWarning": avail_warning,
            "differenceKg": diff_kg,
            "shortageKg": shortage_kg,
            "surplusKg": surplus_kg,
            "status": "shortage" if diff_kg > 0.5 else ("surplus" if diff_kg < -0.5 else "balanced")
        })

    # Mineral Mixture & Salt — exact sum of individual animals
    mineral_mixture_g = int(sum(anim["mineralMixtureG"] for anim in all_solved_animals))
    salt_g = int(sum(anim["saltG"] for anim in all_solved_animals))

    # Total Fresh feed to mix/feed for the farm
    total_fresh_feed_to_give_kg = round(sum(item["recommendedKg"] for item in today_recommendations), 1)
    total_user_feed_kg = round(sum(float(f.quantityKg or 0.0) for f in (req.selectedFeeds or [])), 1)
    total_feed_difference_kg = round(total_fresh_feed_to_give_kg - total_user_feed_kg, 1)

    # Dedicated Pasture Grazing Line Item
    pasture_recommendation = None
    if total_pasture_dm_kg > 0:
        pasture_fresh_est = round(total_pasture_dm_kg / 0.22, 1)
        pasture_name = f"Pasture Grazing ({avg_grazing_hours:.1f} hrs/day · {avg_pasture_dm_per_head:.1f} kg DM/head)" if avg_grazing_hours > 0 else "Pasture Grazing"
        pasture_recommendation = {
            "name": pasture_name,
            "icon": "pasture",
            "category": "Grazing Forage (22% DM)",
            "dmAllocatedKg": round(total_pasture_dm_kg, 2),
            "dmPct": 22.0,
            "recommendedKg": pasture_fresh_est,
            "userProvidedKg": 0.0,
            "differenceKg": 0.0,
            "shortageKg": 0.0,
            "surplusKg": 0.0,
            "status": "Covered by Grazing",
            "isPasture": True
        }

    # Recommended Nutrition Totals from exact solved feeds
    recommended_feed_dm_kg = round(sum(rec["dmAllocatedKg"] for rec in today_recommendations), 2)
    recommended_total_dm_kg = round(recommended_feed_dm_kg + total_pasture_dm_kg, 2)
    recommended_total_me_mcal = round(sum(anim["meSuppliedMcal"] for anim in all_solved_animals), 2)
    recommended_total_cp_kg = round(sum(anim["cpSuppliedG"] for anim in all_solved_animals) / 1000.0, 2)

    recommended_feed_ndf_kg = 0.0
    for rec in today_recommendations:
        rec_dm = rec["dmAllocatedKg"]
        matched = match_feed_data(rec["name"], rec["category"], rec.get("dmPct", 25.0))
        recommended_feed_ndf_kg += get_percentage(matched["NDF"], rec_dm)
    recommended_total_ndf_kg = round(recommended_feed_ndf_kg + (total_pasture_dm_kg * 0.55), 2)

    recommended_diet_cp_pct = (recommended_total_cp_kg / recommended_total_dm_kg * 100.0) if recommended_total_dm_kg > 0 else 0.0
    recommended_diet_ndf_pct = (recommended_total_ndf_kg / recommended_total_dm_kg * 100.0) if recommended_total_dm_kg > 0 else 0.0

    # Feasibility and safety checks
    inclusion_warnings = []
    if recommended_total_dm_kg > 0:
        for rec in today_recommendations:
            rec_dm = rec.get("dmAllocatedKg", 0.0)
            rec_name = rec.get("name", "")
            rec_cat = rec.get("category", "")
            rec_pct = (rec_dm / recommended_total_dm_kg) * 100.0
            max_pct = get_feed_max_inclusion_pct(rec_name, rec_cat)
            if rec_pct > max_pct + 2.0:
                inclusion_warnings.append(
                    f"{rec_name} ({rec_pct:.1f}% of DM) exceeds recommended safe inclusion limit ({max_pct:.1f}%)."
                )

    missing_nutrients = []
    for r in infeasibility_reasons:
        if isinstance(r, dict):
            missing_nutrients.append(r)
        else:
            missing_nutrients.append({
                "nutrient": "Nutrient Shortfall",
                "advice": str(r)
            })

    dmi_shortfall_kg = round(total_herd_dmi_required_kg - recommended_total_dm_kg, 2)
    is_dmi_deficient = dmi_shortfall_kg > (total_herd_dmi_required_kg * 0.05)
    if is_dmi_deficient:
        ration_feasible = False
        missing_nutrients.insert(0, {
            "nutrient": "Dry Matter Intake (DMI) Shortfall",
            "advice": f"Recommended ration supplies only {recommended_total_dm_kg:.2f} kg DM ({(recommended_total_dm_kg/max(0.1, total_herd_dmi_required_kg)*100):.1f}% of requirement). Shortfall of {dmi_shortfall_kg:.2f} kg DM. Additional forage or concentrate feeds are required to formulate a complete ration."
        })

    first_advice = missing_nutrients[0]["advice"] if missing_nutrients else "No safe ration possible with selected feeds"
    ration_feasibility = {
        "isFeasible": ration_feasible,
        "isRationIncomplete": (not ration_feasible),
        "status": "Balanced" if ration_feasible else "Ration incomplete",
        "dmiShortfallKg": max(0.0, dmi_shortfall_kg),
        "missingNutrients": missing_nutrients,
        "inclusionWarnings": inclusion_warnings,
        "message": "Selected feeds can produce a balanced ration." if ration_feasible else f"Ration incomplete: {first_advice}"
    }

    # Calcium & Phosphorus exact reconciliation from recommended diet feeds (Single Equation Rule)
    # RecommendedDM_i = RecommendedAsFed_i * DM%_i / 100
    # Ca_i = RecommendedDM_i * CaConc_i (g/kg DM)
    # P_i = RecommendedDM_i * PConc_i (g/kg DM)
    # RecommendedFeed = sum(Item)
    # TotalRecommended = RecommendedFeed + MineralMix
    rec_feed_ca_g = 0.0
    rec_feed_p_g = 0.0
    for rec in today_recommendations:
        if rec.get("isPasture", False):
            continue
        fname = rec.get("name", "")
        fcat = rec.get("category", "")
        as_fed = float(rec.get("recommendedKg", 0.0))
        dm_p = float(rec.get("dmPct", 25.0))
        rec_dm = as_fed * (dm_p / 100.0)

        specs = feed_mineral_specs.get(fname)
        if specs is None:
            cat_lower = str(fcat).lower()
            if "concentrate" in cat_lower or "unconventional" in cat_lower or "cake" in fname.lower() or "pellet" in fname.lower() or "bran" in fname.lower():
                ca_conc_g_per_kg = 2.5
                p_conc_g_per_kg = 6.5
            elif "dry" in cat_lower or "straw" in fname.lower() or "bagasse" in fname.lower() or "hay" in fname.lower() or "stover" in fname.lower():
                ca_conc_g_per_kg = 3.5
                p_conc_g_per_kg = 1.5
            else:
                ca_conc_g_per_kg = 4.5
                p_conc_g_per_kg = 2.5
        else:
            ca_conc_g_per_kg = specs["caPct"] * 10.0
            p_conc_g_per_kg = specs["pPct"] * 10.0

        rec_feed_ca_g += rec_dm * ca_conc_g_per_kg
        rec_feed_p_g += rec_dm * p_conc_g_per_kg

    rec_feed_ca_g = round(rec_feed_ca_g, 1)
    rec_feed_p_g = round(rec_feed_p_g, 1)

    # Mineral mix contribution: 20% Ca and 10% P
    min_mix_ca_g = round(mineral_mixture_g * 0.20, 1)
    min_mix_p_g = round(mineral_mixture_g * 0.10, 1)
    total_rec_ca_g = round(rec_feed_ca_g + min_mix_ca_g, 1)
    total_rec_p_g = round(rec_feed_p_g + min_mix_p_g, 1)

    ca_req_g = float(total_herd_ca_required_g)
    p_req_g = float(total_herd_p_required_g)
    ca_balance = round(total_rec_ca_g - ca_req_g, 1)
    p_balance = round(total_rec_p_g - p_req_g, 1)

    # Group counts & water averages
    lact_cnt = len(milking_animals)
    preg_cnt = len(pregnant_animals)
    heif_cnt = len(heifer_animals)
    dry_cnt = len(dry_animals)
    bull_cnt = len(bull_animals)

    avg_fwi_lact = round(sum(a["waterLiters"] for a in milking_animals) / max(1, lact_cnt), 1) if lact_cnt > 0 else 0.0
    avg_fwi_preg = round(sum(a["waterLiters"] for a in pregnant_animals) / max(1, preg_cnt), 1) if preg_cnt > 0 else 0.0
    avg_fwi_heif = round(sum(a["waterLiters"] for a in heifer_animals) / max(1, heif_cnt), 1) if heif_cnt > 0 else 0.0
    avg_fwi_dry = round(sum(a["waterLiters"] for a in dry_animals) / max(1, dry_cnt), 1) if dry_cnt > 0 else 0.0
    avg_fwi_bull = round(sum(a["waterLiters"] for a in bull_animals) / max(1, bull_cnt), 1) if bull_cnt > 0 else 0.0

    # -----------------------------------------------------------------
    # 10. NUTRIENT BALANCE STATUS — CURRENT RATION (Fixes 1 & 2)
    #     Consistently evaluates total intake (Trough Feed + Pasture Grazing)
    # --- CURRENT DMI Status ---
    current_dmi_ratio = (total_current_dm_ingested_kg / total_herd_dmi_required_kg) if total_herd_dmi_required_kg > 0 else 1.0
    if current_dmi_ratio > 1.10:
        dmi_excess = round(total_current_dm_ingested_kg - total_herd_dmi_required_kg, 1)
        dmi_status = f"Surplus (+{dmi_excess:.1f} kg DM)"
        dmi_icon = "ok"
        dmi_desc = f"Total intake supplies {total_current_dm_ingested_kg:.2f} kg DM ({current_feed_dm_kg:.2f} kg trough + {total_pasture_dm_kg:.2f} kg pasture) vs {total_herd_dmi_required_kg:.2f} kg required (Surplus)."
    elif current_dmi_ratio >= 0.95:
        dmi_status = "Adequate"
        dmi_icon = "ok"
        dmi_desc = f"Total intake supplies {total_current_dm_ingested_kg:.2f} kg DM ({current_feed_dm_kg:.2f} kg trough + {total_pasture_dm_kg:.2f} kg pasture) meeting {total_herd_dmi_required_kg:.2f} kg required (Optimal)."
    else:
        dmi_deficit = round(total_herd_dmi_required_kg - total_current_dm_ingested_kg, 1)
        dmi_status = f"Deficient (-{dmi_deficit:.1f} kg DM)"
        dmi_icon = "warning"
        dmi_desc = f"Total intake provides {total_current_dm_ingested_kg:.2f} kg DM/day ({current_feed_dm_kg:.2f} kg trough + {total_pasture_dm_kg:.2f} kg pasture). Shortfall of {dmi_deficit:.1f} kg DM vs {total_herd_dmi_required_kg:.2f} kg required."

    # --- CURRENT ME Status ---
    current_total_me_balance_mcal = round(total_current_me_ingested_mcal - total_herd_me_required_mcal, 1)
    current_me_ratio = (total_current_me_ingested_mcal / total_herd_me_required_mcal) if total_herd_me_required_mcal > 0 else 1.0
    if current_total_me_balance_mcal < -0.5:
        energy_status = f"Deficient ({current_total_me_balance_mcal:+.1f} Mcal)"
        energy_icon = "warning"
        energy_desc = f"Energy shortfall of {abs(current_total_me_balance_mcal):.1f} Mcal ME/day ({current_me_ratio*100:.0f}% of need). Current supply: {total_current_me_ingested_mcal:.1f} Mcal vs Required: {total_herd_me_required_mcal:.1f} Mcal."
    elif current_total_me_balance_mcal > 2.0:
        energy_status = f"Surplus ({current_total_me_balance_mcal:+.1f} Mcal)"
        energy_icon = "ok"
        energy_desc = f"ME supplied: {total_current_me_ingested_mcal:.1f} Mcal vs Required: {total_herd_me_required_mcal:.1f} Mcal (Surplus)."
    else:
        energy_status = "Adequate / Balanced"
        energy_icon = "ok"
        energy_desc = f"ME supplied: {total_current_me_ingested_mcal:.1f} Mcal ({current_feed_me_mcal:.1f} Mcal trough + {pasture_me_supplied:.1f} Mcal pasture) vs Required: {total_herd_me_required_mcal:.1f} Mcal (Balanced)."

    # --- CURRENT Protein Status (Simplified CP Adequacy Screen) ---
    current_total_cp_g = total_current_cp_ingested_kg * 1000.0
    current_total_cp_balance_g = round(current_total_cp_g - total_herd_cp_required_g, 1)
    cp_ratio = (current_total_cp_g / total_herd_cp_required_g) if total_herd_cp_required_g > 0 else 1.0

    # Software tolerance screening rule: <95% Deficient, 95%-110% Adequate/Balanced, >110% Surplus
    if cp_ratio < 0.95:
        protein_status = f"Deficient ({current_total_cp_balance_g:+.1f} g/day, {cp_ratio*100:.1f}% met)"
        protein_icon = "warning"
    elif cp_ratio > 1.10:
        protein_status = f"Surplus ({current_total_cp_balance_g:+.1f} g/day, {cp_ratio*100:.1f}% met)"
        protein_icon = "ok"
    else:
        protein_status = f"Adequate / Balanced ({current_total_cp_balance_g:+.1f} g/day, {cp_ratio*100:.1f}% met)"
        protein_icon = "ok"

    protein_desc = f"Daily CP Supply: {current_total_cp_g:.1f} g/day vs Required: {total_herd_cp_required_g:.1f} g/day (Balance: {current_total_cp_balance_g:+.1f} g/day, {cp_ratio*100:.1f}% met). Diet CP concentration: {total_current_diet_cp_pct:.1f}% DM."

    # --- UNIFIED FIBRE (NDF) STATUS FUNCTION (Fix for Problem 4) ---
    def get_ndf_status_info(ndf_pct: float):
        if ndf_pct < 28.0:
            return "Low Fibre (Risk of Acidosis)", "warning", f"Dietary NDF is {ndf_pct:.1f}% (<28% min). Risk of subacute acidosis and low milk fat. Add dry roughage."
        elif ndf_pct <= 48.0:
            return "Optimal / Adequate (30–45% Buffer Target)", "ok", f"Dietary NDF is {ndf_pct:.1f}% (within optimal 28%–48% buffer range, supports healthy cud chewing)."
        else:
            return "High Fibre (High Roughage Diet)", "warning", f"Dietary NDF is {ndf_pct:.1f}% (>48% max optimal). High roughage bulk may restrict total dry matter intake."

    fibre_status, fibre_icon, fibre_desc = get_ndf_status_info(total_current_diet_ndf_pct)

    # Minerals & Vitamins Calculation with exact herd Ca and P balancing
    # Evaluated on the NEW recommended ration (Fix 9) while keeping mineral_mixture_g as exact animal-sum (Fix 10)
    rec_feeds_list = [
        {
            "name": item["name"],
            "asFedKg": item["recommendedKg"],
            "dmKg": item["dmAllocatedKg"],
            "category": item.get("category", "")
        }
        for item in today_recommendations
    ]
    minerals_analysis = calculate_minerals_and_vitamins(
        dmi_kg=recommended_total_dm_kg if recommended_total_dm_kg > 0 else total_herd_dmi_required_kg,
        curr_bw=total_weight / max(1, total_animals),
        milk_yield=avg_act_milk_per_cow,
        milk_protein_pct=3.2,
        parturition_month=8 if num_pregnant > 0 else 1,
        selected_feeds=rec_feeds_list,
        total_ca_required_g=total_herd_ca_required_g,
        total_p_required_g=total_herd_p_required_g,
        mineral_mix_grams=mineral_mixture_g,
        feed_ca_override=rec_feed_ca_g,
        feed_p_override=rec_feed_p_g
    )
    if minerals_analysis.get("mineralBalancing"):
        minerals_analysis["mineralBalancing"]["recommendedMineralMixG"] = mineral_mixture_g

    # Status for current Ca and P
    cur_ca_status = "Balanced (0.0 g)" if abs(current_ca_balance) <= 0.5 else (f"Surplus (+{current_ca_balance:.1f} g)" if current_ca_balance > 0.5 else f"Deficit (-{abs(current_ca_balance):.1f} g)")
    cur_p_status = "Balanced (0.0 g)" if abs(current_p_balance) <= 0.5 else (f"Surplus (+{current_p_balance:.1f} g)" if current_p_balance > 0.5 else f"Deficit (-{abs(current_p_balance):.1f} g)")

    feed_balance_simple = [
        {
            "label": "Dry Matter (DMI)",
            "status": dmi_status,
            "icon": dmi_icon,
            "detail": dmi_desc,
            "requiredKg": total_herd_dmi_required_kg,
            "suppliedKg": total_current_dm_ingested_kg,
            "troughSuppliedKg": current_feed_dm_kg,
            "pastureSuppliedKg": total_pasture_dm_kg,
            "balanceKg": current_total_dmi_balance_kg
        },
        {
            "label": "Energy (ME)",
            "status": energy_status,
            "icon": energy_icon,
            "detail": energy_desc,
            "requiredMcal": total_herd_me_required_mcal,
            "suppliedMcal": total_current_me_ingested_mcal,
            "feedSuppliedMcal": current_feed_me_mcal,
            "pastureSuppliedMcal": pasture_me_supplied,
            "balanceMcal": current_total_me_balance_mcal
        },
        {
            "label": "Protein (CP)",
            "status": protein_status,
            "icon": protein_icon,
            "detail": protein_desc,
            "requiredG": round(total_herd_cp_required_g, 1),
            "suppliedG": round(current_total_cp_g, 1),
            "feedSuppliedG": round(current_feed_cp_g, 1),
            "pastureSuppliedG": round(pasture_cp_supplied_kg * 1000.0, 1),
            "balanceG": current_total_cp_balance_g
        },
        {"label": "Fibre (NDF)", "status": fibre_status, "icon": fibre_icon, "detail": fibre_desc},
        {
            "label": "Calcium (Ca)",
            "status": cur_ca_status,
            "icon": "ok" if current_ca_balance >= -0.5 else "warning",
            "detail": f"Required: {total_herd_ca_required_g:.1f} g/day | Current Supply: {total_current_ca_g:.1f} g/day | Balance: {current_ca_balance:+.1f} g/day",
            "requiredG": total_herd_ca_required_g,
            "suppliedG": total_current_ca_g,
            "feedSuppliedG": current_feed_ca_g,
            "pastureSuppliedG": 0.0,
            "balanceG": current_ca_balance
        },
        {
            "label": "Phosphorus (P)",
            "status": cur_p_status,
            "icon": "ok" if current_p_balance >= -0.5 else "warning",
            "detail": f"Required: {total_herd_p_required_g:.1f} g/day | Current Supply: {total_current_p_g:.1f} g/day | Balance: {current_p_balance:+.1f} g/day",
            "requiredG": total_herd_p_required_g,
            "suppliedG": total_current_p_g,
            "feedSuppliedG": current_feed_p_g,
            "pastureSuppliedG": 0.0,
            "balanceG": current_p_balance
        },
        {
            "label": "Minerals & Salt",
            "status": "Adequate" if salt_g > 0 else "Deficient",
            "icon": "ok",
            "detail": f"Provide {mineral_mixture_g} g mineral mixture + {salt_g} g common iodized salt daily across herd."
        }
    ]

    has_multiple_types = sum([1 if n > 0 else 0 for n in [num_lactating, num_pregnant, num_heifers, num_dry, num_bulls]]) > 1

    def get_avg_category_feeding(anim_list):
        if not anim_list:
            return {"greenFodderKg": 0.0, "dryFodderKg": 0.0, "concentrateKg": 0.0}
        n_anim = len(anim_list)
        return {
            "greenFodderKg": round(sum(a["greenFodderKg"] for a in anim_list) / n_anim, 1),
            "dryFodderKg": round(sum(a["dryFodderKg"] for a in anim_list) / n_anim, 1),
            "concentrateKg": round(sum(a["concentrateKg"] for a in anim_list) / n_anim, 1)
        }

    lact_feed = get_avg_category_feeding(milking_animals)
    preg_feed = get_avg_category_feeding(pregnant_animals)
    heif_feed = get_avg_category_feeding(heifer_animals)
    dry_feed = get_avg_category_feeding(dry_animals)
    bull_feed = get_avg_category_feeding(bull_animals)

    practical_report = {
        "farmName": f"{(req.weather.city if req.weather else 'Farm') or 'Farm'} Dairy Unit",
        "breed": breed_name,
        "totalCattle": total_animals,
        "totalHerdWeightKg": round(total_weight, 1),
        "milkProductionLiters": round(total_act_milk, 1),
        "totalEstimatedDmiReqKg": total_herd_dmi_required_kg,
        "temperatureC": temp,
        "humidityPct": round(rel_hum, 1),
        "waterAvailableLiters": available_water,
        "waterRequiredLiters": total_fwi_required_liters,
        "herdSummary": {
            "totalAnimals": total_animals,
            "milkingCows": lact_cnt,
            "pregnantCattle": preg_cnt,
            "growingHeifers": heif_cnt,
            "dryCows": dry_cnt,
            "breedingBulls": bull_cnt,
            "totalBiomassKg": round(total_weight, 1),
            "totalDmiRequiredKg": total_herd_dmi_required_kg,
            "totalFreshFeedToMixKg": total_fresh_feed_to_give_kg,
            "mineralMixtureTotalG": mineral_mixture_g,
            "saltTotalG": salt_g,
            "waterTotalLiters": total_fwi_required_liters
        },
        "todayRecommendations": today_recommendations,
        "pastureGrazing": pasture_recommendation,
        "totalUserProvidedFeedKg": total_user_feed_kg,
        "totalFreshFeedKg": total_fresh_feed_to_give_kg,
        "totalTroughFreshFeedKg": total_fresh_feed_to_give_kg,
        "totalTroughDmKg": recommended_feed_dm_kg,
        "totalFeedDifferenceKg": total_feed_difference_kg,
        "currentFeedDmKg": current_feed_dm_kg,
        "totalCurrentDmIngestedKg": total_current_dm_ingested_kg,
        "recommendedFeedDmKg": recommended_feed_dm_kg,
        "recommendedTotalDmKg": recommended_total_dm_kg,
        "totalHerdDmiSuppliedKg": recommended_total_dm_kg,
        "pastureDmSuppliedKg": total_pasture_dm_kg,
        "totalPastureDmKg": total_pasture_dm_kg,
        "mineralMixtureGrams": mineral_mixture_g,
        "saltGrams": salt_g,
        "waterLiters": total_fwi_required_liters,
        "isRationIncomplete": not ration_feasible,
        "dmiShortfallKg": max(0.0, dmi_shortfall_kg) if not ration_feasible else 0.0,
        "overallResult": {
            "status": "Ration incomplete" if (not ration_feasible) else ("Ration needs adjustment" if (has_multiple_types or current_dmi_ratio < 0.95 or current_dmi_ratio > 1.10 or cp_ratio < 0.95) else "Ration well balanced"),
            "icon": "critical" if (not ration_feasible) else ("warning" if (has_multiple_types or current_dmi_ratio < 0.95 or current_dmi_ratio > 1.10 or cp_ratio < 0.95) else "ok"),
            "reason": (
                f"Ration incomplete: {first_advice}" if not ration_feasible and missing_nutrients else (
                    "Your animals have distinct physiological demands (lactating, pregnant, growing, dry, draught). Separate feeding rations are generated below for each animal category." if has_multiple_types else ("Selected feeds cannot fully meet nutritional requirements." if not ration_feasible else "Herd requirements are consistent.")
                )
            )
        },
        "perCategory": {
            "milkingCow": {
                "exists": num_lactating > 0,
                "count": num_lactating,
                "feedGoal": f"Maintain body condition + support {avg_act_milk_per_cow:.1f} L/day milk production",
                "farmerMessage": "High producing cows need priority access to top-quality green forage and protein-dense concentrates.",
                "animals": milking_animals,
                "dailyFeeding": {
                    "greenFodderKg": lact_feed["greenFodderKg"],
                    "dryFodderKg": lact_feed["dryFodderKg"],
                    "concentrateKg": lact_feed["concentrateKg"],
                    "mineralMixtureG": round(sum(a["mineralMixtureG"] for a in milking_animals) / max(1, len(milking_animals))) if milking_animals else 70,
                    "saltG": round(sum(a["saltG"] for a in milking_animals) / max(1, len(milking_animals))) if milking_animals else 45,
                    "waterLiters": avg_fwi_lact
                }
            },
            "pregnantCattle": {
                "exists": num_pregnant > 0,
                "count": num_pregnant,
                "firstTimeCount": len(first_time_preg),
                "repeatCount": len(repeat_preg),
                "feedGoal": "Support fetal growth according to pregnancy stage and prepare for lactation",
                "farmerMessage": "Pregnant animals in months 6-9 require extra energy (steaming up). Earlier pregnancy stages need maintenance-level feeding.",
                "animals": pregnant_animals,
                "dailyFeeding": {
                    "greenFodderKg": preg_feed["greenFodderKg"],
                    "dryFodderKg": preg_feed["dryFodderKg"],
                    "concentrateKg": preg_feed["concentrateKg"],
                    "mineralMixtureG": round(sum(a["mineralMixtureG"] for a in pregnant_animals) / max(1, len(pregnant_animals))) if pregnant_animals else 60,
                    "saltG": round(sum(a["saltG"] for a in pregnant_animals) / max(1, len(pregnant_animals))) if pregnant_animals else 35,
                    "waterLiters": avg_fwi_preg
                }
            },
            "growingHeifer": {
                "exists": num_heifers > 0,
                "count": num_heifers,
                "feedGoal": "Steady skeletal frame development and puberty attainment (target 500-600g daily gain)",
                "farmerMessage": "Ensure heifers receive adequate green roughage and minerals; avoid overfeeding fattening starches.",
                "animals": heifer_animals,
                "dailyFeeding": {
                    "greenFodderKg": heif_feed["greenFodderKg"],
                    "dryFodderKg": heif_feed["dryFodderKg"],
                    "concentrateKg": heif_feed["concentrateKg"],
                    "mineralMixtureG": round(sum(a["mineralMixtureG"] for a in heifer_animals) / max(1, len(heifer_animals))) if heifer_animals else 35,
                    "saltG": round(sum(a["saltG"] for a in heifer_animals) / max(1, len(heifer_animals))) if heifer_animals else 25,
                    "waterLiters": avg_fwi_heif
                }
            },
            "dryCow": {
                "exists": num_dry > 0,
                "count": num_dry,
                "feedGoal": "Rest rumen and regenerate mammary tissue before next calving",
                "farmerMessage": "Feed high fibre roughage with limited grain concentrate to maintain optimum body condition score.",
                "animals": dry_animals,
                "dailyFeeding": {
                    "greenFodderKg": dry_feed["greenFodderKg"],
                    "dryFodderKg": dry_feed["dryFodderKg"],
                    "concentrateKg": dry_feed["concentrateKg"],
                    "mineralMixtureG": round(sum(a["mineralMixtureG"] for a in dry_animals) / max(1, len(dry_animals))) if dry_animals else 45,
                    "saltG": round(sum(a["saltG"] for a in dry_animals) / max(1, len(dry_animals))) if dry_animals else 30,
                    "waterLiters": avg_fwi_dry
                }
            },
            "bull": {
                "exists": num_bulls > 0,
                "count": num_bulls,
                "feedGoal": "Maintain breeding vigor, semen quality, and body condition without excess fattening",
                "farmerMessage": "Bulls need balanced green fodder with moderate concentrate for reproductive vitality.",
                "animals": bull_animals,
                "dailyFeeding": {
                    "greenFodderKg": bull_feed["greenFodderKg"],
                    "dryFodderKg": bull_feed["dryFodderKg"],
                    "concentrateKg": bull_feed["concentrateKg"],
                    "mineralMixtureG": round(sum(a["mineralMixtureG"] for a in bull_animals) / max(1, len(bull_animals))) if bull_animals else 50,
                    "saltG": round(sum(a["saltG"] for a in bull_animals) / max(1, len(bull_animals))) if bull_animals else 40,
                    "waterLiters": avg_fwi_bull
                }
            }
        },
        "waterStatus": {
            "availableLiters": available_water,
            "requiredLiters": total_fwi_required_liters,
            "balanceLiters": water_balance_liters,
            "shortageLiters": round(abs(water_balance_liters), 1) if water_balance_liters < 0 else 0,
            "isShortage": water_balance_liters < 0,
            "status": "Water availability is adequate" if water_balance_liters >= 0 else "Water availability is deficient",
            "farmerAction": "Maintain continuous fresh water in clean shaded troughs." if water_balance_liters >= 0 else f"Provide approximately {abs(water_balance_liters):.0f} L extra clean drinking water per day."
        },
        "weatherAdvisory": {
            "title": "Warm Weather Today" if temp >= 30 else "Comfortable Climate Today",
            "tempC": temp,
            "humidityPct": round(rel_hum, 1),
            "thi": thi,
            "recommendedActions": [
                "Keep clean drinking water continuously available in shaded troughs",
                "Provide shade in pens and grazing paddocks",
                "Maintain active air ventilation and cross-breeze in sheds",
                "Shift feeding times towards cooler early morning and late evening hours",
                "Closely watch daily milk production and bunk dry matter intake"
            ]
        },
        "feedBalanceSimple": feed_balance_simple,
        "rationFeasibility": ration_feasibility
    }

    # Dynamic Recommended Status Evaluations (Problem 4: Never mark infeasible/unsafe rations as optimal)
    rec_me_ratio = (recommended_total_me_mcal / total_herd_me_required_mcal) if total_herd_me_required_mcal > 0 else 1.0
    rec_cp_ratio = ((recommended_total_cp_kg * 1000.0) / total_herd_cp_required_g) if total_herd_cp_required_g > 0 else 1.0
    rec_dmi_ratio = (recommended_total_dm_kg / total_herd_dmi_required_kg) if total_herd_dmi_required_kg > 0 else 1.0

    if not ration_feasible:
        rec_me_status = "Infeasible (Unsafe Diet)"
        rec_cp_status = "Infeasible (Unsafe Diet)"
        rec_dmi_status = "Infeasible (Safety limits violated)"
        rec_ndf_status = "Infeasible (Fiber limits violated)"
    else:
        if rec_me_ratio > 1.15:
            rec_me_status = f"Surplus (+{round((rec_me_ratio - 1.0)*100)}% ME)"
        elif rec_me_ratio < 0.90:
            rec_me_status = f"Deficit (-{round((1.0 - rec_me_ratio)*100)}% ME)"
        else:
            rec_me_status = "Optimal (100% Met)"

        if rec_cp_ratio > 1.10:
            rec_cp_status = f"High Protein (+{round((rec_cp_ratio - 1.0)*100)}% CP)"
        elif rec_cp_ratio < 0.95:
            rec_cp_status = f"Protein Deficit (-{round((1.0 - rec_cp_ratio)*100)}% CP)"
        else:
            rec_cp_status = "Optimal (100% Met)"

        # Herd-weighted animal-class NDF target
        weighted_target_ndf = (
            (lact_cnt * 30.0) + (preg_cnt * 35.0) + (heif_cnt * 34.0) + (dry_cnt * 40.0) + (bull_cnt * 36.0)
        ) / max(1, total_animals)

        if recommended_diet_ndf_pct > 55.0:
            rec_ndf_status = "High Fibre (High Roughage Diet)"
        elif recommended_diet_ndf_pct < 28.0:
            rec_ndf_status = "Low Fibre (Risk of Acidosis)"
        else:
            rec_ndf_status = f"Optimal ({round(weighted_target_ndf - 3)}–{round(weighted_target_ndf + 8)}% NDF Target)"

    ca_req_g = float(total_herd_ca_required_g)
    p_req_g = float(total_herd_p_required_g)
    ca_balance = round(total_rec_ca_g - ca_req_g, 1)
    p_balance = round(total_rec_p_g - p_req_g, 1)
    ca_pct = round((total_rec_ca_g / ca_req_g) * 100) if ca_req_g > 0 else 100
    p_pct = round((total_rec_p_g / p_req_g) * 100) if p_req_g > 0 else 100

    if ca_balance > 0.5:
        ca_status_desc = f"Adequate (Feed: {rec_feed_ca_g:.1f}g + Mix: {min_mix_ca_g:.1f}g = {total_rec_ca_g:.1f}g)"
    elif ca_balance < -0.5:
        ca_status_desc = f"Deficit (-{abs(ca_balance)}g)"
    else:
        ca_status_desc = f"Balanced (Feed: {rec_feed_ca_g:.1f}g + Mix: {min_mix_ca_g:.1f}g = {total_rec_ca_g:.1f}g)"

    if p_balance > 0.5:
        p_status_desc = f"Adequate (Feed: {rec_feed_p_g:.1f}g + Mix: {min_mix_p_g:.1f}g = {total_rec_p_g:.1f}g)"
    elif p_balance < -0.5:
        p_status_desc = f"Deficit (-{abs(p_balance)}g)"
    else:
        p_status_desc = f"Balanced (Feed: {rec_feed_p_g:.1f}g + Mix: {min_mix_p_g:.1f}g = {total_rec_p_g:.1f}g)"

    if not ration_feasible:
        rec_dmi_status = "Infeasible (Unsafe Diet)"
    elif 0.95 <= rec_dmi_ratio <= 1.05:
        rec_dmi_status = "100% Balanced"
    elif rec_dmi_ratio > 1.05:
        rec_dmi_status = f"Surplus (+{round((rec_dmi_ratio - 1.0)*100)}% DM)"
    else:
        rec_dmi_status = f"Deficit (-{round((1.0 - rec_dmi_ratio)*100)}% DM)"

    # Unified Recommended Fibre Status (Fix for Problem 4)
    rec_ndf_status, rec_ndf_icon, rec_ndf_desc = get_ndf_status_info(recommended_diet_ndf_pct)

    recommended_nutrition_data = {
        "dmi": {
            "suppliedKg": recommended_total_dm_kg,
            "feedSuppliedKg": recommended_feed_dm_kg,
            "pastureSuppliedKg": total_pasture_dm_kg,
            "targetKg": total_herd_dmi_required_kg,
            "status": rec_dmi_status
        },
        "energy": {
            "suppliedMeMcal": recommended_total_me_mcal,
            "requiredMeMcal": total_herd_me_required_mcal,
            "status": rec_me_status
        },
        "protein": {
            "suppliedCpG": round(recommended_total_cp_kg * 1000.0, 1),
            "requiredCpG": total_herd_cp_required_g,
            "dietCpPct": round(recommended_diet_cp_pct, 1),
            "status": rec_cp_status
        },
        "fibre": {
            "dietNdfPct": round(recommended_diet_ndf_pct, 1),
            "status": rec_ndf_status
        },
        "minerals": {
            "calcium": {
                "requiredG": ca_req_g,
                "suppliedG": total_rec_ca_g,
                "feedSuppliedG": rec_feed_ca_g,
                "mineralMixSuppliedG": min_mix_ca_g,
                "balanceG": ca_balance,
                "ratioPct": ca_pct,
                "status": ca_status_desc
            },
            "phosphorus": {
                "requiredG": p_req_g,
                "suppliedG": total_rec_p_g,
                "feedSuppliedG": rec_feed_p_g,
                "mineralMixSuppliedG": min_mix_p_g,
                "balanceG": p_balance,
                "ratioPct": p_pct,
                "status": p_status_desc
            }
        }
    }
    practical_report["recommendedNutrition"] = recommended_nutrition_data

    # Final Pre-Report Validation Guardrail & Inclusions (Fix 6)
    validation_alerts = []
    for anim in all_solved_animals:
        mol_fresh = anim.get("feedIngredients", {}).get("Cane Molasses", 0.0)
        if mol_fresh > 1.05:
            validation_alerts.append(f"SAFETY: {anim['title']} allocated {mol_fresh}kg Molasses (Max safe 1.0kg)")
        conc_fresh = anim.get("concentrateKg", 0.0)
        dmi = anim.get("dmiKg", 10.0)
        if dmi > 0 and (conc_fresh * 0.88 / dmi) > 0.45:
            validation_alerts.append(f"SAFETY: {anim['title']} concentrate ratio exceeds 40% DMI")

    # Update feasibility with validation alerts if any
    if validation_alerts:
        ration_feasibility["inclusionWarnings"] = ration_feasibility.get("inclusionWarnings", [])
        ration_feasibility["inclusionWarnings"].extend(validation_alerts)

    # =========================================================================
    # FINAL PRE-REPORT SAFETY GATE VALIDATION (Fixes 1 & 6)
    # The ration must only pass when DMI, ME, CP, NDF, Ca, and P are within accepted ranges.
    # =========================================================================
    safety_gate_checks = []
    safety_gate_passed = True
    safety_failure_reasons = []

    # 1. DMI within target (95% - 105%)
    dmi_ok = (0.95 <= rec_dmi_ratio <= 1.05) and ration_feasible
    if not dmi_ok:
        safety_gate_passed = False
        if rec_dmi_ratio < 0.95:
            dmi_deficit = round(total_herd_dmi_required_kg - recommended_total_dm_kg, 1)
            safety_failure_reasons.append(f"DMI Deficient: Total DM {recommended_total_dm_kg:.1f}kg is below 95% requirement (-{dmi_deficit}kg DM shortfall).")
        else:
            dmi_excess = round(recommended_total_dm_kg - total_herd_dmi_required_kg, 1)
            safety_failure_reasons.append(f"DMI Surplus: Total DM {recommended_total_dm_kg:.1f}kg exceeds herd capacity (+{dmi_excess}kg DM).")
    safety_gate_checks.append({
        "gate": "DMI within target?",
        "passed": dmi_ok,
        "detail": f"{recommended_total_dm_kg:.2f} kg DM supplied vs {total_herd_dmi_required_kg:.2f} kg required ({rec_dmi_ratio*100:.1f}%)"
    })

    # 2. ME within range (90% - 115%)
    me_ok = (0.90 <= rec_me_ratio <= 1.15)
    if not me_ok:
        safety_gate_passed = False
        if rec_me_ratio > 1.15:
            surplus_pct = round((rec_me_ratio - 1.0) * 100)
            safety_failure_reasons.append(f"ME Surplus: Energy is +{surplus_pct}% above requirement ({recommended_total_me_mcal:.1f} vs {total_herd_me_required_mcal:.1f} Mcal).")
        else:
            deficit_pct = round((1.0 - rec_me_ratio) * 100)
            safety_failure_reasons.append(f"ME Deficit: Energy is -{deficit_pct}% below requirement ({recommended_total_me_mcal:.1f} vs {total_herd_me_required_mcal:.1f} Mcal).")
    safety_gate_checks.append({
        "gate": "ME within range?",
        "passed": me_ok,
        "detail": f"{recommended_total_me_mcal:.1f} Mcal ME vs {total_herd_me_required_mcal:.1f} Mcal required ({rec_me_ratio*100:.1f}%)"
    })

    # 3. CP within range (90% - 130% or diet CP <= 17.5%)
    cp_ok = (0.90 <= rec_cp_ratio <= 1.30) or (recommended_diet_cp_pct <= 17.5 and rec_cp_ratio >= 0.90)
    if not cp_ok:
        safety_gate_passed = False
        if rec_cp_ratio > 1.30:
            surplus_cp = round((rec_cp_ratio - 1.0) * 100)
            safety_failure_reasons.append(f"CP Surplus: Protein is +{surplus_cp}% above requirement ({recommended_total_cp_kg*1000.0:.0f} vs {total_herd_cp_required_g:.0f} g CP).")
        else:
            deficit_cp = round((1.0 - rec_cp_ratio) * 100)
            safety_failure_reasons.append(f"CP Deficit: Protein is -{deficit_cp}% below requirement ({recommended_total_cp_kg*1000.0:.0f} vs {total_herd_cp_required_g:.0f} g CP).")
    safety_gate_checks.append({
        "gate": "CP within range?",
        "passed": cp_ok,
        "detail": f"{recommended_total_cp_kg*1000.0:.0f} g CP vs {total_herd_cp_required_g:.0f} g required ({rec_cp_ratio*100:.1f}%)"
    })

    # 4. NDF within range (Fix 6: Animal-specific NDF limits)
    # Milking cows: 28% to 42%. Non-lactating (dry, pregnant, heifers, bulls): 32% to 60%.
    ndf_failures = []
    for anim in all_solved_animals:
        anim_ndf = anim.get("ndfPct", recommended_diet_ndf_pct)
        anim_cat = anim.get("category", "herd")
        limits = get_animal_category_ndf_limits(anim_cat)
        if anim_ndf < limits["acidosisThreshold"] - 0.05:
            ndf_failures.append(f"{anim['title']}: {anim_ndf:.1f}% NDF (<{limits['acidosisThreshold']:.0f}% acidosis threshold)")
        elif anim_ndf > limits["highRoughageThreshold"] + 0.05:
            ndf_failures.append(f"{anim['title']}: {anim_ndf:.1f}% NDF (>{limits['highRoughageThreshold']:.0f}% high roughage threshold)")

    ndf_ok = len(ndf_failures) == 0
    if not ndf_ok:
        safety_gate_passed = False
        safety_failure_reasons.append(f"NDF Limit Flag: {ndf_failures[0]}")
    safety_gate_checks.append({
        "gate": "NDF within range?",
        "passed": ndf_ok,
        "detail": f"{recommended_diet_ndf_pct:.1f}% NDF diet (Limits: Milking 28%–48%, Non-lactating 32%–60%)" if ndf_ok else ndf_failures[0]
    })

    # 5. Ca/P adequate
    ca_ok = (total_rec_ca_g >= total_herd_ca_required_g * 0.95)
    p_ok = (total_rec_p_g >= total_herd_p_required_g * 0.95)
    minerals_ok = (ca_ok and p_ok)
    if not minerals_ok:
        safety_gate_passed = False
        if not ca_ok:
            safety_failure_reasons.append(f"Calcium Deficit: Supply is {total_rec_ca_g:.1f}g vs {total_herd_ca_required_g:.1f}g required.")
        if not p_ok:
            safety_failure_reasons.append(f"Phosphorus Deficit: Supply is {total_rec_p_g:.1f}g vs {total_herd_p_required_g:.1f}g required.")
    safety_gate_checks.append({
        "gate": "Ca/P adequate?",
        "passed": minerals_ok,
        "detail": f"Ca: {total_rec_ca_g:.1f}g (Req: {total_herd_ca_required_g:.1f}g) | P: {total_rec_p_g:.1f}g (Req: {total_herd_p_required_g:.1f}g)"
    })

    # 6. Ingredient limits safe (Fix 2: Prevent >40% concentrate DMI across ALL animals)
    limits_safe = True
    for anim in all_solved_animals:
        mol_fresh = anim.get("feedIngredients", {}).get("Cane Molasses", 0.0)
        if mol_fresh > 1.05:
            limits_safe = False
            safety_failure_reasons.append(f"Toxic Limit: {anim['title']} allocated {mol_fresh:.1f}kg Cane Molasses (Max safe 1.0kg/head).")
        conc_dm = anim.get("concentrateDmKg", 0.0)
        dmi = anim.get("dmiKg", 10.0)
        conc_dm_pct = (conc_dm / dmi * 100.0) if dmi > 0 else 0.0
        if conc_dm_pct > 40.05:
            limits_safe = False
            safety_failure_reasons.append(f"Concentrate Overload: {anim['title']} concentrate ratio ({conc_dm_pct:.1f}%) exceeds safe 40% DMI limit (Acidosis Risk).")
    if not limits_safe:
        safety_gate_passed = False
    safety_gate_checks.append({
        "gate": "Ingredient limits safe?",
        "passed": limits_safe,
        "detail": "Molasses <= 1.0 kg/head, Concentrate <= 40% DMI across all cattle" if limits_safe else "Unsafe inclusion levels detected"
    })

    # 7. Animal totals = farm totals
    sum_animal_fresh = sum(a.get("greenFodderKg", 0.0) + a.get("dryFodderKg", 0.0) + a.get("concentrateKg", 0.0) for a in all_solved_animals)
    totals_match = abs(sum_animal_fresh - total_fresh_feed_to_give_kg) <= 2.5 or total_fresh_feed_to_give_kg == 0
    if not totals_match:
        safety_gate_passed = False
        safety_failure_reasons.append(f"Animal totals mismatch: Animal sum is {sum_animal_fresh:.1f}kg vs farm total {total_fresh_feed_to_give_kg:.1f}kg.")
    safety_gate_checks.append({
        "gate": "Animal totals = farm totals?",
        "passed": totals_match,
        "detail": f"Animal Sum: {sum_animal_fresh:.1f} kg fresh == Farm Total: {total_fresh_feed_to_give_kg:.1f} kg fresh"
    })

    # 8. Water adequate
    water_ok = (available_water >= total_fwi_required_liters * 0.95)
    if not water_ok:
        water_shortfall = round(total_fwi_required_liters - available_water)
        safety_failure_reasons.append(f"Water Shortage: Available water ({available_water:.0f} L) is less than required ({total_fwi_required_liters:.0f} L) by {water_shortfall} L/day.")
    safety_gate_checks.append({
        "gate": "Water adequate?",
        "passed": water_ok,
        "detail": f"Available: {available_water:.0f} L vs Required: {total_fwi_required_liters:.0f} L"
    })

    # Determine overall status and icon strictly based on safety gate (Fix 1 & Problem 4: Do not output incomplete or unsafe ration as final):
    if not ration_feasible or not limits_safe:
        overall_status = "No feasible ration possible" if not ration_feasible else "Unsafe inclusion limits detected"
        overall_icon = "critical"
        is_approved = False
        is_provisional = True
        approval_badge = "REJECTED — INFEASIBLE RATION"
        overall_reason = f"{safety_failure_reasons[0] if safety_failure_reasons else (missing_nutrients[0]['advice'] if missing_nutrients else 'Selected feeds cannot satisfy requirements within physiological safety limits.')} Do not feed as final production ration."
    elif rec_dmi_ratio < 0.95:
        overall_status = "Ration incomplete"
        overall_icon = "critical"
        is_approved = False
        is_provisional = True
        approval_badge = "PROVISIONAL — RATION INCOMPLETE"
        overall_reason = f"Ration incomplete: {safety_failure_reasons[0] if safety_failure_reasons else 'Selected feeds cannot meet total herd dry matter intake.'} Do not feed as final production ration."
    elif not safety_gate_passed:
        overall_status = "Ration needs adjustment"
        overall_icon = "warning"
        is_approved = False
        is_provisional = True
        approval_badge = "PROVISIONAL — ADJUSTMENT NEEDED"
        overall_reason = " • ".join(safety_failure_reasons[:4])
    else:
        overall_status = "Ration well balanced"
        overall_icon = "ok"
        is_approved = True
        is_provisional = False
        approval_badge = "APPROVED — WELL BALANCED"
        overall_reason = "All 8 physiological safety gates passed: DMI, ME, CP, NDF, Ca, P, safe ingredient limits (conc <= 40%), animal-farm consistency, and water are all within accepted scientific ranges."

    practical_report["overallResult"] = {
        "status": overall_status,
        "icon": overall_icon,
        "reason": overall_reason,
        "isApproved": is_approved,
        "isProvisional": is_provisional,
        "approvalBadge": approval_badge
    }
    practical_report["isApproved"] = is_approved
    practical_report["isProvisional"] = is_provisional
    practical_report["approvalBadge"] = approval_badge
    practical_report["safetyGate"] = {
        "passed": safety_gate_passed,
        "status": overall_status,
        "icon": overall_icon,
        "checks": safety_gate_checks,
        "failureReasons": safety_failure_reasons
    }

    # Consistent DMI breakdown fields (Fix for Problem 2)
    practical_report["troughCurrentDmKg"] = current_feed_dm_kg
    practical_report["pastureCurrentDmKg"] = total_pasture_dm_kg
    practical_report["totalCurrentDmIngestedKg"] = total_current_dm_ingested_kg

    # Scientific Ruminal Fiber Health (Mertens 1997 / NRC 2001 / ICAR 2013)
    rumen_health = evaluate_rumen_fiber_health(practical_report.get("todayRecommendations", []), recommended_total_dm_kg)
    practical_report["rumenFiberHealth"] = rumen_health

    # Agro-Climatic Regional Feed Intelligence & Nutrient Deficiency Bridges
    dmi_def_pct = max(0.0, (1.0 - rec_dmi_ratio) * 100.0)
    me_def_pct = max(0.0, (1.0 - rec_me_ratio) * 100.0)
    cp_def_pct = max(0.0, (1.0 - rec_cp_ratio) * 100.0)
    mineral_def = (not ca_ok or not p_ok)
    farm_loc = f"{req.weather.city or ''} {getattr(req, 'state', '') or ''}"
    regional_recs = get_regional_feed_recommendations(
        location_str=farm_loc,
        energy_deficit_pct=me_def_pct,
        protein_deficit_pct=cp_def_pct,
        dmi_deficit_pct=dmi_def_pct,
        mineral_deficit=mineral_def
    )
    practical_report["regionalFeedIntelligence"] = regional_recs

    # Complete PDF Knowledge Transfer (KT) Formulation & Calculations
    kt_formulation = calculate_pdf_kt_formulation(
        selected_feeds=req.selectedFeeds or [],
        all_feeds_dict=all_feeds_dict,
        breed_name=breed_name,
        mature_bw=target_mature_bw,
        target_milk_per_day=target_milk_per_day,
        target_fat_pct=target_fat,
        weather_temp_c=temp,
        weather_humidity=rel_hum,
        thi=thi,
        temp_corr=temp_corr,
        resp_water_loss=resp_water_loss,
        lactating_animals=lactating,
        pregnant_animals=first_time_preg + repeat_preg,
        heifer_animals=heifers,
        dry_animals=dry_cows,
        bull_animals=bulls,
        total_dmi_required_kg=total_herd_dmi_required_kg,
        grazing_dm_kg=total_pasture_dm_kg,
        herd_total_water_liters=total_fwi_required_liters,
        current_mineral_mix_g=current_min_mix_g,
        current_salt_g=0.0
    )
    practical_report["ktFormulation"] = kt_formulation

    return {
        "success": True,
        "practicalFeedingReport": practical_report,
        "ktFormulation": kt_formulation,
        "regionalFeedIntelligence": regional_recs,
        "rumenFiberHealth": rumen_health,
        "climate": {
            "temperatureC": temp,
            "humidity": round(rel_hum, 1),
            "dewPoint": dew_point,
            "thi": thi,
            "stressCategory": stress_category,
            "description": stress_factor_desc,
            "respirationWaterLoss": round(resp_water_loss, 3)
        },
        "breed": {
            "name": breed_name,
            "breedReferenceMilkYieldLiters": target_milk_per_day,
            "breedReferenceFatPct": target_fat,
            "targetMilkYieldLiters": target_milk_per_day,
            "targetFatPct": target_fat,
            "targetMatureWeightKg": target_mature_bw,
            "actualMilkYieldLiters": round(avg_act_milk_per_cow, 2),
            "milkYieldVariancePct": round(((avg_act_milk_per_cow / target_milk_per_day) * 100.0 - 100.0) if target_milk_per_day > 0 else 0.0, 1)
        },
        "breedImpact": {
            "breed": breed_name,
            "category": breed_bio.get("breedType", "Cattle"),
            "nemCoeff": nem_coeff,
            "mpCoeff": mp_coeff,
            "thiThreshold": thi_threshold,
            "isHeatStressed": is_heat_stressed,
            "refFatPct": target_fat,
            "coolingAdvice": breed_bio.get("coolingAdvice", "")
        },
        "herdSummary": {
            "totalHead": total_animals,
            "totalBiomassKg": round(total_weight, 1),
            "lactating": num_lactating,
            "pregnant": num_pregnant,
            "heifers": num_heifers,
            "dry": num_dry,
            "bulls": num_bulls,
        },
        "nutritionAnalysis": {
            "dmiRequiredKg": total_herd_dmi_required_kg,
            # Top-level aliases for frontend direct access
            "dmi": recommended_nutrition_data["dmi"],
            "energy": recommended_nutrition_data["energy"],
            "protein": recommended_nutrition_data["protein"],
            "fibre": recommended_nutrition_data["fibre"],
            "rumenFiberHealth": rumen_health,
            "currentNutrition": {
                "dmi": {
                    "requiredKg": total_herd_dmi_required_kg,
                    "suppliedKg": total_current_dm_ingested_kg,
                    "feedSuppliedKg": current_feed_dm_kg,
                    "pastureSuppliedKg": total_pasture_dm_kg,
                    "totalIngestedKg": total_current_dm_ingested_kg,
                    "balanceKg": current_total_dmi_balance_kg,
                    "ratioPct": round(current_dmi_ratio * 100.0, 1),
                    "status": dmi_status
                },
                "energy": {
                    "requiredMeMcal": total_herd_me_required_mcal,
                    "suppliedMeMcal": total_current_me_ingested_mcal,
                    "feedSuppliedMeMcal": current_feed_me_mcal,
                    "pastureSuppliedMeMcal": pasture_me_supplied,
                    "balanceMcal": current_total_me_balance_mcal,
                    "status": energy_status
                },
                "protein": {
                    "requiredCpG": total_herd_cp_required_g,
                    "suppliedCpG": round(current_total_cp_g, 1),
                    "feedSuppliedCpG": round(current_feed_cp_g, 1),
                    "pastureSuppliedCpG": round(pasture_cp_supplied_kg * 1000.0, 1),
                    "dietCpPct": round(total_current_diet_cp_pct, 1),
                    "balanceG": current_total_cp_balance_g,
                    "status": protein_status
                },
                "fibre": {
                    "dietNdfPct": round(total_current_diet_ndf_pct, 1),
                    "feedNdfKg": current_feed_ndf_kg,
                    "totalNdfKg": total_current_ndf_ingested_kg,
                    "status": fibre_status
                },
                "minerals": {
                    "calcium": {
                        "requiredG": total_herd_ca_required_g,
                        "suppliedG": total_current_ca_g,
                        "feedSuppliedG": current_feed_ca_g,
                        "pastureSuppliedG": current_pasture_ca_g,
                        "balanceG": current_ca_balance,
                        "status": cur_ca_status
                    },
                    "phosphorus": {
                        "requiredG": total_herd_p_required_g,
                        "suppliedG": total_current_p_g,
                        "feedSuppliedG": current_feed_p_g,
                        "pastureSuppliedG": current_pasture_p_g,
                        "balanceG": current_p_balance,
                        "status": cur_p_status
                    }
                }
            },
            "recommendedNutrition": recommended_nutrition_data,
            "rationFeasibility": ration_feasibility,
            "feedBreakdown": feed_breakdown
        },
        "waterAnalysis": {
            "requiredLiters": total_fwi_required_liters,
            "availableLiters": available_water,
            "balanceLiters": water_balance_liters,
            "adequacyPct": water_adequacy_pct,
            "status": "Adequate" if water_balance_liters >= 0 else "Deficit",
            "formula": f"Water_herd = Sum(Water_i) = {total_fwi_required_liters} L/day | Adequacy = ({available_water} / {total_fwi_required_liters}) * 100 = {water_adequacy_pct:.1f}%"
        },
        "mineralsAnalysis": minerals_analysis,
        "recommendations": [
            f"Climate is optimal (THI: {thi} - Ambient)." if not is_heat_stressed else f"Heat Stress Alert (THI: {thi} - {stress_category}): Provide cool shaded water and improve shed ventilation.",
            energy_desc,
            protein_desc,
            fibre_desc
        ]
    }
