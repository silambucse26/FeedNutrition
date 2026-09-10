from numpy import *
from collections import defaultdict
import fileinput
import sys,string
import json
import re
import pandas as pd
import math as m
from typing import Type
from fpdf import FPDF
from datetime import date, timedelta
#
parametersFile = sys.argv[1]
#Temperature, dewPoint, inBreed, inputFeed, inputAsFed, actMilkYield, actFatPerc, parturitionCountLact, parturitionCountDry, numDaysPostParturition(DIM)

#
def sysDataSplit(inp: str, data_type: Type):
    if (data_type == int):    out = [0] * len(inp)
    elif (data_type == float):    out = [0.00] * len(inp)
    else:    out = [""] * len(inp)
    for i in range(0,len(inp)):   out[i] = data_type(inp[i])
    return(out)
#
#print("For Heifers and Dry Cows in Heat Stress: Free Water Intake will be: \n")
#FWI for Lactating cows in Heat Stress = FWI + 30%
#FWI for Dry cows in Heat Stress = FWI + 44%
def tempHumData(loc_temp,Dp):
    out=[]
    beta = 17.625
    Lambda = 243.04
    dp_Numerator = (beta*Dp)/(Lambda+Dp)
    dp_Denominator = (beta*loc_temp)/(Lambda+loc_temp)
    relHumLoc = 100 * (exp(dp_Numerator) / exp(dp_Denominator))
    thi = round(((1.8 * loc_temp + 32) -((0.55 - 0.0055 * relHumLoc) * (1.8 * loc_temp - 26.8))),2)
    inp=""
    if (thi < 68.00):      inp = "Ambient!"
    elif ((thi > 67.00) and (thi < 72.00)):        inp = "MILD STRESS!"
    elif ((thi > 71.00) and (thi < 80.00)):        inp = "MILD TO MODERATE STRESS!"
    elif ((thi > 79.00) and (thi < 91.00)):        inp = "MODERATE TO SEVERE STRESS!"
    elif (thi > 90.00):    inp = "Severe stress!"
    if ("ambient" in inp):            factor = "The temperature is ambient. Hence the animals are under no temperture stress"
    else:       factor = "The animals are under possible temperature related " + inp
    tempCorr = (loc_temp - 16.4)**2
    respWaterLoss = 0.41 - 0.02 * loc_temp + 0.0005 * (loc_temp**2) - 0.004 * relHumLoc + 0.00004 * (relHumLoc**2)
    return(relHumLoc,thi,factor,tempCorr,respWaterLoss)
#
def readFile(inputFile):
    df = pd.read_csv(inputFile)
    refColData=df.iloc[:, :1].to_numpy(dtype='str')     #Ingredients, cow breeds
    refHeads=df.columns[1:].to_numpy(dtype='str')   #feed Fractions headers, cow breeds data headers
    headValues=df.iloc[:, 1:].to_numpy(dtype=float)     #Feed Fraction Data percentage (DM and DM basis), breed specific info
    return(refColData,refHeads,headValues)
#
def get_metBWparam(currBW,matBW):
    metCurrBW = currBW**0.75
    metMatBW = matBW**0.75
    return(metCurrBW,metMatBW)
#
def get_percentage(part,total):
    percent = total*part/100
    return(percent)
#
#DM,CP,EE,CF,NFE,Ash,NDF,ADF
def actualValues(as_Fed,compArray,feedType):
    actIntake=[]
    actIntakefrac=[]
    cpFraction=[0.00,0.00,0.00]
    actDmIntake = get_percentage(compArray[0],as_Fed)
    actCpIntake = get_percentage(compArray[1],actDmIntake)
    actEeIntake = get_percentage(compArray[2],actDmIntake)
    actFaIntake = 1-get_percentage(compArray[2],actDmIntake)
    actCfIntake = get_percentage(compArray[3],actDmIntake)
    actNfeIntake = get_percentage(compArray[4],actDmIntake)
    actAshIntake = get_percentage(compArray[5],actDmIntake)
    actNDFIntake = get_percentage(compArray[6],actDmIntake)
    actADFIntake = get_percentage(compArray[7],actDmIntake)
    if (feedType == "concentrates"):
        feedFractions = ["nfDm","nfCp","nfEe","nfFa","nfCf","nfNfe","nfAsh","nfNdf","nfAdf","nfLignin","nfHemiCell","nfTp","nfmilkCp","nfsNPNCPE"]
        actLigninIntake = get_percentage(compArray[8],actDmIntake)
    else:
        feedFractions = ["fDm","fCp","fEe","fFa","fCf","fNfe","fAsh","fNdf","fAdf","fLignin","fHemiCell","fTp","fmilkCp","fsNPNCPE"]
        actLigninIntake = 0.0
    actHemicelluloses = actNDFIntake - actADFIntake
    actTpIntake  = actCpIntake - (actCpIntake / 6.25)
    milkCp = (actCpIntake / 6.25) * 6.38
    actNPNCP = actCpIntake - actTpIntake
    fractionA = actNPNCP/actCpIntake
    fractionC = (actLigninIntake/actADFIntake) * (actCpIntake*0.135)
    fractionB = 100 - fractionA - fractionC
    cpFraction = [fractionA,fractionB,fractionC]
    actFeedFractions = [actDmIntake,actCpIntake,actEeIntake,actFaIntake,actCpIntake,actNfeIntake,actAshIntake,actNDFIntake,actADFIntake,actLigninIntake,actHemicelluloses,actTpIntake,milkCp,actNPNCP]
    return(cpFraction,feedFractions,actFeedFractions)
