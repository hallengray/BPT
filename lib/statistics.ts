/**
 * Advanced Statistical Analysis Utilities
 * 
 * A comprehensive library of statistical functions for health data analysis.
 * Implements rigorous mathematical methods with proper handling of edge cases.
 * 
 * @author EaseMyBP Analytics Team
 * @version 1.0.0
 */

/**
 * Descriptive Statistics Interface
 * Contains comprehensive statistical measures for a dataset
 */
export interface DescriptiveStatistics {
  /** Number of observations */
  n: number
  /** Arithmetic mean */
  mean: number
  /** Sample median (50th percentile) */
  median: number
  /** Sample standard deviation (Bessel's correction applied) */
  standardDeviation: number
  /** Sample variance */
  variance: number
  /** Minimum value */
  min: number
  /** Maximum value */
  max: number
  /** Range (max - min) */
  range: number
  /** First quartile (25th percentile) */
  q1: number
  /** Third quartile (75th percentile) */
  q3: number
  /** Interquartile range (Q3 - Q1) */
  iqr: number
  /** Coefficient of variation (CV = σ/μ × 100) */
  coefficientOfVariation: number
  /** Skewness (Fisher's adjustment) */
  skewness: number
  /** Kurtosis (excess kurtosis, Fisher's definition) */
  kurtosis: number
  /** Standard error of the mean */
  standardError: number
}

/**
 * Confidence Interval Interface
 */
export interface ConfidenceInterval {
  /** Point estimate (usually the mean) */
  estimate: number
  /** Lower bound of the interval */
  lower: number
  /** Upper bound of the interval */
  upper: number
  /** Confidence level (e.g., 0.95 for 95%) */
  confidenceLevel: number
  /** Margin of error */
  marginOfError: number
}

/**
 * Linear Regression Results Interface
 */
export interface LinearRegressionResult {
  /** Slope coefficient (β₁) */
  slope: number
  /** Y-intercept (β₀) */
  intercept: number
  /** Coefficient of determination (R²) */
  rSquared: number
  /** Adjusted R² */
  adjustedRSquared: number
  /** Pearson correlation coefficient (r) */
  correlationCoefficient: number
  /** Standard error of the slope */
  slopeStandardError: number
  /** Standard error of the intercept */
  interceptStandardError: number
  /** Standard error of the estimate (residual standard error) */
  residualStandardError: number
  /** T-statistic for slope significance */
  tStatistic: number
  /** P-value for slope (two-tailed) */
  pValue: number
  /** Degrees of freedom */
  degreesOfFreedom: number
  /** Predicted values */
  predictions: number[]
  /** Residuals */
  residuals: number[]
}

/**
 * Period Comparison Results Interface
 */
export interface PeriodComparisonResult {
  period1: DescriptiveStatistics
  period2: DescriptiveStatistics
  /** Absolute difference in means */
  meanDifference: number
  /** Percent change from period 1 to period 2 */
  percentChange: number
  /** Effect size (Cohen's d) */
  effectSize: number
  /** Effect size interpretation */
  effectSizeInterpretation: 'negligible' | 'small' | 'medium' | 'large'
  /** 95% CI for the difference */
  differenceCI: ConfidenceInterval
  /** T-test results */
  tTest: {
    tStatistic: number
    pValue: number
    degreesOfFreedom: number
    significant: boolean
  }
}

/**
 * Calculate the arithmetic mean of an array
 * @param values - Array of numeric values
 * @returns The arithmetic mean
 */
export function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, val) => sum + val, 0) / values.length
}

/**
 * Calculate the median (50th percentile) of an array
 * Uses linear interpolation for even-length arrays
 * @param values - Array of numeric values
 * @returns The median value
 */
export function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2
  }
  return sorted[mid]
}

/**
 * Calculate the sample variance with Bessel's correction
 * @param values - Array of numeric values
 * @returns The sample variance
 */
