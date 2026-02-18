import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ArrowLeft, CheckCircle2, Loader2, X } from 'lucide-react';
import { DocumentItem } from './types';

interface Props {
  documents: DocumentItem[];
  onBack: () => void;
  onNext: () => void;
  onScrollToMissing: () => void;
}

const Step3CompileValidation = ({ documents, onBack, onNext, onScrollToMissing }: Props) => {
  const mandatoryMissing = documents.filter(d => d.mandatory && d.status === 'pending');
  const hasMissing = mandatoryMissing.length > 0;
  const [phase, setPhase] = useState<'checking' | 'error' | 'sending' | 'success'>(hasMissing ? 'error' : 'checking');

  useEffect(() => {
    if (!hasMissing) {
      const t1 = setTimeout(() => setPhase('sending'), 1500);
      const t2 = setTimeout(() => setPhase('success'), 3500);
      const t3 = setTimeout(() => onNext(), 5000);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [hasMissing, onNext]);

  // Error Modal
  if (phase === 'error') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative gov-card max-w-md w-full mx-4 !p-8 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Missing Required Documents</h2>
          <p className="text-sm text-muted-foreground mb-4">
            The following mandatory documents have not been uploaded yet.
          </p>
          <div className="bg-muted rounded-lg p-3 mb-6 max-h-40 overflow-y-auto text-left">
            {mandatoryMissing.map(d => (
              <div key={d.id} className="flex items-center gap-2 py-1">
                <X className="w-3 h-3 text-destructive shrink-0" />
                <span className="text-sm text-foreground">{d.name}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { onScrollToMissing(); onBack(); }} className="gov-btn-primary">
              Go Back to Upload
            </button>
            <button onClick={onBack} className="gov-btn-secondary">
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Success flow
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
      <AnimatePresence mode="wait">
        {phase === 'checking' && (
          <motion.div key="checking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground">Validating documents…</p>
          </motion.div>
        )}
        {phase === 'sending' && (
          <motion.div key="sending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground">Sending documents to backend…</p>
          </motion.div>
        )}
        {phase === 'success' && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            <p className="text-xl font-bold text-foreground mb-1">Submission Successful</p>
            <p className="text-sm text-muted-foreground">Auditing Started</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Step3CompileValidation;
