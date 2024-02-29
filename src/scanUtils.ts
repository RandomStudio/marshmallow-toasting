import type { MovingAverage } from "./App";

const WINDOW_SIZE = 10;

export const updateMovingAverage = (uuid: string, rssi: number, movingAverages: MovingAverage): MovingAverage => {
  const currentAverages = movingAverages[uuid] || [];
  const updatedAverages = [...(currentAverages.length >= WINDOW_SIZE ? currentAverages.slice(1) : currentAverages), rssi];

  return {
    ...movingAverages,
    [uuid]: updatedAverages
  };
};

const calculateWeightedAverage = (values: number[]): number => {
  if (values.length === 0) return 0;

  let weightSum = 0;
  let weightedValueSum = 0;
  const weightIncreaseFactor = 1.1; // Determines how much more each subsequent value weighs

  values.forEach((value, index) => {
    const weight = Math.pow(weightIncreaseFactor, index);
    weightedValueSum += value * weight;
    weightSum += weight;
  });

  return weightedValueSum / weightSum;
};

export const calculateOverallAverage = (movingAverages: MovingAverage): number => {
  // Flatten all values into a single array
  const allValues = Object.values(movingAverages).flat();

  // Calculate mean and standard deviation for initial filtering
  const mean = allValues.reduce((sum, val) => sum + val, 0) / allValues.length;
  const stdDev = Math.sqrt(allValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / allValues.length);

  // Filter out extreme values, more than 2 standard deviations from the mean
  const filteredValues = allValues.filter(val => Math.abs(val - mean) <= 2 * stdDev);

  // Apply weighted average, giving more importance to newer values
  const weightedAverage = calculateWeightedAverage(filteredValues);

  // Return the weighted average
  return weightedAverage;
};