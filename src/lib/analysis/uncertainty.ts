const Z_95 = 1.96;

function sampleVariance(values: number[], sampleMean: number): number {
  if (values.length < 2) return 0;
  const sumSquares = values.reduce((sum, v) => sum + (v - sampleMean) ** 2, 0);
  return sumSquares / (values.length - 1);
}

export interface ConfidenceInterval {
  low: number;
  high: number;
}

/**
 * Approximate 95% confidence interval for a difference of two means, using
 * the standard two-sample standard error and a normal (z) approximation.
 * "Approximate" is the operative word here — with the small sample sizes an
 * N-of-1 experiment produces, a t-distribution would be more exact, but a
 * wider, honestly-labeled approximation serves the product goal better than
 * false precision.
 */
export function differenceConfidenceInterval(
  interventionValues: number[],
  controlValues: number[]
): ConfidenceInterval {
  const interventionMean = interventionValues.reduce((s, v) => s + v, 0) / interventionValues.length;
  const controlMean = controlValues.reduce((s, v) => s + v, 0) / controlValues.length;
  const effect = interventionMean - controlMean;

  const varianceIntervention = sampleVariance(interventionValues, interventionMean);
  const varianceControl = sampleVariance(controlValues, controlMean);

  const standardError = Math.sqrt(
    varianceIntervention / interventionValues.length + varianceControl / controlValues.length
  );

  const margin = Z_95 * standardError;

  return { low: effect - margin, high: effect + margin };
}