#

def splitFractions(feedFractionArray,feedFractionArrayData,strIn):
    indVal = feedFractionArray.index(strIn)
    outVal = feedFractionArrayData[indVal]
    return(outVal)
#

def milkEnergy(milkFatPerc,MilkYield):
    MEtoNE_conv = 0.66
    milkNEp = 0.36 + 9.69 * milkFatPerc/MilkYield
    milkNEused = milkNEp * MilkYield
    milkMEused = milkNEused/MEtoNE_conv
    return(milkNEused,milkMEused)
#

def calcGest(numParity,parityType):
    countLate = 0
    countFar = 0
    farWeeks = []
    lateWeeks = []
    for i in range(1,(numParity+1)):
        inval = "Please enter the date of Insemination of " + parityType + " " + str(i) + ": "
        dateOfInsemination = str(input(inval))
        inDate = list(map(int,dateOfInsemination.split('/')))
        inseminationDate = date(inDate[2],inDate[1],inDate[0])
        estGestLength = 310
        estGestDate = inseminationDate + timedelta(days=estGestLength)
        weeksBeforeCalving = (estGestDate - date.today()).days / 7
        if (weeksBeforeCalving <= 3):
            lateWeeks.append(weeksBeforeCalving)
            countLate = countLate + 1
        else:
            farWeeks.append(weeksBeforeCalving)
            countFar = countFar + 1
    return(countFar,farWeeks,countLate,lateWeeks)
#

def dmiLactatingCowsAnf(parturition,currBW,milkEnergy,bcs,daysAfterLactation):
    dmiLactAnf=(3.7 + (parturition * 5.7) + 0.305 * milkEnergy + 0.02 * currBW + (-0.689 - 1.87 * parturition) * bcs) * (1 - (0.212 + parturition * 0.316) * exp(-0.053 * daysAfterLactation))
    return(dmiLactAnf)
#

def digestibilityFactors(actCp,actFa,actNfe,actAsh,actNdf,actLignin,fatFactor,sNPNCPE):
    dROMbase = 0.96
    digNDF = (0.75 * (actNdf - actLignin) * (1 - (actLignin / actNdf)**0.667)) / actNdf
    rom = 100 - actAsh - actNdf - actNfe - (actFa/fatFactor) - (actCp - 0.64 * sNPNCPE)
    romDigest = ((rom * dROMbase) - 3.43) / rom
    adROM = ((rom*0.96)-3.43)/rom
    return(digNDF,rom,romDigest,adROM)
#
def dmiLactatingCowsRationEffects(actfNdf,actLignin,actAdf,actNdf,actNfe,ndfBaseDigest,dmi,milkYield):
    fndfd = get_percentage(52,actfNdf)
    adfFraction = actAdf / actNdf
    dmiFeedRation = 12.0 - 0.107 * actfNdf + 8.17 * (adfFraction - 0.602) * (fndfd - 48.3) + 0.02253 * milkYield + 0.00390 * (fndfd - 48.3) * (milkYield - 33.1)
    return(dmiFeedRation)
#
def dmiGrowingHeifersFarOffAnf(currBWFem,matBWFem):
    farOffAnf = 0.022 * matBWFem * (1 - exp(-1.54 * (currBWFem/matBWFem)))
    return(farOffAnf)
#
def dmiGrowingHeifersFarOffAnf_RationEffects(currBWFem,matBWFem,actNdf):
    bwFactor = currBWFem/matBWFem
    farOffAnf_Ration = (0.0226 * matBWFem * (1 - exp(-1.47 * bwFactor))) - (0.082 * (actNdf - (23.1 + 56 * bwFactor - 30.6 * bwFactor**2)))
    return(farOffAnf_Ration)
#
#3 weeks prepartum / last 3 weeks before 1st parturition / last 3 weeks before transition from dry to parturition in cows
def dmiGrowingHeifersLateGestAnf_RationEffects(week,actNdf):
    if (actNdf < 30):   actNdf = 30
    if (actNdf > 55):   actNdf = 55
    dmiNDF = 0.365 - 0.0028 * actNdf
    penPrePart = week * 2
    indivDMI = 1.47 - dmiNDF * week - 0.035 * (week**2)
    penDMI = (1.47 * penPrePart - (dmiNDF/2) * (penPrePart**2) - (0.035/3) * (penPrePart**3)) / penPrePart
    return(indivDMI,penDMI)