export function variance(values: number[]): number {
  if (values.length < 2) return 0
  const avg = mean(values)
  const squaredDiffs = values.map(val => Math.pow(val - avg, 2))
  return squaredDiffs.reduce((sum, val) => sum + val, 0) / (values.length - 1)
}

/**
 * Calculate the sample standard deviation
 * @param values - Array of numeric values
 * @returns The sample standard deviation
 */
export function standardDeviation(values: number[]): number {
  return Math.sqrt(variance(values))
}

/**
 * Calculate a specific percentile using linear interpolation
 * @param values - Array of numeric values
 * @param percentile - Percentile to calculate (0-100)
 * @returns The percentile value
 */
export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0
  if (values.length === 1) return values[0]
  
  const sorted = [...values].sort((a, b) => a - b)
  const index = (p / 100) * (sorted.length - 1)
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  
  if (lower === upper) return sorted[lower]
  
  const fraction = index - lower
  return sorted[lower] * (1 - fraction) + sorted[upper] * fraction
}

/**
 * Calculate skewness using Fisher's adjustment
 * Measures asymmetry of the distribution
 * @param values - Array of numeric values
 * @returns Skewness coefficient
 */
export function skewness(values: number[]): number {
  const n = values.length
  if (n < 3) return 0
  
  const avg = mean(values)
  const std = standardDeviation(values)
  if (std === 0) return 0
  
  const m3 = values.reduce((sum, val) => sum + Math.pow((val - avg) / std, 3), 0) / n
  
  // Fisher's adjustment for sample skewness
  const adjustment = Math.sqrt(n * (n - 1)) / (n - 2)
  return adjustment * m3
}

/**
 * Calculate excess kurtosis (Fisher's definition)
 * Measures tailedness of the distribution
 * @param values - Array of numeric values
 * @returns Excess kurtosis
 */
export function kurtosis(values: number[]): number {
  const n = values.length
  if (n < 4) return 0
  
  const avg = mean(values)
  const std = standardDeviation(values)
  if (std === 0) return 0
  
  const m4 = values.reduce((sum, val) => sum + Math.pow((val - avg) / std, 4), 0) / n
  
  // Fisher's adjustment for sample kurtosis
  const adjustment = ((n - 1) / ((n - 2) * (n - 3))) * ((n + 1) * m4 - 3 * (n - 1))
  return adjustment
}

/**
 * Calculate comprehensive descriptive statistics
 * @param values - Array of numeric values
 * @returns Comprehensive descriptive statistics object
 */
export function calculateDescriptiveStatistics(values: number[]): DescriptiveStatistics {
  if (values.length === 0) {
    return {
      n: 0,
      mean: 0,
      median: 0,
      standardDeviation: 0,
      variance: 0,
      min: 0,
      max: 0,
      range: 0,
      q1: 0,
      q3: 0,
      iqr: 0,
      coefficientOfVariation: 0,
      skewness: 0,
      kurtosis: 0,
      standardError: 0,
    }
  }
  
  const sorted = [...values].sort((a, b) => a - b)
  const n = values.length
  const avg = mean(values)
  const std = standardDeviation(values)
  const q1Val = percentile(values, 25)
  const q3Val = percentile(values, 75)
  
  return {
    n,
    mean: avg,
    median: median(values),
    standardDeviation: std,
    variance: variance(values),
    min: sorted[0],
    max: sorted[n - 1],
    range: sorted[n - 1] - sorted[0],
    q1: q1Val,
    q3: q3Val,
    iqr: q3Val - q1Val,
    coefficientOfVariation: avg !== 0 ? (std / Math.abs(avg)) * 100 : 0,
    skewness: skewness(values),
    kurtosis: kurtosis(values),
    standardError: n > 0 ? std / Math.sqrt(n) : 0,
  }
}

/**
 * Calculate Pearson correlation coefficient
 * @param x - First array of values
 * @param y - Second array of values
 * @returns Pearson correlation coefficient (-1 to 1)
 */
