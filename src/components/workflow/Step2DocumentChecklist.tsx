import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Upload, ArrowLeft, ArrowRight, FileText, ShieldCheck } from 'lucide-react';
import { DocumentItem, FormData } from './types';

interface Props {
  formData: FormData;
  documents: DocumentItem[];
  onDocumentsChange: (docs: DocumentItem[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const getDocumentsForCase = (formData: FormData): DocumentItem[] => {
  const schema = formData.schema;
  const docs: DocumentItem[] = [];

  // Found in HIS
  const foundDocs = [
    { name: `${schema} Smart Card Copy`, desc: `Verified ${schema} beneficiary card` },
    { name: 'Referral Letter from Polyclinic', desc: 'HIS digital copy' },
    { name: 'Aadhaar Card Copy', desc: 'Linked via ABHA/KYC' },
    { name: 'Discharge Summary', desc: 'Electronic health record' },
    { name: 'Investigation Reports', desc: 'Lab & Radiology console' },
    { name: 'Prescriptions', desc: 'Digital prescriptions' },
  ];

  foundDocs.forEach((d, i) => {
    docs.push({
      id: `found-${i}`,
      name: d.name,
      description: d.desc,
      mandatory: true,
      status: 'verified',
      file: null,
      section: 'HIS Documents',
      foundInHIS: true
    });
  });

  // Missing Docs
  const missingDocs = [
    { name: 'Pouches', desc: 'Original physical pouches required for audit' },
    { name: 'Vendor Invoice', desc: 'Third-party vendor billing details' },
  ];

  missingDocs.forEach((d, i) => {
    docs.push({
      id: `missing-${i}`,
      name: d.name,
      description: d.desc,
      mandatory: true,
      status: 'pending',
      file: null,
      section: 'Missing Documents',
      foundInHIS: false
    });
  });

  return docs;
};

const Step2DocumentChecklist = ({ formData, documents: existingDocs, onDocumentsChange, onNext, onBack }: Props) => {
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    if (existingDocs.length > 0) return existingDocs;
    return getDocumentsForCase(formData);
  });

  const foundInHIS = useMemo(() => documents.filter(d => d.foundInHIS), [documents]);
  const missing = useMemo(() => documents.filter(d => !d.foundInHIS), [documents]);

  const allResolved = missing.every(d => d.status !== 'pending');

  const handleGeneralUpload = () => {
    // Simulate uploading all missing docs
    const updated = documents.map(d =>
      !d.foundInHIS ? { ...d, status: 'uploaded' as const } : d
    );
    setDocuments(updated);
    onDocumentsChange(updated);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 py-4"
    >
      {/* Header Info */}
      <div className="flex items-center justify-between bg-primary/5 p-6 rounded-2xl border border-primary/10 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Case Processing</h2>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-foreground">{formData.treatmentCategory}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
            <span className="text-lg font-medium text-muted-foreground">IP: {formData.ipNumber}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-muted-foreground mb-1">Scheme</p>
          <span className="gov-badge-success text-sm py-1 px-3 rounded-full">{formData.schema} Portal</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Found in HIS Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <ShieldCheck className="w-5 h-5 text-success" />
            <h3 className="text-lg font-bold text-foreground">Verified by HIS</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {foundInHIS.map(doc => (
              <div
                key={doc.id}
                className="bg-card border-2 border-success/20 rounded-xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="space-y-1">
                  <p className="font-bold text-foreground leading-tight">{doc.name}</p>
                  <p className="text-xs text-success font-semibold flex items-center gap-1 uppercase tracking-tighter">
                    <CheckCircle2 className="w-3 h-3" /> Found in HIS
                  </p>
                </div>
                <div className="bg-success/10 p-2 rounded-full">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Missing Documents Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <h3 className="text-lg font-bold">Action Required: Missing Documents</h3>
          </div>

          <div className="bg-destructive/5 border-2 border-destructive/20 rounded-2xl p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {missing.map(doc => (
                <div key={doc.id} className="bg-background/80 p-4 rounded-xl border border-destructive/10 flex items-center gap-3 shadow-sm">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.description}</p>
                  </div>
                  {doc.status !== 'pending' && (
                    <div className="ml-auto">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-col items-center gap-4">
              <p className="text-sm text-center text-muted-foreground font-medium max-w-md">
                Physical audit documents like <span className="text-destructive font-bold">Pouches</span> and <span className="text-destructive font-bold">Vendor Invoices</span> must be uploaded manually for this case.
              </p>
              <button
                onClick={handleGeneralUpload}
                disabled={allResolved}
                className={`gov-btn-primary w-full sm:w-auto px-10 py-4 text-base font-bold shadow-xl shadow-primary/20 ${allResolved ? 'opacity-50 grayscale' : ''}`}
              >
                <Upload className="w-5 h-5" /> {allResolved ? 'Documents Uploaded' : 'Upload All Missing Documents'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between items-center pt-8 border-t border-border">
        <button onClick={onBack} className="gov-btn-secondary px-8">
          <ArrowLeft className="w-4 h-4" /> Step 1 Info
        </button>
        <button
          onClick={onNext}
          disabled={!allResolved}
          className="gov-btn-primary px-10"
        >
          Proceed to Compile <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default Step2DocumentChecklist;