#
def dmiBW(dmi,currBWFem):
    dmi_BW = dmi / currBWFem
    return(dmi_BW)
#
#Mineral Intake
def absNa(dmi,currBW,milkYieldperDay,parturition):
    maintenance = 1.45 * dmi
    if (parturition > 6):        gestReq = 1.4*currBW/715
    lactation = 0.4*milkYieldperDay
    return(maintenance,gestReq,lactation)
#
def digestedStarch(dmi_MBW):
    dStarchBase = 0.91
    digStarch = dStarchBase - 1.0 * (dmi_MBW - 0.035)
    return(digestedStarch)
#
#Ruminal Digestion
def rumDigestionNDF_Starch(actCp,actNfe,actfNdf,actNdf,actAdf,wet,Dmi):
    RumDigNDFCoeff = -31.9 + 0.721 * (actNdf*100/Dmi) * (actNfe*100/Dmi) + 6.63 * (actCp*100/Dmi) - 0.211 * ((actCp/Dmi)**2) - 0.387 * ((actAdf*100/Dmi)/(actNdf*100/Dmi)) * 100 - 0.121 * wet + 1.51 * (Dmi)
    RumDigStCoeff = 70.6 - 14.5 * Dmi + 0.424 * actfNdf + 1.39 * (actNfe*100/Dmi) - 0.0219 * ((actNfe*100/Dmi)**2) - 0.154 * wet
    RumDigNDF = RumDigNDFCoeff*actNdf/100
    RumDigStarch = RumDigStCoeff*actNfe/100
    rumNDFPass = actNdf - RumDigNDF
    rumStarchPass = actNfe - RumDigStarch
    ruminantDigestion = [RumDigNDF,RumDigStarch,rumNDFPass,rumStarchPass]
    return(ruminantDigestion)
#
def fractional_RumDigestibilityB(feedDM,feedType):
    if (feedType == "forage"):   
        kp = 4.87
        kd = 0.04
    if (feedType == "concentrate"):   
        kp = 5.28
        kd = 0.01
    factor = kp/(kd + kp)
    part = feedDM * factor
    return(part)
#
def duodenalEndoN(dmi):
    duEndN_min = 15.4 + 2.6 + 1.21 + 0.24 * dmi
    duEndN_max = 15.4 - 2.6 + 1.21 - 0.24 * dmi
    return(duEndN_min,duEndN_max)
#

class varAssign:
    pass

#MAIN
data=[]
for line in fileinput.input(parametersFile):
    finp = line.split()
    data.append(finp[0])

for i in range(0,len(data)): 
    temperature = float(data[0])
    dewPoint = float(data[1])
    inBreed = data[2]
    feedIn = data[3]
    asFed = data[4]
    actMilkYield = float(data[5])
    actFatPerc = float(data[6])
    numGest = data[7]   #Primi,Multi
    numLact = data[8]   #Primi,Multi
    dryParity = int(data[9])    #Multi only
    postCalvingDIM = int(data[10])
#

#Temperature, dewPoint, inBreed, inputFeed, inputAsFed, actMilkYield, actFatPerc, parturitionCountLact, parturitionCountDry, numDaysPostParturition(DIM)
relativeHumidity, THI, stressFactor, TMPC, waterLoss_respiration = tempHumData(temperature,dewPoint)
print(relativeHumidity,THI,stressFactor,TMPC,waterLoss_respiration)

#
feedArray = list(map(str.strip, feedIn.split(',')))
asFedArray = list(map(float, asFed.split(',')))

print(feedArray)
print(asFedArray,"\n")

csvFiles=["breedspecificanimaldata.csv","roughages.csv","concentrates.csv","unconventionalFeeds.csv"]

breeds, breedDataHeads, breedData = readFile(csvFiles[0])              

breedIndex = where(breeds == inBreed)
milkFatIndex = where(breedDataHeads == "fat")
milkYieldPerDay = where(breedDataHeads == "mypday")
matBWData = where(breedDataHeads == "matureBWFemale")

milkFatPercTarget = breedData[breedIndex[0][0]][milkFatIndex[0][0]]
milkYield_target = breedData[breedIndex[0][0]][milkYieldPerDay[0][0]]
print("Milk Yield Target: ",milkYield_target)

milkNEusedEnergy_target, milkNEusedEnergy_actual = milkEnergy(milkFatPercTarget,milkYield_target)
milkMEusedEnergy_target, milkMEusedEnergy_actual  = milkEnergy(actFatPerc,actMilkYield)

diffMilkYield = (actMilkYield/milkYield_target)*100