export function pearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length < 2) return 0
  
  const n = x.length
  const meanX = mean(x)
  const meanY = mean(y)
  
  let numerator = 0
  let denomX = 0
  let denomY = 0
  
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX
    const dy = y[i] - meanY
    numerator += dx * dy
    denomX += dx * dx
    denomY += dy * dy
  }
  
  const denominator = Math.sqrt(denomX * denomY)
  if (denominator === 0) return 0
  
  return numerator / denominator
}

/**
 * Perform simple linear regression using Ordinary Least Squares (OLS)
 * @param x - Independent variable values
 * @param y - Dependent variable values
 * @returns Comprehensive linear regression results
 */
export function linearRegression(x: number[], y: number[]): LinearRegressionResult {
  const n = x.length
  
  if (n < 2 || x.length !== y.length) {
    return {
      slope: 0,
      intercept: 0,
      rSquared: 0,
      adjustedRSquared: 0,
      correlationCoefficient: 0,
      slopeStandardError: 0,
      interceptStandardError: 0,
      residualStandardError: 0,
      tStatistic: 0,
      pValue: 1,
      degreesOfFreedom: 0,
      predictions: [],
      residuals: [],
    }
  }
  
  const meanX = mean(x)
  const meanY = mean(y)
  
  // Calculate slope and intercept
  let numerator = 0
  let denominator = 0
  
  for (let i = 0; i < n; i++) {
    numerator += (x[i] - meanX) * (y[i] - meanY)
    denominator += Math.pow(x[i] - meanX, 2)
  }
  
  const slope = denominator !== 0 ? numerator / denominator : 0
  const intercept = meanY - slope * meanX
  
  // Calculate predictions and residuals
  const predictions = x.map(xi => slope * xi + intercept)
  const residuals = y.map((yi, i) => yi - predictions[i])
  
  // Calculate R² and adjusted R²
  const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0)
  const ssResidual = residuals.reduce((sum, r) => sum + r * r, 0)
  const rSquared = ssTotal !== 0 ? 1 - ssResidual / ssTotal : 0
  const adjustedRSquared = n > 2 ? 1 - ((1 - rSquared) * (n - 1)) / (n - 2) : rSquared
  
  // Calculate correlation coefficient
  const r = pearsonCorrelation(x, y)
  
  // Calculate standard errors
  const df = n - 2
  const mse = df > 0 ? ssResidual / df : 0
  const residualStandardError = Math.sqrt(mse)
  
  const sxx = denominator
  const slopeStandardError = sxx > 0 ? residualStandardError / Math.sqrt(sxx) : 0
  const interceptStandardError = sxx > 0 
    ? residualStandardError * Math.sqrt(x.reduce((sum, xi) => sum + xi * xi, 0) / (n * sxx))
    : 0
  
  // Calculate t-statistic and p-value for slope
  const tStatistic = slopeStandardError !== 0 ? slope / slopeStandardError : 0
  const pValue = df > 0 ? twoTailedPValue(tStatistic, df) : 1
  
  return {
    slope,
    intercept,
    rSquared,
    adjustedRSquared,
    correlationCoefficient: r,
    slopeStandardError,
    interceptStandardError,
    residualStandardError,
    tStatistic,
    pValue,
    degreesOfFreedom: df,
    predictions,
    residuals,
  }
}

/**
 * Calculate confidence interval for a mean
 * Uses t-distribution for small samples
 * @param values - Array of numeric values
 * @param confidenceLevel - Confidence level (default 0.95)
 * @returns Confidence interval object
 */
