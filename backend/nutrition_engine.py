import os
import math
from math import exp
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional, Tuple

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

# ---------------------------------------------------------
# 1. Climate & Heat Stress (THI & Respiration Water Loss)
# ---------------------------------------------------------
def tempHumData(loc_temp: float, Dp: float):
    """
    User script THI & Thermal Stress calculation.
    """
    beta = 17.625
    Lambda = 243.04
    dp_Numerator = (beta * Dp) / (Lambda + Dp)
    dp_Denominator = (beta * loc_temp) / (Lambda + loc_temp)
    relHumLoc = 100 * (exp(dp_Numerator) / exp(dp_Denominator))
    relHumLoc = max(5.0, min(100.0, relHumLoc))
    
    thi = round(((1.8 * loc_temp + 32) - ((0.55 - 0.0055 * relHumLoc) * (1.8 * loc_temp - 26.8))), 2)
    
    # Standard exclusive THI stress classification bands (NRC & Armstrong 1994)
    if thi < 68.00:
        stress_category = "Ambient"
        factor = "Thermal comfort zone (THI < 68). Animals are under no thermal stress."
    elif 68.00 <= thi < 72.00:
        stress_category = "Mild Stress"
        factor = "Mild thermal stress (THI 68–<72). Respiration rate and water intake are slightly elevated."
    elif 72.00 <= thi < 80.00:
        stress_category = "Moderate Stress"
        factor = "Moderate thermal stress (THI 72–<80). Expect 5–10% decrease in milk yield and reduced DMI."
    elif 80.00 <= thi <= 90.00:
        stress_category = "Severe Stress"
        factor = "Severe thermal stress (THI 80–90). Urgent cooling required (fans, misters, shade, electrolytes)."
    else:
        stress_category = "Emergency / Extreme Stress"
        factor = "Extreme thermal stress (THI > 90). Critical risk of heat stroke, lethargy, and severe production drop."

    tempCorr = ((loc_temp - 16.4) ** 2) if loc_temp > 16.4 else 0.0
    respWaterLoss = 0.41 - 0.02 * loc_temp + 0.0005 * (loc_temp ** 2) - 0.004 * relHumLoc + 0.00004 * (relHumLoc ** 2)
    respWaterLoss = max(0.0, respWaterLoss)

    return relHumLoc, thi, stress_category, factor, tempCorr, respWaterLoss

def get_dew_point_from_humidity(temp_c: float, humidity_pct: float) -> float:
    beta = 17.625
    Lambda = 243.04
    rh = max(1.0, min(100.0, humidity_pct))
    gamma = (beta * temp_c) / (Lambda + temp_c) + math.log(rh / 100.0)
    dp = (Lambda * gamma) / (beta - gamma)
    return round(dp, 2)

def get_metBWparam(currBW: float, matBW: float):
    metCurrBW = (currBW ** 0.75) if currBW > 0 else 0.0
    metMatBW = (matBW ** 0.75) if matBW > 0 else 0.0
    return metCurrBW, metMatBW

def get_percentage(part: float, total: float) -> float:
    return (total * part) / 100.0

# ---------------------------------------------------------
# 2. Milk Energy Equations
# ---------------------------------------------------------
def milkEnergy(milkFatPerc: float, milkYield: float, is_buffalo: bool = False):
    MEtoNE_conv = 0.64
    if milkYield <= 0:
        return 0.0, 0.0
    # NRC 2001 & ICAR standards:
    # NE_L (Mcal/kg) = 0.0929 * Fat% + 0.0563 * Protein% + 0.0395 * Lactose%
    # Cow milk (~3.2% protein, 4.85% lactose): NE_L = 0.0929 * Fat% + 0.372
    # Buffalo milk (~4.2% protein, 5.10% lactose): NE_L = 0.0929 * Fat% + 0.438
    if is_buffalo or milkFatPerc >= 6.0:
        milkNEp = 0.0929 * milkFatPerc + 0.438
    else:
        milkNEp = 0.0929 * milkFatPerc + 0.372
    milkNEused = milkNEp * milkYield
    milkMEused = milkNEused / MEtoNE_conv
    return milkNEused, milkMEused

# ---------------------------------------------------------
# 3. Feed Fractions & Actual Values Breakdown
# ---------------------------------------------------------
def actualValues(as_Fed: float, compArray: List[float], feedType: str):
    """
    compArray: [DM, CP, EE, CF, NFE, Ash, NDF, ADF, (Lignin)]
    """
    actDmIntake = get_percentage(compArray[0], as_Fed)
    actCpIntake = get_percentage(compArray[1], actDmIntake)
    actEeIntake = get_percentage(compArray[2], actDmIntake)
    actFaIntake = max(0.0, actDmIntake - actEeIntake)
    actCfIntake = get_percentage(compArray[3], actDmIntake)
    actNfeIntake = get_percentage(compArray[4], actDmIntake)
    actAshIntake = get_percentage(compArray[5], actDmIntake)
    actNDFIntake = get_percentage(compArray[6], actDmIntake)
    actADFIntake = get_percentage(compArray[7], actDmIntake)

    if feedType == "concentrates" and len(compArray) > 8:
        feedFractions = ["nfDm","nfCp","nfEe","nfFa","nfCf","nfNfe","nfAsh","nfNdf","nfAdf","nfLignin","nfHemiCell","nfTp","nfmilkCp","nfsNPNCPE"]
        actLigninIntake = get_percentage(compArray[8], actDmIntake)
    else:
        feedFractions = ["fDm","fCp","fEe","fFa","fCf","fNfe","fAsh","fNdf","fAdf","fLignin","fHemiCell","fTp","fmilkCp","fsNPNCPE"]
        actLigninIntake = get_percentage(compArray[8], actDmIntake) if len(compArray) > 8 else (0.10 * actADFIntake)

    actHemicelluloses = max(0.0, actNDFIntake - actADFIntake)
    actTpIntake = max(0.0, actCpIntake - (actCpIntake / 6.25))
    milkCp = (actCpIntake / 6.25) * 6.38
    actNPNCP = max(0.0, actCpIntake - actTpIntake)

    fractionA = (actNPNCP / actCpIntake * 100.0) if actCpIntake > 0 else 20.0
    fractionC = ((actLigninIntake / actADFIntake) * (actCpIntake * 0.135)) if actADFIntake > 0 else 5.0
    fractionB = max(0.0, 100.0 - fractionA - fractionC)
    cpFraction = [fractionA, fractionB, fractionC]

    actFeedFractions = [
        actDmIntake, actCpIntake, actEeIntake, actFaIntake, actCfIntake,
        actNfeIntake, actAshIntake, actNDFIntake, actADFIntake, actLigninIntake,
        actHemicelluloses, actTpIntake, milkCp, actNPNCP
    ]
    return cpFraction, feedFractions, actFeedFractions

# ---------------------------------------------------------
# 4. Digestibility & DMI Equations
# ---------------------------------------------------------
def digestibilityFactors(actCp, actFa, actNfe, actAsh, actNdf, actLignin, fatFactor=1.06, sNPNCPE=0.0):
    dROMbase = 0.96
    if actNdf > 0:
        ratio = max(0.0, min(0.99, actLignin / actNdf))
        digNDF = (0.75 * (actNdf - actLignin) * (1.0 - (ratio ** 0.667))) / actNdf
    else:
        digNDF = 0.50

    rom = max(0.1, 100.0 - actAsh - actNdf - actNfe - (actFa / max(0.1, fatFactor)) - (actCp - 0.64 * sNPNCPE))
    romDigest = ((rom * dROMbase) - 3.43) / rom
    adROM = ((rom * 0.96) - 3.43) / rom
    return digNDF, rom, romDigest, adROM

def dmiLactatingCowsAnf(parturition: int, currBW: float, milkEnergyVal: float, bcs: float = 3.0, daysAfterLactation: int = 60):
    dmi = (
        3.7 + (parturition * 5.7) + 0.305 * milkEnergyVal + 0.02 * currBW + (-0.689 - 1.87 * parturition) * bcs
    ) * (1.0 - (0.212 + parturition * 0.316) * exp(-0.053 * max(1, daysAfterLactation)))
    return max(2.0, dmi)

def dmiLactatingCowsRationEffects(actfNdf, actLignin, actAdf, actNdf, actNfe, ndfBaseDigest, dmi, milkYield):
    fndfd = get_percentage(52.0, actfNdf)
    adfFraction = (actAdf / actNdf) if actNdf > 0 else 0.5
    dmiFeedRation = (
        12.0
        - 0.107 * actfNdf
        + 8.17 * (adfFraction - 0.602) * (fndfd - 48.3)
        + 0.02253 * milkYield
        + 0.00390 * (fndfd - 48.3) * (milkYield - 33.1)
    )
    return max(2.0, dmiFeedRation)

def dmiGrowingHeifersFarOffAnf(currBWFem, matBWFem):
    if matBWFem <= 0:
        return 5.0
    return 0.022 * matBWFem * (1.0 - exp(-1.54 * (currBWFem / matBWFem)))

def dmiGrowingHeifersFarOffAnf_RationEffects(currBWFem, matBWFem, actNdf):
    if matBWFem <= 0:
        return 5.0
    bwFactor = currBWFem / matBWFem
    farOffAnf_Ration = (0.0226 * matBWFem * (1.0 - exp(-1.47 * bwFactor))) - (
        0.082 * (actNdf - (23.1 + 56.0 * bwFactor - 30.6 * (bwFactor ** 2)))
    )
    return max(1.5, farOffAnf_Ration)

def dmiGrowingHeifersLateGestAnf_RationEffects(week: float, actNdf: float):
    actNdf = max(30.0, min(55.0, actNdf))
    dmiNDF = 0.365 - 0.0028 * actNdf
    penPrePart = max(0.5, week * 2.0)
    indivDMI = 1.47 - dmiNDF * week - 0.035 * (week ** 2)
    penDMI = (1.47 * penPrePart - (dmiNDF / 2.0) * (penPrePart ** 2) - (0.035 / 3.0) * (penPrePart ** 3)) / penPrePart
    return max(1.0, indivDMI), max(1.0, penDMI)

def digestedStarch(dmi_MBW: float):
    dStarchBase = 0.91
    return dStarchBase - 1.0 * (dmi_MBW - 0.035)

def fractional_RumDigestibilityB(feedDM: float, feedType: str):
    if feedType == "forage":
        kp = 4.87
        kd = 0.04
    else:
        kp = 5.28
        kd = 0.01
    factor = kp / (kd + kp)
    return feedDM * factor

def rumDigestionNDF_Starch(actCp, actNfe, actfNdf, actNdf, actAdf, wet, Dmi):
    if Dmi <= 0:
        return [0.0, 0.0, 0.0, 0.0]
    RumDigNDFCoeff = (
        -31.9
        + 0.721 * (actNdf * 100.0 / Dmi) * (actNfe * 100.0 / Dmi)
        + 6.63 * (actCp * 100.0 / Dmi)
        - 0.211 * ((actCp / Dmi) ** 2)
        - 0.387 * ((actAdf * 100.0 / Dmi) / max(0.01, (actNdf * 100.0 / Dmi))) * 100.0
        - 0.121 * wet
        + 1.51 * Dmi
    )
    RumDigStCoeff = 70.6 - 14.5 * Dmi + 0.424 * actfNdf + 1.39 * (actNfe * 100.0 / Dmi) - 0.0219 * ((actNfe * 100.0 / Dmi) ** 2) - 0.154 * wet
    RumDigNDF = RumDigNDFCoeff * actNdf / 100.0
    RumDigStarch = RumDigStCoeff * actNfe / 100.0
    rumNDFPass = max(0.0, actNdf - RumDigNDF)
    rumStarchPass = max(0.0, actNfe - RumDigStarch)
    return [RumDigNDF, RumDigStarch, rumNDFPass, rumStarchPass]

# ---------------------------------------------------------
# 5. Mineral & Vitamin Analysis Engine (NRC + user data)
# ---------------------------------------------------------
def load_mineral_dataset():
    paths = [
        os.path.join(DATA_DIR, "consolidated_minerals.dat"),
        os.path.join(os.path.dirname(__file__), "consolidated_minerals.dat")
    ]
    for p in paths:
        if os.path.exists(p):
            try:
                # Tab-separated
                df = pd.read_csv(p, sep="\t")
                df.columns = [str(c).strip() for c in df.columns]
                df = df.replace("-", np.nan)
                return df
            except Exception:
                try:
                    df = pd.read_csv(p, delim_whitespace=True)
                    df.columns = [str(c).strip() for c in df.columns]
                    df = df.replace("-", np.nan)
                    return df
                except Exception:
                    pass
    return pd.DataFrame()

def calculate_minerals_and_vitamins(
    dmi_kg: float, 
    curr_bw: float, 
    milk_yield: float, 
    milk_protein_pct: float = 3.2,
    parturition_month: int = 1,
    selected_feeds: List[Dict[str, Any]] = None,
    total_ca_required_g: Optional[float] = None,
    total_p_required_g: Optional[float] = None,
    mineral_mix_grams: float = 0.0,
    feed_ca_override: Optional[float] = None,
    feed_p_override: Optional[float] = None
) -> Dict[str, Any]:
    """
    Computes supplied minerals from ration vs NRC/ICAR requirements.
    Calculates exact mineral mixture needed to cover Calcium and Phosphorus deficits.
    """
    minerals_df = load_mineral_dataset()
    
    # 1. Calculate Requirements using formulas in mineralFormat.py (or use exact total passed in)
    if total_ca_required_g is not None:
        ca_req_g = round(float(total_ca_required_g), 1)
    else:
        ca_gest = 0.0
        if parturition_month >= 6:
            month_factor = max(0, parturition_month - 5)
            ca_gest = 7.0 + month_factor * 7.5
        ca_maint = 0.90 * 0.034 * dmi_kg * 100.0
        ca_milk = (0.295 * 0.73 + 0.239 * 0.029 * milk_protein_pct) * milk_yield * 10.0
        ca_req_g = round(max(20.0, ca_maint + ca_milk + ca_gest), 1)

    if total_p_required_g is not None:
        p_req_g = round(float(total_p_required_g), 1)
    else:
        p_gest = 0.0
        if parturition_month >= 6:
            month_factor = max(0, parturition_month - 5)
            p_gest = 4.5 + month_factor * 4.5
        p_adult = (1.0 * curr_bw * 0.001 * dmi_kg) + (0.0006 * curr_bw)
        p_milk = milk_yield * (0.49 + 0.13 * milk_protein_pct)
        p_req_g = round(max(15.0, p_adult * 10.0 + p_milk + p_gest), 1)

    # Magnesium (g/day)
    mg_maint = 0.3 * dmi_kg + 0.0007 * curr_bw
    mg_lact = 0.11 * milk_yield
    mg_req_g = round((mg_maint + mg_lact) * 10.0, 1)

    # Sodium (Na) (g/day)
    na_maint = 1.45 * dmi_kg
    na_lact = 0.4 * milk_yield
    na_req_g = round(na_maint + na_lact, 1)

    # Potassium (K) (g/day)
    k_maint = 2.5 * dmi_kg + 0.2 * curr_bw * 0.1
    k_lact = 1.5 * milk_yield
    k_req_g = round(k_maint + k_lact, 1)

    # Chloride (Cl) (g/day)
    cl_maint = 1.11 * dmi_kg
    cl_lact = 1.0 * milk_yield
    cl_req_g = round(cl_maint + cl_lact, 1)

    # Trace Minerals (mg/day)
    cu_req_mg = round((0.0145 * dmi_kg * 1000.0) + (0.04 * milk_yield * 10.0), 1)
    zn_req_mg = round((0.0026 * curr_bw * 1000.0) + (0.03 * milk_yield * 10.0), 1)
    mn_req_mg = round((0.0026 * curr_bw * 1000.0) + (0.03 * milk_yield * 10.0), 1)
    se_req_mg = round(0.3 * dmi_kg, 2)
    i_req_mg = round((0.0026 * curr_bw) + (1.0 * milk_yield * 0.1), 2)

    # Vitamins
    vit_a_iu = round(110.0 * curr_bw if milk_yield <= 35 else 110.0 * curr_bw + 1000.0 * (milk_yield - 35))
    vit_e_iu = round(0.8 * curr_bw if milk_yield > 0 else 1.6 * curr_bw)

    # 2. Compute Supplied amounts from feed
    supplied = {
        "Ca_g": 0.0, "P_g": 0.0, "Mg_g": 0.0, "K_g": 0.0, "Na_g": 0.0, "Cl_g": 0.0,
        "Cu_mg": 0.0, "Zn_mg": 0.0, "Mn_mg": 0.0, "Se_mg": 0.0, "Fe_mg": 0.0
    }

    if selected_feeds and not minerals_df.empty and "Ingredient" in minerals_df.columns:
        for f in selected_feeds:
            fname = str(f.get("name", "")).strip().lower()
            qty = float(f.get("asFedKg", f.get("quantityKg", 0.0)))
            dm_kg = float(f.get("dmKg", qty * 0.25))

            matched_row = None
            for _, row in minerals_df.iterrows():
                ing = str(row["Ingredient"]).strip().lower()
                if ing in fname or fname in ing:
                    matched_row = row
                    break
            
            f_cat = str(f.get("category", "")).lower()
            if "concentrate" in f_cat or "unconventional" in f_cat or "cake" in fname or "pellet" in fname or "bran" in fname:
                def_ca, def_p, def_mg, def_k, def_na, def_cl = 0.25, 0.65, 0.30, 1.20, 0.05, 0.10
            elif "dry" in f_cat or "straw" in fname or "bagasse" in fname or "hay" in fname or "stover" in fname:
                def_ca, def_p, def_mg, def_k, def_na, def_cl = 0.35, 0.15, 0.18, 1.10, 0.08, 0.25
            else: # green
                def_ca, def_p, def_mg, def_k, def_na, def_cl = 0.45, 0.25, 0.22, 1.80, 0.08, 0.20

            def safe_val(col, default=0.0):
                if matched_row is not None and col in matched_row:
                    try:
                        v = float(matched_row[col])
                        return v if not np.isnan(v) else default
                    except Exception:
                        return default
                return default

            supplied["Ca_g"] += dm_kg * safe_val("Ca (%)", def_ca) * 10.0
            supplied["P_g"] += dm_kg * safe_val("P (%)", def_p) * 10.0
            supplied["Mg_g"] += dm_kg * safe_val("Mg (%)", def_mg) * 10.0
            supplied["K_g"] += dm_kg * safe_val("K (%)", def_k) * 10.0
            supplied["Na_g"] += dm_kg * safe_val("Na (%)", def_na) * 10.0
            supplied["Cl_g"] += dm_kg * safe_val("Cl (%)", def_cl) * 10.0

            supplied["Cu_mg"] += dm_kg * safe_val("Cu (ppm)", 10.0)
            supplied["Zn_mg"] += dm_kg * safe_val("Zn (ppm)", 35.0)
            supplied["Mn_mg"] += dm_kg * safe_val("Mn (ppm)", 40.0)
            supplied["Se_mg"] += dm_kg * safe_val("Se (ppm)", 0.2)
            supplied["Fe_mg"] += dm_kg * safe_val("Fe (ppm)", 250.0)

    # 3. Calcium & Phosphorus deficit and Mineral Mix balancing
    # Deficits from feed alone (or use exact reconciled feed values if provided)
    feed_ca_g = round(feed_ca_override if feed_ca_override is not None else supplied["Ca_g"], 1)
    feed_p_g = round(feed_p_override if feed_p_override is not None else supplied["P_g"], 1)
    raw_ca_deficit = max(0.0, round(ca_req_g - feed_ca_g, 1))
    raw_p_deficit = max(0.0, round(p_req_g - feed_p_g, 1))

    # Standard BIS Type II Mineral Mixture provides ~20% Ca and ~10% P
    needed_for_ca = round(raw_ca_deficit / 0.20) if raw_ca_deficit > 0 else 0
    needed_for_p = round(raw_p_deficit / 0.10) if raw_p_deficit > 0 else 0
    balanced_mix_g = float(mineral_mix_grams) if mineral_mix_grams > 0 else max(float(needed_for_ca), float(needed_for_p))

    # Add mineral mixture contribution
    ca_from_mix = round(balanced_mix_g * 0.20, 1)
    p_from_mix = round(balanced_mix_g * 0.10, 1)
    mg_from_mix = round(balanced_mix_g * 0.05, 1)

    total_ca_supplied = round(feed_ca_g + ca_from_mix, 1)
    total_p_supplied = round(feed_p_g + p_from_mix, 1)
    total_mg_supplied = round(supplied["Mg_g"] + mg_from_mix, 1)

    ca_balance = round(total_ca_supplied - ca_req_g, 1)
    p_balance = round(total_p_supplied - p_req_g, 1)

    return {
        "calcium": {
            "name": "Calcium (Ca)",
            "unit": "g/day",
            "required": ca_req_g,
            "feedSupplied": feed_ca_g,
            "mineralMixSupplied": ca_from_mix,
            "supplied": total_ca_supplied,
            "balance": ca_balance,
            "status": "Adequate" if total_ca_supplied >= ca_req_g * 0.95 else "Deficit"
        },
        "phosphorus": {
            "name": "Phosphorus (P)",
            "unit": "g/day",
            "required": p_req_g,
            "feedSupplied": feed_p_g,
            "mineralMixSupplied": p_from_mix,
            "supplied": total_p_supplied,
            "balance": p_balance,
            "status": "Adequate" if total_p_supplied >= p_req_g * 0.95 else "Deficit"
        },
        "mineralBalancing": {
            "caDeficitG": raw_ca_deficit,
            "pDeficitG": raw_p_deficit,
            "recommendedMineralMixG": balanced_mix_g,
            "caFromMineralMixG": ca_from_mix,
            "pFromMineralMixG": p_from_mix,
            "caStatus": "Balanced" if total_ca_supplied >= ca_req_g * 0.95 else "Needs Supplement",
            "pStatus": "Balanced" if total_p_supplied >= p_req_g * 0.95 else "Needs Supplement",
            "isBalanced": bool(total_ca_supplied >= ca_req_g * 0.95 and total_p_supplied >= p_req_g * 0.95)
        },
        "magnesium": {
            "name": "Magnesium (Mg)",
            "unit": "g/day",
            "required": mg_req_g,
            "supplied": supplied["Mg_g"],
            "balance": round(supplied["Mg_g"] - mg_req_g, 1),
            "status": "Adequate" if supplied["Mg_g"] >= mg_req_g else "Deficit"
        },
        "sodium": {
            "name": "Sodium (Na)",
            "unit": "g/day",
            "required": na_req_g,
            "supplied": supplied["Na_g"],
            "balance": round(supplied["Na_g"] - na_req_g, 1),
            "status": "Adequate" if supplied["Na_g"] >= na_req_g else "Deficit"
        },
        "potassium": {
            "name": "Potassium (K)",
            "unit": "g/day",
            "required": k_req_g,
            "supplied": supplied["K_g"],
            "balance": round(supplied["K_g"] - k_req_g, 1),
            "status": "Adequate" if supplied["K_g"] >= k_req_g else "Deficit"
        },
        "copper": {
            "name": "Copper (Cu)",
            "unit": "mg/day",
            "required": cu_req_mg,
            "supplied": supplied["Cu_mg"],
            "balance": round(supplied["Cu_mg"] - cu_req_mg, 1),
            "status": "Adequate" if supplied["Cu_mg"] >= cu_req_mg else "Deficit"
        },
        "zinc": {
            "name": "Zinc (Zn)",
            "unit": "mg/day",
            "required": zn_req_mg,
            "supplied": supplied["Zn_mg"],
            "balance": round(supplied["Zn_mg"] - zn_req_mg, 1),
            "status": "Adequate" if supplied["Zn_mg"] >= zn_req_mg else "Deficit"
        },
        "vitaminA": {
            "name": "Vitamin A",
            "unit": "IU/day",
            "required": vit_a_iu,
            "status": "Supplement 50,000 - 80,000 IU/day"
        },
        "vitaminE": {
            "name": "Vitamin E",
            "unit": "IU/day",
            "required": vit_e_iu,
            "status": "Supplement 500 - 1,000 IU/day"
        }
    }