diffMilkNEusedEnergy = (milkNEusedEnergy_actual/milkNEusedEnergy_target)*100
diffMilkMEusedEnergy = (milkMEusedEnergy_actual/milkMEusedEnergy_target)*100

if (diffMilkYield > 0.00):      print("Milk Yield is %1.2f percent lower"%(100-diffMilkYield))
else:   print("Milk Yield is %1.2f percent higher"%(diffMilkYield-100))

if (diffMilkNEusedEnergy > 0.00):      print("Milk Energy: %1.2f percent lower\n"%(100-diffMilkNEusedEnergy))
else:      print("Milk Energy: %1.2f percent higher\n"%(diffMilkMEusedEnergy-100))

print("Milk Yield : Milk Energy Matrix\n")
print("\tMilkYield\tFatPercent\tMilkEnergy")
print("Actual\t",actMilkYield,"\t\t",actFatPerc,"\t\t",round(milkNEusedEnergy_target,2),"\t\t",round(milkMEusedEnergy_actual,2))
print("Target\t",milkYield_target,"\t\t",milkFatPercTarget,"\t\t",round(milkMEusedEnergy_target,2),"\t\t",round(milkMEusedEnergy_actual,2),"\n")

#
#feed Ingredients Data
feedType=["roughages","concentrates","unconventionalFeeds"]

#refColData,refHeads,headValues
roughIngred, feedR_Fractions, roughData = readFile(csvFiles[1])     #fodder
concIngred, feedC_Fractions, concData = readFile(csvFiles[2])
unConvIngred, feedUn_Fractions, unConvData = readFile(csvFiles[3])

index=0
#
out=[""]*len(feedArray)

varInstance = varAssign()
forageFeedFractions=[]
nonForageFeedFractions=[]

totFractions = ["fnfDm","fnfCp","fnfEe","fnfFa","fnfCf","fnfNfe","fnfAsh","fnfNdf","fnfAdf","fnfLignin","fnfHemiCell","fnfTp","fnfmilkCp","fnfsNPNCPE"]
totOut = [0.0]*len(totFractions)
#
fout = [0.0] * len(totFractions)
nfout = [0.0] * len(totFractions)

forCpFractions = []
nforCpFractions = []

rumCPB = 0.00
cp = []
for feed, asFed in zip(feedArray,asFedArray):
    if (feed in roughIngred):
        v=0
        kd = 0.04 
        print(feed," yes")
        for i in range(0,len(roughData)):       
            if (feed == roughIngred[i]):    index=i
        protFract, ffractions, feedActArray = actualValues(asFed,roughData[index],feedType[v])
        cp.append(feedActArray[ffractions.index('fCp')])
        rumCPB = rumCPB + fractional_RumDigestibilityB(feedActArray[0],"forage")
        forCpFractions.append(protFract)
        for i in range(0,len(ffractions)):  fout[i] = fout[i] + feedActArray[i]
        flag=0
    elif (feed in concIngred):
        v=1
        kd = 0.01
        for j in range(0,len(concData)):       
            if (feed == concIngred[j]):    index=j
        protFract, nffractions, feedActArray = actualValues(asFed,concData[index],feedType[v])
        cp.append(feedActArray[nffractions.index('nfCp')])
        rumCPB = rumCPB + fractional_RumDigestibilityB(feedActArray[0],"concentrate")
        nforCpFractions.append(protFract)
        for i in range(0,len(nffractions)):            nfout[i] = nfout[i] + feedActArray[i]
        flag=1
#
for i in range(0,len(totFractions)):        
    if (i!=0):    
        fout[i] = fout[i]/fout[0]
        nfout[i] = nfout[i]/nfout[0]
        totOut[i] = fout[i] + nfout[i]    
    setattr(varInstance,ffractions[i],fout[i])
    setattr(varInstance,nffractions[i],nfout[i])
    setattr(varInstance,totFractions[i],totOut[i])

#fractions
#Dm,Cp,Ee,Fa,Cf,Nfe,Ash,Ndf,Adf,Lignin,HemiCell,Tp,Cp
#digestibilityFactors(actCp,actFa,actNfe,actAsh,actNdf,actLignin,fatFactor)

ffatFactor = 1.06
nffatFactor = 1.00

dfNdf_Base, fROM, dfROM, adfROM = digestibilityFactors(varInstance.fCp,varInstance.fFa,varInstance.fNfe,varInstance.fAsh,varInstance.fNdf,varInstance.fLignin,ffatFactor,varInstance.fsNPNCPE)

dnfNdf_Base, nfROM, dnfROM, adnfROM = digestibilityFactors(varInstance.nfCp,varInstance.nfFa,varInstance.nfNfe,varInstance.nfAsh,varInstance.nfNdf,varInstance.nfLignin,nffatFactor,varInstance.nfsNPNCPE)

print("dNdf_Base",dfNdf_Base,dnfNdf_Base)
print("adROM",adfROM,adnfROM)