export function confidenceInterval(
  values: number[],
  confidenceLevel: number = 0.95
): ConfidenceInterval {
  const n = values.length
  if (n < 2) {
    const m = n === 1 ? values[0] : 0
    return {
      estimate: m,
      lower: m,
      upper: m,
      confidenceLevel,
      marginOfError: 0,
    }
  }
  
  const avg = mean(values)
  const se = standardDeviation(values) / Math.sqrt(n)
  const df = n - 1
  
  // Get t-critical value
  const alpha = 1 - confidenceLevel
  const tCritical = tCriticalValue(alpha / 2, df)
  
  const marginOfError = tCritical * se
  
  return {
    estimate: avg,
    lower: avg - marginOfError,
    upper: avg + marginOfError,
    confidenceLevel,
    marginOfError,
  }
}

/**
 * Perform Welch's t-test for comparing two independent samples
 * Does not assume equal variances
 * @param sample1 - First sample
 * @param sample2 - Second sample
 * @returns T-test results
 */
export function welchTTest(
  sample1: number[],
  sample2: number[]
): { tStatistic: number; pValue: number; degreesOfFreedom: number; significant: boolean } {
  const n1 = sample1.length
  const n2 = sample2.length
  
  if (n1 < 2 || n2 < 2) {
    return { tStatistic: 0, pValue: 1, degreesOfFreedom: 0, significant: false }
  }
  
  const mean1 = mean(sample1)
  const mean2 = mean(sample2)
  const var1 = variance(sample1)
  const var2 = variance(sample2)
  
  // Welch's t-statistic
  const se = Math.sqrt(var1 / n1 + var2 / n2)
  if (se === 0) {
    return { tStatistic: 0, pValue: 1, degreesOfFreedom: n1 + n2 - 2, significant: false }
  }
  
  const tStatistic = (mean1 - mean2) / se
  
  // Welch-Satterthwaite degrees of freedom
  const v1 = var1 / n1
  const v2 = var2 / n2
  const df = Math.pow(v1 + v2, 2) / (Math.pow(v1, 2) / (n1 - 1) + Math.pow(v2, 2) / (n2 - 1))
  
  const pValue = twoTailedPValue(tStatistic, df)
  
  return {
    tStatistic,
    pValue,
    degreesOfFreedom: df,
    significant: pValue < 0.05,
  }
}

/**
 * Calculate Cohen's d effect size
 * @param sample1 - First sample
 * @param sample2 - Second sample
 * @returns Cohen's d value
 */
export function cohensD(sample1: number[], sample2: number[]): number {
  const n1 = sample1.length
  const n2 = sample2.length
  
  if (n1 < 2 || n2 < 2) return 0
  
  const mean1 = mean(sample1)
  const mean2 = mean(sample2)
  const var1 = variance(sample1)
  const var2 = variance(sample2)
  
  // Pooled standard deviation
  const pooledVar = ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2)
  const pooledSD = Math.sqrt(pooledVar)
  
  if (pooledSD === 0) return 0
  
  return (mean1 - mean2) / pooledSD
}

/**
 * Interpret Cohen's d effect size
 * @param d - Cohen's d value
 * @returns Effect size interpretation
 */
export function interpretEffectSize(d: number): 'negligible' | 'small' | 'medium' | 'large' {
  const absD = Math.abs(d)
  if (absD < 0.2) return 'negligible'
  if (absD < 0.5) return 'small'
  if (absD < 0.8) return 'medium'
  return 'large'
}

/**
 * Compare two time periods statistically
 * @param period1Values - Values from the first period
 * @param period2Values - Values from the second period
 * @returns Comprehensive comparison results
 */
