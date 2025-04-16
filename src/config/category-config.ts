import { ArticleTypeDefinition, CategoryMapping, SpecialtyFilter } from '../types';

/**
 * Article type definitions mapping PubMed publication types to our standardized types
 */
export const ARTICLE_TYPE_DEFINITIONS: ArticleTypeDefinition[] = [
  {
    id: 'guideline',
    name: 'Clinical Guideline',
    description: 'Official clinical practice guidelines',
    color: '#4CAF50', // Green
    pubmed_types: [
      'Guideline', 
      'Practice Guideline',
      'Consensus Development Conference',
      'Consensus Development Conference, NIH'
    ],
    priority: 1
  },
  {
    id: 'systematic_review',
    name: 'Systematic Review',
    description: 'Systematic review or meta-analysis',
    color: '#2196F3', // Blue
    pubmed_types: [
      'Meta-Analysis',
      'Systematic Review'
    ],
    priority: 2
  },
  {
    id: 'randomized_trial',
    name: 'Randomized Trial',
    description: 'Randomized controlled trial',
    color: '#9C27B0', // Purple
    pubmed_types: [
      'Randomized Controlled Trial'
    ],
    priority: 3
  },
  {
    id: 'clinical_trial',
    name: 'Clinical Trial',
    description: 'Clinical trial (non-randomized)',
    color: '#673AB7', // Deep Purple
    pubmed_types: [
      'Clinical Trial',
      'Clinical Trial, Phase I',
      'Clinical Trial, Phase II',
      'Clinical Trial, Phase III',
      'Clinical Trial, Phase IV'
    ],
    priority: 4
  },
  {
    id: 'review',
    name: 'Review',
    description: 'Literature review or narrative review',
    color: '#FF9800', // Orange
    pubmed_types: [
      'Review'
    ],
    priority: 5
  },
  {
    id: 'case_report',
    name: 'Case Report',
    description: 'Case report or case series',
    color: '#795548', // Brown
    pubmed_types: [
      'Case Reports'
    ],
    priority: 6
  }
];

/**
 * Category mappings for MeSH terms and qualifiers
 */
export const CATEGORY_MAPPINGS: CategoryMapping[] = [
  {
    id: 'therapy',
    name: 'Therapy',
    description: 'Therapeutic interventions and treatments',
    color: '#E91E63', // Pink
    mesh_descriptors: [
      'Therapeutics',
      'Treatment Outcome',
      'Drug Therapy'
    ],
    mesh_qualifiers: [
      'therapy',
      'therapeutic use',
      'drug therapy'
    ],
    priority: 1
  },
  {
    id: 'diagnosis',
    name: 'Diagnosis',
    description: 'Diagnostic techniques and procedures',
    color: '#9C27B0', // Purple
    mesh_descriptors: [
      'Diagnosis',
      'Diagnostic Techniques and Procedures'
    ],
    mesh_qualifiers: [
      'diagnosis',
      'diagnostic use'
    ],
    priority: 2
  },
  {
    id: 'prognosis',
    name: 'Prognosis',
    description: 'Disease outcomes and prognostic factors',
    color: '#009688', // Teal
    mesh_descriptors: [
      'Prognosis',
      'Survival Analysis',
      'Disease Progression'
    ],
    mesh_qualifiers: [
      'mortality',
      'complications'
    ],
    priority: 3
  },
  {
    id: 'etiology',
    name: 'Etiology',
    description: 'Disease causes and risk factors',
    color: '#FF5722', // Deep Orange
    mesh_descriptors: [
      'Etiology',
      'Risk Factors',
      'Causality'
    ],
    mesh_qualifiers: [
      'etiology',
      'epidemiology',
      'genetics'
    ],
    priority: 4
  },
  {
    id: 'prevention',
    name: 'Prevention',
    description: 'Disease prevention and prophylaxis',
    color: '#8BC34A', // Light Green
    mesh_descriptors: [
      'Primary Prevention',
      'Secondary Prevention',
      'Preventive Health Services'
    ],
    mesh_qualifiers: [
      'prevention & control'
    ],
    priority: 5
  }
];

/**
 * Map of specialties to their related MeSH terms
 */