gestParity = list(map(int, numGest.split(',')))    #primi,multi
lactParity = list(map(int, numLact.split(',')))    #primi,multi
print("\n")

#Animal BW Factors
matBWFem = breedData[breedIndex[0][0]][matBWData[0][0]]
currBWFem = matBWFem * 0.90

metabolicCurrBW, metabolicMatBW = get_metBWparam(currBWFem,matBWFem)

print("metabolicCurrBW: ",metabolicCurrBW)
print("metabolicMatBW: ",metabolicMatBW)

bcsLactation = 3.0

totFWIReq = 0.000
totFWIReq_target = 0.000
totFWIReq_actual = 0.000

#dmi calc

primi = 0
multi = 1

#Lactating Cows
#Animal Factor Based
lactPrimi = lactParity[0]
lactMulti = lactParity[1]

#milkMEusedEnergy_target, milkMEusedEnergy_actual
lact=[0,0]
#Anf,Anf-Ration
if (lactPrimi>0):
    lact[0] = 1
    dmiLactAnf_targetMilkEnergyP = dmiLactatingCowsAnf(primi,metabolicCurrBW,milkMEusedEnergy_target,bcsLactation,postCalvingDIM)
    dmiLactAnf_actualMilkEnergyP = dmiLactatingCowsAnf(primi,metabolicCurrBW,milkMEusedEnergy_actual,bcsLactation,postCalvingDIM)
    dmiLactRationBased_target_primi = dmiLactatingCowsRationEffects(varInstance.fNdf,varInstance.fnfLignin,varInstance.fnfAdf,varInstance.fnfNdf,varInstance.fnfNfe,dfNdf_Base,dmiLactAnf_targetMilkEnergyP,milkYield_target)   #Ration
    dmiLactRationBased_actual_primi = dmiLactatingCowsRationEffects(varInstance.fNdf,varInstance.fnfLignin,varInstance.fnfAdf,varInstance.fnfNdf,varInstance.fnfNfe,dfNdf_Base,dmiLactAnf_targetMilkEnergyP,milkYield_target)   #Ration
    dmiLactRationBased_target_primi_MBW = dmiLactRationBased_target_primi / metabolicCurrBW
    dmiLactRationBased_actual_primi_MBW = dmiLactRationBased_actual_primi / metabolicCurrBW
    lactationFWI_Target = -34.6 + (2.75 * dmiLactRationBased_target_primi_MBW) + (0.84 * milkYield_target) + (2.32 * varInstance.fnfAsh) + (0.27 * varInstance.fnfDm)
    lactationFWI_Actual = 23.0 + (2.38 * dmiLactRationBased_target_primi_MBW) + (0.64 * actMilkYield) + (2.32 * varInstance.fnfAsh) + (0.27 * varInstance.fnfDm)
    digStPrimiLactRation_target = digestedStarch(dmiLactRationBased_target_primi_MBW)
    digStPrimiLactRation_actual = digestedStarch(dmiLactRationBased_actual_primi_MBW)

#Anf,Anf-Ration
if (lactMulti>0):
    lact[1] = 1
    dmiLactAnf_targetMilkEnergyM = dmiLactatingCowsAnf(multi,metabolicCurrBW,milkMEusedEnergy_target,bcsLactation,postCalvingDIM)
    dmiLactAnf_actualMilkEnergyM = dmiLactatingCowsAnf(multi,metabolicCurrBW,milkMEusedEnergy_actual,bcsLactation,postCalvingDIM)
    dmiLactRationBased_target_multi = dmiLactatingCowsRationEffects(varInstance.fNdf,varInstance.fnfLignin,varInstance.fnfAdf,varInstance.fnfNdf,varInstance.fnfNfe,dfNdf_Base,dmiLactAnf_targetMilkEnergyM,milkYield_target)   #Ration
    dmiLactRationBased_actual_multi = dmiLactatingCowsRationEffects(varInstance.fNdf,varInstance.fnfLignin,varInstance.fnfAdf,varInstance.fnfNdf,varInstance.fnfNfe,dfNdf_Base,dmiLactAnf_actualMilkEnergyM,actMilkYield)   #Ration
    dmiLactRationBased_target_multi_MBW = dmiLactRationBased_target_multi / metabolicCurrBW
    dmiLactRationBased_actual_multi_MBW = dmiLactRationBased_actual_multi / metabolicCurrBW
    digStMultiLactRation_target = digestedStarch(dmiLactRationBased_target_multi_MBW)
    digStMultiLactRation_actual = digestedStarch(dmiLactRationBased_actual_multi_MBW)


#Gestational DMI - Primiparous, Multiparous
#Predicted Gestational Date Calculator
gest=[[0,0],[0,0]]         #far,late
wet = 0.00

