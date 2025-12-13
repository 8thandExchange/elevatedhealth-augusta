// Holgate Logic - Clinical Decision Rules for Lab Interpretation
// Based on Dr. Holgate's methodology for hormone and neurotransmitter analysis

export interface LabValues {
  // Hormones (Saliva Profile III)
  estradiol_e2?: number | null;
  progesterone_pg?: number | null;
  testosterone_t?: number | null;
  dhea_s?: number | null;
  cortisol_morning?: number | null;
  cortisol_noon?: number | null;
  cortisol_evening?: number | null;
  cortisol_night?: number | null;
  // Neurotransmitters
  serotonin?: number | null;
  gaba?: number | null;
  dopamine?: number | null;
  glutamate?: number | null;
  norepinephrine?: number | null;
  epinephrine?: number | null;
}

export interface Finding {
  pattern: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'hormone' | 'neurotransmitter' | 'adrenal';
}

export interface Protocol {
  name: string;
  dosage: string;
  timing: string;
  priority: number;
  rationale: string;
}

export interface ClinicalImpression {
  story: string;
  findings: Finding[];
  protocols: Protocol[];
}

// Reference ranges for interpretation
const REFERENCE_RANGES = {
  // Male hormone ranges (saliva)
  testosterone_male_low: 50,
  testosterone_male_optimal: 100,
  estradiol_male_high: 3.0,
  
  // Female hormone ranges (saliva)
  testosterone_female_low: 20,
  estradiol_female_low: 1.0,
  progesterone_female_low: 75,
  
  // Cortisol curve ranges (saliva, ng/dL)
  cortisol_morning_low: 8,
  cortisol_morning_optimal: 15,
  cortisol_noon_low: 5,
  cortisol_evening_low: 3,
  cortisol_night_low: 2,
  
  // DHEA-S ranges
  dhea_s_low: 150,
  
  // Neurotransmitter ranges (urine, mcg/g creatinine)
  serotonin_low: 100,
  gaba_low: 500,
  dopamine_low: 150,
  glutamate_high: 60,
  norepinephrine_low: 30,
  epinephrine_low: 5,
};

function analyzeHormones(values: LabValues, gender: string): Finding[] {
  const findings: Finding[] = [];
  
  // Burnout Pattern: Low T + Low Cortisol
  if (
    values.testosterone_t && values.testosterone_t < 50 &&
    values.cortisol_morning && values.cortisol_morning < REFERENCE_RANGES.cortisol_morning_low
  ) {
    findings.push({
      pattern: 'Burnout Pattern',
      description: 'HPA Axis dysfunction is suppressing sex hormones. Prioritize Adrenal Support (AdreneVive) before TRT.',
      priority: 'high',
      category: 'hormone',
    });
  }
  
  // Estrogen Dominance (Male)
  if (
    gender === 'male' &&
    values.estradiol_e2 && values.estradiol_e2 > REFERENCE_RANGES.estradiol_male_high
  ) {
    findings.push({
      pattern: 'Estrogen Dominance',
      description: 'Risk of mood swings/water retention. Protocol: Zinc + DIM.',
      priority: 'high',
      category: 'hormone',
    });
  }
  
  // Low Testosterone (Gender-specific)
  const tLow = gender === 'male' 
    ? REFERENCE_RANGES.testosterone_male_low 
    : REFERENCE_RANGES.testosterone_female_low;
  
  if (values.testosterone_t && values.testosterone_t < tLow) {
    findings.push({
      pattern: 'Low Testosterone',
      description: gender === 'male' 
        ? 'Testosterone deficiency detected. Evaluate for TRT after ruling out adrenal dysfunction.'
        : 'Low testosterone may contribute to fatigue, low libido, and muscle weakness.',
      priority: 'medium',
      category: 'hormone',
    });
  }
  
  // Low Progesterone (Female)
  if (
    gender === 'female' &&
    values.progesterone_pg && values.progesterone_pg < REFERENCE_RANGES.progesterone_female_low
  ) {
    findings.push({
      pattern: 'Progesterone Deficiency',
      description: 'Low progesterone correlates with sleep issues, anxiety, and PMS symptoms. Consider bioidentical progesterone.',
      priority: 'medium',
      category: 'hormone',
    });
  }
  
  // Low DHEA-S
  if (values.dhea_s && values.dhea_s < REFERENCE_RANGES.dhea_s_low) {
    findings.push({
      pattern: 'DHEA Depletion',
      description: 'Low DHEA-S indicates adrenal reserve depletion. Consider DHEA supplementation after adrenal support.',
      priority: 'medium',
      category: 'hormone',
    });
  }
  
  return findings;
}