export const SPECIALTY_MESH_MAPPINGS: Record<string, string[]> = {
  'Cardiology': [
    'Heart Diseases',
    'Cardiovascular Diseases',
    'Vascular Diseases',
    'Heart',
    'Myocardium'
  ],
  'Neurology': [
    'Nervous System Diseases',
    'Brain Diseases',
    'Neurodegenerative Diseases',
    'Stroke',
    'Epilepsy'
  ],
  'Oncology': [
    'Neoplasms',
    'Cancer',
    'Tumors',
    'Carcinoma'
  ],
  'Pulmonology': [
    'Lung Diseases',
    'Respiratory Tract Diseases',
    'Pulmonary Disease, Chronic Obstructive',
    'Asthma'
  ],
  'Gastroenterology': [
    'Digestive System Diseases',
    'Gastrointestinal Diseases',
    'Liver Diseases',
    'Inflammatory Bowel Diseases'
  ],
  'Infectious Diseases': [
    'Infections',
    'Bacterial Infections',
    'Viral Infections',
    'Communicable Diseases',
    'Anti-Infective Agents'
  ],
  'Endocrinology': [
    'Endocrine System Diseases',
    'Diabetes Mellitus',
    'Thyroid Diseases',
    'Hormones'
  ],
  'Psychiatry': [
    'Mental Disorders',
    'Mood Disorders',
    'Anxiety Disorders',
    'Psychotic Disorders'
  ]
};

/**
 * Specialty filters with hierarchical structure
 */
export const SPECIALTY_FILTERS: SpecialtyFilter[] = [
  {
    id: 'cardiology',
    name: 'Cardiology',
    description: 'Heart and cardiovascular system diseases',
    mesh_terms: [
      'Heart Diseases',
      'Cardiovascular Diseases',
      'Vascular Diseases',
      'Heart',
      'Blood Vessels'
    ],
    sub_specialties: [
      {
        id: 'interventional_cardiology',
        name: 'Interventional Cardiology',
        description: 'Catheter-based treatments of heart diseases',
        mesh_terms: [
          'Angioplasty',
          'Stents',
          'Cardiac Catheterization',
          'Percutaneous Coronary Intervention'
        ]
      },
      {
        id: 'electrophysiology',
        name: 'Electrophysiology',
        description: 'Heart rhythm disorders',
        mesh_terms: [
          'Arrhythmias, Cardiac',
          'Cardiac Electrophysiology',
          'Catheter Ablation',
          'Pacemaker, Artificial'
        ]
      }
    ]
  },
  {
    id: 'neurology',
    name: 'Neurology',
    description: 'Brain and nervous system diseases',
    mesh_terms: [
      'Nervous System Diseases',
      'Brain Diseases',
      'Neurodegenerative Diseases',
      'Stroke',
      'Epilepsy'
    ],
    sub_specialties: [
      {
        id: 'movement_disorders',
        name: 'Movement Disorders',
        description: 'Parkinson\'s and related disorders',
        mesh_terms: [
          'Movement Disorders',
          'Parkinson Disease',
          'Tremor',
          'Dystonia'
        ]
      },
      {
        id: 'neuroimmunology',
        name: 'Neuroimmunology',
        description: 'Immune-mediated neurological disorders',
        mesh_terms: [
          'Multiple Sclerosis',
          'Demyelinating Diseases',
          'Neuroimmunology',
          'Guillain-Barre Syndrome'
        ]
      }
    ]
  },
  {
    id: 'oncology',
    name: 'Oncology',
    description: 'Cancer and tumor diseases',
    mesh_terms: [
      'Neoplasms',
      'Tumors',
      'Carcinoma',
      'Cancer'
    ],
    sub_specialties: [
      {
        id: 'hematologic_oncology',
        name: 'Hematologic Oncology',
        description: 'Blood cancers',
        mesh_terms: [
          'Leukemia',
          'Lymphoma',
          'Multiple Myeloma',
          'Hematologic Neoplasms'
        ]
      },
      {
        id: 'radiation_oncology',
        name: 'Radiation Oncology',
        description: 'Radiation therapy for cancer',
        mesh_terms: [
          'Radiotherapy',
          'Radiation Oncology',
          'Brachytherapy',
          'Radiosurgery'
        ]
      }
    ]
  }
];

/**
 * Publication type to filter mapping
 */
export const PUBLICATION_TYPE_FILTER_MAP: Record<string, string> = {
  'Clinical Guideline': '("Guideline"[Publication Type] OR "Practice Guideline"[Publication Type])',
  'Systematic Review': '("Systematic Review"[Publication Type] OR "Meta-Analysis"[Publication Type])',
  'Randomized Trial': '"Randomized Controlled Trial"[Publication Type]',
  'Clinical Trial': '"Clinical Trial"[Publication Type]',
  'Case Report': '"Case Reports"[Publication Type]',
  'Review': '"Review"[Publication Type]'
};