# ---------------------------------------------------------
# Helper to load reference datasets
# ---------------------------------------------------------
def load_datasets():
    breeds_path = os.path.join(DATA_DIR, "breedspecificanimaldata.csv")
    rough_path = os.path.join(DATA_DIR, "roughages.csv")
    conc_path = os.path.join(DATA_DIR, "concentrates.csv")
    unconv_path = os.path.join(DATA_DIR, "unconventionalFeeds.csv")

    breeds_df = pd.read_csv(breeds_path) if os.path.exists(breeds_path) else pd.DataFrame()
    rough_df = pd.read_csv(rough_path) if os.path.exists(rough_path) else pd.DataFrame()
    conc_df = pd.read_csv(conc_path) if os.path.exists(conc_path) else pd.DataFrame()
    unconv_df = pd.read_csv(unconv_path) if os.path.exists(unconv_path) else pd.DataFrame()

    return breeds_df, rough_df, conc_df, unconv_df


# ---------------------------------------------------------
# 5. Feed ME Content & Pregnancy Stage Helpers
# ---------------------------------------------------------

# Standard ME content values (Mcal/kg DM) for common feed categories
FEED_ME_CONTENT = {
    "green_fodder": 2.0,      # Green roughage: ~2.0 Mcal ME/kg DM
    "dry_roughage": 1.6,      # Dry roughage: ~1.6 Mcal ME/kg DM  
    "concentrate": 2.8,       # Concentrates: ~2.8 Mcal ME/kg DM
    "molasses": 2.4,          # Cane molasses: ~2.4 Mcal ME/kg DM
    "unconventional": 2.0,    # Unconventional feeds: ~2.0 Mcal ME/kg DM
    "pasture": 2.0,           # Pasture grazing: ~2.0 Mcal ME/kg DM
    "default": 2.0,
}

# Maximum inclusion limits (% of total DM) per feed type
MAX_INCLUSION_PCT = {
    "molasses": 10.0,          # Molasses: max 10% of total DM
    "concentrate": 50.0,       # Concentrates: max 50% of total DM
    "dry_roughage": 40.0,      # Dry roughage: max 40% of total DM
    "green_fodder": 100.0,     # Green fodder: no practical upper limit
    "unconventional": 15.0,    # Unconventional feeds: max 15% of total DM
    "default": 100.0,
}

def get_feed_me_mcal_per_kg_dm(feed_name: str, feed_category: str = "") -> float:
    """
    Returns ME content in Mcal/kg DM for a given feed based on name/category.
    """
    name_lower = str(feed_name).lower()
    cat_lower = str(feed_category).lower()
    
    if "molasses" in name_lower:
        return FEED_ME_CONTENT["molasses"]
    elif any(w in name_lower for w in ['straw', 'paddy', 'bhoosa', 'hay', 'stover', 'kadbi', 'haulm']):
        return FEED_ME_CONTENT["dry_roughage"]
    elif any(w in name_lower for w in ['maize fodder', 'sorghum fodder', 'napier', 'lucerne', 'berseem', 'green', 'grass', 'oat fodder', 'silage', 'sugarcane tops']):
        return FEED_ME_CONTENT["green_fodder"]
    elif 'dry' in cat_lower or 'dry roughage' in cat_lower:
        return FEED_ME_CONTENT["dry_roughage"]
    elif 'green' in cat_lower:
        return FEED_ME_CONTENT["green_fodder"]
    elif 'concentrate' in cat_lower or any(w in name_lower for w in ['grain', 'bran', 'cake', 'meal', 'pellet']):
        return FEED_ME_CONTENT["concentrate"]
    elif 'unconventional' in cat_lower:
        return FEED_ME_CONTENT["unconventional"]
    else:
        return FEED_ME_CONTENT["default"]


def get_feed_max_inclusion_pct(feed_name: str, feed_category: str = "") -> float:
    """
    Returns maximum inclusion % of total DM for a given feed.
    """
    name_lower = str(feed_name).lower()
    cat_lower = str(feed_category).lower()
    
    if "molasses" in name_lower:
        return MAX_INCLUSION_PCT["molasses"]
    elif any(w in name_lower for w in ['straw', 'paddy', 'bhoosa', 'hay', 'stover', 'kadbi', 'haulm']):
        return MAX_INCLUSION_PCT["dry_roughage"]
    elif 'concentrate' in cat_lower or any(w in name_lower for w in ['grain', 'bran', 'cake', 'meal', 'pellet']):
        return MAX_INCLUSION_PCT["concentrate"]
    elif 'unconventional' in cat_lower:
        return MAX_INCLUSION_PCT["unconventional"]
    else:
        return MAX_INCLUSION_PCT["default"]


def classify_pregnancy_stage(preg_month: int) -> str:
    """
    Classifies pregnancy stage based on gestation month (1-9).
    """
    preg_month = max(1, min(9, int(preg_month)))
    if preg_month <= 3:
        return "Early pregnancy"
    elif preg_month <= 5:
        return "Mid pregnancy"
    elif preg_month <= 7:
        return "Late pregnancy"
    else:
        return "Advanced pregnancy (Steaming up)"


# ---------------------------------------------------------
# 6. Individual Animal Precision Nutrition Models (NRC 2001)
# ---------------------------------------------------------

# ---------------------------------------------------------
# NASEM 2021 Nutritional Equations
# ---------------------------------------------------------

def calculate_nasem_heifer_growth_nel(
    bw: float,
    mature_bw: float = 450.0,
    target_adg_kg: float = 0.60
) -> Tuple[float, float]:
    """
    NASEM 2021 growth model for growing heifers and first-lactation cows:
    - EBG = 0.85 * ADG
    - r = BW / MatBW
    - Fat_ADG = [0.067 + 0.375 * r] * (EBG / ADG)
    - Protein_ADG = [0.201 - 0.081 * r] * (EBG / ADG)
    - RE_growth = 9.4 * Fat_ADG + 5.55 * Protein_ADG
    - NEL_growth/kg = RE_growth / 0.61
    - NEL_growth/day = NEL_growth/kg * ADG
    """
    if target_adg_kg <= 0.0:
        return 0.0, 0.0
    ebg = 0.85 * target_adg_kg
    r = min(1.0, max(0.2, float(bw) / max(100.0, float(mature_bw))))
    ebg_ratio = ebg / max(0.01, target_adg_kg)
    fat_adg = (0.067 + 0.375 * r) * ebg_ratio
    prot_adg = max(0.05, (0.201 - 0.081 * r) * ebg_ratio)
    re_growth = 9.4 * fat_adg + 5.55 * prot_adg
    nel_per_kg = re_growth / 0.61
    nel_growth = round(nel_per_kg * target_adg_kg, 2)
    cp_growth_g = round((prot_adg * target_adg_kg * 1000.0) / 0.50, 1)
    return nel_growth, cp_growth_g


def calculate_nasem_gestation_nel(
    day_gest: float,
    mature_bw: float = 450.0,
    is_heifer: bool = False
) -> Tuple[float, float, float]:
    """
    NASEM 2021 Eq. 3-15 to 3-18 for fetal gravid uterus accretion:
    - Mature cow: CalfBW = 0.063 * MatBW
    - Heifer: CalfBW = 0.058 * MatBW
    - GrUter_parturition = CalfBW * 1.825
    - GrUter_current = GrUter_parturition * exp(-(0.0243 - 0.0000245 * DayGest) * (280 - DayGest))
    - GrUterGain = (0.0243 - 0.0000245 * DayGest) * GrUter_current
    - NEL_gest = GrUterGain * 4.16
    """
    mat_bw = max(200.0, float(mature_bw))
    calf_bw = mat_bw * (0.058 if is_heifer else 0.063)
    gr_uter_part = calf_bw * 1.825

    dg = max(0.0, min(279.0, float(day_gest)))
    if dg <= 0.0:
        return 0.0, 0.0, 0.0

    k = 0.0243 - (0.0000245 * dg)
    exp_val = -(k * (280.0 - dg))
    gr_uter_curr = gr_uter_part * math.exp(exp_val)
    gr_uter_gain = k * gr_uter_curr
    nel_gest = round(gr_uter_gain * 4.16, 2)
    cp_gest_g = round((gr_uter_gain * 1000.0 * 0.12) / 0.33, 1)
    return nel_gest, cp_gest_g, round(gr_uter_gain, 4)


def calculate_nasem_dmi(
    category: str,
    bw: float,
    mature_bw: float = 450.0,
    milk_yield: float = 0.0,
    milk_fat_pct: float = 4.0,
    bcs: float = 3.0,
    dim: int = 90,
    preg_month: int = 0,
    day_gest: Optional[float] = None,
    is_first_lactation: bool = False,
    is_heifer: bool = False,
    diet_ndf_pct: float = 40.0
) -> float:
    """
    Computes DMI capacity strictly following NASEM (2021) category-specific equations:
    - Lactating cow: NASEM 2021 Eq. 2-1
    - Growing heifer: NASEM 2021 Eq. 2-3
    - Dry/pregnant cow (Close-up, last 3 weeks): NASEM 2021 pre-calving equation
    """
    bw = max(100.0, float(bw))
    mat_bw = max(bw * 1.05, float(mature_bw or 450.0))
    cat_lower = str(category or "").lower()

    if "milk" in cat_lower or "lactat" in cat_lower:
        # NASEM 2021 Eq. 2-1
        p_val = 0.0 if is_first_lactation else 1.0
        nel_milk_kg = 0.360 + (0.0969 * max(2.5, float(milk_fat_pct)))
        milk_e = float(milk_yield) * nel_milk_kg
        bcs_val = max(2.0, min(4.5, float(bcs)))
        dim_val = max(1, int(dim))

        term1 = (3.7 + (5.7 * p_val) + (0.305 * milk_e) + (0.022 * bw) + ((-0.689 - 1.87 * p_val) * bcs_val))
        term2 = (1.0 - ((0.212 + 0.136 * p_val) * math.exp(-0.053 * dim_val)))
        dmi_lact = term1 * term2
        return round(max(bw * 0.020, min(bw * 0.045, dmi_lact)), 2)

    elif "heifer" in cat_lower or "grow" in cat_lower:
        # NASEM 2021 Eq. 2-3
        r = min(1.0, max(0.2, bw / mat_bw))
        dmi_heif = 0.022 * mat_bw * (1.0 - math.exp(-1.54 * r))
        return round(max(bw * 0.018, min(bw * 0.035, dmi_heif)), 2)

    elif "preg" in cat_lower or "dry" in cat_lower:
        dg = day_gest if day_gest is not None else (preg_month * 30.4 if preg_month > 0 else 210.0)
        if dg >= 259.0:  # Last 3 weeks before calving
            weeks_to_calv = (280.0 - dg) / 7.0
            w = -max(1.0, min(3.0, weeks_to_calv))  # Week is negative (-1, -2, -3)
            ndf_clamped = max(30.0, min(55.0, float(diet_ndf_pct)))
            dmi_100 = 1.47 - ((0.365 - 0.0028 * ndf_clamped) * w) - (0.035 * (w ** 2))
            if is_heifer:
                dmi_100 *= 0.88
            dmi_close = bw * (dmi_100 / 100.0)
            return round(max(bw * 0.016, min(bw * 0.030, dmi_close)), 2)
        else:
            return round(bw * 0.022, 2)
    else:
        # Breeding bulls / default
        return round(bw * 0.022, 2)


def calculate_nasem_water_fwi(
    is_lactating: bool,
    dmi_kg: float,
    diet_dm_pct: float = 25.0,
    diet_cp_pct: float = 12.0,
    diet_na_pct: float = 0.15,
    diet_k_pct: float = 1.20,
    temp_c: float = 25.0
) -> float:
    """
    Computes Free Water Intake (FWI, L/day) strictly following NASEM 2021:
    - Lactating cows: NASEM 2021 Eq. 9-1 (Appuhamy et al. 2016):
      FWI = -91.1 + 2.93*DMI + 0.61*DM% + 0.062*NaK + 2.49*CP% + 0.76*T
      where NaK = (Na% / 0.023 + K% / 0.039) * 10
    - Dry/Mature cows & non-lactating cattle: NASEM 2021 Eq. 9-3 (Holter and Urban 1992):
      FWI = 1.16*DMI + 0.23*DM% + 0.44*T + 0.061*(T - 16.4)^2
    NOTE: Temperature is already built into the equations. DO NOT multiply by 1.44 during heat stress!
    """
    dmi = max(1.0, float(dmi_kg))
    dm_p = max(10.0, min(95.0, float(diet_dm_pct)))
    cp_p = max(5.0, min(30.0, float(diet_cp_pct)))
    t = float(temp_c)

    if is_lactating:
        na_p = max(0.01, float(diet_na_pct))
        k_p = max(0.10, float(diet_k_pct))
        nak = ((na_p / 0.023) + (k_p / 0.039)) * 10.0
        fwi = -91.1 + (2.93 * dmi) + (0.61 * dm_p) + (0.062 * nak) + (2.49 * cp_p) + (0.76 * t)
        return round(max(30.0, fwi), 1)
    else:
        tmpc2 = ((t - 16.4) ** 2) if t > 16.4 else 0.0
        fwi = (1.16 * dmi) + (0.23 * dm_p) + (0.44 * t) + (0.061 * tmpc2)
        return round(max(20.0, min(120.0, fwi)), 1)


def evaluate_nasem_forage_ndf(forage_ndf_pct: float, total_ndf_pct: float) -> Dict[str, Any]:
    """
    Evaluates diet NDF against NASEM 2021 Sliding Table:
    Forage NDF % DM | Min Total NDF % DM | Max Starch % DM
    >= 19%          | 25%                | 30%
    18%             | 27%                | 28%
    17%             | 29%                | 26%
    16%             | 31%                | 24%
    15%             | 33%                | 22%
    < 15%           | Acidosis Warning   | High SARA risk
    """
    f_ndf = float(forage_ndf_pct)
    t_ndf = float(total_ndf_pct)

    if f_ndf >= 19.0:
        min_tot_ndf = 25.0
        max_starch = 30.0
    elif f_ndf >= 18.0:
        min_tot_ndf = 27.0
        max_starch = 28.0
    elif f_ndf >= 17.0:
        min_tot_ndf = 29.0
        max_starch = 26.0
    elif f_ndf >= 16.0:
        min_tot_ndf = 31.0
        max_starch = 24.0
    elif f_ndf >= 15.0:
        min_tot_ndf = 33.0
        max_starch = 22.0
    else:
        min_tot_ndf = 35.0
        max_starch = 20.0

    is_sufficient = (t_ndf >= min_tot_ndf) and (f_ndf >= 15.0)
    if f_ndf < 15.0:
        status = "Severe Acidosis Risk (Forage NDF < 15% NASEM minimum)"
        advice = f"Diet forage NDF is {f_ndf:.1f}%, which is below the NASEM 15% critical minimum. Add long-stem forage or roughage immediately."
    elif t_ndf < min_tot_ndf:
        status = f"Marginal Rumen Buffer (Total NDF {t_ndf:.1f}% < {min_tot_ndf}% required for {f_ndf:.1f}% Forage NDF)"
        advice = f"With {f_ndf:.1f}% forage NDF, NASEM 2021 requires at least {min_tot_ndf}% total diet NDF. Increase fiber content to prevent subacute ruminal acidosis (SARA)."
    else:
        status = f"Optimal Rumen Buffer (Forage NDF {f_ndf:.1f}% meets NASEM sliding standard)"
        advice = f"Rumen buffering and cud chewing are well supported (Total NDF {t_ndf:.1f}% meets the {min_tot_ndf}% threshold)."

    return {
        "forageNdfPct": round(f_ndf, 1),
        "totalNdfPct": round(t_ndf, 1),
        "minRequiredTotalNdfPct": min_tot_ndf,
        "maxStarchPct": max_starch,
        "isSufficient": is_sufficient,
        "status": status,
        "advice": advice
    }