if (gestParity[0] != 0):
    countfar=0
    countlate=0
    far, farWeeks, late, lateWeeks = calcGest(gestParity[0],"Heifer")
    if (far > 0): 
        gest[0][0] = 1
        farOffHeifAnf = [0.00] * far
        farOffHeifAnfRation = [0.00] * far
        farOffHeifAnfRation_MBW = [0.00] * far
        RuminantDigestionfarOff = [0.00] * far
        digestedStarchfarOffHeif = [0.00] * far
        for f in range(0,len(farWeeks)):
            farOffHeifAnf[f] = dmiGrowingHeifersFarOffAnf(metabolicCurrBW,metabolicMatBW) #Heif1 - Anf
            farOffHeifAnfRation[f] = dmiGrowingHeifersFarOffAnf_RationEffects(metabolicCurrBW,metabolicMatBW,varInstance.fnfNdf) #Heif2 - Anf + Ration
            farOffHeifAnfRation_MBW[f] = farOffHeifAnfRation[f]/metabolicCurrBW
            digestedStarchfarOffHeif[f] = digestedStarch(farOffHeifAnfRation_MBW[f])
            RuminantDigestionfarOff[f] = rumDigestionNDF_Starch(varInstance.fnfCp,varInstance.fnfNfe,varInstance.fNdf,varInstance.fnfNdf,varInstance.fnfAdf,wet,farOffHeifAnfRation_MBW[f])
    if (late > 0):
        gest[0][1] = 1
        lateHeifAnfRation_Ind = [0.00] * late        #use for multiparous individual
        lateHeifAnfRation_Ind_MBW = [0.00] * late        #use for multiparous individual
        digestedStarchLateHeifInd = [0.00] * late
        for l in range(0,len(lateWeeks)):
            w = lateWeeks[b]
            lateHeifAnfRation_Ind[l], lateHeifAnfRation_Pen[l] = dmiGrowingHeifersLateGestAnf_RationEffects((-w),varInstance.fnfNdf)
            lateHeifAnfRation_Ind_MBW[l] = lateHeifAnfRation_Ind[l]/metabolicCurrBW
            digestedStarchLateHeifInd[l] = digestedStarch(lateHeifAnfRation_Ind_MBW[l])
        if (late > 3):
            lateHeifAnfRation_Pen = [0.00] * late        #use for multiparous pen
            lateHeifAnfRation_Pen_MBW = [0.00] * late        #use for multiparous pen
            digestedStarchLateHeifPen = [0.00] * late
        for l in range(0,len(lateWeeks)):
            w = lateWeeks[b]
            lateHeifAnfRation_Pen_MBW[l] = lateHeifAnfRation_Pen[l]/metabolicCurrBW
            digestedStarchLateHeifPen[l] = digestedStarch(lateHeifAnfRation_Pen_MBW[l])
#
if (gestParity[1] != 0):
    far, farWeeks, late, lateWeeks = calcGest(gestParity[1],"Multiparous Cow")
    if (late > 0):
        gest[1][1] = 1
        lateHeifAnfRation_IndMPC = [0.00] * late        #use for multiparous individual    -- Anf-Ration
        multiLateGestInd_DMI_close = [0.00] * late      #--Anf-Ration
        multiparousDMI_LateGestInd = [0.00] * late      #--Anf-Ration
        lateHeifAnfRation_IndMPC_MBW = [0.00] * late        #use for multiparous individual    -- Anf-Ration
        multiparousDMI_LateGestInd_MBW = [0.00] * late      #--Anf-Ration
        multiLateGestInd_DMI_close_MBW = [0.00] * late      #--Anf-Ration
        RuminantDigestionlateGestind = [0.00] * late
        digestedStarchmultilateGestind = [0.0] * late
        for l in range(0,len(lateWeeks)):
            w = lateWeeks[l]
            lateHeifAnfRation_IndMPC[l], lateHeifAnfRation_PenMPC[l] = dmiGrowingHeifersLateGestAnf_RationEffects((-w),varInstance.fnfNdf)
            multiLateGestInd_DMI_close[l] = lateHeifAnfRation_IndMPC[l] * metabolicCurrBW * 0.88 / 100
            multiparousDMI_LateGestInd[l] = min(multiLateGestInd_DMI_close[l], lateHeifAnfRation_IndMPC[l])
            lateHeifAnfRation_IndMPC_MBW[l] = lateHeifAnfRation_IndMPC[l]/metabolicCurrBW
            multiparousDMI_LateGestInd_MBW[l] = multiparousDMI_LateGestInd[l]/metabolicCurrBW
            multiLateGestInd_DMI_close_MBW[l] = multiLateGestInd_DMI_close[l]/metabolicCurrBW
            RuminantDigestionlateGestind[l] = rumDigestionNDF_Starch(varInstance.fnfCp,varInstance.fnfNfe,varInstance.fNdf,varInstance.fnfNdf,varInstance.fnfAdf,wet,multiparousDMI_LateGestInd_MBW[l])
            digestedStarchmultilateGestind[l] = digestedStarch(multiparousDMI_LateGestInd_MBW[l])
        if (late > 3):
            lateHeifAnfRation_PenMPC = [0.00] * late        #use for multiparous pen           -- Anf-Ration
            multiLateGestPen_DMI_close = [0.00] * late      #--Anf-Ration
            multiparousDMI_LateGestPen = [0.00] * late      #--Anf-Ration
            lateHeifAnfRation_PenMPC_MBW = [0.00] * late        #use for multiparous pen           -- Anf-Ration
            multiLateGestPen_DMI_close_MBW = [0.00] * late      #--Anf-Ration
            multiparousDMI_LateGestPen_MBW = [0.00] * late      #--Anf-Ration
            RuminantDigestionlateGestpen = [0.00] * late
            digestedStarchmultilateGestpen = [0.0] * late
            for l in range(0,len(lateWeeks)):
                w = lateWeeks[l]
                multiLateGestPen_DMI_close[l] = lateHeifAnfRation_PenMPC[l] * metabolicCurrBW * 0.88 / 100
                multiparousDMI_LateGestPen[l] = min(multiLateGestInd_DMI_close[l], lateHeifAnfRation_PenMPC[l])
                lateHeifAnfRation_PenMPC_MBW[l] = lateHeifAnfRation_PenMPC[l]/metabolicCurrBW
                multiLateGestPen_DMI_close_MBW[l] = multiLateGestPen_DMI_close[l]/metabolicCurrBW
                multiparousDMI_LateGestPen_MBW[l] = multiparousDMI_LateGestPen[l]/metabolicCurrBW
                RuminantDigestionlateGestpen[l] = rumDigestionNDF_Starch(varInstance.fnfCp,varInstance.fnfNfe,varInstance.fNdf,varInstance.fnfNdf,varInstance.fnfAdf,wet,multiparousDMI_LateGestPen_MBW[l])
                digestedStarchmultilateGestpen[l] = digestedStarch(multiparousDMI_LateGestPen_MBW[l])