function analyzeAdrenals(values: LabValues): Finding[] {
  const findings: Finding[] = [];
  
  // Adrenal Exhaustion (Flat Curve)
  const hasFullCurve = values.cortisol_morning != null && 
    values.cortisol_noon != null && 
    values.cortisol_evening != null && 
    values.cortisol_night != null;
  
  if (hasFullCurve) {
    const morning = values.cortisol_morning!;
    const noon = values.cortisol_noon!;
    const evening = values.cortisol_evening!;
    const night = values.cortisol_night!;
    
    // Flat/Low Curve
    if (
      morning < REFERENCE_RANGES.cortisol_morning_low &&
      noon < REFERENCE_RANGES.cortisol_noon_low &&
      evening < REFERENCE_RANGES.cortisol_evening_low &&
      night < REFERENCE_RANGES.cortisol_night_low
    ) {
      findings.push({
        pattern: 'Adrenal Exhaustion',
        description: 'Flat cortisol curve indicates severe HPA axis dysfunction. Patient needs aggressive rest/recovery protocol.',
        priority: 'high',
        category: 'adrenal',
      });
    }
    
    // Inverted Curve (high at night, low in morning)
    if (night > morning) {
      findings.push({
        pattern: 'Inverted Cortisol Curve',
        description: 'Cortisol higher at night than morning. Indicates circadian disruption. Affects sleep and recovery.',
        priority: 'high',
        category: 'adrenal',
      });
    }
    
    // Morning Blunting
    if (morning < REFERENCE_RANGES.cortisol_morning_low) {
      findings.push({
        pattern: 'Morning Cortisol Blunting',
        description: 'Low morning cortisol correlates with fatigue, brain fog, and difficulty waking. Consider adaptogens.',
        priority: 'medium',
        category: 'adrenal',
      });
    }
  }
  
  return findings;
}

function analyzeNeurotransmitters(values: LabValues): Finding[] {
  const findings: Finding[] = [];
  
  // Serotonin Deficiency
  if (values.serotonin && values.serotonin < REFERENCE_RANGES.serotonin_low) {
    findings.push({
      pattern: 'Serotonin Deficiency',
      description: 'Correlates with depression/worry. Protocol: 5-HTP or Tryptophan.',
      priority: 'high',
      category: 'neurotransmitter',
    });
  }
  
  // GABA Deficiency
  if (values.gaba && values.gaba < REFERENCE_RANGES.gaba_low) {
    findings.push({
      pattern: 'Inhibitory Deficit',
      description: 'Low GABA correlates with anxiety/panic. Protocol: PharmaGABA or L-Theanine.',
      priority: 'high',
      category: 'neurotransmitter',
    });
  }
  
  // Glutamate Excess
  if (values.glutamate && values.glutamate > REFERENCE_RANGES.glutamate_high) {
    findings.push({
      pattern: 'Excitotoxicity Alert',
      description: 'Brain is inflamed/over-firing. Perfect candidate for Ketamine Therapy + NAC/Magnesium.',
      priority: 'high',
      category: 'neurotransmitter',
    });
  }
  
  // Dopamine Deficiency
  if (values.dopamine && values.dopamine < REFERENCE_RANGES.dopamine_low) {
    findings.push({
      pattern: 'Catecholamine Deficit',
      description: 'Low dopamine correlates with low drive/focus. Protocol: L-Tyrosine or Mucuna.',
      priority: 'medium',
      category: 'neurotransmitter',
    });
  }
  
  // Low Norepinephrine
  if (values.norepinephrine && values.norepinephrine < REFERENCE_RANGES.norepinephrine_low) {
    findings.push({
      pattern: 'Norepinephrine Deficiency',
      description: 'Low norepinephrine affects alertness and concentration. Often seen with chronic stress burnout.',
      priority: 'medium',
      category: 'neurotransmitter',
    });
  }
  
  // Low Epinephrine
  if (values.epinephrine && values.epinephrine < REFERENCE_RANGES.epinephrine_low) {
    findings.push({
      pattern: 'Epinephrine Depletion',
      description: 'Depleted epinephrine indicates adrenal fatigue affecting fight-or-flight response.',
      priority: 'low',
      category: 'neurotransmitter',
    });
  }
  
  return findings;
}