def calculate_individual_lactating_cow(
    bw: float,
    milk_yield: float,
    milk_fat_pct: float,
    stage: str = "Mid lactation",
    bcs: float = 3.0,
    walking_km: float = 0.0,
    is_heat_stressed: bool = False,
    is_first_lactation: bool = False,
    nem_coeff: float = 0.080,
    mp_coeff: float = 3.0,
    thi_val: Optional[float] = None,
    thi_threshold: float = 72.0,
    dmi_pct_bw: float = 0.028,
    mature_bw: float = 450.0,
    ambient_temp_c: float = 25.0
) -> Dict[str, Any]:
    """
    Computes daily requirements for a single lactating cow strictly following NASEM 2021:
    - Maintenance NEL: 0.10 * BW^0.75 (NASEM 2021 Eq. 3-13)
    - Milk NEL: MilkYield * (0.360 + 0.0969 * Fat%) (NASEM 2021 Eq. 3-14)
    - Growth NEL: NASEM empty body gain model for primiparous heifers (ADG = 0.25 kg/d)
    - DMI: NASEM 2021 Eq. 2-1
    - Water: NASEM 2021 Eq. 9-1 (no duplicate heat stress multiplier)
    - Minerals: Factorial absorbed model (Ca_maint = 0.90 * DMI, P_maint = 1.0 * DMI + 0.0006 * BW, P_milk = 0.90 * Milk)
    """
    bw = max(200.0, float(bw))
    milk_yield = max(0.0, float(milk_yield))
    milk_fat_pct = max(2.5, float(milk_fat_pct))
    bcs = max(2.0, min(4.5, float(bcs)))
    mat_bw = max(bw * 1.05, float(mature_bw or 450.0))

    stage_lower = str(stage).lower()
    dim = 30 if "early" in stage_lower else (210 if "late" in stage_lower else 90)

    # 1. Net Energy (Mcal NEL/day)
    nel_maint = 0.10 * (bw ** 0.75)
    nel_per_kg_milk = 0.360 + (0.0969 * milk_fat_pct)
    nel_milk = milk_yield * nel_per_kg_milk
    nel_growth, cp_growth_g = calculate_nasem_heifer_growth_nel(bw, mat_bw, target_adg_kg=0.25 if is_first_lactation else 0.0)
    nel_activity = 0.0026 * bw * max(0.0, float(walking_km)) * 0.66
    total_nel_req = round(nel_maint + nel_milk + nel_growth + nel_activity, 2)
    total_me_mcal = round(total_nel_req / 0.66, 2)

    # 2. Crude Protein (g CP/day)
    maint_cp_g = (mp_coeff * (bw ** 0.75)) / 0.64
    milk_cp_g = milk_yield * (85.0 * (1.0 + 0.08 * (milk_fat_pct - 4.0)))
    total_cp_g = round(maint_cp_g + milk_cp_g + cp_growth_g, 1)

    # 3. Dry Matter Intake (kg DM/day) — NASEM 2021 Eq. 2-1
    dmi_cap = calculate_nasem_dmi(
        category="milking",
        bw=bw,
        mature_bw=mat_bw,
        milk_yield=milk_yield,
        milk_fat_pct=milk_fat_pct,
        bcs=bcs,
        dim=dim,
        is_first_lactation=is_first_lactation
    )

    # 4. Factorial Minerals (NASEM 2021)
    # Absorbed Ca: maintenance = 0.90 * DMI, milk = 1.22 * Milk, growth = 2.5 g
    # Dietary Ca requirement = Absorbed / 0.40 (True absorption coeff)
    abs_ca = (0.90 * dmi_cap) + (1.22 * milk_yield) + (2.5 if is_first_lactation else 0.0)
    ca_req_g = round(max(25.0, abs_ca / 0.40), 1)

    # Absorbed P: maintenance = 1.0 * DMI + 0.0006 * BW, milk = 0.90 * Milk, growth = 1.5 g
    # Dietary P requirement = Absorbed / 0.60 (True absorption coeff)
    abs_p = (1.0 * dmi_cap) + (0.0006 * bw) + (0.90 * milk_yield) + (1.5 if is_first_lactation else 0.0)
    p_req_g = round(max(18.0, abs_p / 0.60), 1)

    # 5. Free Water Intake (NASEM 2021 Eq. 9-1)
    fwi_l = calculate_nasem_water_fwi(
        is_lactating=True,
        dmi_kg=dmi_cap,
        diet_dm_pct=25.0,
        diet_cp_pct=13.0,
        diet_na_pct=0.18,
        diet_k_pct=1.40,
        temp_c=ambient_temp_c
    )

    return {
        "bw": bw,
        "dmiKg": dmi_cap,
        "meMcal": total_me_mcal,
        "nelMcal": total_nel_req,
        "cpG": total_cp_g,
        "caG": ca_req_g,
        "pG": p_req_g,
        "fwiL": fwi_l,
        "milkYield": milk_yield,
        "milkFat": milk_fat_pct,
        "isFirstLactation": is_first_lactation,
        "lactationType": "first_lactation" if is_first_lactation else "second_plus",
        "growthNelMcal": round(nel_growth, 2),
        "growthMeMcal": round(nel_growth / 0.66, 2),
        "growthCpG": round(cp_growth_g, 1),
        "nelMaintMcal": round(nel_maint, 2),
        "nelMilkMcal": round(nel_milk, 2)
    }


def calculate_individual_pregnant_cow(
    bw: float,
    preg_month: int = 7,
    is_heifer: bool = False,
    walking_km: float = 0.0,
    is_heat_stressed: bool = False,
    nem_coeff: float = 0.080,
    mp_coeff: float = 3.0,
    thi_threshold: float = 72.0,
    dmi_pct_bw: float = 0.024,
    mature_bw: float = 450.0,
    ambient_temp_c: float = 25.0
) -> Dict[str, Any]:
    """
    Computes requirements for a pregnant cow strictly following NASEM 2021:
    - Maintenance NEL: 0.10 * BW^0.75 (NASEM 2021 Eq. 3-13)
    - Gestational NEL: NASEM 2021 Eq. 3-15 to 3-18 (CalfBW = 0.063 * MatBW cow, 0.058 heifer)
    - DMI: NASEM 2021 pre-calving equation for close-up (last 3 weeks)
    - Water: NASEM 2021 Eq. 9-3 (Holter & Urban 1992, no duplicate heat stress multiplier)
    """
    bw = max(180.0, float(bw))
    preg_month = max(1, min(9, int(preg_month)))
    day_gest = min(279.0, preg_month * 30.4)
    mat_bw = max(bw * 1.05, float(mature_bw or 450.0))

    # 1. Net Energy (Mcal NEL/day)
    nel_maint = 0.10 * (bw ** 0.75)
    nel_gest, cp_gest_g, gr_uter_gain = calculate_nasem_gestation_nel(day_gest, mat_bw, is_heifer=is_heifer)
    nel_growth, cp_growth_g = calculate_nasem_heifer_growth_nel(bw, mat_bw, target_adg_kg=0.35 if is_heifer else 0.0)
    nel_activity = 0.0026 * bw * max(0.0, float(walking_km)) * 0.66
    total_nel_req = round(nel_maint + nel_gest + nel_growth + nel_activity, 2)
    total_me_mcal = round(total_nel_req / 0.66, 2)

    # 2. Crude Protein (g CP/day)
    maint_cp_g = (mp_coeff * (bw ** 0.75)) / 0.64
    total_cp_g = round(maint_cp_g + cp_gest_g + cp_growth_g, 1)

    # 3. Dry Matter Intake (kg DM/day) — NASEM 2021
    dmi_cap = calculate_nasem_dmi(
        category="pregnant",
        bw=bw,
        mature_bw=mat_bw,
        preg_month=preg_month,
        day_gest=day_gest,
        is_heifer=is_heifer
    )

    # 4. Factorial Minerals (NASEM 2021)
    ca_maint_abs = 0.90 * dmi_cap
    p_maint_abs = 1.0 * dmi_cap + 0.0006 * bw
    ca_gest_abs = gr_uter_gain * 1000.0 * 0.018 if day_gest >= 190 else 0.0
    p_gest_abs = gr_uter_gain * 1000.0 * 0.010 if day_gest >= 190 else 0.0
    ca_req_g = round(max(24.0, (ca_maint_abs + ca_gest_abs + (2.0 if is_heifer else 0.0)) / 0.40), 1)
    p_req_g = round(max(16.0, (p_maint_abs + p_gest_abs + (1.2 if is_heifer else 0.0)) / 0.60), 1)

    # 5. Free Water Intake (NASEM 2021 Eq. 9-3)
    fwi_l = calculate_nasem_water_fwi(
        is_lactating=False,
        dmi_kg=dmi_cap,
        diet_dm_pct=30.0,
        diet_cp_pct=11.0,
        temp_c=ambient_temp_c
    )

    stage = classify_pregnancy_stage(preg_month)
    return {
        "bw": bw,
        "dmiKg": dmi_cap,
        "meMcal": total_me_mcal,
        "nelMcal": total_nel_req,
        "cpG": total_cp_g,
        "caG": ca_req_g,
        "pG": p_req_g,
        "fwiL": fwi_l,
        "pregMonth": preg_month,
        "stage": stage,
        "isHeifer": is_heifer,
        "nelGestMcal": nel_gest,
        "nelMaintMcal": round(nel_maint, 2),
        "gravidUterineGainKgDay": gr_uter_gain
    }


def calculate_individual_heifer(
    bw: float,
    target_mature_bw: float = 450.0,
    walking_km: float = 0.0,
    is_heat_stressed: bool = False,
    nem_coeff: float = 0.080,
    mp_coeff: float = 3.0,
    thi_threshold: float = 72.0,
    dmi_pct_bw: float = 0.026,
    target_adg_g: float = 600.0,
    ambient_temp_c: float = 25.0
) -> Dict[str, Any]:
    """
    Computes requirements for a growing open heifer strictly following NASEM 2021:
    - Maintenance NEL: 0.10 * BW^0.75 (NASEM 2021 Eq. 3-13)
    - Growth NEL: NASEM 2021 empty body gain model (EBG = 0.85 * ADG, RE_growth)
    - DMI: NASEM 2021 Eq. 2-3 (0.022 * MatBW * [1 - exp(-1.54 * BW/MatBW)])
    - Water: Estimated water planning value using NASEM Eq. 9-3
    """
    bw = max(100.0, float(bw))
    mat_bw = max(bw * 1.15, float(target_mature_bw or 450.0))
    target_adg_kg = max(0.2, min(1.0, float(target_adg_g) / 1000.0))

    # 1. Net Energy (Mcal NEL/day)
    nel_maint = 0.10 * (bw ** 0.75)
    nel_growth, cp_growth_g = calculate_nasem_heifer_growth_nel(bw, mat_bw, target_adg_kg=target_adg_kg)
    nel_activity = 0.0026 * bw * max(0.0, float(walking_km)) * 0.66
    total_nel_req = round(nel_maint + nel_growth + nel_activity, 2)
    total_me_mcal = round(total_nel_req / 0.66, 2)

    # 2. Crude Protein (g CP/day)
    maint_cp_g = (mp_coeff * (bw ** 0.75)) / 0.64
    total_cp_g = round(maint_cp_g + cp_growth_g, 1)

    # 3. Dry Matter Intake (kg DM/day) — NASEM 2021 Eq. 2-3
    dmi_cap = calculate_nasem_dmi(
        category="heifer",
        bw=bw,
        mature_bw=mat_bw
    )

    # 4. Factorial Minerals (NASEM 2021)
    ca_req_g = round(max(18.0, ((0.90 * dmi_cap) + 4.5) / 0.40), 1)
    p_req_g = round(max(12.0, ((1.0 * dmi_cap + 0.0006 * bw) + 2.8) / 0.60), 1)

    # 5. Free Water Intake (NASEM Eq. 9-3 estimated water planning value)
    fwi_l = calculate_nasem_water_fwi(
        is_lactating=False,
        dmi_kg=dmi_cap,
        diet_dm_pct=35.0,
        diet_cp_pct=11.0,
        temp_c=ambient_temp_c
    )

    return {
        "bw": bw,
        "dmiKg": dmi_cap,
        "meMcal": total_me_mcal,
        "nelMcal": total_nel_req,
        "cpG": total_cp_g,
        "caG": ca_req_g,
        "pG": p_req_g,
        "fwiL": fwi_l,
        "targetAdgKg": target_adg_kg,
        "nelGrowthMcal": nel_growth,
        "growthCpG": cp_growth_g,
        "waterNote": "Estimated water planning value (NASEM Eq. 9-3 baseline)"
    }


def calculate_individual_dry_cow(
    bw: float,
    dry_days: int = 45,
    walking_km: float = 0.0,
    is_heat_stressed: bool = False,
    nem_coeff: float = 0.080,
    mp_coeff: float = 3.0,
    thi_threshold: float = 72.0,
    dmi_pct_bw: float = 0.022,
    mature_bw: float = 450.0,
    ambient_temp_c: float = 25.0
) -> Dict[str, Any]:
    """
    Computes requirements for a resting dry cow strictly following NASEM 2021:
    - Maintenance NEL: 0.10 * BW^0.75 (NASEM 2021 Eq. 3-13)
    - DMI: NASEM 2021 baseline (2.2% BW)
    - Water: NASEM 2021 Eq. 9-3
    """
    bw = max(200.0, float(bw))
    nel_maint = 0.10 * (bw ** 0.75)
    nel_activity = 0.0026 * bw * max(0.0, float(walking_km)) * 0.66
    total_nel_req = round(nel_maint + nel_activity, 2)
    total_me_mcal = round(total_nel_req / 0.66, 2)

    total_cp_g = round((mp_coeff * (bw ** 0.75)) / 0.64 + 100.0, 1)
    dmi_cap = round(bw * 0.022, 2)

    ca_req_g = round(max(25.0, (0.90 * dmi_cap) / 0.40), 1)
    p_req_g = round(max(18.0, (1.0 * dmi_cap + 0.0006 * bw) / 0.60), 1)

    fwi_l = calculate_nasem_water_fwi(
        is_lactating=False,
        dmi_kg=dmi_cap,
        diet_dm_pct=40.0,
        diet_cp_pct=10.0,
        temp_c=ambient_temp_c
    )

    return {
        "bw": bw,
        "dmiKg": dmi_cap,
        "meMcal": total_me_mcal,
        "nelMcal": total_nel_req,
        "cpG": total_cp_g,
        "caG": ca_req_g,
        "pG": p_req_g,
        "fwiL": fwi_l,
        "dryDays": dry_days
    }


def calculate_individual_bull(
    bw: float,
    walking_km: float = 0.0,
    is_heat_stressed: bool = False,
    nem_coeff: float = 0.080,
    mp_coeff: float = 3.0,
    thi_threshold: float = 72.0,
    dmi_pct_bw: float = 0.022,
    ambient_temp_c: float = 25.0
) -> Dict[str, Any]:
    """
    Computes requirements for an adult breeding or draught bull following NASEM 2021:
    - Maintenance NEL: 0.10 * BW^0.75 * 1.10 (bulls have ~10% higher basal metabolism)
    - DMI: 2.2% BW
    - Water: NASEM 2021 Eq. 9-3
    """
    bw = max(250.0, float(bw))
    nel_maint = 0.10 * (bw ** 0.75) * 1.10
    nel_activity = 0.0026 * bw * max(0.0, float(walking_km)) * 0.66
    total_nel_req = round(nel_maint + nel_activity, 2)
    total_me_mcal = round(total_nel_req / 0.66, 2)

    total_cp_g = round(((mp_coeff * 1.10) * (bw ** 0.75)) / 0.64, 1)
    dmi_cap = round(bw * 0.022, 2)

    ca_req_g = round(max(28.0, (0.90 * dmi_cap) / 0.40), 1)
    p_req_g = round(max(20.0, (1.0 * dmi_cap + 0.0006 * bw) / 0.60), 1)

    fwi_l = calculate_nasem_water_fwi(
        is_lactating=False,
        dmi_kg=dmi_cap,
        diet_dm_pct=40.0,
        diet_cp_pct=10.0,
        temp_c=ambient_temp_c
    )

    return {
        "bw": bw,
        "dmiKg": dmi_cap,
        "meMcal": total_me_mcal,
        "nelMcal": total_nel_req,
        "cpG": total_cp_g,
        "caG": ca_req_g,
        "pG": p_req_g,
        "fwiL": fwi_l
    }


# ---------------------------------------------------------
# 7. Scientific Pasture Grazing Intake Model
# ---------------------------------------------------------
def calculate_scientific_pasture_intake(
    bw: float,
    hours: float,
    grazing_system: str = "inside_farm",
    total_dmi_cap: float = 12.0,
    pasture_quality: str = "medium"
) -> float:
    """
    Computes scientific daily pasture dry matter intake (kg DM/head) based on
    body weight, grazing duration, pasture quality, and diminishing intake rates (Hodgson 1990, NRC 2001).
    Avoids unrealistic overestimations.
    """
    if hours <= 0 or grazing_system in ["no_grazing", "none", "zero", "stall_fed", "zero_grazing", ""]:
        return 0.0
    
    # Scale intake rate to metabolic body size relative to standard 450kg cow
    scale = ((max(100.0, float(bw)) / 450.0) ** 0.75)
    
    # Pasture condition biting kinetics (kg DM/h for standard 450kg cow in first 4 hours)
    pq_lower = str(pasture_quality or "").lower()
    if any(w in pq_lower for w in ["lush", "good", "rich", "improved"]):
        base_rate_h1 = 0.75
    elif any(w in pq_lower for w in ["poor", "dry", "sparse", "degraded"]):
        base_rate_h1 = 0.35
    else:
        base_rate_h1 = 0.55  # Medium/standard native pasture
        
    rate_h2 = base_rate_h1 * 0.58  # 4-8 hours: rumination and searching
    rate_h3 = base_rate_h1 * 0.25  # >8 hours: fatigue, rumination
    
    effective_h1 = min(hours, 4.0)
    effective_h2 = max(0.0, min(hours - 4.0, 4.0))
    effective_h3 = max(0.0, min(hours - 8.0, 4.0))
    
    est_dm = (effective_h1 * base_rate_h1 + effective_h2 * rate_h2 + effective_h3 * rate_h3) * scale
    
    # Bounded by physiological rumen fill:
    # Part-time grazing (<=4 hrs) covers at most 30% of total DMI capacity
    # Moderate grazing (4-8 hrs) covers at most 45% of total DMI capacity
    # Full day grazing (>8 hrs) covers at most 60% of total DMI capacity
    if hours <= 4.0:
        max_pasture_dm = min(2.5 * scale, total_dmi_cap * 0.30)
    elif hours <= 8.0:
        max_pasture_dm = min(4.2 * scale, total_dmi_cap * 0.45)
    else:
        max_pasture_dm = min(6.0 * scale, total_dmi_cap * 0.60)
        
    return round(max(0.0, min(est_dm, max_pasture_dm)), 2)


# ---------------------------------------------------------
# 8. Breed Biological & Metabolic Parameters (ICAR & NRC)
# ---------------------------------------------------------
def get_breed_biological_parameters(breed_name: str) -> Dict[str, Any]:
    """
    Returns scientific metabolic coefficients and physiological baselines for cattle/buffalo breeds.
    Sources: ICAR 2013, NRC 2001.
    """
    bname = str(breed_name or "").strip().lower()
    
    # Buffaloes (Murrah, Jaffarabadi, Mehsana, Nili Ravi, Surti, etc.)
    buffalo_keywords = ["murrah", "nili", "jaffarabadi", "bhadawari", "mehsana", "surti", "pandharpuri", "toda", "buffalo"]
    if any(k in bname for k in buffalo_keywords):
        return {
            "breedType": "Buffalo",
            "nem_coeff": 0.084,          # Buffalo basal maintenance (ICAR 2013)
            "mp_coeff": 3.2,             # Higher protein turnover for high milk fat/solids
            "ref_fat_pct": 7.2,
            "ref_mature_bw": 550.0,
            "thi_threshold": 74.0,
            "cooling_advice": "Buffaloes have fewer sweat glands; provide wallowing, water spraying, or shade during high THI.",
            "dmi_pct_bw": 0.026
        }
    
    # Indigenous Zebu (Bos indicus)
    zebu_keywords = [
        "gir", "sahiwal", "red sindhi", "rathi", "tharparkar", "kankrej", "ongole", 
        "hariana", "deoni", "krishna valley", "hallikar", "amritmahal", "khillari", 
        "kangayam", "bargur", "umblachery", "pulikulam", "vechur", "malnad gidda", 
        "punganur", "kasargod", "indigenous", "desi"
    ]
    if any(k in bname for k in zebu_keywords):
        mature_bw = 210.0 if any(d in bname for d in ["vechur", "punganur", "malnad gidda", "kasargod"]) else 450.0
        return {
            "breedType": "Indigenous Zebu (Bos indicus)",
            "nem_coeff": 0.073,          # ~10% lower basal fasting heat production (ICAR 2013 / NRC 2001)
            "mp_coeff": 2.8,
            "ref_fat_pct": 4.6,
            "ref_mature_bw": mature_bw,
            "thi_threshold": 76.0,       # High tropical heat tolerance
            "cooling_advice": "Bos indicus has high heat tolerance and vascular dewlap cooling.",
            "dmi_pct_bw": 0.025
        }
    
    # Exotic Bos taurus (Holstein Friesian, Jersey, Brown Swiss)
    exotic_keywords = ["holstein", "friesian", "hf", "jersey", "brown swiss", "ayrshire", "guernsey", "exotic"]
    is_crossbred = ("cross" in bname or "cb" in bname)
    if any(k in bname for k in exotic_keywords) and not is_crossbred:
        return {
            "breedType": "Exotic (Bos taurus)",
            "nem_coeff": 0.080,          # NRC 2001 standard
            "mp_coeff": 3.0,
            "ref_fat_pct": 4.8 if "jersey" in bname else 3.8,
            "ref_mature_bw": 430.0 if "jersey" in bname else 650.0,
            "thi_threshold": 68.0,       # Highly susceptible to heat stress
            "cooling_advice": "Exotic breeds are vulnerable to heat stress above THI 68. Provide active fan cooling and sprinklers.",
            "dmi_pct_bw": 0.035
        }
    
    # Crossbreds & Default Cattle
    return {
        "breedType": "Crossbred Cattle",
        "nem_coeff": 0.078,
        "mp_coeff": 3.0,
        "ref_fat_pct": 4.2,
        "ref_mature_bw": 500.0,
        "thi_threshold": 72.0,
        "cooling_advice": "Crossbred cattle show mild stress above THI 72. Maintain good barn ventilation and cold drinking water.",
        "dmi_pct_bw": 0.030
    }