dry=0
#Non Lactating Dry Multiparous Cows and Growing Heifers
if (dryParity > 0):
    dry=1
    weeks = 2
    lateDryAnfRation_IndMPC, lateDryAnfRation_PenMPC = dmiGrowingHeifersLateGestAnf_RationEffects(weeks,varInstance.fnfNdf) #applies for growing heifers also
    lateDmiDryInd_MBW = lateDryAnfRation_IndMPC/metabolicCurrBW
    lateDmiDryPen_MBW = lateDryAnfRation_PenMPC/metabolicCurrBW
    digestedStarchDryInd = digestedStarch(lateDmiDryInd_MBW)
    digestedStarchDryPen = digestedStarch(lateDmiDryPen_MBW)

print("Lact",lact)
print("GestPrimi",gest[0])
print("GestMulti",gest[1])
print("Dry",dry)


#Free Water Intake 
print("For Calves on calf starter: \n Feed 4 times the Dry Matter Intake. \nFor Example: If the calf is fed 2 Kg of calf starter, feed 8 litres of water\n")

print("For Calves being weaned: \n Feed 2 times the Dry Matter Intake. \n For Example: If the calf is fed 2 Kg of total intake, feed 4 litres of water\n")

print("For fully weaned animals: \n Feed 4 times the Dry Matter Intake. \n For Example; If the calf is fed 2 Kg of Total Mixed Ration, feed 8 litres of water\n")



#if (lact[0] == 1):          #primi

#if (lact[1] == 1):          #multi

if (gest[0][0] == 1):       #primifar
    print("Far Off Heifer: ",len(farOffHeifAnfRation_MBW))

if (gest[0][1] == 1):       #primilate
    print("Late Gestation stage Individual Heifers: ",len(lateHeifAnfRation_Ind_MBW))
    print("Late Gestatation stage Heifers in a Pen: ",len(lateHeifAnfRation_Pen_MBW))

if (gest[1][1] == 1):       #multilate
    print("Late Gestation stage Multiparous Individuals: ",len(multiparousDMI_LateGestInd_MBW))
    print("Late Gestation stage Multiparous Animals in a Pen: ",len(multiparousDMI_LateGestPen_MBW))

if (dry == 1):              #dry multiparous cows and growing heifers
    print("Dry Individual Cows and Growing Heifers : ",lateDmiDryInd_MBW)
    print("Dry Cows and Growing Heifers in a Pen: ",lateDmiDryPen_MBW)



