// app/lib/weightUnits.ts

export type WeightUnit = "kg" | "lbs";

const KG_TO_LBS = 2.2046226218;
const DEFAULT_DECIMALS = 1;

function roundTo(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function trimTrailingZeros(value: number, decimals: number) {
  return roundTo(value, decimals)
    .toFixed(decimals)
    .replace(/\.0+$/, "")
    .replace(/(\.\d*[1-9])0+$/, "$1");
}

export function kgToLbs(kg: number): number {
  if (!Number.isFinite(kg)) return 0;
  return kg * KG_TO_LBS;
}

export function lbsToKg(lbs: number): number {
  if (!Number.isFinite(lbs)) return 0;
  return lbs / KG_TO_LBS;
}

export function normalizeWeightUnit(value: unknown): WeightUnit {
  return value === "lbs" ? "lbs" : "kg";
}

export function isWeightUnit(value: unknown): value is WeightUnit {
  return value === "kg" || value === "lbs";
}

export function getWeightUnitLabel(unit: WeightUnit): string {
  return unit;
}

export function formatWeightForDisplay(params: {
  kgValue?: number | null;
  unit: WeightUnit;
  decimals?: number;
}): string {
  const { kgValue, unit, decimals = DEFAULT_DECIMALS } = params;

  if (kgValue == null || !Number.isFinite(kgValue) || kgValue <= 0) return "";

  const displayValue = unit === "lbs" ? kgToLbs(kgValue) : kgValue;
  return trimTrailingZeros(displayValue, decimals);
}

export function formatWeightWithUnit(params: {
  kgValue?: number | null;
  unit: WeightUnit;
  decimals?: number;
}): string {
  const value = formatWeightForDisplay(params);
  if (!value) return "—";
  return `${value} ${params.unit}`;
}

export function parseWeightInputToCanonicalKg(params: {
  input: string;
  inputUnit: WeightUnit;
}): number | null {
  const { input, inputUnit } = params;

  if (!input?.trim()) return null;

  const normalized = input.replace(",", ".").trim();
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed <= 0) return null;

  return inputUnit === "lbs" ? lbsToKg(parsed) : parsed;
}

export function formatStoredWeightStringForDisplay(params: {
  storedWeight: string;
  unit: WeightUnit;
  decimals?: number;
}): string {
  const { storedWeight, unit, decimals = DEFAULT_DECIMALS } = params;

  if (!storedWeight?.trim()) return "";

  const normalized = storedWeight.replace(",", ".").trim();
  const kgValue = Number(normalized);

  if (!Number.isFinite(kgValue) || kgValue <= 0) return "";

  return formatWeightForDisplay({
    kgValue,
    unit,
    decimals,
  });
}

export function formatStoredWeightStringWithUnit(params: {
  storedWeight: string;
  unit: WeightUnit;
  decimals?: number;
}): string {
  const value = formatStoredWeightStringForDisplay(params);
  if (!value) return "—";
  return `${value} ${params.unit}`;
}

export function convertInputWeightStringToStoredKgString(params: {
  inputWeight: string;
  inputUnit: WeightUnit;
  decimals?: number;
}): string {
  const { inputWeight, inputUnit, decimals = 3 } = params;

  const kgValue = parseWeightInputToCanonicalKg({
    input: inputWeight,
    inputUnit,
  });

  if (kgValue == null) return "";

  return trimTrailingZeros(kgValue, decimals);
}

export function convertStoredKgStringToAlternateUnitString(params: {
  storedWeight: string;
  unit: WeightUnit;
  decimals?: number;
}): string {
  return formatStoredWeightStringForDisplay(params);
}

export function maybeConvertWeightValue(params: {
  value: number | null | undefined;
  fromUnit: WeightUnit;
  toUnit: WeightUnit;
  decimals?: number;
}): number | null {
  const { value, fromUnit, toUnit, decimals = DEFAULT_DECIMALS } = params;

  if (value == null || !Number.isFinite(value) || value <= 0) return null;
  if (fromUnit === toUnit) return roundTo(value, decimals);

  const converted = fromUnit === "kg" ? kgToLbs(value) : lbsToKg(value);
  return roundTo(converted, decimals);
}