export function comparePeriods(
  period1Values: number[],
  period2Values: number[]
): PeriodComparisonResult {
  const stats1 = calculateDescriptiveStatistics(period1Values)
  const stats2 = calculateDescriptiveStatistics(period2Values)
  
  const meanDiff = stats2.mean - stats1.mean
  const percentChange = stats1.mean !== 0 ? ((stats2.mean - stats1.mean) / Math.abs(stats1.mean)) * 100 : 0
  
  const d = cohensD(period2Values, period1Values)
  const tTest = welchTTest(period2Values, period1Values)
  
  // Calculate CI for the difference
  const seDiff = Math.sqrt(
    Math.pow(stats1.standardError, 2) + Math.pow(stats2.standardError, 2)
  )
  const dfDiff = Math.min(stats1.n - 1, stats2.n - 1)
  const tCrit = tCriticalValue(0.025, Math.max(dfDiff, 1))
  const moe = tCrit * seDiff
  
  return {
    period1: stats1,
    period2: stats2,
    meanDifference: meanDiff,
    percentChange,
    effectSize: d,
    effectSizeInterpretation: interpretEffectSize(d),
    differenceCI: {
      estimate: meanDiff,
      lower: meanDiff - moe,
      upper: meanDiff + moe,
      confidenceLevel: 0.95,
      marginOfError: moe,
    },
    tTest,
  }
}

/**
 * Calculate moving average
 * @param values - Array of values
 * @param window - Window size
 * @returns Array of moving averages
 */
export function movingAverage(values: number[], window: number): number[] {
  if (values.length < window || window < 1) return values
  
  const result: number[] = []
  
  for (let i = window - 1; i < values.length; i++) {
    const windowValues = values.slice(i - window + 1, i + 1)
    result.push(mean(windowValues))
  }
  
  return result
}

/**
 * Calculate exponential moving average
 * @param values - Array of values
 * @param alpha - Smoothing factor (0 < alpha <= 1)
 * @returns Array of EMAs
 */
export function exponentialMovingAverage(values: number[], alpha: number = 0.3): number[] {
  if (values.length === 0) return []
  
  const result: number[] = [values[0]]
  
  for (let i = 1; i < values.length; i++) {
    result.push(alpha * values[i] + (1 - alpha) * result[i - 1])
  }
  
  return result
}

/**
 * Detect outliers using the IQR method
 * @param values - Array of values
 * @param k - IQR multiplier (default 1.5)
 * @returns Object with outlier information
 */
export function detectOutliers(
  values: number[],
  k: number = 1.5
): { outliers: number[]; outlierIndices: number[]; lowerBound: number; upperBound: number } {
  if (values.length < 4) {
    return { outliers: [], outlierIndices: [], lowerBound: -Infinity, upperBound: Infinity }
  }
  
  const q1 = percentile(values, 25)
  const q3 = percentile(values, 75)
  const iqr = q3 - q1
  
  const lowerBound = q1 - k * iqr
  const upperBound = q3 + k * iqr
  
  const outliers: number[] = []
  const outlierIndices: number[] = []
  
  values.forEach((val, index) => {
    if (val < lowerBound || val > upperBound) {
      outliers.push(val)
      outlierIndices.push(index)
    }
  })
  
  return { outliers, outlierIndices, lowerBound, upperBound }
}

/**
 * Calculate z-score for a value
 * @param value - The value to calculate z-score for
 * @param mean - Population/sample mean
 * @param std - Population/sample standard deviation
 * @returns Z-score
 */
export function zScore(value: number, avg: number, std: number): number {
  if (std === 0) return 0
  return (value - avg) / std
}

// ============================================
// Helper Functions for Statistical Distributions
// ============================================

/**
 * Approximate t-critical value using Cornish-Fisher expansion
 * This is a reasonable approximation for df > 3
 */
function tCriticalValue(alpha: number, df: number): number {
  // Use normal approximation for large df
  if (df > 100) {
    return normalCriticalValue(alpha)
  }
  
  // Approximation using Cornish-Fisher expansion
  const z = normalCriticalValue(alpha)
  const g1 = (z * z * z + z) / 4
  const g2 = (5 * Math.pow(z, 5) + 16 * Math.pow(z, 3) + 3 * z) / 96
  const g3 = (3 * Math.pow(z, 7) + 19 * Math.pow(z, 5) + 17 * Math.pow(z, 3) - 15 * z) / 384
  
  return z + g1 / df + g2 / (df * df) + g3 / Math.pow(df, 3)
}