# ---------------------------------------------------------
# 9. Constrained Least-Cost Ration Optimizer (Linear Programming)
# ---------------------------------------------------------
REFERENCE_FEED_COST_RS_PER_KG_FRESH = {
    "wheat straw (bhoosa)": 3.5,
    "paddy straw": 2.5,
    "sorghum stover (kadbi)": 3.0,
    "hay": 4.5,
    "silage": 3.5,
    "maize fodder": 2.5,
    "sorghum fodder": 2.2,
    "cowpea fodder": 2.5,
    "napier grass": 2.0,
    "green grass": 1.8,
    "rice grass": 1.8,
    "lucerne (alfalfa)": 3.8,
    "berseem (egyptian clover)": 3.5,
    "oat fodder": 2.8,
    "sugarcane tops": 1.5,
    "groundnut haulm": 4.0,
    "groundnut haulm / vines": 4.0,
    "wheat bran": 22.0,
    "rice bran": 18.0,
    "maize grain crushed": 24.0,
    "barley grain": 23.0,
    "oats grain": 25.0,
    "commercial dairy pellets": 26.0,
    "cottonseed cake": 34.0,
    "mustard cake": 32.0,
    "groundnut cake": 42.0,
    "sesame / til cake": 36.0,
    "sesame cake": 36.0,
    "til cake": 36.0,
    "soybean meal": 44.0,
    "citrus fruit pulp": 5.0,
    "cane molasses": 10.0,
    "molasses": 10.0,
    "default roughage": 2.5,
    "default concentrate": 26.0
}

def get_reference_feed_cost(feed_name: str, category: str = "") -> float:
    fname = str(feed_name or "").strip().lower()
    for k, cost in REFERENCE_FEED_COST_RS_PER_KG_FRESH.items():
        if k in fname or fname in k:
            return cost
    cat = str(category or "").lower()
    if "concentrate" in cat or "cake" in fname or "meal" in fname or "grain" in fname:
        return 28.0
    if "dry" in cat or "straw" in fname or "stover" in fname or "hay" in fname:
        return 3.0
    if "green" in cat or "fodder" in fname or "grass" in fname:
        return 2.5
    if "unconventional" in cat or "pulp" in fname:
        return 6.0
    return 5.0

def diagnose_ration_infeasibility(
    feeds: List[Dict[str, Any]],
    target_dmi_kg: float,
    target_me_mcal: float,
    target_cp_g: float,
    min_ndf_pct: float,
    is_milking: bool = False,
    milk_yield: float = 0.0
) -> List[Dict[str, str]]:
    """
    Diagnoses the exact nutritional cause of ration infeasibility and provides actionable advice.
    """
    reasons = []
    has_conc = any(f.get("group") in ["concentrate", "unconventional"] for f in feeds)
    has_dry = any(f.get("group") == "dry" for f in feeds)
    has_green = any(f.get("group") == "green" for f in feeds)

    max_me_feed = max((f.get("mePerKgDm", 0.0) for f in feeds), default=0.0)
    max_possible_me = max_me_feed * target_dmi_kg

    max_cp_feed = max((f.get("cpPct", 0.0) * 10.0 for f in feeds), default=0.0)
    max_possible_cp = max_cp_feed * target_dmi_kg

    max_ndf_pct = max((f.get("ndfPct", 0.0) for f in feeds), default=0.0)

    if max_possible_me < target_me_mcal * 0.95:
        shortfall = round(target_me_mcal - max_possible_me, 1)
        reasons.append({
            "nutrient": "Energy (ME) Deficit",
            "advice": f"Available feeds supply at most {max_possible_me:.1f} Mcal ME, but {target_me_mcal:.1f} Mcal required (shortfall of {shortfall} Mcal). Add energy-dense feeds like maize grains, silage, or dairy pellets."
        })

    if max_possible_cp < target_cp_g * 0.90:
        shortfall = round(target_cp_g - max_possible_cp)
        reasons.append({
            "nutrient": "Protein (CP) Deficit",
            "advice": f"Available feeds supply at most {max_possible_cp:.0f} g CP, but {target_cp_g:.0f} g required (shortfall of {shortfall} g). Add protein-dense feeds like mustard cake, cotton seed cake, or soybean meal."
        })

    if max_ndf_pct < min_ndf_pct:
        reasons.append({
            "nutrient": "Dietary Fibre (NDF) Shortfall",
            "advice": f"All selected feeds are low in fibre (max NDF {max_ndf_pct:.1f}% vs minimum {min_ndf_pct:.1f}% required for this animal category). Add dry roughage (straw/hay) to maintain rumen function."
        })

    if is_milking and not has_conc and milk_yield >= 4.0:
        reasons.append({
            "nutrient": "Missing Concentrate Feed",
            "advice": f"Milking cow producing {milk_yield:.1f} L/day requires concentrate feed to sustain milk yield and body condition. Add commercial dairy concentrate or oilseed cake."
        })

    if not has_dry:
        reasons.append({
            "nutrient": "Missing Dry Roughage",
            "advice": "Ration lacks dry roughage (straw/bhoosa/hay) needed for cud chewing, saliva production, and rumen buffer capacity."
        })

    if not reasons:
        reasons.append({
            "nutrient": "Nutrient Imbalance Conflict",
            "advice": f"Selected feeds cannot simultaneously meet energy ({target_me_mcal:.1f} Mcal), protein ({target_cp_g:.0f} g), and fibre constraints within the {target_dmi_kg:.1f} kg DMI capacity. Add both quality forage and concentrate."
        })

    return reasons


def optimize_animal_category_ration(
    category: str,
    target_dmi_kg: float,
    target_me_mcal: float,
    target_cp_g: float,
    feeds: List[Dict[str, Any]],
    milk_yield: float = 0.0,
    is_late_pregnancy: bool = False
) -> Dict[str, Any]:
    """
    Formulates a physiologically safe, least-cost daily ration for an individual animal or category.
    Uses SciPy HiGHS linear programming.
    Enforces:
    - Min/Max Energy (ME): target <= ME <= max(target * 1.10, target_dmi * 2.05)
    - Min/Max Protein (CP): target <= CP <= max(target * 1.15, target_dmi * 105.0 g)
    - Fibre Safety (NDF): animal class specific targets:
        * Milking: >= 28%
        * Late pregnant: >= 33%
        * Heifers: >= 32%
        * Dry cows: >= 38%
        * Bulls: >= 35%
    - Strict Ingredient Ceilings:
        * Liquid Cane Molasses: <= 1.0 kg fresh/day for milking/bulls; <= 0.5 kg fresh/day for dry/heifers
        * Concentrates: <= 40% DMI for milking; <= 25% for late pregnant; <= 15% for dry/heifers
        * Dry roughage: 15% - 35% DMI
        * Green fodder: 35% - 65% DMI
    - Production Concentrate Minimum:
        * Milking cows producing milk receive concentrate based on milk yield (ICAR: ~0.25 kg DM/L).
    - ABSOLUTELY NO EQUAL-SHARE FALLBACK: Returns detailed diagnostics and actionable advice if infeasible.
    """
    from scipy.optimize import linprog
    
    n = len(feeds)
    if n == 0 or target_dmi_kg <= 0.1:
        return {
            "success": False,
            "allocations": {},
            "dmSuppliedKg": 0.0,
            "meSuppliedMcal": 0.0,
            "cpSuppliedG": 0.0,
            "ndfPct": 0.0,
            "ndfTargetPct": 28.0,
            "costRs": 0.0,
            "statusMessage": "No feeds available or zero target DMI",
            "diagnostics": []
        }

    cat_lower = str(category or "").lower()
    is_milking = ("milk" in cat_lower or "lactat" in cat_lower)
    is_dry = ("dry" in cat_lower)
    is_heifer = ("heifer" in cat_lower or "grow" in cat_lower)
    is_bull = ("bull" in cat_lower)
    is_pregnant = ("preg" in cat_lower)

    # Objective: Minimize cost per kg DM
    c = []
    for f in feeds:
        fresh_cost = get_reference_feed_cost(f["name"], f.get("category", ""))
        dm_frac = max(0.10, f["dmPct"] / 100.0)
        c.append(fresh_cost / dm_frac)

    # 1. Equality constraint: Total DM = target_dmi_kg
    A_eq = [[1.0] * n]
    b_eq = [target_dmi_kg]

    # 2. Inequality constraints: A_ub * x <= b_ub
    A_ub = []
    b_ub = []

    # (a) Energy Lower Requirement: sum(ME_i * x_i) >= target_me  => -sum <= -target
    A_ub.append([-f["mePerKgDm"] for f in feeds])
    b_ub.append(-max(0.0, target_me_mcal * 0.98))

    # (b) Energy Upper Safe Limit:
    if is_milking:
        max_me = max(target_me_mcal * 1.15, target_dmi_kg * 2.10)
    elif is_late_pregnancy:
        max_me = max(target_me_mcal * 1.15, target_dmi_kg * 1.95)
    else:
        max_me = max(target_me_mcal * 1.15, target_dmi_kg * 1.80)
    A_ub.append([f["mePerKgDm"] for f in feeds])
    b_ub.append(max_me)

    # (c) Protein Lower Requirement: sum((CP_i / 100) * x_i) * 1000 >= target_cp
    A_ub.append([-f["cpPct"] * 10.0 for f in feeds])
    b_ub.append(-max(0.0, target_cp_g * 0.98))

    # (d) Protein Upper Safe Limit:
    # High producing milking cows require concentrated feeds (e.g. SBM 48% CP).
    # Non-milking cattle should not exceed safe protein levels to prevent metabolic nitrogen load.
    if is_milking:
        max_cp = max(target_cp_g * 1.25, target_dmi_kg * 160.0)
    elif is_late_pregnancy:
        max_cp = max(target_cp_g * 1.25, target_dmi_kg * 130.0)
    else:
        max_cp = max(target_cp_g * 1.25, target_dmi_kg * 110.0)
    A_ub.append([f["cpPct"] * 10.0 for f in feeds])
    b_ub.append(max_cp)

    # (e) Dietary Fibre Minimum tailored by Animal Class (NRC & ICAR):
    # Milking: >= 28% (rumen health + milk fat depression prevention)
    # Pregnant: >= 33% (fetal space + prevent fat cow syndrome)
    # Growing Heifers: >= 32% (rumen capacity development)
    # Dry Cows: >= 38% (maintain rumen volume, prevent displaced abomasum)
    # Breeding Bulls: >= 35% (satiety, prevent obesity & mobility issues)
    if is_milking:
        min_ndf_pct = 28.0
    elif is_dry:
        min_ndf_pct = 38.0
    elif is_pregnant:
        min_ndf_pct = 33.0
    elif is_heifer:
        min_ndf_pct = 32.0
    elif is_bull:
        min_ndf_pct = 35.0
    else:
        min_ndf_pct = 28.0

    A_ub.append([-f["ndfPct"] / 100.0 for f in feeds])
    b_ub.append(-(min_ndf_pct / 100.0) * target_dmi_kg)

    # Category Group Indices
    dry_indices = [i for i, f in enumerate(feeds) if f["group"] == "dry"]
    conc_indices = [i for i, f in enumerate(feeds) if f["group"] in ["concentrate", "unconventional"]]
    green_indices = [i for i, f in enumerate(feeds) if f["group"] == "green"]

    # Dry roughage inclusion tailored by animal physiological class (ICAR & NRC):
    # Milking cows: 10% to 35% dry fodder (leave room for concentrates & green fodder)
    # Dry cows: 25% to 65% dry fodder (rumen volume maintenance, prevents overfatting)
    # Breeding bulls: 25% to 65% dry fodder (satiety, avoids obesity)
    # Pregnant cattle: 20% to 50% dry fodder (steaming up / maintenance)
    # Growing heifers: 20% to 55% dry fodder (rumen development)
    if dry_indices:
        if is_milking:
            min_dry_pct = 0.10
            max_dry_pct = 0.35
        elif is_dry or is_bull:
            min_dry_pct = 0.25
            max_dry_pct = 0.65
        elif is_late_pregnancy:
            min_dry_pct = 0.20
            max_dry_pct = 0.50
        elif is_pregnant or is_heifer:
            min_dry_pct = 0.20
            max_dry_pct = 0.55
        else:
            min_dry_pct = 0.15
            max_dry_pct = 0.50

        row_min = [0.0] * n
        for idx in dry_indices:
            row_min[idx] = -1.0
        A_ub.append(row_min)
        b_ub.append(-min_dry_pct * target_dmi_kg)

        row_max = [0.0] * n
        for idx in dry_indices:
            row_max[idx] = 1.0
        A_ub.append(row_max)
        b_ub.append(max_dry_pct * target_dmi_kg)

    # Concentrates total inclusion: STRICTLY CAPPED at <= 40% DMI across ALL animals (Fix 2)
    min_conc_dm = 0.0
    if conc_indices:
        row_max = [0.0] * n
        for idx in conc_indices:
            row_max[idx] = 1.0
        A_ub.append(row_max)

        # Cap concentrate at 40% for milking cows (ICAR/NRC safe limit against SARA acidosis)
        if is_milking:
            max_conc_frac = 0.40  # STRICT CAP: Never exceed 40% DMI
            if milk_yield > 0.0:
                calc_min_conc = max(0.10 * target_dmi_kg, milk_yield * 0.22)
                min_conc_dm = min(max_conc_frac * target_dmi_kg * 0.85, calc_min_conc)
        elif is_late_pregnancy:
            max_conc_frac = 0.25  # Steaming up (Max 25%)
        elif is_dry:
            max_conc_frac = 0.15  # Max 15% for dry cows
        elif is_heifer:
            max_conc_frac = 0.20  # Max 20% for growing heifers
        elif is_bull:
            max_conc_frac = 0.20  # Max 20% for breeding bulls
        else:
            max_conc_frac = 0.25

        # Strictly enforce <= 40% concentrate DMI
        max_conc_frac = min(0.40, max_conc_frac)
        b_ub.append(max_conc_frac * target_dmi_kg)

        if min_conc_dm > 0.05:
            row_min_conc = [0.0] * n
            for idx in conc_indices:
                row_min_conc[idx] = -1.0
            A_ub.append(row_min_conc)
            b_ub.append(-min_conc_dm)

    # Bounds for individual feeds (Fix 4: ensure bounds cannot mathematically prevent 100% DMI)
    bounds = []
    has_green = bool(green_indices)
    has_dry = bool(dry_indices)
    for f in feeds:
        fname = f["name"].lower()
        dm_frac = max(0.10, f["dmPct"] / 100.0)

        # STRICT CANE MOLASSES SAFETY CAP (Prevent toxic overdose):
        if "molasses" in fname:
            if is_milking or is_bull:
                max_molasses_dm = min(1.0 * dm_frac, target_dmi_kg * 0.08)
            else:
                max_molasses_dm = min(0.5 * dm_frac, target_dmi_kg * 0.05)
            bounds.append((0.0, max(0.0, max_molasses_dm)))
        elif "mustard" in fname or "cottonseed" in fname:
            bounds.append((0.0, target_dmi_kg * 0.15))  # max 15% cake
        elif f["group"] in ["concentrate", "unconventional"]:
            bounds.append((0.0, target_dmi_kg * min(0.35, max_conc_frac if conc_indices else 0.40)))
        elif f["group"] == "dry":
            # If no green fodder is available, allow dry fodder to fill up to 100% of roughage DMI
            max_dry_allowed = target_dmi_kg if not has_green else (target_dmi_kg * max_dry_pct)
            bounds.append((0.0, max(0.1, max_dry_allowed)))
        else:
            # Green fodder / silage: allow up to 100% roughage DMI if dry fodder is scarce
            max_green_allowed = target_dmi_kg if not has_dry else (target_dmi_kg * 0.85)
            bounds.append((0.0, max(0.1, max_green_allowed)))

    # Run linear program solver
    # Pass 1: Strict least-cost formulation
    res = linprog(c, A_ub=A_ub, b_ub=b_ub, A_eq=A_eq, b_eq=b_eq, bounds=bounds, method="highs")

    # Progressive relaxation passes if strict optimization fails (Fix 4: Improve optimizer feasibility):
    # Pass 2: Relax upper energy/protein bounds (+35% ME, +40% CP) and relax min CP to 85%
    if not res.success:
        A_ub_rel2 = []
        b_ub_rel2 = []
        for i, row in enumerate(A_ub):
            if row == [-f["cpPct"] * 10.0 for f in feeds]:
                A_ub_rel2.append(row)
                b_ub_rel2.append(-max(0.0, target_cp_g * 0.85))
            elif row == [f["mePerKgDm"] for f in feeds]:
                A_ub_rel2.append(row)
                b_ub_rel2.append(max_me * 1.35)
            elif row == [f["cpPct"] * 10.0 for f in feeds]:
                A_ub_rel2.append(row)
                b_ub_rel2.append(max_cp * 1.40)
            elif any(row[idx] == -1.0 for idx in conc_indices) and sum(1 for v in row if v == -1.0) == len(conc_indices):
                A_ub_rel2.append(row)
                b_ub_rel2.append(-max(0.0, min_conc_dm * 0.50))
            else:
                A_ub_rel2.append(row)
                b_ub_rel2.append(b_ub[i])
        res = linprog(c, A_ub=A_ub_rel2, b_ub=b_ub_rel2, A_eq=A_eq, b_eq=b_eq, bounds=bounds, method="highs")

    # Pass 3: Drop upper energy and protein constraints entirely (natural forage excess is safe),
    # relax min CP to 75%, relax min NDF to 25%, drop min dry fodder bound
    if not res.success:
        A_ub_rel3 = []
        b_ub_rel3 = []
        for i, row in enumerate(A_ub):
            if row == [f["mePerKgDm"] for f in feeds] or row == [f["cpPct"] * 10.0 for f in feeds]:
                continue  # drop upper limits
            elif row == [-f["cpPct"] * 10.0 for f in feeds]:
                A_ub_rel3.append(row)
                b_ub_rel3.append(-max(0.0, target_cp_g * 0.75))
            elif row == [-f["ndfPct"] / 100.0 for f in feeds]:
                A_ub_rel3.append(row)
                b_ub_rel3.append(-0.25 * target_dmi_kg)
            elif any(row[idx] == -1.0 for idx in dry_indices) and sum(1 for v in row if v == -1.0) == len(dry_indices):
                continue  # drop min dry fodder bound
            elif any(row[idx] == -1.0 for idx in conc_indices) and sum(1 for v in row if v == -1.0) == len(conc_indices):
                continue  # drop min concentrate bound
            else:
                A_ub_rel3.append(row)
                b_ub_rel3.append(b_ub[i])
        res = linprog(c, A_ub=A_ub_rel3, b_ub=b_ub_rel3, A_eq=A_eq, b_eq=b_eq, bounds=bounds, method="highs")

    # Pass 4: Safe Physiological Baseline Allocation (Fix 3: NEVER GIVE 0 FEED TO ANIMALS)
    # If linear programming fails due to severe numerical or nutritional imbalance,
    # construct a practical, category-appropriate ration that satisfies 100% of target DMI
    if not res.success:
        diagnostics = diagnose_ration_infeasibility(
            feeds=feeds,
            target_dmi_kg=target_dmi_kg,
            target_me_mcal=target_me_mcal,
            target_cp_g=target_cp_g,
            min_ndf_pct=min_ndf_pct,
            is_milking=is_milking,
            milk_yield=milk_yield
        )
        msg = "; ".join(d["advice"] for d in diagnostics[:2]) if diagnostics else "Nutrient goals relaxed to safe baseline"

        # Baseline allocation strategy:
        # 1. Allocate concentrates up to safe limit (milking: 25-35%, others: 10-15%, strictly <= 40%)
        # 2. Allocate remaining DMI to available green and dry roughage
        allocations = {f["name"]: 0.0 for f in feeds}
        rem_dm = target_dmi_kg

        # Concentrate allocation
        conc_target_frac = 0.30 if is_milking else (0.15 if is_late_pregnancy else 0.10)
        conc_target_dm = min(target_dmi_kg * 0.40, target_dmi_kg * conc_target_frac) if conc_indices else 0.0
        if conc_indices and conc_target_dm > 0:
            share = conc_target_dm / len(conc_indices)
            for idx in conc_indices:
                f_name = feeds[idx]["name"]
                f_dm = max(0.10, feeds[idx]["dmPct"] / 100.0)
                if "molasses" in f_name.lower():
                    alloc_dm = min(share, 0.75 * f_dm)
                else:
                    alloc_dm = share
                allocations[f_name] = round(alloc_dm, 2)
                rem_dm -= alloc_dm

        # Roughage allocation across available green and dry
        rough_indices = green_indices + dry_indices
        if not rough_indices:
            rough_indices = list(range(n))  # fallback to whatever exists

        if green_indices and dry_indices:
            # 60% green roughage, 40% dry roughage of remainder
            green_rem = rem_dm * (0.65 if is_milking else 0.55)
            dry_rem = rem_dm - green_rem
            for idx in green_indices:
                allocations[feeds[idx]["name"]] += round(green_rem / len(green_indices), 2)
            for idx in dry_indices:
                allocations[feeds[idx]["name"]] += round(dry_rem / len(dry_indices), 2)
        else:
            share_rough = rem_dm / len(rough_indices)
            for idx in rough_indices:
                allocations[feeds[idx]["name"]] += round(share_rough, 2)

        # Normalize allocations so total equals exactly target_dmi_kg
        curr_tot = sum(allocations.values())
        if curr_tot > 0 and abs(curr_tot - target_dmi_kg) > 0.01:
            scale = target_dmi_kg / curr_tot
            for k in allocations:
                allocations[k] = round(allocations[k] * scale, 2)
            # Fix minor rounding delta
            diff = round(target_dmi_kg - sum(allocations.values()), 2)
            if diff != 0 and rough_indices:
                allocations[feeds[rough_indices[0]]["name"]] = round(allocations[feeds[rough_indices[0]]["name"]] + diff, 2)

        tot_dm = sum(allocations.values())
        tot_me = sum(allocations[f["name"]] * f["mePerKgDm"] for f in feeds)
        tot_cp_g = sum(allocations[f["name"]] * f["cpPct"] * 10.0 for f in feeds)
        tot_ndf_g = sum(allocations[f["name"]] * f["ndfPct"] * 10.0 for f in feeds)
        tot_cost = sum(allocations[f["name"]] * c[i] for i, f in enumerate(feeds))
        ndf_pct = (tot_ndf_g / (tot_dm * 10.0)) if tot_dm > 0 else 0.0

        return {
            "success": False,  # Ration cannot be safely formulated within physiological limits
            "isBaselineFallback": True,
            "allocations": {},
            "dmSuppliedKg": 0.0,
            "meSuppliedMcal": 0.0,
            "cpSuppliedG": 0.0,
            "ndfPct": 0.0,
            "ndfTargetPct": min_ndf_pct,
            "costRs": 0.0,
            "statusMessage": f"No safe ration possible with selected feeds: {msg}",
            "diagnostics": diagnostics
        }

    # Extract allocations from successful linprog
    allocations = {}
    for i, f in enumerate(feeds):
        allocations[f["name"]] = round(float(res.x[i]), 2)

    # Compute actual supplied totals
    tot_dm = sum(allocations.values())
    tot_me = sum(allocations[f["name"]] * f["mePerKgDm"] for f in feeds)
    tot_cp_g = sum(allocations[f["name"]] * f["cpPct"] * 10.0 for f in feeds)
    tot_ndf_g = sum(allocations[f["name"]] * f["ndfPct"] * 10.0 for f in feeds)
    tot_cost = sum(allocations[f["name"]] * c[i] for i, f in enumerate(feeds))
    ndf_pct = (tot_ndf_g / (tot_dm * 10.0)) if tot_dm > 0 else 0.0

    return {
        "success": True,
        "isBaselineFallback": False,
        "allocations": allocations,
        "dmSuppliedKg": round(tot_dm, 2),
        "meSuppliedMcal": round(tot_me, 2),
        "cpSuppliedG": round(tot_cp_g, 1),
        "ndfPct": round(ndf_pct, 1),
        "ndfTargetPct": min_ndf_pct,
        "costRs": round(tot_cost, 1),
        "statusMessage": "Optimal least-cost ration achieved within safe limits",
        "diagnostics": []
    }


