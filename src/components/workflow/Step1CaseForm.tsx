import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Building2, Loader2 } from 'lucide-react';
import { FormData, SchemaType, ECHS_SUBCATEGORIES, ECHSTreatmentCategory, CGHS_BENEFICIARY_CATEGORIES } from './types';

interface Props {
  formData: FormData;
  onChange: (data: Partial<FormData>) => void;
  onNext: () => void;
}

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div>
    <label className="gov-label">
      {label} {required && <span className="text-destructive">*</span>}
    </label>
    {children}
  </div>
);

const SectionTitle = ({ title }: { title: string }) => (
  <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
    <div className="w-1 h-5 bg-primary rounded-full" />
    {title}
  </h3>
);

const Step1CaseForm = ({ formData, onChange, onNext }: Props) => {
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange({ [field]: e.target.value });
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const setSchema = (s: SchemaType) => {
    onChange({ schema: s, treatmentCategory: '', treatmentSubcategory: '', beneficiaryCategory: '' });
  };

  const schema = formData.schema;
  const cat = formData.treatmentCategory;

  const echsCategories: ECHSTreatmentCategory[] = ['Normal', 'Emergency', 'Chemotherapy', 'Dialysis'];
  const cghsCategories = ['Normal / Planned', 'Emergency', 'Chemotherapy', 'Dialysis', 'Chronic Disease Management'];

  const subcategories = schema === 'ECHS' && cat
    ? ECHS_SUBCATEGORIES[cat as ECHSTreatmentCategory] || []
    : [];

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = 'Required';
    if (!formData.mobileNumber.trim()) errs.mobileNumber = 'Required';
    if (!formData.treatmentCategory) errs.treatmentCategory = 'Required';
    if (!formData.hospitalName.trim()) errs.hospitalName = 'Required';
    if (!formData.admissionDate) errs.admissionDate = 'Required';
    if (!formData.diagnosis.trim()) errs.diagnosis = 'Required';
    if (!formData.treatingDoctor.trim()) errs.treatingDoctor = 'Required';

    if (schema === 'ECHS') {
      if (!formData.smartCardNumber.trim()) errs.smartCardNumber = 'Required';
      if (!formData.serviceNumber.trim()) errs.serviceNumber = 'Required';
      if (cat === 'Normal' && !formData.estimatedCost.trim()) errs.estimatedCost = 'Required';
    }
    if (schema === 'CGHS') {
      if (!formData.beneficiaryCategory) errs.beneficiaryCategory = 'Required';
      if (!formData.cghsCardNumber.trim()) errs.cghsCardNumber = 'Required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = () => {
    if (validate()) onNext();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Loading scheme configuration…</p>
      </div>
    );
  }

  const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -12 }, transition: { duration: 0.25 } };

  return (
    <motion.div {...fadeIn} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-primary" />
          <span className="text-lg font-semibold text-foreground">Sarvodaya Hospital</span>
        </div>
      </div>

      {/* Schema Selector */}
      <div className="flex justify-center">
        <div className="inline-flex bg-muted rounded-lg p-1 gap-1">
          {(['ECHS', 'CGHS'] as SchemaType[]).map(s => (
            <button
              key={s}
              onClick={() => setSchema(s)}
              className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${
                schema === s ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={schema} {...fadeIn} className="space-y-6">
          {/* CGHS Beneficiary Category */}
          {schema === 'CGHS' && (
            <div className="gov-section">
              <SectionTitle title="Beneficiary Category" />
              <Field label="Category" required>
                <select className="gov-select" value={formData.beneficiaryCategory} onChange={set('beneficiaryCategory')}>
                  <option value="">Select category</option>
                  {CGHS_BENEFICIARY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.beneficiaryCategory && <p className="text-xs text-destructive mt-1">{errors.beneficiaryCategory}</p>}
              </Field>
            </div>
          )}

          {/* Beneficiary Details */}
          <div className="gov-section">
            <SectionTitle title="Beneficiary Details" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Full Name" required>
                <input className="gov-input" value={formData.fullName} onChange={set('fullName')} placeholder="Enter full name" />
                {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}
              </Field>

              {schema === 'ECHS' ? (
                <>
                  <Field label="ECHS Smart Card Number" required>
                    <input className="gov-input" value={formData.smartCardNumber} onChange={set('smartCardNumber')} placeholder="Card number" />
                    {errors.smartCardNumber && <p className="text-xs text-destructive mt-1">{errors.smartCardNumber}</p>}
                  </Field>
                  <Field label="Service Number" required>
                    <input className="gov-input" value={formData.serviceNumber} onChange={set('serviceNumber')} placeholder="Service number" />
                    {errors.serviceNumber && <p className="text-xs text-destructive mt-1">{errors.serviceNumber}</p>}
                  </Field>
                  <Field label="Rank (at Retirement)">
                    <input className="gov-input" value={formData.rank} onChange={set('rank')} placeholder="Rank" />
                  </Field>
                  <Field label="Branch">
                    <select className="gov-select" value={formData.branch} onChange={set('branch')}>
                      <option value="">Select branch</option>
                      <option>Army</option>
                      <option>Navy</option>
                      <option>Air Force</option>
                    </select>
                  </Field>
                  <Field label="PPO Number">
                    <input className="gov-input" value={formData.ppoNumber} onChange={set('ppoNumber')} placeholder="PPO Number" />
                  </Field>
                  <Field label="Registered Polyclinic Name">
                    <input className="gov-input" value={formData.polyclinicName} onChange={set('polyclinicName')} placeholder="Polyclinic name" />
                  </Field>
                </>
              ) : (
                <>
                  <Field label="CGHS Card Number" required>
                    <input className="gov-input" value={formData.cghsCardNumber} onChange={set('cghsCardNumber')} placeholder="Card number" />
                    {errors.cghsCardNumber && <p className="text-xs text-destructive mt-1">{errors.cghsCardNumber}</p>}
                  </Field>
                  <Field label="Beneficiary ID">
                    <input className="gov-input" value={formData.beneficiaryId} onChange={set('beneficiaryId')} placeholder="Beneficiary ID" />
                  </Field>
                  <Field label="Serving / Pensioner">
                    <select className="gov-select" value={formData.servingPensioner} onChange={set('servingPensioner')}>
                      <option value="">Select</option>
                      <option>Serving</option>
                      <option>Pensioner</option>
                    </select>
                  </Field>
                  <Field label="Department / Ministry">
                    <input className="gov-input" value={formData.departmentMinistry} onChange={set('departmentMinistry')} placeholder="Department" />
                  </Field>
                  <Field label="Ward Entitlement">
                    <select className="gov-select" value={formData.wardEntitlement} onChange={set('wardEntitlement')}>
                      <option value="">Select</option>
                      <option>General Ward</option>
                      <option>Semi-Private</option>
                      <option>Private</option>
                    </select>
                  </Field>
                </>
              )}

              <Field label="Mobile Number" required>
                <input className="gov-input" value={formData.mobileNumber} onChange={set('mobileNumber')} placeholder="10-digit mobile" />
                {errors.mobileNumber && <p className="text-xs text-destructive mt-1">{errors.mobileNumber}</p>}
              </Field>
              {schema === 'ECHS' && (
                <>
                  <Field label="Aadhaar Number (optional)">
                    <input className="gov-input" value={formData.aadhaarNumber} onChange={set('aadhaarNumber')} placeholder="12-digit Aadhaar" />
                  </Field>
                  <Field label="Relationship to Ex-Serviceman">
                    <select className="gov-select" value={formData.relationship} onChange={set('relationship')}>
                      <option value="">Select</option>
                      <option>Self</option>
                      <option>Spouse</option>
                      <option>Son</option>
                      <option>Daughter</option>
                      <option>Parent</option>
                    </select>
                  </Field>
                </>
              )}
            </div>
          </div>

          {/* Treatment Category */}
          <div className="gov-section">
            <SectionTitle title="Treatment Category" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Category" required>
                <select
                  className="gov-select"
                  value={formData.treatmentCategory}
                  onChange={e => onChange({ treatmentCategory: e.target.value, treatmentSubcategory: '' })}
                >
                  <option value="">Select category</option>
                  {(schema === 'ECHS' ? echsCategories : cghsCategories).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.treatmentCategory && <p className="text-xs text-destructive mt-1">{errors.treatmentCategory}</p>}
              </Field>

              {subcategories.length > 0 && (
                <Field label="Subcategory">
                  <select className="gov-select" value={formData.treatmentSubcategory} onChange={set('treatmentSubcategory')}>
                    <option value="">Select subcategory</option>
                    {subcategories.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
              )}
            </div>
          </div>

          {/* Hospital & Admission Details */}
          <div className="gov-section">
            <SectionTitle title="Hospital & Admission Details" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Hospital Name" required>
                <input className="gov-input" value={formData.hospitalName} onChange={set('hospitalName')} placeholder="Hospital name" />
                {errors.hospitalName && <p className="text-xs text-destructive mt-1">{errors.hospitalName}</p>}
              </Field>
              <Field label="Empanelment Code">
                <input className="gov-input" value={formData.empanelmentCode} onChange={set('empanelmentCode')} placeholder="Code" />
              </Field>
              <Field label="Admission Date" required>
                <input className="gov-input" type="date" value={formData.admissionDate} onChange={set('admissionDate')} />
                {errors.admissionDate && <p className="text-xs text-destructive mt-1">{errors.admissionDate}</p>}
              </Field>
              <Field label="Expected Discharge Date">
                <input className="gov-input" type="date" value={formData.expectedDischargeDate} onChange={set('expectedDischargeDate')} />
              </Field>
              <Field label="Diagnosis" required>
                <input className="gov-input" value={formData.diagnosis} onChange={set('diagnosis')} placeholder="Primary diagnosis" />
                {errors.diagnosis && <p className="text-xs text-destructive mt-1">{errors.diagnosis}</p>}
              </Field>
              <Field label="Provisional Diagnosis Code">
                <input className="gov-input" value={formData.diagnosisCode} onChange={set('diagnosisCode')} placeholder="ICD code" />
              </Field>
              <Field label="Treating Doctor Name" required>
                <input className="gov-input" value={formData.treatingDoctor} onChange={set('treatingDoctor')} placeholder="Doctor name" />
                {errors.treatingDoctor && <p className="text-xs text-destructive mt-1">{errors.treatingDoctor}</p>}
              </Field>
              {((schema === 'ECHS' && cat === 'Normal') || schema === 'CGHS') && (
                <Field label="Estimated Cost" required={schema === 'ECHS' && cat === 'Normal'}>
                  <input className="gov-input" value={formData.estimatedCost} onChange={set('estimatedCost')} placeholder="₹" />
                  {errors.estimatedCost && <p className="text-xs text-destructive mt-1">{errors.estimatedCost}</p>}
                </Field>
              )}
            </div>
          </div>

          {/* Conditional Sections */}
          <AnimatePresence>
            {/* Emergency Section */}
            {cat === 'Emergency' && (
              <motion.div {...fadeIn} className="gov-section">
                <SectionTitle title="Emergency Details" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Emergency Admission Time">
                    <input className="gov-input" type="datetime-local" value={formData.emergencyAdmissionTime} onChange={set('emergencyAdmissionTime')} />
                  </Field>
                  {schema === 'ECHS' ? (
                    <Field label="Intimation Sent to ECHS?">
                      <select className="gov-select" value={formData.intimationSentToECHS} onChange={set('intimationSentToECHS')}>
                        <option value="">Select</option>
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                    </Field>
                  ) : (
                    <>
                      <Field label="Emergency Type">
                        <input className="gov-input" value={formData.emergencyType} onChange={set('emergencyType')} placeholder="Emergency type" />
                      </Field>
                      <Field label="Intimation Sent to CGHS?">
                        <select className="gov-select" value={formData.intimationSentToCGHS} onChange={set('intimationSentToCGHS')}>
                          <option value="">Select</option>
                          <option>Yes</option>
                          <option>No</option>
                        </select>
                      </Field>
                      <Field label="Intimation Date">
                        <input className="gov-input" type="date" value={formData.intimationDate} onChange={set('intimationDate')} />
                      </Field>
                    </>
                  )}
                  <Field label={schema === 'ECHS' ? 'Intimation Date & Time' : 'Date & Time of Admission'}>
                    <input className="gov-input" type="datetime-local" value={formData.intimationDateTime} onChange={set('intimationDateTime')} />
                  </Field>
                  <Field label="Emergency Justification">
                    <input className="gov-input" value={formData.emergencyJustification} onChange={set('emergencyJustification')} placeholder="Justification" />
                  </Field>
                  <Field label="ICU Required?">
                    <select className="gov-select" value={formData.icuRequired} onChange={set('icuRequired')}>
                      <option value="">Select</option>
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </Field>
                </div>
              </motion.div>
            )}

            {/* Chemotherapy Section */}
            {cat === 'Chemotherapy' && (
              <motion.div {...fadeIn} className="gov-section">
                <SectionTitle title="Chemotherapy Details" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {schema === 'CGHS' && (
                    <Field label="Cancer Type">
                      <input className="gov-input" value={formData.cancerType} onChange={set('cancerType')} placeholder="Cancer type" />
                    </Field>
                  )}
                  <Field label="Histopathology Report Available?">
                    <select className="gov-select" value={formData.histopathologyAvailable} onChange={set('histopathologyAvailable')}>
                      <option value="">Select</option>
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </Field>
                  {schema === 'CGHS' && (
                    <Field label="Treatment Type">
                      <input className="gov-input" value={formData.treatmentType} onChange={set('treatmentType')} placeholder="Treatment type" />
                    </Field>
                  )}
                  <Field label="Cycle Number">
                    <input className="gov-input" type="number" value={formData.cycleNumber} onChange={set('cycleNumber')} placeholder="Current cycle" />
                  </Field>
                  <Field label="Total Planned Cycles">
                    <input className="gov-input" type="number" value={formData.totalPlannedCycles} onChange={set('totalPlannedCycles')} placeholder="Total cycles" />
                  </Field>
                  <Field label="Drug Name">
                    <input className="gov-input" value={formData.drugName} onChange={set('drugName')} placeholder="Drug name" />
                  </Field>
                  {schema === 'ECHS' && (
                    <Field label="Protocol Type">
                      <input className="gov-input" value={formData.protocolType} onChange={set('protocolType')} placeholder="Protocol" />
                    </Field>
                  )}
                  {schema === 'CGHS' && (
                    <>
                      <Field label="Estimated Cost Per Cycle">
                        <input className="gov-input" value={formData.estimatedCostPerCycle} onChange={set('estimatedCostPerCycle')} placeholder="₹" />
                      </Field>
                      <Field label="Pre-Authorization Number">
                        <input className="gov-input" value={formData.preAuthNumber} onChange={set('preAuthNumber')} placeholder="Auth number" />
                      </Field>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* Dialysis Section */}
            {cat === 'Dialysis' && (
              <motion.div {...fadeIn} className="gov-section">
                <SectionTitle title="Dialysis Details" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Nephrologist Name">
                    <input className="gov-input" value={formData.nephrologistName} onChange={set('nephrologistName')} placeholder="Name" />
                  </Field>
                  <Field label="Number of Sessions Planned">
                    <input className="gov-input" type="number" value={formData.sessionsPlanned} onChange={set('sessionsPlanned')} placeholder="Sessions" />
                  </Field>
                  <Field label={schema === 'ECHS' ? 'Per Session Cost' : 'Cost Per Session'}>
                    <input className="gov-input" value={formData.perSessionCost} onChange={set('perSessionCost')} placeholder="₹" />
                  </Field>
                  {schema === 'CGHS' && (
                    <>
                      <Field label="Emergency?">
                        <select className="gov-select" value={formData.isEmergencyDialysis} onChange={set('isEmergencyDialysis')}>
                          <option value="">Select</option>
                          <option>Yes</option>
                          <option>No</option>
                        </select>
                      </Field>
                      {formData.isEmergencyDialysis !== 'Yes' && (
                        <Field label="Referral Number">
                          <input className="gov-input" value={formData.referralNumber} onChange={set('referralNumber')} placeholder="Referral #" />
                        </Field>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* CGHS Normal/Planned Referral */}
            {schema === 'CGHS' && cat === 'Normal / Planned' && (
              <motion.div {...fadeIn} className="gov-section">
                <SectionTitle title="Referral Details" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Referral Number">
                    <input className="gov-input" value={formData.referralNumber} onChange={set('referralNumber')} placeholder="Referral #" />
                  </Field>
                  <Field label="Referral Date">
                    <input className="gov-input" type="date" value={formData.referralDate} onChange={set('referralDate')} />
                  </Field>
                  <Field label="CGHS Wellness Centre Name">
                    <input className="gov-input" value={formData.wellnessCentreName} onChange={set('wellnessCentreName')} placeholder="Centre name" />
                  </Field>
                  <Field label="Pre-Authorization Required?">
                    <select className="gov-select" value={formData.preAuthRequired} onChange={set('preAuthRequired')}>
                      <option value="">Select</option>
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </Field>
                  {formData.preAuthRequired === 'Yes' && (
                    <Field label="Pre-Authorization Number">
                      <input className="gov-input" value={formData.preAuthNumber} onChange={set('preAuthNumber')} placeholder="Auth number" />
                    </Field>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Continue Button */}
      <div className="flex justify-end pt-4">
        <button onClick={handleContinue} className="gov-btn-primary">
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default Step1CaseForm;
