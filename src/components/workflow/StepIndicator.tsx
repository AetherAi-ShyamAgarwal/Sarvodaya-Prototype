import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { WorkflowStep } from './types';

const steps = [
  { num: 1, label: 'Case Form' },
  { num: 2, label: 'Documents' },
  { num: 3, label: 'Compile' },
  { num: 4, label: 'Audit' },
  { num: 5, label: 'Finalize' },
];

interface Props {
  currentStep: WorkflowStep;
}

const StepIndicator = ({ currentStep }: Props) => {
  return (
    <div className="flex items-center justify-center gap-1 mb-8">
      {steps.map((step, i) => {
        const isDone = currentStep > step.num;
        const isActive = currentStep === step.num;
        return (
          <div key={step.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: isActive ? 1.1 : 1 }}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  isDone ? 'gov-step-done' : isActive ? 'gov-step-active' : 'gov-step-pending'
                }`}
              >
                {isDone ? <Check className="w-4 h-4" /> : step.num}
              </motion.div>
              <span className={`text-xs mt-1 font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-1 mt-[-14px] rounded ${isDone ? 'bg-success' : 'bg-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
