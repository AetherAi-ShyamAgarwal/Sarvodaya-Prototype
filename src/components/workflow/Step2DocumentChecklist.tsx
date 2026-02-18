import { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, CheckCircle2, Clock, FileText, ArrowLeft, ArrowRight, RefreshCw, Eye } from 'lucide-react';
import { DocumentItem, FormData } from './types';

interface Props {
  formData: FormData;
  documents: DocumentItem[];
  onDocumentsChange: (docs: DocumentItem[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const getDocumentsForCase = (formData: FormData): DocumentItem[] => {
  const cat = formData.treatmentCategory;
  const sub = formData.treatmentSubcategory;
  const isCashless = formData.isCashless === 'Yes';
  const docs: DocumentItem[] = [];
  let id = 0;

  const add = (name: string, desc: string, mandatory: boolean, section: string) => {
    docs.push({ id: `doc-${id++}`, name, description: desc, mandatory, status: 'pending', file: null, section });
  };

  // Basic / Common
  add('ECHS Smart Card Copy', 'Front & back copy of smart card', true, 'Basic Documents');
  if (cat !== 'Emergency') add('Referral Letter from Polyclinic', 'Original referral letter', true, 'Basic Documents');
  add('Aadhaar Card Copy', 'If required by scheme', false, 'Basic Documents');
  add('Admission Note', 'Hospital admission documentation', true, 'Basic Documents');
  add('Discharge Summary', 'Complete discharge summary', true, 'Basic Documents');
  add('Detailed Itemized Final Bill', 'Itemized hospital bill', true, 'Basic Documents');
  add('Investigation Reports', 'Lab and radiology reports', true, 'Basic Documents');
  add('Prescriptions', 'All prescriptions during treatment', true, 'Basic Documents');
  add('Signed Claim Form', 'Duly signed claim form', true, 'Basic Documents');

  // Pre-Auth (Normal/Planned)
  if (cat === 'Normal' || cat === 'Normal / Planned') {
    add('Pre-Authorization Request Form', 'Request form for pre-auth', true, 'Pre-Authorization');
    add('Pre-Authorization Approval Letter', 'Approved letter', true, 'Pre-Authorization');
    add('OPD Consultation Notes', 'Outpatient consultation', false, 'Pre-Authorization');
    add('Diagnosis Reports', 'Supporting diagnosis', false, 'Pre-Authorization');
    add('Proposed Treatment Plan', 'Plan of treatment', false, 'Pre-Authorization');
    add('Estimated Cost Sheet', 'Cost estimation', false, 'Pre-Authorization');
  }

  // Surgery
  if (sub === 'Surgery') {
    add('OT Notes', 'Operation theatre notes', true, 'Surgery Documents');
    add('Anaesthesia Notes', 'Anaesthesia record', false, 'Surgery Documents');
    add('Implant Stickers', 'If applicable', false, 'Surgery Documents');
    add('Implant Invoice', 'If applicable', false, 'Surgery Documents');
    add('Surgeon Notes', 'Surgeon operative notes', false, 'Surgery Documents');
    add('Post-Operative Notes', 'Post-op documentation', false, 'Surgery Documents');
    add('ICU Notes', 'If ICU used', false, 'Surgery Documents');
  }

  // Emergency
  if (cat === 'Emergency') {
    add('Emergency Certificate', 'Certificate of emergency', true, 'Emergency Documents');
    add('ER Admission Time Record', 'ER admission timestamp', true, 'Emergency Documents');
    add('Intimation Proof (24-48 hrs)', 'Proof of intimation sent', true, 'Emergency Documents');
    add('Clinical Justification Notes', 'Clinical justification', false, 'Emergency Documents');
    add('ICU Records', 'If applicable', false, 'Emergency Documents');
    add('All Diagnostic Reports', 'Complete diagnostics', false, 'Emergency Documents');
    add('Final Bill', 'Final emergency bill', false, 'Emergency Documents');
  }

  // Chemo
  if (cat === 'Chemotherapy') {
    add('Histopathology Report', 'Pathology report', true, 'Chemotherapy Documents');
    add('Oncology Treatment Plan', 'Treatment plan', true, 'Chemotherapy Documents');
    add('Pre-Approval for Each Cycle', 'Cycle pre-approval', true, 'Chemotherapy Documents');
    add('Day Care Admission Notes', 'Day care notes', false, 'Chemotherapy Documents');
    add('Chemo Administration Sheet', 'Administration record', false, 'Chemotherapy Documents');
    add('Drug Batch Numbers', 'Batch details', false, 'Chemotherapy Documents');
    add('Cycle-wise Billing', 'Per-cycle billing', false, 'Chemotherapy Documents');
    add('Final Consolidated Bill', 'Consolidated bill', false, 'Chemotherapy Documents');
  }

  // Dialysis
  if (cat === 'Dialysis') {
    add('Nephrologist Prescription', 'Prescription from nephrologist', true, 'Dialysis Documents');
    add('Dialysis Chart (per session)', 'Session-wise chart', false, 'Dialysis Documents');
    add('Lab Reports', 'Supporting lab reports', false, 'Dialysis Documents');
    add('Session-wise Billing', 'Per-session billing', false, 'Dialysis Documents');
  }

  // Reimbursement
  if (!isCashless) {
    add('Original Bills', 'Original payment bills', true, 'Reimbursement Documents');
    add('Payment Receipts', 'Payment receipts', true, 'Reimbursement Documents');
    add('Bank Details of Beneficiary', 'Account details', true, 'Reimbursement Documents');
    add('Cancelled Cheque Copy', 'Cancelled cheque', false, 'Reimbursement Documents');
    add('Reimbursement Claim Form', 'Claim form', false, 'Reimbursement Documents');
  }

  return docs;
};

const Step2DocumentChecklist = ({ formData, documents: existingDocs, onDocumentsChange, onNext, onBack }: Props) => {
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    if (existingDocs.length > 0) return existingDocs;
    return getDocumentsForCase(formData);
  });

  const firstMissingRef = useRef<HTMLDivElement>(null);

  const uploadedCount = documents.filter(d => d.status !== 'pending').length;
  const totalRequired = documents.length;
  const mandatoryDocs = documents.filter(d => d.mandatory);
  const mandatoryUploaded = mandatoryDocs.filter(d => d.status !== 'pending').length;
  const allMandatoryDone = mandatoryUploaded === mandatoryDocs.length;

  const sections = useMemo(() => {
    const map = new Map<string, DocumentItem[]>();
    documents.forEach(d => {
      if (!map.has(d.section)) map.set(d.section, []);
      map.get(d.section)!.push(d);
    });
    return Array.from(map.entries());
  }, [documents]);

  const handleUpload = (docId: string) => {
    const updated = documents.map(d =>
      d.id === docId ? { ...d, status: 'uploaded' as const } : d
    );
    setDocuments(updated);
    onDocumentsChange(updated);
  };

  const handleReplace = (docId: string) => {
    const updated = documents.map(d =>
      d.id === docId ? { ...d, status: 'pending' as const, file: null } : d
    );
    setDocuments(updated);
    onDocumentsChange(updated);
  };

  const statusIcon = (status: DocumentItem['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-muted-foreground" />;
      case 'uploaded': return <Upload className="w-4 h-4 text-primary" />;
      case 'verified': return <CheckCircle2 className="w-4 h-4 text-success" />;
    }
  };

  const statusLabel = (status: DocumentItem['status']) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'uploaded': return 'Uploaded';
      case 'verified': return 'Verified';
    }
  };

  const progressPct = mandatoryDocs.length > 0 ? (mandatoryUploaded / mandatoryDocs.length) * 100 : 100;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Upload Counter */}
        <div className="gov-card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-foreground">Uploaded: <span className="text-primary">{uploadedCount} / {totalRequired}</span> Required</p>
              <p className="text-sm text-muted-foreground">Mandatory Uploaded: <span className="font-medium">{mandatoryUploaded} / {mandatoryDocs.length}</span></p>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <motion.div
              className="h-2.5 rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Document Sections */}
        {sections.map(([sectionName, docs]) => (
          <div key={sectionName} className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              {sectionName}
            </h3>
            <div className="space-y-2">
              {docs.map((doc, i) => {
                const isFirstMissing = doc.mandatory && doc.status === 'pending';
                return (
                  <div
                    key={doc.id}
                    ref={isFirstMissing && !firstMissingRef.current ? firstMissingRef : undefined}
                    className="gov-card !p-4 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      {doc.status !== 'pending' ? (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <FileText className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">{doc.name}</p>
                        {doc.mandatory && <span className="gov-badge-mandatory">Mandatory</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">{doc.description}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1.5 text-xs">
                        {statusIcon(doc.status)}
                        <span className={doc.status === 'uploaded' ? 'text-primary font-medium' : doc.status === 'verified' ? 'text-success font-medium' : 'text-muted-foreground'}>
                          {statusLabel(doc.status)}
                        </span>
                      </div>
                      {doc.status === 'pending' ? (
                        <button onClick={() => handleUpload(doc.id)} className="gov-btn-primary !py-2 !px-3 text-xs">
                          <Upload className="w-3 h-3" /> Upload
                        </button>
                      ) : (
                        <button onClick={() => handleReplace(doc.id)} className="gov-btn-secondary !py-2 !px-3 text-xs">
                          <RefreshCw className="w-3 h-3" /> Replace
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <button onClick={onBack} className="gov-btn-secondary">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button onClick={onNext} className="gov-btn-primary" disabled={!allMandatoryDone} title={!allMandatoryDone ? 'Upload all mandatory documents first' : ''}>
            Compile <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sticky Summary Panel */}
      <div className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-6 gov-card space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Schema</span>
              <span className="font-medium">{formData.schema}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category</span>
              <span className="font-medium">{formData.treatmentCategory || '—'}</span>
            </div>
            {formData.treatmentSubcategory && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subcategory</span>
                <span className="font-medium">{formData.treatmentSubcategory}</span>
              </div>
            )}
            <hr className="border-border" />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Documents</span>
              <span className="font-medium">{totalRequired}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Uploaded</span>
              <span className="font-medium text-primary">{uploadedCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mandatory</span>
              <span className={`font-medium ${allMandatoryDone ? 'text-success' : 'text-destructive'}`}>
                {mandatoryUploaded} / {mandatoryDocs.length}
              </span>
            </div>
          </div>
          <button
            onClick={onNext}
            disabled={!allMandatoryDone}
            className="gov-btn-primary w-full text-sm"
            title={!allMandatoryDone ? 'Upload all mandatory documents to compile' : ''}
          >
            {allMandatoryDone ? 'Compile Documents' : `${mandatoryDocs.length - mandatoryUploaded} mandatory remaining`}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Step2DocumentChecklist;