function generateProtocols(findings: Finding[]): Protocol[] {
  const protocols: Protocol[] = [];
  let priority = 1;
  
  // Check for patterns and generate appropriate protocols
  const patterns = findings.map(f => f.pattern);
  
  // Adrenal support is always first if adrenal issues detected
  if (patterns.includes('Adrenal Exhaustion') || patterns.includes('Burnout Pattern') || patterns.includes('Morning Cortisol Blunting')) {
    protocols.push({
      name: 'AdreneVive',
      dosage: '2 caps AM, 1 cap PM',
      timing: 'With meals',
      priority: priority++,
      rationale: 'Must address HPA axis dysfunction before hormone optimization',
    });
  }
  
  // Circadian support for inverted curve
  if (patterns.includes('Inverted Cortisol Curve')) {
    protocols.push({
      name: 'Sleep Hygiene + Phosphatidylserine',
      dosage: '100mg PS at bedtime',
      timing: 'Before bed',
      priority: priority++,
      rationale: 'Reduce nighttime cortisol and restore circadian rhythm',
    });
  }
  
  // Estrogen management
  if (patterns.includes('Estrogen Dominance')) {
    protocols.push({
      name: 'Zinc + DIM',
      dosage: 'Zinc 50mg + DIM 200mg daily',
      timing: 'With dinner',
      priority: priority++,
      rationale: 'Reduce estrogen conversion and promote healthy metabolism',
    });
  }
  
  // DHEA support
  if (patterns.includes('DHEA Depletion')) {
    protocols.push({
      name: 'DHEA',
      dosage: '25mg daily',
      timing: 'Morning with food',
      priority: priority++,
      rationale: 'Restore adrenal reserve (after adrenal support stabilization)',
    });
  }
  
  // Serotonin support
  if (patterns.includes('Serotonin Deficiency')) {
    protocols.push({
      name: '5-HTP',
      dosage: '100mg',
      timing: 'Before bed',
      priority: priority++,
      rationale: 'Support serotonin production for mood and sleep',
    });
  }
  
  // GABA support
  if (patterns.includes('Inhibitory Deficit')) {
    protocols.push({
      name: 'PharmaGABA or L-Theanine',
      dosage: 'GABA 200mg or L-Theanine 200mg',
      timing: 'As needed for anxiety, or before bed',
      priority: priority++,
      rationale: 'Calm overactive nervous system and reduce anxiety',
    });
  }
  
  // Glutamate/Excitotoxicity
  if (patterns.includes('Excitotoxicity Alert')) {
    protocols.push({
      name: 'NAC + Magnesium Glycinate',
      dosage: 'NAC 600mg 2x/day + Magnesium 400mg at bedtime',
      timing: 'NAC with meals, Magnesium at bedtime',
      priority: priority++,
      rationale: 'Reduce glutamate toxicity and neuroinflammation',
    });
    protocols.push({
      name: 'Consider Ketamine Therapy',
      dosage: 'Evaluate for IV or at-home ketamine protocol',
      timing: 'After baseline stabilization',
      priority: priority++,
      rationale: 'Ketamine is highly effective for glutamate dysregulation',
    });
  }
  
  // Dopamine support
  if (patterns.includes('Catecholamine Deficit')) {
    protocols.push({
      name: 'L-Tyrosine or Mucuna Pruriens',
      dosage: 'L-Tyrosine 500mg or Mucuna 300mg',
      timing: 'Morning on empty stomach',
      priority: priority++,
      rationale: 'Support dopamine production for focus and motivation',
    });
  }
  
  // Low testosterone (after addressing adrenal issues)
  if (patterns.includes('Low Testosterone') && !patterns.includes('Burnout Pattern')) {
    protocols.push({
      name: 'Evaluate for Testosterone Therapy',
      dosage: 'Based on clinical assessment',
      timing: 'After adrenal stabilization if applicable',
      priority: priority++,
      rationale: 'Address testosterone deficiency after ruling out HPA dysfunction',
    });
  }
  
  // Progesterone support
  if (patterns.includes('Progesterone Deficiency')) {
    protocols.push({
      name: 'Bioidentical Progesterone',
      dosage: 'Per clinical protocol',
      timing: 'Evening/bedtime',
      priority: priority++,
      rationale: 'Support sleep, reduce anxiety, protect breast tissue',
    });
  }
  
  return protocols;
}

