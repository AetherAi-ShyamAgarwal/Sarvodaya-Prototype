import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FormData, initialFormData, DocumentItem, WorkflowStep } from './types';
import StepIndicator from './StepIndicator';
import Step1CaseForm from './Step1CaseForm';
import Step2DocumentChecklist from './Step2DocumentChecklist';
import Step3CompileValidation from './Step3CompileValidation';
import Step4AuditSimulation from './Step4AuditSimulation';
import Step5DocumentReorder from './Step5DocumentReorder';
import { Building2 } from 'lucide-react';

const WorkflowContainer = () => {
  const [step, setStep] = useState<WorkflowStep>(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  const updateForm = useCallback((partial: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...partial }));
  }, []);

  const goTo = useCallback((s: WorkflowStep) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(s);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className=" mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-semibold text-foreground">Sarvodaya Hospital</span>
          </div>
        </div>

        {
          <StepIndicator currentStep={step} />
        }

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && (
              <div className="max-w-7xl pt-2 mx-auto">
                <Step1CaseForm formData={formData} onChange={updateForm} onNext={() => goTo(2)} />
              </div>
            )}
            {step === 2 && (
              <div className="max-w-7xl pt-2 mx-auto">
                <Step2DocumentChecklist
                  formData={formData}
                  documents={documents}
                  onDocumentsChange={setDocuments}
                  onNext={() => goTo(3)}
                  onBack={() => goTo(1)}
                />
              </div>
            )}
            {step === 3 && (
              <div className="max-w-7xl pt-2 mx-auto">
                <Step3CompileValidation
                  documents={documents}
                  onBack={() => goTo(2)}
                  onNext={() => goTo(4)}
                  onScrollToMissing={() => { }}
                />
              </div>
            )}
            {step === 4 && (
              <div className="max-w-7xl pt-2 mx-auto">
                <Step4AuditSimulation onNext={() => goTo(5)} />
              </div>
            )}
            {step === 5 && (
              <div className="max-w-8xl pt-2 mx-auto">
                <Step5DocumentReorder documents={documents} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WorkflowContainer;
