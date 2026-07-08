import type { AnalysisObservation } from "./build-dataset";

type Matrix = number[][];

function transpose(matrix: Matrix): Matrix {
  return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
}

function multiply(a: Matrix, b: Matrix): Matrix {
  return a.map((row) =>
    b[0].map((_, colIndex) => row.reduce((sum, value, i) => sum + value * b[i][colIndex], 0))
  );
}

/** Gauss-Jordan matrix inversion. Matrices here are small (a handful of columns), so no need for a numerics library. */
function invert(matrix: Matrix): Matrix | null {
  const n = matrix.length;
  const augmented = matrix.map((row, i) => [
    ...row,
    ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  ]);

  for (let col = 0; col < n; col++) {
    let pivotRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(augmented[row][col]) > Math.abs(augmented[pivotRow][col])) {
        pivotRow = row;
      }
    }
    if (Math.abs(augmented[pivotRow][col]) < 1e-10) return null; // singular — can't invert

    [augmented[col], augmented[pivotRow]] = [augmented[pivotRow], augmented[col]];

    const pivot = augmented[col][col];
    for (let j = 0; j < 2 * n; j++) augmented[col][j] /= pivot;

    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = augmented[row][col];
      for (let j = 0; j < 2 * n; j++) augmented[row][j] -= factor * augmented[col][j];
    }
  }

  return augmented.map((row) => row.slice(n));
}

function solveOls(X: Matrix, y: Matrix): number[] | null {
  const Xt = transpose(X);
  const XtX = multiply(Xt, X);
  const XtXInverse = invert(XtX);
  if (!XtXInverse) return null;
  const XtY = multiply(Xt, y);
  const beta = multiply(XtXInverse, XtY);
  return beta.map((row) => row[0]);
}

export const REGRESSION_COEFFICIENT_NAMES = [
  "intercept",
  "assignment",
  "dayStrain",
  "weekday_1",
  "weekday_2",
  "weekday_3",
  "weekday_4",
  "weekday_5",
  "weekday_6",
] as const;

export interface AdjustedRegressionResult {
  coefficients: Record<(typeof REGRESSION_COEFFICIENT_NAMES)[number], number>;
  adjustedEffect: number;
  rowsUsed: number;
}

/**
 * Recovery = intercept + assignment*T + dayStrain*S + weekday dummies + error.
 *
 * Deliberately does NOT include sleep duration as a covariate: the habits
 * this product tests (e.g. no late caffeine) plausibly work BY changing
 * sleep, so controlling for sleep would net out part of the effect being
 * measured. Sleep duration is reported as its own secondary outcome instead.
 */
export function fitAdjustedModel(observations: AnalysisObservation[]): AdjustedRegressionResult | null {
  const rows = observations.filter((o) => o.dayStrain !== null);
  const columnCount = REGRESSION_COEFFICIENT_NAMES.length;

  if (rows.length < columnCount + 2) return null;

  const X: Matrix = rows.map((o) => {
    const weekdayDummies = [1, 2, 3, 4, 5, 6].map((day) => (o.weekday === day ? 1 : 0));
    return [1, o.assignedCondition === "INTERVENTION" ? 1 : 0, o.dayStrain as number, ...weekdayDummies];
  });
  const y: Matrix = rows.map((o) => [o.recoveryScore]);

  const beta = solveOls(X, y);
  if (!beta) return null;

  const coefficients = Object.fromEntries(
    REGRESSION_COEFFICIENT_NAMES.map((name, i) => [name, beta[i]])
  ) as AdjustedRegressionResult["coefficients"];

  return { coefficients, adjustedEffect: coefficients.assignment, rowsUsed: rows.length };
}
