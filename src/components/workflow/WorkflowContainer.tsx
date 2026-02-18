import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FormData, initialFormData, DocumentItem, WorkflowStep } from './types';
import StepIndicator from './StepIndicator';
import Step1CaseForm from './Step1CaseForm';
import Step2DocumentChecklist from './Step2DocumentChecklist';
import Step3CompileValidation from './Step3CompileValidation';
import Step4AuditSimulation from './Step4AuditSimulation';
import Step5DocumentReorder from './Step5DocumentReorder';

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
      <div className="max-w-5xl mx-auto px-4 py-8">
        <StepIndicator currentStep={step} />
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && (
              <Step1CaseForm formData={formData} onChange={updateForm} onNext={() => goTo(2)} />
            )}
            {step === 2 && (
              <Step2DocumentChecklist
                formData={formData}
                documents={documents}
                onDocumentsChange={setDocuments}
                onNext={() => goTo(3)}
                onBack={() => goTo(1)}
              />
            )}
            {step === 3 && (
              <Step3CompileValidation
                documents={documents}
                onBack={() => goTo(2)}
                onNext={() => goTo(4)}
                onScrollToMissing={() => {}}
              />
            )}
            {step === 4 && (
              <Step4AuditSimulation onNext={() => goTo(5)} />
            )}
            {step === 5 && (
              <Step5DocumentReorder documents={documents} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WorkflowContainer;