'''farOffHeif_FWI = (1.16 * farOffHeifAnfRation_MBW) + (0.23 * varInstance.fnfDm) + (0.44 * temperature) + (0.061 * (TMPC**2))

dryCow_GrowingHeif_FWI_Ind = (1.16 * lateDmiDryInd_MBW) + (0.23 * varInstance.fnfDm) + (0.44 * temperature) + (0.061 * (TMPC**2))
dryCow_GrowingHeif_FWI_Pen = (1.16 * lateDmiDryPen_MBW) + (0.23 * varInstance.fnfDm) + (0.44 * temperature) + (0.061 * (TMPC**2))

lateHeifAnfRation_FWI_Ind = (1.16 * lateHeifAnfRation_Ind_MBW) + (0.23 * varInstance.fnfDm) + (0.44 * temperature) + (0.061 * (TMPC**2))
lateHeifAnfRation_FWI_Pen = (1.16 * lateHeifAnfRation_Pen_MBW) + (0.23 * varInstance.fnfDm) + (0.44 * temperature) + (0.061 * (TMPC**2))

multiparousLateGest_Ind_FWI = (1.16 * multiparousDMI_LateGestInd_MBW) + (0.23 * varInstance.fnfDm) + (0.44 * temperature) + (0.061 * (TMPC**2))
multiparousLateGest_Pen_FWI = (1.16 * multiparousDMI_LateGestPen_MBW) + (0.23 * varInstance.fnfDm) + (0.44 * temperature) + (0.061 * (TMPC**2))'''


#RUP
#RumdcCPB
rumdcCPB = 100 - rumCPB

intRUP = -0.086
refCPIn = 3.39
dtRUP = 0.00

print("Forage:" ,len(forCpFractions))
print("NonForage:" ,len(nforCpFractions))
count = 0

if (len(forCpFractions) > 0):
    for f in range(0,len(forCpFractions)):
        count = count + 1
        RUPA = (forCpFractions[f][0] - varInstance.fsNPNCPE) * 0.064
        RUPB = forCpFractions[f][1] * (1 - rumdcCPB /100)
        RUP = RUPA + RUPB + forCpFractions[f][2] + (intRUP/refCPIn) * cp[f]
        dtRUP = dtRUP + RUP

if (len(nforCpFractions) > 0):
    for nf in range(0,len(nforCpFractions)):
        count = count + 1
        RUPA = RUPA + (nforCpFractions[nf][0] - varInstance.nfsNPNCPE) * 0.064
        RUPB = RUPB + forCpFractions[nf][1] * (1 - rumdcCPB /100)
        RUP = RUPA + RUPB + forCpFractions[f][2] + (intRUP/refCPIn) * cp[f+nf+1]
        dtRUP = dtRUP + RUP

print("dietary RUP Intake: ",dtRUP)
print("Dietary Cp: ",varInstance.fnfCp)

absRUP_CP = dtRUP / varInstance.fnfCp
dtRDPIntake = varInstance.fnfCp - dtRUP

print("Dietary RDP Intake: ",dtRDPIntake)

#RDP - DMI

#Lactating Heifer
if (lact[0] == 1):          #primi
    RDPlacttarget_primi = dtRDPIntake / dmiLactRationBased_target_primi_MBW
    RDPlactactual_primi = dtRDPIntake / dmiLactRationBased_actual_primi_MBW
    
#Lactating Cows
if (lact[1] == 1):          #multi
    RDPlacttarget_multi = dtRDPIntake / dmiLactRationBased_target_multi_MBW
    RDPlactactual_multi = dtRDPIntake / dmiLactRationBased_actual_multi_MBW

#Gestational Heifers
if (gest[0][0] == 1):       #primifar
    RDPprimifar = [0.0] * len(farOffHeifAnfRation_MBW)
    for i in range(0,len(RDPprimifar)):     RDPprimifar[i] = dtRDPIntake / farOffHeifAnfRation_MBW[i]

if (gest[0][1] == 1):       #primilate
    RDPprimilateInd = [0.0] * len(lateHeifAnfRation_Ind_MBW)
    RDPprimilatePen = [0.0] * len(lateHeifAnfRation_Pen_MBW)
    for i in range(0,len(RDPprimilateInd)):
        RDPprimilateInd[i] = dtRDPIntake/lateHeifAnfRation_Ind_MBW[i]
        RDPprimilatePen[i] = dtRDPIntake/lateHeifAnfRation_Pen_MBW[i]

#Gestational Cows
if (gest[1][1] == 1):        #multilate
    RDPmultilateInd = [0.0] * len(multiparousDMI_LateGestInd_MBW)
    RDPmultilatePen = [0.0] * len(multiparousDMI_LateGestPen_MBW)
    for i in range(0,len(RDPmultilateInd)):
        RDPmultilateInd[i] = dtRDPIntake / multiparousDMI_LateGestInd_MBW[i]
        RDPmultilatePen[i] = dtRDPIntake / multiparousDMI_LateGestPen_MBW[i]

#Non Lactational or Dry Cows
if (dry == 1):
    RDPlateDryInd = dtRDPIntake / lateDmiDryInd_MBW
    RDPlateDryPen = dtRDPIntake / lateDmiDryPen_MBW

