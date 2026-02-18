import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';

interface Props {
  onNext: () => void;
}

const auditChecks = [
  'Beneficiary ID Verification',
  'Smart Card Validity',
  'Referral Authenticity',
  'Treatment Package Validation',
  'Billing Compliance',
];

const Step4AuditSimulation = ({ onNext }: Props) => {
  const [completedChecks, setCompletedChecks] = useState<number>(0);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    if (completedChecks < auditChecks.length) {
      const t = setTimeout(() => setCompletedChecks(prev => prev + 1), 1500);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setAllDone(true), 800);
      return () => clearTimeout(t);
    }
  }, [completedChecks]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-8">
      <div className="text-center">
        <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-3" />
        <h2 className="text-xl font-bold text-foreground">Government Audit Verification</h2>
        <p className="text-sm text-muted-foreground mt-1">Sequential verification in progress</p>
      </div>

      <div className="space-y-3">
        {auditChecks.map((check, i) => {
          const isDone = i < completedChecks;
          const isActive = i === completedChecks && completedChecks < auditChecks.length;
          return (
            <motion.div
              key={check}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`gov-card !p-4 flex items-center gap-4 ${isDone ? 'border-success/30' : ''}`}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                {isDone ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <CheckCircle2 className="w-6 h-6 text-success" />
                  </motion.div>
                ) : isActive ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-border" />
                )}
              </div>
              <span className={`text-sm font-medium ${isDone ? 'text-success' : isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                {check}
              </span>
              {isDone && <span className="ml-auto text-xs font-medium text-success">Verified</span>}
            </motion.div>
          );
        })}
      </div>

      {allDone && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <p className="text-lg font-bold text-foreground">Audit Successful</p>
          <button onClick={onNext} className="gov-btn-primary">
            Proceed to Final Compilation <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Step4AuditSimulation;