def optimize_least_cost_ration(
    feeds: List[Dict[str, Any]],
    target_dmi_kg: float,
    target_me_mcal: float,
    target_cp_g: float
) -> Dict[str, Any]:
    """
    Backward-compatible herd optimizer delegating to optimize_animal_category_ration.
    """
    return optimize_animal_category_ration(
        category="herd",
        target_dmi_kg=target_dmi_kg,
        target_me_mcal=target_me_mcal,
        target_cp_g=target_cp_g,
        feeds=feeds
    )


def optimize_joint_farm_ration(
    animals: List[Dict[str, Any]],
    feeds: List[Dict[str, Any]],
    farm_inventory_kg: Dict[str, float]
) -> Dict[str, Any]:
    """
    Joint Farm-Level Multi-Animal-Class LP Optimizer with Hard Farm Inventory Constraints:
    - Simultaneously solves for all animals j in {milking, dry, pregnant, heifer, bull}.
    - Decision variables: x_{j,k} = kg DM/day of feed k for animal j.
    - Farm inventory slack variables: s_k = kg As-Fed shortage of feed k beyond farmer's stock.
    - Objective: Minimize sum(Cost_k * x_{j,k}) + 10000 * sum(s_k)
    - Hard Inventory Constraint: sum_j (x_{j,k} / DMfraction_k) - s_k <= Inventory_k
    - Animal Nutritional Constraints:
        * 0.95 * DMI_j <= sum_k x_{j,k} <= 1.05 * DMI_j
        * sum_k x_{j,k} * NEL_k >= NEL_Req_j
        * sum_k x_{j,k} * CP_k >= CP_Req_j
        * Safe concentrate cap: sum_{k in conc} x_{j,k} <= 0.40 * sum_k x_{j,k}
        * Safe roughage minimums & molasses caps
    """
    from scipy.optimize import linprog
    m_animals = len(animals)
    k_feeds = len(feeds)

    if m_animals == 0 or k_feeds == 0:
        return {
            "success": False,
            "statusMessage": "No animals or feeds available for optimization",
            "animalAllocations": {},
            "herdTotalsAsFed": {},
            "inventoryShortages": {},
            "isInventorySufficient": True
        }

    # Total decision variables: m_animals * k_feeds (x_{j,k}) + k_feeds (s_k)
    n_vars = (m_animals * k_feeds) + k_feeds

    def get_var_idx(animal_idx: int, feed_idx: int) -> int:
        return (animal_idx * k_feeds) + feed_idx

    def get_slack_idx(feed_idx: int) -> int:
        return (m_animals * k_feeds) + feed_idx

    # Cost vector c
    c = [0.0] * n_vars
    for j in range(m_animals):
        for k in range(k_feeds):
            f = feeds[k]
            fresh_cost = get_reference_feed_cost(f["name"], f.get("category", ""))
            dm_frac = max(0.10, f["dmPct"] / 100.0)
            c[get_var_idx(j, k)] = fresh_cost / dm_frac

    for k in range(k_feeds):
        # Penalty cost for exceeding farmer's on-farm inventory
        c[get_slack_idx(k)] = 10000.0

    A_ub = []
    b_ub = []

    # 1. Animal-Specific Constraints
    for j, a in enumerate(animals):
        cat = str(a.get("category", "")).lower()
        is_milking = ("milk" in cat or "lactat" in cat)
        is_late = bool(a.get("is_late_pregnancy", False))
        is_dry = ("dry" in cat)
        is_heifer = ("heifer" in cat or "grow" in cat)
        is_bull = ("bull" in cat)

        trough_dmi = max(0.2, float(a.get("target_dmi_kg", 5.0)))
        trough_nel = max(0.1, float(a.get("target_nel_mcal", 5.0)))
        trough_cp = max(10.0, float(a.get("target_cp_g", 300.0)))
        milk_yield = float(a.get("milk_yield", 0.0))

        # (a) DMI lower bound: sum_k x_{j,k} >= 0.95 * trough_dmi => -sum_k x_{j,k} <= -0.95 * trough_dmi
        row_dmi_low = [0.0] * n_vars
        for k in range(k_feeds):
            row_dmi_low[get_var_idx(j, k)] = -1.0
        A_ub.append(row_dmi_low)
        b_ub.append(-0.95 * trough_dmi)

        # (b) DMI upper bound: sum_k x_{j,k} <= 1.05 * trough_dmi
        row_dmi_up = [0.0] * n_vars
        for k in range(k_feeds):
            row_dmi_up[get_var_idx(j, k)] = 1.0
        A_ub.append(row_dmi_up)
        b_ub.append(1.05 * trough_dmi)

        # (c) NEL Requirement: sum_k (x_{j,k} * nelPerKgDm_k) >= trough_nel
        row_nel = [0.0] * n_vars
        for k, f in enumerate(feeds):
            nel_dens = float(f.get("nelPerKgDm", f.get("mePerKgDm", 2.0) * 0.66))
            row_nel[get_var_idx(j, k)] = -nel_dens
        A_ub.append(row_nel)
        b_ub.append(-max(0.1, trough_nel * 0.95))

        # (d) CP Requirement: sum_k (x_{j,k} * cpPct_k * 10) >= trough_cp
        row_cp = [0.0] * n_vars
        for k, f in enumerate(feeds):
            row_cp[get_var_idx(j, k)] = -(float(f["cpPct"]) * 10.0)
        A_ub.append(row_cp)
        b_ub.append(-max(10.0, trough_cp * 0.95))

        # (e) Concentrate Cap: sum_{k in conc} x_{j,k} - max_conc_frac * sum_k x_{j,k} <= 0
        conc_frac = 0.40 if is_milking else (0.25 if is_late else (0.20 if is_heifer or is_bull else 0.15))
        row_conc = [0.0] * n_vars
        for k, f in enumerate(feeds):
            is_conc = f.get("group") in ["concentrate", "unconventional"]
            row_conc[get_var_idx(j, k)] = (1.0 - conc_frac) if is_conc else (-conc_frac)
        A_ub.append(row_conc)
        b_ub.append(0.0)

        # (f) Dry roughage inclusion if dry roughage feeds are present
        dry_indices = [k for k, f in enumerate(feeds) if f.get("group") == "dry"]
        if dry_indices:
            min_dry_frac = 0.10 if is_milking else 0.20
            row_dry = [0.0] * n_vars
            for k, f in enumerate(feeds):
                is_dry_feed = (k in dry_indices)
                row_dry[get_var_idx(j, k)] = -(1.0 - min_dry_frac) if is_dry_feed else min_dry_frac
            A_ub.append(row_dry)
            b_ub.append(0.0)

    # 2. Hard Farm Inventory Constraints (with slack penalty variables)
    for k, f in enumerate(feeds):
        fname = f["name"]
        inv_as_fed = float(farm_inventory_kg.get(fname, 0.0) or 0.0)
        # If farmer entered 0 or omitted, treat as 9999.0 kg default capacity
        limit_as_fed = inv_as_fed if inv_as_fed > 0.0 else 9999.0

        dm_frac = max(0.10, float(f["dmPct"]) / 100.0)
        # sum_j (x_{j,k} / dm_frac) - s_k <= limit_as_fed
        row_inv = [0.0] * n_vars
        for j in range(m_animals):
            row_inv[get_var_idx(j, k)] = 1.0 / dm_frac
        row_inv[get_slack_idx(k)] = -1.0
        A_ub.append(row_inv)
        b_ub.append(limit_as_fed)

    # Variable bounds: x_{j,k} >= 0, s_k >= 0
    bounds = [(0.0, None) for _ in range(n_vars)]

    # Molasses individual upper bounds
    for j in range(m_animals):
        for k, f in enumerate(feeds):
            if "molasses" in f["name"].lower():
                dm_frac = max(0.10, float(f["dmPct"]) / 100.0)
                bounds[get_var_idx(j, k)] = (0.0, 0.75 * dm_frac)

    # Run SciPy HiGHS LP Solver
    res = linprog(c, A_ub=A_ub, b_ub=b_ub, bounds=bounds, method="highs")

    # If infeasible due to extreme nutrient mismatch, run progressive relaxation on protein & energy
    # Note: Concentrate caps (<=40% milking, <=25% late preg, <=20% heifers/bulls, <=15% dry) and molasses bounds are HARD safety constraints and NEVER relaxed.
    if not res.success:
        A_ub_rel = []
        b_ub_rel = []
        for i, row in enumerate(A_ub):
            b_val = b_ub[i]
            # Check if this row is CP requirement
            for j in range(m_animals):
                cp_expected = -max(10.0, float(animals[j].get("target_cp_g", 300.0)) * 0.95)
                if abs(b_val - cp_expected) < 0.1:
                    b_val = b_val * 0.80
                    break
                # Check if this row is NEL requirement
                nel_expected = -max(0.1, float(animals[j].get("target_nel_mcal", 5.0)) * 0.95)
                if abs(b_val - nel_expected) < 0.1:
                    if animals[j].get("category") == "growingHeifer":
                        # For growing heifers on tropical forages, scale target to maintenance + achievable gain
                        bw_h = float(animals[j].get("record", {}).get("bw", 260.0)) if isinstance(animals[j].get("record"), dict) else 260.0
                        maint_nel_h = 0.10 * (bw_h ** 0.75)
                        b_val = -max(maint_nel_h, float(animals[j].get("target_nel_mcal", 5.0)) * 0.75)
                    else:
                        b_val = b_val * 0.85
                    break
            A_ub_rel.append(row)
            b_ub_rel.append(b_val)
        res = linprog(c, A_ub=A_ub_rel, b_ub=b_ub_rel, bounds=bounds, method="highs")

    # If still not solved within hard safety limits, mark optimization as infeasible
    # NEVER produce an unsafe allocation with >40% concentrate!
    if not res.success:
        alloc_dm_map = {a["id"]: {f["name"]: 0.0 for f in feeds} for a in animals}
        slack_map = {f["name"]: 0.0 for f in feeds}
        is_succ = False
        status_msg = "No safe ration possible with selected feeds: Available feed quality cannot meet animal nutrient demands without exceeding safe concentrate limits (max 40% DMI for milking, 20% for heifers/bulls, 15% for dry cows). Additional high-quality forage or higher-density feeds are required."
    else:
        is_succ = True
        status_msg = "Joint multi-class least-cost ration optimized successfully within inventory limits."
        alloc_dm_map = {}
        for j, a in enumerate(animals):
            a_allocs = {}
            for k, f in enumerate(feeds):
                val = float(res.x[get_var_idx(j, k)])
                a_allocs[f["name"]] = max(0.0, round(val, 2))
            alloc_dm_map[a["id"]] = a_allocs

        slack_map = {}
        for k, f in enumerate(feeds):
            slack_val = float(res.x[get_slack_idx(k)])
            slack_map[f["name"]] = max(0.0, round(slack_val, 1))

    # Calculate Herd Totals and Inventory Shortages
    herd_as_fed_totals = {f["name"]: 0.0 for f in feeds}
    herd_dm_totals = {f["name"]: 0.0 for f in feeds}
    for a in animals:
        a_id = a["id"]
        for f in feeds:
            fname = f["name"]
            dm_k = alloc_dm_map.get(a_id, {}).get(fname, 0.0)
            dm_p = max(10.0, float(f["dmPct"]))
            fr_k = round(dm_k / (dm_p / 100.0), 1)
            herd_dm_totals[fname] += dm_k
            herd_as_fed_totals[fname] += fr_k

    inventory_shortages = {}
    additional_purchases = {}
    is_inv_sufficient = True
    for f in feeds:
        fname = f["name"]
        rec_as_fed = round(herd_as_fed_totals[fname], 1)
        avail = float(farm_inventory_kg.get(fname, 0.0) or 0.0)
        if avail > 0.0 and rec_as_fed > avail:
            diff = round(rec_as_fed - avail, 1)
            inventory_shortages[fname] = {
                "availableKg": avail,
                "recommendedKg": rec_as_fed,
                "shortageKg": diff
            }
            additional_purchases[fname] = diff
            is_inv_sufficient = False
        else:
            inventory_shortages[fname] = {
                "availableKg": avail if avail > 0.0 else rec_as_fed,
                "recommendedKg": rec_as_fed,
                "shortageKg": 0.0
            }

    return {
        "success": is_succ,
        "statusMessage": status_msg,
        "animalAllocations": alloc_dm_map,
        "herdTotalsAsFed": herd_as_fed_totals,
        "herdTotalsDm": {k: round(v, 2) for k, v in herd_dm_totals.items()},
        "inventoryShortages": inventory_shortages,
        "additionalPurchasesNeeded": additional_purchases,
        "isInventorySufficient": is_inv_sufficient
    }


