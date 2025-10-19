export interface Stage {
  name: string;
  conversion: number | null;
}

export interface ForwardResult {
  stageName: string;
  stageVolume: number;
  conversionToNext: string;
}

export interface ReverseResult {
  stageName: string;
  requiredVolume: number;
  cumulativeConversion: string;
}

export interface ForwardCalculationResult {
  results: ForwardResult[];
  customersDisplay: number;
  revenueEstimate: number;
  volumes: number[];
}

export interface ReverseCalculationResult {
  results: ReverseResult[];
  customersNeeded: number;
  requiredTop: number;
}

export const parseConversion = (value: number | null): number | null => {
  if (value === null || value === undefined) return null;
  return value > 1 ? value / 100 : value;
};

export const forwardCalc = (
  stages: Stage[],
  startingVolume: number,
  averageDealSize: number
): ForwardCalculationResult => {
  const results: ForwardResult[] = [];
  const volumes: number[] = [startingVolume];

  for (let i = 1; i < stages.length; i++) {
    const conv = parseConversion(stages[i].conversion);
    const nextVolume = conv ? volumes[i - 1] * conv : 0;
    volumes.push(nextVolume);
  }

  stages.forEach((stage, i) => {
    let convDisplay = "–";
    if (i < stages.length - 1) {
      const nextConv = parseConversion(stages[i + 1].conversion);
      convDisplay = nextConv !== null ? `${(nextConv * 100).toFixed(1)}%` : "–";
    }

    results.push({
      stageName: stage.name,
      stageVolume: Math.round(volumes[i]),
      conversionToNext: convDisplay,
    });
  });

  const customersFloat = volumes[volumes.length - 1];
  const customersDisplay = Math.round(customersFloat);
  const revenueEstimate = customersFloat * averageDealSize;

  return { results, customersDisplay, revenueEstimate, volumes };
};

export const reverseCalc = (
  stages: Stage[],
  targetRevenue: number,
  averageDealSize: number
): ReverseCalculationResult => {
  const results: ReverseResult[] = [];
  const customersNeeded = targetRevenue / averageDealSize;
  const required: number[] = new Array(stages.length);
  required[stages.length - 1] = customersNeeded;

  for (let i = stages.length - 1; i > 0; i--) {
    const conv = parseConversion(stages[i].conversion);
    required[i - 1] = conv ? required[i] / conv : 0;
  }

  stages.forEach((stage, i) => {
    const reqDisplay = Math.round(required[i]);
    let cumPct = 100;
    if (i > 0) {
      const prev = required[i - 1] || 1;
      cumPct = (required[i] / prev) * 100;
    }

    results.push({
      stageName: stage.name,
      requiredVolume: reqDisplay,
      cumulativeConversion: `${cumPct.toFixed(1)}%`,
    });
  });

  return { results, customersNeeded, requiredTop: Math.round(required[0]) };
};