/**
 * Approximate normal critical value using Beasley-Springer-Moro algorithm
 */
function normalCriticalValue(alpha: number): number {
  // Rational approximation for the inverse normal CDF
  const a = [
    -3.969683028665376e1,
    2.209460984245205e2,
    -2.759285104469687e2,
    1.383577518672690e2,
    -3.066479806614716e1,
    2.506628277459239e0,
  ]
  const b = [
    -5.447609879822406e1,
    1.615858368580409e2,
    -1.556989798598866e2,
    6.680131188771972e1,
    -1.328068155288572e1,
  ]
  const c = [
    -7.784894002430293e-3,
    -3.223964580411365e-1,
    -2.400758277161838e0,
    -2.549732539343734e0,
    4.374664141464968e0,
    2.938163982698783e0,
  ]
  const d = [
    7.784695709041462e-3,
    3.224671290700398e-1,
    2.445134137142996e0,
    3.754408661907416e0,
  ]
  
  const pLow = 0.02425
  const pHigh = 1 - pLow
  const p = alpha
  
  let q: number, r: number
  
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p))
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    )
  } else if (p <= pHigh) {
    q = p - 0.5
    r = q * q
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    )
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p))
    return -(
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    )
  }
}

/**
 * Approximate two-tailed p-value for t-distribution
 * Uses Student's t-distribution approximation
 */
function twoTailedPValue(t: number, df: number): number {
  // Approximation using regularized incomplete beta function
  const x = df / (df + t * t)
  const a = df / 2
  const b = 0.5
  
  // Beta function approximation
  const beta = incompleteBeta(x, a, b)
  
  return beta
}

/**
 * Regularized incomplete beta function approximation
 * Uses continued fraction expansion
 */
function incompleteBeta(x: number, a: number, b: number): number {
  if (x === 0) return 0
  if (x === 1) return 1
  
  // Use symmetry relation if needed
  if (x > (a + 1) / (a + b + 2)) {
    return 1 - incompleteBeta(1 - x, b, a)
  }
  
  // Continued fraction expansion (Lentz's algorithm)
  const lnBeta = logGamma(a) + logGamma(b) - logGamma(a + b)
  const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lnBeta) / a
  
  let f = 1
  let c = 1
  let d = 0
  
  for (let m = 0; m <= 100; m++) {
    const m2 = 2 * m
    
    // Even step
    let numerator = m === 0 ? 1 : (m * (b - m) * x) / ((a + m2 - 1) * (a + m2))
    d = 1 + numerator * d
    if (Math.abs(d) < 1e-30) d = 1e-30
    c = 1 + numerator / c
    if (Math.abs(c) < 1e-30) c = 1e-30
    d = 1 / d
    f *= d * c
    
    // Odd step
    numerator = -((a + m) * (a + b + m) * x) / ((a + m2) * (a + m2 + 1))
    d = 1 + numerator * d
    if (Math.abs(d) < 1e-30) d = 1e-30
    c = 1 + numerator / c
    if (Math.abs(c) < 1e-30) c = 1e-30
    d = 1 / d
    const delta = d * c
    f *= delta
    
    if (Math.abs(delta - 1) < 1e-10) break
  }
  
  return front * (f - 1)
}

/**
 * Log gamma function approximation (Stirling's approximation)
 */
function logGamma(x: number): number {
  if (x <= 0) return 0
  
  const c = [
    76.18009172947146,
    -86.50532032941677,
    24.01409824083091,
    -1.231739572450155,
    0.1208650973866179e-2,
    -0.5395239384953e-5,
  ]
  
  let y = x
  let tmp = x + 5.5
  tmp -= (x + 0.5) * Math.log(tmp)
  let ser = 1.000000000190015
  
  for (let j = 0; j < 6; j++) {
    ser += c[j] / ++y
  }
  
  return -tmp + Math.log(2.5066282746310005 * ser / x)
}