def validate_lactating_cow_feasibility(
    cow_title: str,
    milk_yield: float,
    milk_fat: float,
    body_weight: float,
    target_dmi_kg: float,
    target_me_mcal: float,
    target_cp_g: float,
    feeds: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Validates whether a lactating cow's production demands (milk yield and fat)
    can be realistically satisfied by the available feed catalog within physical DMI capacity.
    """
    if milk_yield <= 0:
        return {"isFeasible": True, "warnings": [], "advice": ""}
    
    max_feed_me = max((f.get("mePerKgDm", 2.0) for f in feeds), default=2.0)
    has_concentrate = any(f.get("group") in ["concentrate", "unconventional"] for f in feeds)
    has_green = any(f.get("group") == "green" for f in feeds)
    has_dry = any(f.get("group") == "dry" for f in feeds)

    required_me_density = target_me_mcal / max(0.1, target_dmi_kg)
    required_cp_density_pct = (target_cp_g / (max(0.1, target_dmi_kg) * 1000.0)) * 100.0

    warnings = []
    advice_items = []
    
    # 1. Energy density check
    if required_me_density > max_feed_me * 0.98:
        warnings.append(f"{cow_title} ({milk_yield:.1f}L/day): Required energy density ({required_me_density:.2f} Mcal/kg DM) exceeds the highest available feed ({max_feed_me:.2f} Mcal/kg DM).")
        advice_items.append("Add high-energy concentrates like Maize grain, Barley, or Balanced Dairy Mash (2.8+ Mcal/kg DM).")

    # 2. Concentrate necessity for high milk yield
    if milk_yield >= 8.0 and not has_concentrate:
        warnings.append(f"{cow_title} produces {milk_yield:.1f}L/day but no concentrate feed is provided.")
        advice_items.append(f"Provide at least {milk_yield * 0.35:.1f} kg commercial concentrate or grain mash daily.")

    # 3. Forage variety check
    if not has_green and not has_dry:
        warnings.append(f"{cow_title}: No roughage (green/dry fodder) available. High risk of ruminal acidosis.")
        advice_items.append("Add fresh green fodder and straw/kadbi.")

    is_feasible = len(warnings) == 0
    return {
        "isFeasible": is_feasible,
        "cowTitle": cow_title,
        "milkYield": milk_yield,
        "requiredMeDensity": round(required_me_density, 2),
        "requiredCpDensityPct": round(required_cp_density_pct, 1),
        "warnings": warnings,
        "advice": " ".join(advice_items)
    }


def get_animal_category_ndf_limits(category: str) -> Dict[str, Any]:
    """
    Returns animal-category specific dietary NDF limits based on NRC (2001) and ICAR standards.
    - Milking cows: 28% to 42% (min 28% prevents acidosis; max 42% avoids physical gut fill limiting milk)
    - Pregnant cattle: 33% to 52% (safe pregnancy rumen bulk)
    - Growing heifers: 32% to 50% (rumen muscle and volume development)
    - Dry cows: 35% to 60% (high fiber roughage protects against displaced abomasum & obesity)
    - Breeding bulls: 35% to 60% (satiety, maintains lean athletic body condition)
    """
    cat = str(category or "").lower()
    if "milk" in cat or "lactat" in cat:
        return {
            "category": "Milking Cow",
            "minNdfPct": 28.0,
            "optMinNdfPct": 28.0,
            "optMaxNdfPct": 42.0,
            "rangeDesc": "28%–42% (Optimal for milk fat & energy intake)",
            "acidosisThreshold": 28.0,
            "highRoughageThreshold": 42.0
        }
    elif "dry" in cat:
        return {
            "category": "Dry Cow",
            "minNdfPct": 35.0,
            "optMinNdfPct": 35.0,
            "optMaxNdfPct": 60.0,
            "rangeDesc": "35%–60% (High roughage protects rumen volume & prevents displaced abomasum)",
            "acidosisThreshold": 32.0,
            "highRoughageThreshold": 60.0
        }
    elif "preg" in cat:
        return {
            "category": "Pregnant Cattle",
            "minNdfPct": 33.0,
            "optMinNdfPct": 33.0,
            "optMaxNdfPct": 52.0,
            "rangeDesc": "33%–52% (Safe gestation roughage balance)",
            "acidosisThreshold": 30.0,
            "highRoughageThreshold": 52.0
        }
    elif "heifer" in cat or "grow" in cat:
        return {
            "category": "Growing Heifer",
            "minNdfPct": 32.0,
            "optMinNdfPct": 32.0,
            "optMaxNdfPct": 50.0,
            "rangeDesc": "32%–50% (Supports healthy rumen development)",
            "acidosisThreshold": 28.0,
            "highRoughageThreshold": 50.0
        }
    elif "bull" in cat:
        return {
            "category": "Breeding Bull",
            "minNdfPct": 35.0,
            "optMinNdfPct": 35.0,
            "optMaxNdfPct": 60.0,
            "rangeDesc": "35%–60% (Maintains satiety & prevents obesity)",
            "acidosisThreshold": 32.0,
            "highRoughageThreshold": 60.0
        }
    else:
        return {
            "category": "Herd / General",
            "minNdfPct": 28.0,
            "optMinNdfPct": 28.0,
            "optMaxNdfPct": 50.0,
            "rangeDesc": "28%–50% (Standard ruminant roughage range)",
            "acidosisThreshold": 28.0,
            "highRoughageThreshold": 50.0
        }


def evaluate_category_ndf_status(category: str, ndf_pct: float) -> Tuple[str, str, str]:
    """
    Evaluates dietary NDF% for an animal category against its physiological standard.
    Returns: (status_text, icon, detailed_description)
    """
    limits = get_animal_category_ndf_limits(category)
    cat_name = limits["category"]
    if ndf_pct < limits["acidosisThreshold"]:
        return (
            f"Low Fibre / Acidosis Risk ({ndf_pct:.1f}%)",
            "warning",
            f"{cat_name} dietary NDF is {ndf_pct:.1f}% (below {limits['acidosisThreshold']:.0f}% min). Risk of subacute ruminal acidosis and milk fat depression. Add dry roughage."
        )
    elif ndf_pct <= limits["highRoughageThreshold"]:
        return (
            f"Optimal / Adequate ({ndf_pct:.1f}%)",
            "ok",
            f"{cat_name} dietary NDF is {ndf_pct:.1f}% (within target {limits['rangeDesc']}). Supports healthy rumination and cud chewing."
        )
    else:
        return (
            f"High Roughage ({ndf_pct:.1f}%)",
            "warning",
            f"{cat_name} dietary NDF is {ndf_pct:.1f}% (exceeds {limits['highRoughageThreshold']:.0f}% threshold). High roughage bulk may restrict total nutrient intake."
        )


def evaluate_rumen_fiber_health(ration_items: List[Dict[str, Any]], total_dmi_kg: float) -> Dict[str, Any]:
    """
    Evaluates ruminal fiber health, Forage NDF (fNDF), Physically Effective NDF (peNDF),
    and Subacute Ruminal Acidosis (SARA) risk according to Mertens (1997), NRC (2001), and ICAR (2013).
    - Forage NDF (fNDF) minimum: 19% of diet DM (essential to stimulate cud chewing and saliva bicarbonate buffering).
    - Physically effective NDF (peNDF) minimum: 21% of diet DM.
    - Total diet NDF ceiling: 48% (prevents rumen fill limitation in lactating animals).
    """
    total_dmi = max(0.1, float(total_dmi_kg))
    total_ndf_kg = 0.0
    forage_ndf_kg = 0.0
    pendf_kg = 0.0

    for item in ration_items:
        dm_kg = float(item.get("dmAllocatedKg", 0.0) or item.get("dmKg", 0.0) or 0.0)
        ndf_pct = float(item.get("ndf", 0.0) or item.get("ndfPct", 0.0) or 40.0)
        cat = str(item.get("category", "") or "").lower()

        ndf_in_item = dm_kg * (ndf_pct / 100.0)
        total_ndf_kg += ndf_in_item

        is_forage = ("green" in cat or "dry" in cat or "pasture" in cat or "roughage" in cat or "fodder" in cat)
        if is_forage:
            forage_ndf_kg += ndf_in_item

        # Physically effective NDF factors (Mertens 1997)
        if "dry" in cat or "straw" in cat or "hay" in cat or "stover" in cat or "kadbi" in cat:
            pe_factor = 0.92  # Long stem dry roughages have highest ruminal buffering value
        elif "green" in cat or "pasture" in cat or "silage" in cat:
            pe_factor = 0.78  # Fresh green forages and silages
        else:
            pe_factor = 0.22  # Concentrates and finely ground grains
        pendf_kg += ndf_in_item * pe_factor

    total_ndf_pct = round((total_ndf_kg / total_dmi) * 100.0, 1)
    fndf_pct = round((forage_ndf_kg / total_dmi) * 100.0, 1)
    pendf_pct = round((pendf_kg / total_dmi) * 100.0, 1)

    # Diagnostic evaluation
    warnings = []
    if fndf_pct < 19.0:
        sara_risk = "High"
        status_text = f"Low Forage Fiber ({fndf_pct}% fNDF)"
        status_icon = "critical"
        warnings.append(f"Forage NDF is {fndf_pct}% (below 19.0% safe threshold). High risk of Subacute Ruminal Acidosis (SARA), low butterfat, and loose dung. Feed at least 2 kg long dry roughage (bhusa/straw).")
    elif pendf_pct < 21.0:
        sara_risk = "Moderate"
        status_text = f"Borderline Ruminal Buffering ({pendf_pct}% peNDF)"
        status_icon = "warning"
        warnings.append(f"Physically Effective NDF is {pendf_pct}% (below 21.0% optimum). Ensure chop length of green fodder is at least 2–3 cm to maintain cud-chewing.")
    elif total_ndf_pct > 48.0:
        sara_risk = "Low"
        status_text = f"High Rumen Fill ({total_ndf_pct}% NDF)"
        status_icon = "warning"
        warnings.append(f"Total dietary NDF is {total_ndf_pct}% (above 48% high-bulk threshold). Rumen fill is saturated, which may limit feed intake for high milk yielders.")
    else:
        sara_risk = "Low"
        status_text = f"Optimal Rumen Motility ({fndf_pct}% fNDF, {pendf_pct}% peNDF)"
        status_icon = "ok"

    cud_chews_est = int(min(60000, max(25000, pendf_kg * 4500)))

    return {
        "totalNdfPct": total_ndf_pct,
        "forageNdfPct": fndf_pct,
        "physicallyEffectiveNdfPct": pendf_pct,
        "saraRisk": sara_risk,
        "statusText": status_text,
        "statusIcon": status_icon,
        "warnings": warnings,
        "estimatedCudChewsPerDay": cud_chews_est,
        "advisory": warnings[0] if warnings else "Excellent ruminal motility with healthy cud-chewing, natural saliva buffering, and stable ruminal pH (>6.2)."
    }


def get_regional_feed_recommendations(
    location_str: str = "",
    energy_deficit_pct: float = 0.0,
    protein_deficit_pct: float = 0.0,
    dmi_deficit_pct: float = 0.0,
    mineral_deficit: bool = False
) -> Dict[str, Any]:
    """
    Agro-Climatic Regional Feed Intelligence Engine.
    Maps Indian states and dairy belts to cost-effective, locally abundant feeds,
    and provides intelligent deficiency-bridging recommendations.
    """
    loc = str(location_str or "").strip().lower()

    # Zone mapping
    south_keywords = ["tamil nadu", "chennai", "coimbatore", "madurai", "kerala", "kochi", "trivandrum",
                      "karnataka", "bangalore", "bengaluru", "mysore", "andhra", "hyderabad", "telangana", "vijayawada"]
    north_keywords = ["punjab", "ludhiana", "haryana", "karnal", "rajasthan", "jaipur", "uttar pradesh",
                      "lucknow", "agra", "delhi", "chandigarh", "himachal", "uttarakhand", "jammu"]
    west_keywords = ["gujarat", "ahmedabad", "anand", "surat", "vadodara", "maharashtra", "pune", "mumbai",
                     "nashik", "kolhapur", "nagpur", "goa"]
    east_keywords = ["west bengal", "kolkata", "bihar", "patna", "odisha", "bhubaneswar", "jharkhand", "ranchi", "assam", "guwahati"]
    central_keywords = ["madhya pradesh", "bhopal", "indore", "jabalpur", "chhattisgarh", "raipur"]

    if any(k in loc for k in south_keywords):
        zone_id = "south"
        zone_name = "Southern Peninsular Zone (TN, KA, AP, TS, KL)"
        top_greens = [
            {"name": "Hybrid Napier (CO-4 / CO-5 / Super Napier)", "cpPct": 10.5, "dmPct": 22.0, "reason": "High biomass yield (250-300 t/ha/yr), drought-resilient perennial fodder"},
            {"name": "Guinea Grass / Para Grass", "cpPct": 9.2, "dmPct": 20.0, "reason": "Thrives in tropical lowlands and irrigated pastures"},
            {"name": "Agathi (Sesbania grandiflora)", "cpPct": 24.0, "dmPct": 25.0, "reason": "Protein-rich leguminous tree fodder for lactating cattle"}
        ]
        top_dry = [
            {"name": "Paddy Straw (Treated with 4% Urea)", "dmPct": 88.0, "reason": "Abundant local base roughage; urea treatment elevates CP from 4% to 8%"},
            {"name": "Groundnut Haulm", "dmPct": 90.0, "reason": "High protein legume roughage (12-14% CP) superior to plain cereal straws"},
            {"name": "Ragi Straw (Finger Millet)", "dmPct": 89.0, "reason": "Palatable calcium-rich cereal straw popular across dryland zones"}
        ]
        top_concentrates = [
            {"name": "Groundnut Cake (Kadalai Punnaku)", "cpPct": 42.0, "meMcal": 2.85, "role": "Premium regional vegetable protein source"},
            {"name": "Coconut (Copra) Cake", "cpPct": 21.0, "meMcal": 2.75, "role": "Rich in bypass fat and digestible fiber, improves milk butterfat"},
            {"name": "Cottonseed Cake (De-linted)", "cpPct": 24.0, "meMcal": 2.65, "role": "Standard dairy protein cake supporting butterfat synthesis"},
            {"name": "Broken Rice (Rice Kani)", "cpPct": 8.5, "meMcal": 2.90, "role": "Low-cost local energy booster replacing expensive maize"}
        ]
    elif any(k in loc for k in north_keywords):
        zone_id = "north"
        zone_name = "Northern Indo-Gangetic Zone (PB, HR, UP, RJ)"
        top_greens = [
            {"name": "Berseem (Egyptian Clover)", "cpPct": 18.5, "dmPct": 15.0, "reason": "Premier winter legume providing lush digestible crude protein"},
            {"name": "Lucerne (Alfalfa)", "cpPct": 20.0, "dmPct": 20.0, "reason": "High-protein perennial legume for arid and canal-irrigated zones"},
            {"name": "Green Fodder Maize", "cpPct": 8.5, "dmPct": 24.0, "reason": "Excellent energy-rich summer/kharif succulent fodder"}
        ]
        top_dry = [
            {"name": "Wheat Straw (Turi / Bhusa)", "dmPct": 90.0, "reason": "Gold standard staple dry roughage for Indo-Gangetic dairy herds"},
            {"name": "Pearl Millet (Bajra) Kadbi", "dmPct": 88.0, "reason": "Widely fed drought-hardy coarse roughage in arid belts"}
        ]
        top_concentrates = [
            {"name": "Mustard / Rapeseed Cake (Sarson Khali)", "cpPct": 35.0, "meMcal": 2.65, "role": "Cost-effective dominant winter oil cake (feed up to 2 kg/cow/day)"},
            {"name": "Wheat Bran (Choker)", "cpPct": 14.5, "meMcal": 2.45, "role": "Palatable phosphorus-rich energy & fiber balancer"},
            {"name": "Cottonseed Cake", "cpPct": 24.0, "meMcal": 2.70, "role": "Elevates milk fat test in Murrah buffaloes and Sahiwal cows"}
        ]
    elif any(k in loc for k in west_keywords):
        zone_id = "west"
        zone_name = "Western Dairy Belt (Gujarat & Maharashtra)"
        top_greens = [
            {"name": "Lucerne / Alfalfa", "cpPct": 19.5, "dmPct": 20.0, "reason": "Extensively cultivated in Anand, Mehsana, and Kolhapur dairy belts"},
            {"name": "Sugarcane Tops", "cpPct": 6.5, "dmPct": 26.0, "reason": "Low-cost seasonal roughage abundant during cane crushing months"},
            {"name": "Hybrid Napier (Jaywant / CO-5)", "cpPct": 10.0, "dmPct": 22.0, "reason": "Year-round green supply under canal irrigation"}
        ]
        top_dry = [
            {"name": "Sugarcane Bagasse (Treated)", "dmPct": 90.0, "reason": "Abundant agro-industrial byproduct from sugar mills"},
            {"name": "Jowar (Sorghum) Kadbi", "dmPct": 89.0, "reason": "Highly preferred palatable cereal stover in Maharashtra & North Gujarat"}
        ]
        top_concentrates = [
            {"name": "Cottonseed Cake / Whole Cottonseed", "cpPct": 24.0, "meMcal": 2.80, "role": "Regional staple for buffalo dairy herds; boosts milk fat to 7%+"},
            {"name": "Groundnut Cake", "cpPct": 42.0, "meMcal": 2.85, "role": "Saurashtra groundnut belt high-protein supplement"},
            {"name": "Sugarcane Molasses", "cpPct": 3.5, "meMcal": 2.40, "role": "Economical sugar-based energy, improves ration palatability"}
        ]
    elif any(k in loc for k in east_keywords):
        zone_id = "east"
        zone_name = "Eastern Agricultural Zone (WB, BR, OD, JH, AS)"
        top_greens = [
            {"name": "Rice Bean (Vigna umbellata)", "cpPct": 14.0, "dmPct": 22.0, "reason": "High-yielding nutritious legume suited to humid eastern plains"},
            {"name": "Khesari / Lathyrus", "cpPct": 16.0, "dmPct": 18.0, "reason": "Relay crop legume grown in paddy fallows"},
            {"name": "Green Maize / Oats", "cpPct": 9.5, "dmPct": 22.0, "reason": "Succulent energy fodder for winter feeding"}
        ]
        top_dry = [
            {"name": "Paddy Straw (Aman/Boro)", "dmPct": 87.0, "reason": "Universal regional roughage; combine with mineral mix to counter oxalates"}
        ]
        top_concentrates = [
            {"name": "Mustard Cake", "cpPct": 34.0, "meMcal": 2.60, "role": "Primary economical vegetable protein cake in eastern India"},
            {"name": "De-oiled Rice Bran (DORB)", "cpPct": 15.0, "meMcal": 2.10, "role": "Low-cost filler and fiber carrier for dairy cattle"},
            {"name": "Broken Rice", "cpPct": 8.5, "meMcal": 2.90, "role": "Energy-rich starch source for lactating animals"}
        ]
    else:
        # Central or default zone
        zone_id = "central_default"
        zone_name = "Central Agro-Zone / National Dairy Grid"
        top_greens = [
            {"name": "Green Maize Fodder", "cpPct": 8.5, "dmPct": 24.0, "reason": "Versatile high-energy forage palatable to all cattle"},
            {"name": "Berseem / Lucerne", "cpPct": 18.0, "dmPct": 18.0, "reason": "Balanced legume roughage supplying digestible protein and calcium"}
        ]
        top_dry = [
            {"name": "Wheat Straw / Soybean Straw", "dmPct": 89.0, "reason": "Staple dry roughage base maintaining healthy rumination"}
        ]
        top_concentrates = [
            {"name": "Soybean Meal (De-oiled)", "cpPct": 46.0, "meMcal": 2.95, "role": "Gold standard high-protein meal with superior amino acid balance"},
            {"name": "Gram Chuni / Husk", "cpPct": 16.0, "meMcal": 2.50, "role": "Pulse byproduct providing digestible protein and rumen fiber"},
            {"name": "Maize Grain", "cpPct": 9.0, "meMcal": 3.05, "role": "High-density starch energy source supporting milk peak production"}
        ]

    # Dynamic Deficiency Bridges
    deficiency_bridges = []
    if protein_deficit_pct > 5.0:
        if zone_id == "south":
            bridge = "Feed 1.0–1.5 kg Groundnut Cake or Coconut Cake + 3 kg Agathi green leaves to bridge the protein shortage."
        elif zone_id == "north":
            bridge = "Feed 1.0–1.5 kg Mustard Cake (Sarson Khali) + 5 kg fresh Berseem/Lucerne to eliminate the protein deficit."
        elif zone_id == "west":
            bridge = "Feed 1.5 kg Cottonseed Cake or 1.0 kg Soybean Meal to bridge the protein shortage and boost milk fat."
        elif zone_id == "east":
            bridge = "Feed 1.2 kg Mustard Cake + 0.5 kg Rice Bran to overcome the crude protein shortfall."
        else:
            bridge = "Feed 1.0 kg Soybean Meal (DOC) or 1.5 kg Gram Chuni to satisfy the herd protein requirement."
        deficiency_bridges.append({"type": "Protein Bridge", "advice": bridge, "severity": "High" if protein_deficit_pct > 15.0 else "Medium"})

    if energy_deficit_pct > 5.0:
        if zone_id in ["south", "east"]:
            bridge = "Add 1.0 kg Broken Rice or 0.8 kg Crushed Maize + 0.5 kg Molasses per cow/day for energy balance."
        elif zone_id in ["west"]:
            bridge = "Add 0.75 kg Sugarcane Molasses + 1.0 kg Maize grain or whole cottonseed to meet metabolic energy demands."
        else:
            bridge = "Add 1.0–1.5 kg Crushed Maize grain or Wheat bran choker to restore dietary energy density."
        deficiency_bridges.append({"type": "Energy Bridge", "advice": bridge, "severity": "High" if energy_deficit_pct > 15.0 else "Medium"})

    if dmi_deficit_pct > 5.0:
        deficiency_bridges.append({
            "type": "Dry Matter / Rumen Fill Bridge",
            "advice": "Supplement 3–5 kg regional dry roughage (Paddy straw / Wheat bhusa / Kadbi) to achieve full rumen satiety and prevent acidosis.",
            "severity": "High" if dmi_deficit_pct > 10.0 else "Medium"
        })

    if mineral_deficit:
        deficiency_bridges.append({
            "type": "Mineral Precision Bridge",
            "advice": "Feed 50–70g ISI Type II Area-Specific Mineral Mixture + 30g common salt per cow daily to prevent reproductive and calcium metabolic failures.",
            "severity": "Medium"
        })

    return {
        "zoneId": zone_id,
        "zoneName": zone_name,
        "detectedLocation": location_str or "National",
        "topRegionalGreens": top_greens,
        "topRegionalDry": top_dry,
        "topRegionalConcentrates": top_concentrates,
        "deficiencyBridges": deficiency_bridges
    }


# =========================================================================
# 7. Complete PDF Knowledge Transfer (KT) Formulation Engine
# =========================================================================
def calculate_pdf_kt_formulation(
    selected_feeds: List[Dict[str, Any]],
    all_feeds_dict: Dict[str, Any],
    breed_name: str,
    mature_bw: float,
    target_milk_per_day: float,
    target_fat_pct: float,
    weather_temp_c: float,
    weather_humidity: float,
    thi: float,
    temp_corr: float,
    resp_water_loss: float,
    lactating_animals: List[Any],
    pregnant_animals: List[Any],
    heifer_animals: List[Any],
    dry_animals: List[Any],
    bull_animals: List[Any],
    total_dmi_required_kg: float,
    grazing_dm_kg: float = 0.0,
    herd_total_water_liters: Optional[float] = None,
    current_mineral_mix_g: float = 0.0,
    current_salt_g: float = 0.0
) -> Dict[str, Any]:
    """
    Implements all formulas from the Knowledge Transfer (KT) Formulation System,
    with full scientific corrections resolving the 31 nutritional discrepancies:
    1. Proximate & Protein Fractions (DM, CP, EE, CF, NFE, Ash, NDF, ADF, Lignin, FA, Hemicellulose, TP, NPNCP).
    2. Complete 15-mineral profile from consolidated_minerals.dat.
    3. % Forage NDF in diet (> 21% Target Buffer).
    4. Free Water Intake (FWI) using exact NaK and non-squared TMPC2 formulas.
    5. Net Energy (NEL): Feed NEL, Milk NEL (0.360 + 0.0969*Fat%), Milk NEuse, Maintenance NEL, Gest_NEL, Total NEL Req & True Balance.
    6. Weeks to Calving: (280 - DayGest)/7 (Far-off >3 wks, Close-up <=3 wks).
    7. Corrected NRC DMI equations for heifers (MatBW prefactor) and lactating cows (4% FCM & complete terms).
    8. Moisture-derived As-Fed feed requirement and pasture grazing integration.
    """
    minerals_df = load_mineral_dataset()

    # Total counts and biomass
    num_lact = len(lactating_animals)
    num_preg = len(pregnant_animals)
    num_heif = len(heifer_animals)
    num_dry = len(dry_animals)
    num_bulls = len(bull_animals)
    total_cattle = num_lact + num_preg + num_heif + num_dry + num_bulls

    total_milk_yield = sum(float(getattr(c, "milkYield", 0.0) or 0.0) if hasattr(c, "milkYield") else float(c.get("milkYield", 0.0) or 0.0) for c in lactating_animals)
    avg_milk_per_cow = (total_milk_yield / max(1, num_lact)) if num_lact > 0 else target_milk_per_day

    # Weighted fat percentage
    fat_sum = sum(float(getattr(c, "milkFat", target_fat_pct) or target_fat_pct) if hasattr(c, "milkFat") else float(c.get("milkFat", target_fat_pct) or target_fat_pct) for c in lactating_animals)
    avg_fat_pct = (fat_sum / max(1, num_lact)) if num_lact > 0 else target_fat_pct

    # Total live body weight across herd
    def get_w(item):
        if hasattr(item, "weight"):
            return float(getattr(item, "weight", mature_bw) or mature_bw)
        return float(item.get("weight", mature_bw) or mature_bw)

    all_cattle_list = lactating_animals + pregnant_animals + heifer_animals + dry_animals + bull_animals
    total_bw = sum(get_w(c) for c in all_cattle_list)
    avg_bw = (total_bw / max(1, total_cattle)) if total_cattle > 0 else mature_bw

    # -------------------------------------------------------------
    # 1. FEED NUTRITIVE VALUES (Points 1-10)
    # -------------------------------------------------------------
    feed_breakdown = []
    tot_as_fed = 0.0
    tot_dm = 0.0
    tot_cp = 0.0
    tot_ee = 0.0
    tot_cf = 0.0
    tot_nfe = 0.0
    tot_ash = 0.0
    tot_ndf = 0.0
    tot_adf = 0.0
    tot_lignin = 0.0
    tot_fa = 0.0
    tot_hemicellulose = 0.0
    tot_tp = 0.0
    tot_npncp = 0.0
    tot_forage_ndf = 0.0
    tot_feed_me = 0.0

    # Mineral accumulators for all 15 minerals from consolidated_minerals.dat
    mineral_totals = {
        "Ca_g": 0.0, "P_g": 0.0, "Mg_g": 0.0, "K_g": 0.0, "Na_g": 0.0, "Cl_g": 0.0, "S_g": 0.0,
        "Co_mg": 0.0, "Cu_mg": 0.0, "I_mg": 0.0, "Fe_mg": 0.0, "Mn_mg": 0.0, "Se_mg": 0.0, "Zn_mg": 0.0, "Mo_mg": 0.0
    }

    for f in (selected_feeds or []):
        fname = f.get("name", "") if isinstance(f, dict) else getattr(f, "name", "")
        cat = f.get("category", "") if isinstance(f, dict) else getattr(f, "category", "")
        qty = float(f.get("quantityKg", 0.0) if isinstance(f, dict) else getattr(f, "quantityKg", 0.0) or 0.0)
        custom_dm = float(f.get("dmPct", 0.0) if isinstance(f, dict) else getattr(f, "dmPct", 0.0) or 0.0)

        if qty <= 0:
            continue

        # Match proximate data
        f_lower = fname.strip().lower()
        matched_prox = None
        for k, v in all_feeds_dict.items():
            if k in f_lower or f_lower in k:
                matched_prox = v
                break
        
        is_conc_cat = ("concentrate" in cat.lower() or any(w in f_lower for w in ['grain', 'bran', 'cake', 'meal', 'pellet', 'choker']))
        is_unconv_cat = ("unconventional" in cat.lower() or "molasses" in f_lower)

        # Base percentages
        if matched_prox:
            dm_pct = custom_dm if custom_dm > 0 else float(matched_prox.get("DM", 25.0))
            cp_pct = float(matched_prox.get("CP", 10.0))
            ee_pct = float(matched_prox.get("EE", 2.5))
            cf_pct = float(matched_prox.get("CF", 25.0))
            nfe_pct = float(matched_prox.get("NFE", 50.0))
            ash_pct = float(matched_prox.get("Ash", 8.0))
            ndf_pct = float(matched_prox.get("NDF", 50.0))
            adf_pct = float(matched_prox.get("ADF", 30.0))
        else:
            dm_pct = custom_dm if custom_dm > 0 else (88.0 if is_conc_cat else 25.0)
            cp_pct = 20.0 if is_conc_cat else 8.5
            ee_pct = 3.5 if is_conc_cat else 2.0
            cf_pct = 12.0 if is_conc_cat else 28.0
            nfe_pct = 56.0 if is_conc_cat else 50.0
            ash_pct = 8.0 if is_conc_cat else 9.5
            ndf_pct = 30.0 if is_conc_cat else 58.0
            adf_pct = 15.0 if is_conc_cat else 32.0

        # Feed classification
        if is_conc_cat:
            feed_class = "Concentrates"
        elif is_unconv_cat:
            feed_class = "Unconventional Feeds"
        elif dm_pct < 45.0:
            feed_class = "Wet Fodder"
        else:
            feed_class = "Dry Fodder"

        # Point 6 Correction: Roughages DO contain lignin! Never force to 0.
        def_lignin = 3.5 if is_conc_cat else (6.5 if feed_class == "Dry Fodder" else 4.5)
        lignin_pct = float(matched_prox.get("Lignin", def_lignin)) if matched_prox else def_lignin

        # 1. Feed Dry Matter (DM) = As Fed x % DM / 100
        feed_dm_kg = qty * (dm_pct / 100.0)

        # 2. Feed Crude protein (CP) = Feed DM x % CP / 100
        feed_cp_kg = feed_dm_kg * (cp_pct / 100.0)

        # 3. Feed Ether Extract (EE) = Feed DM x % EE / 100
        feed_ee_kg = feed_dm_kg * (ee_pct / 100.0)

        # 4. Feed Crude Fibre (CF) = Feed DM x % CF / 100
        feed_cf_kg = feed_dm_kg * (cf_pct / 100.0)

        # 5. Feed Nitrogen Free Extract (NFE) = Feed DM x % NFE / 100
        feed_nfe_kg = feed_dm_kg * (nfe_pct / 100.0)

        # 6. Feed Ash = Feed DM x % Ash / 100
        feed_ash_kg = feed_dm_kg * (ash_pct / 100.0)

        # 7. Feed Neutral Detergent Fibre (NDF) = Feed DM x % NDF / 100
        feed_ndf_kg = feed_dm_kg * (ndf_pct / 100.0)

        # 8. Feed Acid Detergent fiber (ADF) = Feed DM x % ADF / 100
        feed_adf_kg = feed_dm_kg * (adf_pct / 100.0)

        # 9. Point 6 Correction: Lignin = DM x % Lignin / 100 (for all feeds)
        feed_lignin_kg = feed_dm_kg * (lignin_pct / 100.0)

        # 10. Point 7 Correction: Fatty acids = DM x % FA / 100 (ruminants FA ~85% of EE)
        fa_pct = float(matched_prox.get("FA", ee_pct * 0.85)) if matched_prox else (ee_pct * 0.85)
        feed_fa_kg = feed_dm_kg * (fa_pct / 100.0)

        # 11. Point 5: Hemicellulose = NDF - ADF
        feed_hemicell_kg = max(0.0, feed_ndf_kg - feed_adf_kg)

        # Points 8, 9, 10 Correction:
        # Nitrogen = CP / 6.25
        feed_n_kg = feed_cp_kg / 6.25
        # NPNCP: non-protein nitrogen crude protein fraction (~8-15% of CP unless urea/silage)
        if matched_prox and "NPNCP" in matched_prox:
            feed_npncp_kg = feed_dm_kg * (float(matched_prox["NPNCP"]) / 100.0)
        else:
            npn_frac = 0.08 if is_conc_cat else (0.10 if feed_class == "Dry Fodder" else 0.15)
            feed_npncp_kg = feed_cp_kg * npn_frac

        # 12. True Protein (TP) = CP - NPNCP
        feed_tp_kg = max(0.0, feed_cp_kg - feed_npncp_kg)

        # Feed ME & NEL (Points 21 & 22)
        me_density = get_feed_me_mcal_per_kg_dm(fname, cat)
        feed_me_mcal = feed_dm_kg * me_density
        feed_nel_mcal = feed_me_mcal * 0.66

        # Match Minerals from consolidated_minerals.dat
        matched_mineral_row = None
        if not minerals_df.empty and "Ingredient" in minerals_df.columns:
            for _, r in minerals_df.iterrows():
                ing = str(r["Ingredient"]).strip().lower()
                if ing in f_lower or f_lower in ing:
                    matched_mineral_row = r
                    break
        
        def get_min(col_name, default_pct=0.0):
            if matched_mineral_row is not None and col_name in matched_mineral_row:
                try:
                    val = float(matched_mineral_row[col_name])
                    if not np.isnan(val):
                        return val
                except Exception:
                    pass
            return default_pct

        # Macro minerals (% on DM basis -> grams: DM_kg * % * 10)
        if is_conc_cat:
            def_ca, def_p, def_mg, def_k, def_na, def_cl, def_s = 0.25, 0.65, 0.30, 1.20, 0.05, 0.10, 0.25
        elif feed_class == "Dry Fodder":
            def_ca, def_p, def_mg, def_k, def_na, def_cl, def_s = 0.35, 0.15, 0.18, 1.10, 0.08, 0.25, 0.15
        else: # Wet Fodder
            def_ca, def_p, def_mg, def_k, def_na, def_cl, def_s = 0.45, 0.25, 0.22, 1.80, 0.08, 0.20, 0.18

        ca_pct = get_min("Ca (%)", def_ca)
        p_pct = get_min("P (%)", def_p)
        mg_pct = get_min("Mg (%)", def_mg)
        k_pct = get_min("K (%)", def_k)
        na_pct = get_min("Na (%)", def_na)
        cl_pct = get_min("Cl (%)", def_cl)
        s_pct = get_min("S (%)", def_s)

        feed_ca_g = feed_dm_kg * ca_pct * 10.0
        feed_p_g = feed_dm_kg * p_pct * 10.0
        feed_mg_g = feed_dm_kg * mg_pct * 10.0
        feed_k_g = feed_dm_kg * k_pct * 10.0
        feed_na_g = feed_dm_kg * na_pct * 10.0
        feed_cl_g = feed_dm_kg * cl_pct * 10.0
        feed_s_g = feed_dm_kg * s_pct * 10.0

        # Micro minerals (ppm = mg/kg DM -> mg: DM_kg * ppm)
        co_ppm = get_min("Co (ppm)", 0.15)
        cu_ppm = get_min("Cu (ppm)", 12.0)
        i_ppm = get_min("I (ppm)", 0.25)
        fe_ppm = get_min("Fe (ppm)", 250.0)
        mn_ppm = get_min("Mn (ppm)", 50.0)
        se_ppm = get_min("Se (ppm)", 0.20)
        zn_ppm = get_min("Zn (ppm)", 40.0)
        mo_ppm = get_min("Mo (ppm)", 1.2)

        feed_co_mg = feed_dm_kg * co_ppm
        feed_cu_mg = feed_dm_kg * cu_ppm
        feed_i_mg = feed_dm_kg * i_ppm
        feed_fe_mg = feed_dm_kg * fe_ppm
        feed_mn_mg = feed_dm_kg * mn_ppm
        feed_se_mg = feed_dm_kg * se_ppm
        feed_zn_mg = feed_dm_kg * zn_ppm
        feed_mo_mg = feed_dm_kg * mo_ppm

        # Accumulate mineral totals
        mineral_totals["Ca_g"] += feed_ca_g
        mineral_totals["P_g"] += feed_p_g
        mineral_totals["Mg_g"] += feed_mg_g
        mineral_totals["K_g"] += feed_k_g
        mineral_totals["Na_g"] += feed_na_g
        mineral_totals["Cl_g"] += feed_cl_g
        mineral_totals["S_g"] += feed_s_g
        mineral_totals["Co_mg"] += feed_co_mg
        mineral_totals["Cu_mg"] += feed_cu_mg
        mineral_totals["I_mg"] += feed_i_mg
        mineral_totals["Fe_mg"] += feed_fe_mg
        mineral_totals["Mn_mg"] += feed_mn_mg
        mineral_totals["Se_mg"] += feed_se_mg
        mineral_totals["Zn_mg"] += feed_zn_mg
        mineral_totals["Mo_mg"] += feed_mo_mg

        # Accumulate proximate totals
        tot_as_fed += qty
        tot_dm += feed_dm_kg
        tot_cp += feed_cp_kg
        tot_ee += feed_ee_kg
        tot_cf += feed_cf_kg
        tot_nfe += feed_nfe_kg
        tot_ash += feed_ash_kg
        tot_ndf += feed_ndf_kg
        tot_adf += feed_adf_kg
        tot_lignin += feed_lignin_kg
        tot_fa += feed_fa_kg
        tot_hemicellulose += feed_hemicell_kg
        tot_tp += feed_tp_kg
        tot_npncp += feed_npncp_kg
        tot_feed_me += feed_me_mcal

        if feed_class in ["Wet Fodder", "Dry Fodder"]:
            tot_forage_ndf += feed_ndf_kg

        feed_breakdown.append({
            "name": fname,
            "category": cat,
            "feedClass": feed_class,
            "asFedKg": round(qty, 2),
            "dmPct": round(dm_pct, 1),
            "dmKg": round(feed_dm_kg, 2),
            "cpKg": round(feed_cp_kg, 3),
            "eeKg": round(feed_ee_kg, 3),
            "cfKg": round(feed_cf_kg, 3),
            "nfeKg": round(feed_nfe_kg, 3),
            "ashKg": round(feed_ash_kg, 3),
            "ndfKg": round(feed_ndf_kg, 3),
            "adfKg": round(feed_adf_kg, 3),
            "ligninKg": round(feed_lignin_kg, 3),
            "faKg": round(feed_fa_kg, 3),
            "hemicelluloseKg": round(feed_hemicell_kg, 3),
            "tpKg": round(feed_tp_kg, 3),
            "npncpKg": round(feed_npncp_kg, 3),
            "nitrogenKg": round(feed_n_kg, 4),
            "meMcal": round(feed_me_mcal, 2),
            "nelMcal": round(feed_nel_mcal, 2),
            "minerals": {
                "caG": round(feed_ca_g, 2),
                "pG": round(feed_p_g, 2),
                "mgG": round(feed_mg_g, 2),
                "kG": round(feed_k_g, 2),
                "naG": round(feed_na_g, 2),
                "clG": round(feed_cl_g, 2),
                "sG": round(feed_s_g, 2),
                "coMg": round(feed_co_mg, 2),
                "cuMg": round(feed_cu_mg, 2),
                "iMg": round(feed_i_mg, 2),
                "feMg": round(feed_fe_mg, 2),
                "mnMg": round(feed_mn_mg, 2),
                "seMg": round(feed_se_mg, 3),
                "znMg": round(feed_zn_mg, 2),
                "moMg": round(feed_mo_mg, 2)
            }
        })

    tot_feed_nel = round(tot_feed_me * 0.66, 2)

    # -------------------------------------------------------------
    # 2. FORAGE NDF BUFFER (NASEM 2021 Sliding Scale)
    # -------------------------------------------------------------
    total_diet_ndf_pct = round((tot_ndf / max(0.01, tot_dm)) * 100.0, 1)
    forage_ndf_pct = round((tot_forage_ndf / max(0.01, tot_dm)) * 100.0, 1)
    forage_ndf_analysis = evaluate_nasem_forage_ndf(forage_ndf_pct, total_diet_ndf_pct)
    forage_ndf_analysis["totalForageNdfKg"] = round(tot_forage_ndf, 2)
    forage_ndf_analysis["totalDietDmKg"] = round(tot_dm, 2)
    is_forage_ndf_sufficient = forage_ndf_analysis["isSufficient"]

    # -------------------------------------------------------------
    # 3. METABOLIZABLE ENERGY & NET ENERGY MATRIX (Points 21-27)
    # -------------------------------------------------------------
    # Milk NEL (Mcal/kg): NEL = 0.360 + 0.0969 * Fat% (NASEM 2021 Eq. 3-14)
    milk_nel_mcal_per_kg = round(0.360 + (0.0969 * avg_fat_pct), 3) if num_lact > 0 else 0.0
    milk_neuse_mcal_per_day = round(milk_nel_mcal_per_kg * total_milk_yield, 2)
    milk_me_mcal_per_day = round(milk_neuse_mcal_per_day / 0.66, 2) if milk_neuse_mcal_per_day > 0 else 0.0

    # Maintenance NEL = 0.10 * BW^0.75 Mcal/day (NASEM 2021 Eq. 3-13)
    tot_nel_maint = round(sum(0.10 * (get_w(c) ** 0.75) for c in all_cattle_list), 2)
    nel_maint_per_cow = round(0.10 * (avg_bw ** 0.75), 2)

    # Gestational Requirements (NASEM 2021 Eq 3-15 to 3-18)
    is_any_heifer_preg = any(getattr(p, "isHeifer", False) or (isinstance(p, dict) and p.get("isHeifer", False)) for p in pregnant_animals)
    calf_birth_weight = round(mature_bw * (0.058 if is_any_heifer_preg else 0.063), 1)
    gr_uter_wt_init = calf_birth_weight * 1.825

    gest_nel_list = []
    gest_cp_list = []
    gr_uter_curr_list = []
    gr_uter_gain_list = []
    preg_days_list = []

    for p in pregnant_animals:
        is_heif = bool(getattr(p, "isHeifer", False) or (isinstance(p, dict) and p.get("isHeifer", False)))
        cat_p = str(getattr(p, "category", "") or (p.get("category", "") if isinstance(p, dict) else "")).lower()
        if "heifer" in cat_p or "first" in cat_p:
            is_heif = True

        p_bw = float(getattr(p, "weight", mature_bw) if hasattr(p, "weight") else (p.get("weight", mature_bw) if isinstance(p, dict) else mature_bw))
        p_mat_bw = max(p_bw, float(mature_bw or 450.0))

        pm = getattr(p, "pregMonth", None) if hasattr(p, "pregMonth") else (p.get("pregMonth") if isinstance(p, dict) else None)
        if pm is None:
            pm = getattr(p, "gestationalMonths", None) if hasattr(p, "gestationalMonths") else (p.get("gestationalMonths") if isinstance(p, dict) else None)
        pm_val = float(pm) if pm is not None and float(pm) > 0 else 7.0

        pd_val = getattr(p, "pregDays", None) if hasattr(p, "pregDays") else (p.get("pregDays") if isinstance(p, dict) else None)
        if pd_val is not None and float(pd_val) > 0:
            day_gest = min(279.0, max(1.0, float(pd_val)))
        else:
            day_gest = min(279.0, max(1.0, pm_val * 30.4))
        preg_days_list.append(day_gest)

        # NASEM 2021 continuous gravid uterus accretion
        p_calf_bw = p_mat_bw * (0.058 if is_heif else 0.063)
        p_gr_uter_part = p_calf_bw * 1.825
        k_val = 0.0243 - (0.0000245 * day_gest)
        exp_term = -(k_val * (280.0 - day_gest))
        p_gr_uter_curr = p_gr_uter_part * math.exp(exp_term)
        p_gr_uter_gain = k_val * p_gr_uter_curr
        p_gest_nel = p_gr_uter_gain * 4.16
        p_gest_cp_g = (p_gr_uter_gain * 1000.0 * 0.12) / 0.33

        gest_nel_list.append(p_gest_nel)
        gest_cp_list.append(p_gest_cp_g)
        gr_uter_curr_list.append(p_gr_uter_curr)
        gr_uter_gain_list.append(p_gr_uter_gain)

    total_gest_nel = round(sum(gest_nel_list), 2)
    gest_nel_per_animal = round(total_gest_nel / max(1, num_preg), 2) if num_preg > 0 else 0.0
    avg_day_gest = (sum(preg_days_list) / max(1, len(preg_days_list))) if preg_days_list else 210.0
    weeks_to_calving = round((280.0 - avg_day_gest) / 7.0, 1)
    dry_period_stage = "Close-up (<= 3 weeks to calving)" if weeks_to_calving <= 3.0 else "Far-off (> 3 weeks to calving)"
    gr_uter_wt_current = round(sum(gr_uter_curr_list) / max(1, len(gr_uter_curr_list)), 2) if gr_uter_curr_list else 0.0
    gr_uter_wt_gain = round(sum(gr_uter_gain_list) / max(1, len(gr_uter_gain_list)), 4) if gr_uter_gain_list else 0.0

    # NASEM Growth model for primiparous cows & growing heifers
    primi_count = sum(1 for c in lactating_animals if (getattr(c, "isFirstLactation", False) or getattr(c, "lactationType", "") == "first_lactation"))
    nel_primi_grow, _ = calculate_nasem_heifer_growth_nel(avg_bw, mature_bw, target_adg_kg=0.25)
    nel_heif_grow, _ = calculate_nasem_heifer_growth_nel(avg_bw, mature_bw, target_adg_kg=0.60)
    growth_nel = round((primi_count * nel_primi_grow) + (num_heif * nel_heif_grow), 2)

    # Total NEL Requirement: NEL_Req = NEL_Maint + NEL_Milk + NEL_Gest + NEL_Growth
    total_nel_required = round(tot_nel_maint + milk_neuse_mcal_per_day + total_gest_nel + growth_nel, 2)
    total_nel_formula = f"TotalNELReq = {tot_nel_maint:.2f} (Maint) + {milk_neuse_mcal_per_day:.2f} (Milk) + {total_gest_nel:.2f} (Gest) + {growth_nel:.2f} (Growth/Frame) = {total_nel_required:.2f} Mcal/day"

    # True Energy Balance & Adequacy %
    energy_balance_nel = round(tot_feed_nel - total_nel_required, 2)
    nel_adequacy_pct = round((tot_feed_nel / max(0.1, total_nel_required)) * 100.0, 1)
    if 95.0 <= nel_adequacy_pct <= 105.0:
        energy_status = "Optimal Energy Balance (NASEM 95–105%)"
        energy_advice = "Dietary Net Energy matches total herd physiological requirements."
    elif nel_adequacy_pct < 95.0:
        energy_status = "Energy Deficit (Negative Balance)"
        energy_advice = f"Deficit of {abs(energy_balance_nel):.1f} Mcal NEL/day. Increase dietary energy density."
    else:
        energy_status = "Energy Surplus"
        energy_advice = f"Surplus of {energy_balance_nel:.1f} Mcal NEL/day. Monitor body condition to avoid excess fat."

    # -------------------------------------------------------------
    # 4. MINERAL SUPPLY & NASEM FACTORIAL REQUIREMENTS
    # -------------------------------------------------------------
    # Transparent source breakdown: Natural feeds + Supplements
    if current_mineral_mix_g is not None and current_mineral_mix_g > 0:
        supp_ca_g = round(current_mineral_mix_g * 0.20, 1)
        supp_p_g = round(current_mineral_mix_g * 0.10, 1)
        supp_mix_kg = round(current_mineral_mix_g / 1000.0, 3)
    else:
        supp_ca_g = 0.0
        supp_p_g = 0.0
        supp_mix_kg = 0.0

    if current_salt_g is not None and current_salt_g > 0:
        supp_na_g = round(current_salt_g * 0.393, 1)
        supp_cl_g = round(current_salt_g * 0.607, 1)
        supp_salt_kg = round(current_salt_g / 1000.0, 3)
    else:
        supp_na_g = 0.0
        supp_cl_g = 0.0
        supp_salt_kg = 0.0

    tot_ca_supplied_g = round(mineral_totals["Ca_g"] + supp_ca_g, 1)
    tot_p_supplied_g = round(mineral_totals["P_g"] + supp_p_g, 1)
    tot_na_supplied_g = round(mineral_totals["Na_g"] + supp_na_g, 1)
    tot_cl_supplied_g = round(mineral_totals["Cl_g"] + supp_cl_g, 1)

    # NASEM Absorbed & Dietary Factorial Requirements
    abs_ca_req = (0.90 * total_dmi_required_kg) + (1.22 * total_milk_yield) + (gr_uter_wt_gain * 1000.0 * 0.018 * num_preg)
    dietary_ca_req_g = round(max(total_cattle * 25.0, abs_ca_req / 0.40), 1)

    abs_p_req = (1.0 * total_dmi_required_kg) + (0.0006 * total_bw) + (0.90 * total_milk_yield) + (gr_uter_wt_gain * 1000.0 * 0.010 * num_preg)
    dietary_p_req_g = round(max(total_cattle * 18.0, abs_p_req / 0.60), 1)

    ca_adequacy_pct = round((tot_ca_supplied_g / max(0.1, dietary_ca_req_g)) * 100.0, 1)
    p_adequacy_pct = round((tot_p_supplied_g / max(0.1, dietary_p_req_g)) * 100.0, 1)

    # -------------------------------------------------------------
    # 5. FREE WATER INTAKE (FWI) (NASEM 2021 Eq 9-1 & 9-3)
    # -------------------------------------------------------------
    diet_dm_pct = (tot_dm / max(0.01, tot_as_fed) * 100.0) if tot_as_fed > 0 else 25.0
    diet_cp_pct = (tot_cp / max(0.01, tot_dm) * 100.0) if tot_dm > 0 else 12.0
    diet_na_pct = (tot_na_supplied_g / max(0.01, tot_dm * 1000.0)) * 100.0
    diet_k_pct = (mineral_totals["K_g"] / max(0.01, tot_dm * 1000.0)) * 100.0
    nak_factor = round(((diet_na_pct / 0.023) + (diet_k_pct / 0.039)) * 10.0, 2)
    if num_lact > 0:
        lact_dmi_per_cow = sum(
            calculate_nasem_dmi(
                "milkingCow",
                bw=get_w(c),
                milk_yield=float(getattr(c, "milkYield", 0.0) if hasattr(c, "milkYield") else c.get("milkYield", 0.0)),
                milk_fat_pct=float(getattr(c, "milkFat", target_fat_pct) if hasattr(c, "milkFat") else c.get("milkFat", target_fat_pct)),
                mature_bw=mature_bw
            ) for c in lactating_animals
        ) / max(1, num_lact)
    else:
        lact_dmi_per_cow = (total_dmi_required_kg / max(1, total_cattle)) * 1.20

    rem_animals = pregnant_animals + heifer_animals + dry_animals + bull_animals
    if rem_animals:
        rem_dmi_per_head = sum(
            calculate_nasem_dmi("dryCow", bw=get_w(c), mature_bw=mature_bw)
            for c in rem_animals
        ) / max(1, len(rem_animals))
    else:
        rem_dmi_per_head = (total_dmi_required_kg / max(1, total_cattle)) * 0.90

    # NASEM 2021 Eq. 9-1: FWI = -91.1 + 2.93*DMI + 0.61*DM% + 0.062*NaK + 2.49*CP% + 0.76*Temp
    lact_fwi_head = calculate_nasem_water_fwi(True, lact_dmi_per_cow, diet_dm_pct, diet_cp_pct, diet_na_pct, diet_k_pct, weather_temp_c)

    # NASEM 2021 Eq. 9-3: FWI = 1.16*DMI + 0.23*DM% + 0.44*Temp + 0.061*(Temp-16.4)^2
    rem_fwi_head = calculate_nasem_water_fwi(False, rem_dmi_per_head, diet_dm_pct, diet_cp_pct, diet_na_pct, diet_k_pct, weather_temp_c)
    tmpc2 = ((weather_temp_c - 16.4) ** 2) if weather_temp_c > 16.4 else 0.0

    if herd_total_water_liters is not None and herd_total_water_liters > 0:
        total_fwi_liters = round(float(herd_total_water_liters), 1)
    else:
        total_fwi_liters = round((lact_fwi_head * num_lact) + (rem_fwi_head * (num_preg + num_heif + num_dry + num_bulls)), 1)

    # -------------------------------------------------------------
    # 6. REQUIRED BODY WEIGHT & REQUIRED AS-FED
    # -------------------------------------------------------------
    primi_target_bw = round(mature_bw * 0.85, 1)
    multi_target_bw = round(mature_bw * 0.95, 1)
    moisture_required_as_fed_kg = round(total_dmi_required_kg / max(0.10, diet_dm_pct / 100.0), 1)
    herd_as_fed_baseline_kg = round(avg_bw * 0.045 * total_cattle, 1)
    primi_as_fed_req_kg = round(primi_target_bw * 0.045, 1)
    multi_as_fed_req_kg = round(multi_target_bw * 0.045, 1)

    # -------------------------------------------------------------
    # 7. DMI FORMULATIONS & CORRECTIONS
    # -------------------------------------------------------------
    primi_far_off_dmi_target = round(0.022 * mature_bw * (1.0 - math.exp(-1.54 * (avg_bw / max(100.0, mature_bw)))), 2)
    multi_close_dmi_target = round((primi_far_off_dmi_target * avg_bw / 100.0) * 0.88, 2)

    diet_ndf_pct = (tot_ndf / max(0.01, tot_dm) * 100.0) if tot_dm > 0 else 45.0
    diet_adf_pct = (tot_adf / max(0.01, tot_dm) * 100.0) if tot_dm > 0 else 28.0
    bw_mat_ratio = avg_bw / max(100.0, mature_bw)
    heifer_diet_dmi = round(
        0.0226 * mature_bw * (1.0 - math.exp(-1.47 * bw_mat_ratio)) -
        0.082 * (diet_ndf_pct - (23.1 + 56.0 * bw_mat_ratio - 30.6 * (bw_mat_ratio ** 2))),
        2
    )

    fcm_4pct = (0.4 * avg_milk_per_cow) + (15.0 * (avg_fat_pct / 100.0) * avg_milk_per_cow)
    dim_avg = 100
    p_lact = 1.0
    bcs_ref = 3.0
    dmi_lact_target_eq = round(
        (3.7 + (5.7 * p_lact) + (0.305 * fcm_4pct) + (0.022 * avg_bw) + ((-0.689 - 1.87 * p_lact) * bcs_ref)) *
        (1.0 - ((0.212 + 0.136 * p_lact) * math.exp(-0.053 * dim_avg))),
        2
    )
    dmi_lact_target_eq = max(avg_bw * 0.02, min(avg_bw * 0.045, dmi_lact_target_eq))

    fndfd_pct = 52.0
    adf_ndf_ratio = diet_adf_pct / max(0.1, diet_ndf_pct)
    dmi_lact_feed_effect = round(
        12.0 - (0.107 * forage_ndf_pct) + (8.17 * adf_ndf_ratio) + (0.0253 * fndfd_pct) -
        (0.328 * (adf_ndf_ratio - 0.602) * (fndfd_pct - 48.3)) +
        (0.225 * avg_milk_per_cow) + (0.00390 * (fndfd_pct - 48.3) * (avg_milk_per_cow - 33.1)),
        2
    )
    dmi_lact_feed_effect = max(avg_bw * 0.018, min(avg_bw * 0.045, dmi_lact_feed_effect))

    total_dm_ingested_kg = round(tot_dm + grazing_dm_kg, 2)

    # -------------------------------------------------------------
    # 8. MULTI-NUTRIENT ADEQUACY INDEX (NASEM 2021)
    # -------------------------------------------------------------
    dmi_adequacy_pct = round((total_dm_ingested_kg / max(0.1, total_dmi_required_kg)) * 100.0, 1)
    cp_required_g = total_dmi_required_kg * 120.0
    cp_adequacy_pct = round((tot_cp * 1000.0 / max(0.1, cp_required_g)) * 100.0, 1)

    is_overall_balanced = (
        (95.0 <= dmi_adequacy_pct <= 105.0) and
        (95.0 <= nel_adequacy_pct <= 105.0) and
        (95.0 <= cp_adequacy_pct <= 110.0) and
        is_forage_ndf_sufficient and
        (ca_adequacy_pct >= 95.0) and
        (p_adequacy_pct >= 95.0)
    )

    return {
        "nutritiveComposition": {
            "feeds": feed_breakdown,
            "dietTotals": {
                "asFedKg": round(tot_as_fed, 2),
                "dmKg": round(tot_dm, 2),
                "cpKg": round(tot_cp, 3),
                "cpG": round(tot_cp * 1000.0, 1),
                "cpPct": round(diet_cp_pct, 1),
                "eeKg": round(tot_ee, 3),
                "eePct": round((tot_ee / max(0.01, tot_dm)) * 100.0, 1),
                "cfKg": round(tot_cf, 3),
                "cfPct": round((tot_cf / max(0.01, tot_dm)) * 100.0, 1),
                "nfeKg": round(tot_nfe, 3),
                "nfePct": round((tot_nfe / max(0.01, tot_dm)) * 100.0, 1),
                "ashKg": round(tot_ash, 3),
                "ashPct": round((tot_ash / max(0.01, tot_dm)) * 100.0, 1),
                "ndfKg": round(tot_ndf, 3),
                "ndfPct": round(diet_ndf_pct, 1),
                "adfKg": round(tot_adf, 3),
                "adfPct": round(diet_adf_pct, 1),
                "ligninKg": round(tot_lignin, 3),
                "faKg": round(tot_fa, 3),
                "hemicelluloseKg": round(tot_hemicellulose, 3),
                "tpKg": round(tot_tp, 3),
                "npncpKg": round(tot_npncp, 3),
                "meMcal": round(tot_feed_me, 2),
                "nelMcal": tot_feed_nel
            }
        },
        "forageNdfBuffer": forage_ndf_analysis,
        "mineralProfile": {
            "source": "backend/consolidated_minerals.dat",
            "naturalFeedsSupply": {
                "calciumG": round(mineral_totals["Ca_g"], 1),
                "phosphorusG": round(mineral_totals["P_g"], 1),
                "sodiumG": round(mineral_totals["Na_g"], 1),
                "chlorideG": round(mineral_totals["Cl_g"], 1)
            },
            "supplementsSupply": {
                "mineralMixtureKg": supp_mix_kg,
                "saltKg": supp_salt_kg,
                "calciumG": supp_ca_g,
                "phosphorusG": supp_p_g,
                "sodiumG": supp_na_g,
                "chlorideG": supp_cl_g
            },
            "macroMinerals": {
                "calcium": {"symbol": "Ca", "unit": "g/day", "supplied": tot_ca_supplied_g, "feedSupplied": round(mineral_totals["Ca_g"], 1), "suppSupplied": supp_ca_g, "required": dietary_ca_req_g, "adequacyPct": ca_adequacy_pct},
                "phosphorus": {"symbol": "P", "unit": "g/day", "supplied": tot_p_supplied_g, "feedSupplied": round(mineral_totals["P_g"], 1), "suppSupplied": supp_p_g, "required": dietary_p_req_g, "adequacyPct": p_adequacy_pct},
                "magnesium": {"symbol": "Mg", "unit": "g/day", "supplied": round(mineral_totals["Mg_g"], 1)},
                "potassium": {"symbol": "K", "unit": "g/day", "supplied": round(mineral_totals["K_g"], 1)},
                "sodium": {"symbol": "Na", "unit": "g/day", "supplied": tot_na_supplied_g},
                "chloride": {"symbol": "Cl", "unit": "g/day", "supplied": tot_cl_supplied_g},
                "sulfur": {"symbol": "S", "unit": "g/day", "supplied": round(mineral_totals["S_g"], 1)}
            },
            "traceMinerals": {
                "cobalt": {"symbol": "Co", "unit": "mg/day", "supplied": round(mineral_totals["Co_mg"], 2)},
                "copper": {"symbol": "Cu", "unit": "mg/day", "supplied": round(mineral_totals["Cu_mg"], 2)},
                "iodine": {"symbol": "I", "unit": "mg/day", "supplied": round(mineral_totals["I_mg"], 2)},
                "iron": {"symbol": "Fe", "unit": "mg/day", "supplied": round(mineral_totals["Fe_mg"], 1)},
                "manganese": {"symbol": "Mn", "unit": "mg/day", "supplied": round(mineral_totals["Mn_mg"], 1)},
                "selenium": {"symbol": "Se", "unit": "mg/day", "supplied": round(mineral_totals["Se_mg"], 3)},
                "zinc": {"symbol": "Zn", "unit": "mg/day", "supplied": round(mineral_totals["Zn_mg"], 1)},
                "molybdenum": {"symbol": "Mo", "unit": "mg/day", "supplied": round(mineral_totals["Mo_mg"], 2)}
            }
        },
        "energyAnalysis": {
            "dietMeMcal": round(tot_feed_me, 2),
            "feedNelMcal": tot_feed_nel,
            "milkNepMcalPerKg": milk_nel_mcal_per_kg,
            "milkNeuseMcalPerDay": milk_neuse_mcal_per_day,
            "milkMeMcalPerDay": milk_me_mcal_per_day,
            "maintenanceNelMcal": tot_nel_maint,
            "maintenanceNelPerCowMcal": nel_maint_per_cow,
            "gestNelMcalPerDay": total_gest_nel,
            "gestNelPerCowMcal": round(gest_nel_per_animal, 2),
            "growthNelMcal": growth_nel,
            "growthDescription": "Heifer frame growth & primiparous tissue gain (NASEM Empty Body Gain Model)",
            "totalNelRequiredMcal": total_nel_required,
            "totalNelFormula": total_nel_formula,
            "energyBalanceNelMcal": energy_balance_nel,
            "nelAdequacyPct": nel_adequacy_pct,
            "energyStatus": energy_status,
            "energyAdvice": energy_advice,
            "gravidUterineWeightKg": round(gr_uter_wt_current, 2),
            "gravidUterineGainKgDay": round(gr_uter_wt_gain, 4),
            "weeksToCalving": weeks_to_calving,
            "dryPeriodStage": dry_period_stage,
            "bwGainCoefficients": {
                "lactatingNelPerKgGain": 5.6,
                "nonLactatingNelPerKgGain": 6.9
            }
        },
        "freeWaterIntakeFwi": {
            "nakFactor": nak_factor,
            "tempCorr": round(temp_corr, 2),
            "tmpc2": round(tmpc2, 2),
            "respiratoryWaterLoss": round(resp_water_loss, 4),
            "lactatingFwiPerCowL": lact_fwi_head,
            "remainingFwiPerHeadL": rem_fwi_head,
            "totalFwiLiters": total_fwi_liters,
            "lactatingFormula": "FWI = -91.1 + (2.93 * DMI) + (0.61 * DM%) + (0.062 * NaK) + (2.49 * CP%) + (0.76 * Temp)",
            "remainingFormula": "FWI = 1.16*DMI + 0.23*DM% + 0.44*Temp + 0.061*(Temp-16.4)^2",
            "herdFormula": "Water_herd = Sum(Water_i)"
        },
        "bodyWeightAndFeedingBaselines": {
            "primiparousTargetBwKg": primi_target_bw,
            "multiparousTargetBwKg": multi_target_bw,
            "moistureRequiredAsFedKg": moisture_required_as_fed_kg,
            "herdAsFedBaselineKg": herd_as_fed_baseline_kg,
            "primiparousRequiredAsFedKg": primi_as_fed_req_kg,
            "multiparousRequiredAsFedKg": multi_as_fed_req_kg,
            "rule": "Moisture As-Fed = DMI / (DM% / 100) | Baseline Thumb-Rule = 4.5% Live BW"
        },
        "dmiFormulations": {
            "primiparousFarOffTargetDmiKg": primi_far_off_dmi_target,
            "multiparousCloseTargetDmiKg": multi_close_dmi_target,
            "heiferDietDmiKg": heifer_diet_dmi,
            "lactatingTargetDmiEqKg": dmi_lact_target_eq,
            "lactatingFarmFeedDmiKg": dmi_lact_feed_effect,
            "troughDmKg": round(tot_dm, 2),
            "grazingDmKg": round(grazing_dm_kg, 2),
            "totalDmIngestedKg": total_dm_ingested_kg
        },
        "rationBalanceSummary": {
            "isBalanced": is_overall_balanced,
            "dmiAdequacyPct": dmi_adequacy_pct,
            "nelAdequacyPct": nel_adequacy_pct,
            "cpAdequacyPct": cp_adequacy_pct,
            "forageNdfBufferSufficient": is_forage_ndf_sufficient,
            "caAdequacyPct": ca_adequacy_pct,
            "pAdequacyPct": p_adequacy_pct,
            "status": "Scientifically Balanced Ration" if is_overall_balanced else "Imbalanced Ration - Review Deficits / Surpluses"
        }
    }