function generateStory(findings: Finding[], values: LabValues): string {
  if (findings.length === 0) {
    return "Your labs appear within normal ranges. Continue current wellness protocols and retest in 3-6 months.";
  }
  
  const hasAdrenalIssue = findings.some(f => f.category === 'adrenal');
  const hasHormoneIssue = findings.some(f => f.category === 'hormone');
  const hasNeuroIssue = findings.some(f => f.category === 'neurotransmitter');
  
  const highPriorityFindings = findings.filter(f => f.priority === 'high');
  
  let story = "";
  
  // Build the narrative based on findings
  if (hasAdrenalIssue && hasNeuroIssue) {
    story = "Your labs show that your adrenal system is exhausted from chronic stress, which is affecting your brain chemistry. ";
    if (findings.some(f => f.pattern === 'Serotonin Deficiency')) {
      story += "Your brain isn't producing enough serotonin, which explains feelings of depression or worry. ";
    }
    if (findings.some(f => f.pattern === 'Inhibitory Deficit')) {
      story += "Low GABA levels are contributing to anxiety and difficulty relaxing. ";
    }
    story += "We need to restore your adrenal function first, then support your neurotransmitter balance.";
  } else if (hasAdrenalIssue && hasHormoneIssue) {
    story = "Your labs reveal a burnout pattern where chronic stress has depleted your adrenal reserves, which is now suppressing your hormone production. ";
    story += "We must address the adrenal dysfunction before optimizing hormones, otherwise treatments won't be as effective.";
  } else if (hasAdrenalIssue) {
    story = "Your cortisol pattern indicates significant adrenal stress. ";
    if (findings.some(f => f.pattern === 'Adrenal Exhaustion')) {
      story += "Your HPA axis is exhausted and needs aggressive rest and recovery support. ";
    }
    if (findings.some(f => f.pattern === 'Inverted Cortisol Curve')) {
      story += "Your cortisol is higher at night than morning, disrupting sleep and recovery. ";
    }
    story += "Restoring healthy adrenal function is the foundation for all other improvements.";
  } else if (hasNeuroIssue) {
    story = "Your neurotransmitter panel reveals imbalances that explain your symptoms. ";
    if (findings.some(f => f.pattern === 'Excitotoxicity Alert')) {
      story += "Elevated glutamate indicates your brain is in an inflamed, over-firing state—this is where ketamine therapy can be particularly effective. ";
    }
    if (findings.some(f => f.pattern === 'Catecholamine Deficit')) {
      story += "Low dopamine is affecting your motivation and focus. ";
    }
    story += "We can target these specific deficiencies with precision supplements.";
  } else if (hasHormoneIssue) {
    story = "Your hormone panel shows specific imbalances we can address. ";
    if (findings.some(f => f.pattern === 'Estrogen Dominance')) {
      story += "Elevated estrogen is affecting mood and causing water retention. ";
    }
    if (findings.some(f => f.pattern === 'Low Testosterone')) {
      story += "Low testosterone is contributing to fatigue and reduced vitality. ";
    }
    story += "Targeted hormone optimization will help restore your energy and well-being.";
  }
  
  return story;
}

export function analyzeLabResults(values: LabValues, gender: string = 'female', kitType: 'hormone_mapping' | 'neuro_reset' = 'hormone_mapping'): ClinicalImpression {
  let findings: Finding[] = [];
  
  // Always analyze hormones and adrenals
  findings = [...findings, ...analyzeHormones(values, gender)];
  findings = [...findings, ...analyzeAdrenals(values)];
  
  // Add neurotransmitter analysis for Neuro-Reset kit
  if (kitType === 'neuro_reset') {
    findings = [...findings, ...analyzeNeurotransmitters(values)];
  }
  
  // Sort by priority
  findings.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  // Generate protocols based on findings
  const protocols = generateProtocols(findings);
  
  // Generate patient-facing story
  const story = generateStory(findings, values);
  
  return {
    story,
    findings,
    protocols,
  };
}

export { REFERENCE_RANGES };
