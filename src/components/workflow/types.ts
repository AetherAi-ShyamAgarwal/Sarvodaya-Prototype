export type SchemaType = 'ECHS' | 'CGHS';

export type ECHSTreatmentCategory = 'Normal' | 'Emergency' | 'Chemotherapy' | 'Dialysis';
export type CGHSTreatmentCategory = 'Normal / Planned' | 'Emergency' | 'Chemotherapy' | 'Dialysis' | 'Chronic Disease Management';

export type ECHSSubcategory = {
  Normal: 'Surgery' | 'Medical Management' | 'Day Care Procedure';
  Emergency: 'Cardiac Emergency' | 'Accident / Trauma' | 'Stroke' | 'ICU Admission';
  Chemotherapy: 'Day Care Chemo' | 'Inpatient Chemo' | 'Targeted Therapy';
  Dialysis: 'Routine Dialysis' | 'Emergency Dialysis';
};

export const ECHS_SUBCATEGORIES: Record<ECHSTreatmentCategory, string[]> = {
  Normal: ['Surgery', 'Medical Management', 'Day Care Procedure'],
  Emergency: ['Cardiac Emergency', 'Accident / Trauma', 'Stroke', 'ICU Admission'],
  Chemotherapy: ['Day Care Chemo', 'Inpatient Chemo', 'Targeted Therapy'],
  Dialysis: ['Routine Dialysis', 'Emergency Dialysis'],
};

export const CGHS_SUBCATEGORIES: Record<string, string[]> = {
  'Normal / Planned': [],
  'Emergency': [],
  'Chemotherapy': [],
  'Dialysis': [],
  'Chronic Disease Management': [],
};

export const CGHS_BENEFICIARY_CATEGORIES = [
  'Serving Central Government Employee',
  'Central Government Pensioner',
  'Member of Parliament',
  'Ex-Governor / Ex-Minister',
  'Freedom Fighter',
  'Dependent (Spouse / Child / Parent)',
];

export interface DocumentItem {
  id: string;
  name: string;
  description: string;
  mandatory: boolean;
  status: 'pending' | 'uploaded' | 'verified';
  file?: File | null;
  section: string;
  foundInHIS?: boolean;
}

export interface FormData {
  schema: SchemaType;
  // ECHS fields
  fullName: string;
  smartCardNumber: string;
  serviceNumber: string;
  rank: string;
  branch: string;
  ppoNumber: string;
  polyclinicName: string;
  mobileNumber: string;
  aadhaarNumber: string;
  relationship: string;
  // Treatment
  treatmentCategory: string;
  treatmentSubcategory: string;
  // Hospital
  hospitalName: string;
  empanelmentCode: string;
  admissionDate: string;
  expectedDischargeDate: string;
  diagnosis: string;
  diagnosisCode: string;
  treatingDoctor: string;
  estimatedCost: string;
  // Emergency
  emergencyAdmissionTime: string;
  intimationSentToECHS: string;
  intimationDateTime: string;
  emergencyJustification: string;
  icuRequired: string;
  // Chemo
  histopathologyAvailable: string;
  cycleNumber: string;
  totalPlannedCycles: string;
  drugName: string;
  protocolType: string;
  // Dialysis
  sessionsPlanned: string;
  perSessionCost: string;
  nephrologistName: string;
  // CGHS specific
  beneficiaryCategory: string;
  cghsCardNumber: string;
  beneficiaryId: string;
  servingPensioner: string;
  departmentMinistry: string;
  wardEntitlement: string;
  // CGHS Normal
  referralNumber: string;
  referralDate: string;
  wellnessCentreName: string;
  preAuthRequired: string;
  preAuthNumber: string;
  // CGHS Emergency
  emergencyType: string;
  intimationSentToCGHS: string;
  intimationDate: string;
  // CGHS Chemo
  cancerType: string;
  treatmentType: string;
  estimatedCostPerCycle: string;
  // CGHS Dialysis
  isEmergencyDialysis: string;
  // Cashless
  isCashless: string;
  ipNumber: string;
}

export const initialFormData: FormData = {
  schema: 'ECHS',
  fullName: '', smartCardNumber: '', serviceNumber: '', rank: '', branch: '', ppoNumber: '',
  polyclinicName: '', mobileNumber: '', aadhaarNumber: '', relationship: '',
  treatmentCategory: 'Normal', treatmentSubcategory: '',
  hospitalName: '', empanelmentCode: '', admissionDate: '', expectedDischargeDate: '',
  diagnosis: '', diagnosisCode: '', treatingDoctor: '', estimatedCost: '',
  emergencyAdmissionTime: '', intimationSentToECHS: '', intimationDateTime: '',
  emergencyJustification: '', icuRequired: '',
  histopathologyAvailable: '', cycleNumber: '', totalPlannedCycles: '', drugName: '', protocolType: '',
  sessionsPlanned: '', perSessionCost: '', nephrologistName: '',
  beneficiaryCategory: '', cghsCardNumber: '', beneficiaryId: '', servingPensioner: '',
  departmentMinistry: '', wardEntitlement: '',
  referralNumber: '', referralDate: '', wellnessCentreName: '', preAuthRequired: '', preAuthNumber: '',
  emergencyType: '', intimationSentToCGHS: '', intimationDate: '',
  cancerType: '', treatmentType: '', estimatedCostPerCycle: '',
  isEmergencyDialysis: '', isCashless: 'Yes',
  ipNumber: '1234567890',
};

export type WorkflowStep = 1 | 2 | 3 | 4 | 5;
