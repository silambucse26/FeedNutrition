# Minerals and Vitamins Requirement Engine (NRC Standards)
import math

def calciumAbsorption_Maint(dmi: float, milkProteinPerc: float):
    maintenance = [(0.90 * 0.034 * dmi), (0.90 * (-0.034) * dmi)]
    milkCalc = (0.295 * 0.73 + 0.239 * 0.029 * milkProteinPerc, ((-0.295 * 0.73) - (0.239 * 0.029) * milkProteinPerc))
    return maintenance, milkCalc

def phosphorousHomeostasis_Maint(weight: float, dmi: float, currBW: float, matBW: float, milkYieldperDay: float, milkProteinPerc: float, adg: float = 0.5):
    growthKgD = (1.2 + ((4.635 * (matBW ** 0.22)) * (currBW - 0.22))) * adg
    adultsgd = (1.0 * weight * dmi) + (0.0006 * currBW)
    growingHeifersgd = (0.8 * weight * dmi) + (0.0006 * currBW)
    unknownMilkProt = milkYieldperDay * 0.90
    knownMilkProtein = milkYieldperDay * (0.49 + 0.13 * milkProteinPerc)
    return growthKgD, adultsgd, growingHeifersgd, unknownMilkProt, knownMilkProtein

def vitEBioavailReq(currBW: float):
    dryCows = 1.6 * currBW
    prepartum_3wksbefore = 3.0 * currBW
    lactatingCows = 0.8 * currBW
    growingHeifers = 0.8 * currBW
    return dryCows, prepartum_3wksbefore, lactatingCows, growingHeifers

def respLosses(temp: float, relHum: float):
    bodyWaterLoss = 0.41 - 0.02 * temp + 0.0005 * (temp ** 2) - 0.004 * relHum + 0.00004 * (relHum ** 2)
    return max(0.0, bodyWaterLoss)

def magnesium(dmi: float, currBW: float, milkYieldperDay: float, parturition: int = 1):
    maintenance = 0.3 * dmi + 0.0007 * currBW
    gestReq = 0.3 * currBW / 715.0 if parturition > 6 else 0.0
    lactation = 0.11 * milkYieldperDay
    return maintenance, gestReq, lactation

def absNa(dmi: float, currBW: float, milkYieldperDay: float, parturition: int = 1):
    maintenance = 1.45 * dmi
    gestReq = 1.4 * currBW / 715.0 if parturition > 6 else 0.0
    lactation = 0.4 * milkYieldperDay
    return maintenance, gestReq, lactation

def absCl(dmi: float, currBW: float, milkYieldperDay: float, parturition: int = 1):
    maintenance = 1.11 * dmi
    gestReq = 1.0 * currBW / 715.0 if parturition > 6 else 0.0
    lactation = 1.0 * milkYieldperDay
    return maintenance, gestReq, lactation

def absK(dmi: float, currBW: float, milkYieldperDay: float, parturition: int = 1):
    maintenance_lact = 2.5 * dmi + 0.2 * currBW
    maintenance_nonlact = 2.5 * dmi + 0.07 * currBW
    gestReq = 1.03 * currBW / 715.0 if parturition > 6 else 0.0
    lactation = 1.5 * milkYieldperDay
    return maintenance_lact, maintenance_nonlact, gestReq, lactation

def reqCopper(dmi: float, currBW: float, milkYieldperDay: float, parturition: int = 1):
    maintenance = 0.0145 * dmi
    gestReq_1 = 0.0003 * currBW if (3 <= parturition < 6) else 0.0
    gestReq_2 = 0.0023 * currBW if parturition >= 6 else 0.0
    lactation = 0.04 * milkYieldperDay
    return maintenance, gestReq_1, gestReq_2, lactation

def reqI(currBW: float, milkYieldperDay: float, parturition: int = 1):
    maintenance = 0.0026 * currBW
    gestReq = 0.025 * currBW if parturition > 6 else 0.0
    lactation = 1.0 * milkYieldperDay
    return maintenance, gestReq, lactation

def reqMn(currBW: float, milkYieldperDay: float, parturition: int = 1):
    maintenance = 0.0026 * currBW
    gestReq = 0.00042 * currBW if parturition > 6 else 0.0
    lactation = 0.03 * milkYieldperDay
    return maintenance, gestReq, lactation

def reqSe(dmi: float):
    maintenance = 0.3 * dmi
    return maintenance

def reqZn(dmi: float, currBW: float, milkYieldperDay: float, parturition: int = 1):
    maintenance = 0.0026 * currBW  # endogenous fecal loss
    gestReq = 0.00042 * currBW if parturition > 6 else 0.0
    lactation = 0.03 * milkYieldperDay
    return maintenance, gestReq, lactation

def reqVitA(currBW: float, milkYieldperDay: float):
    if milkYieldperDay <= 35:
        adeqIntake = 110 * currBW
    else:
        adeqIntake = 110 * currBW + 1000 * (milkYieldperDay - 35)
    return adeqIntake
