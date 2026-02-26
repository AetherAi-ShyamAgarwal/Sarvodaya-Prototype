import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Search, Loader2 } from 'lucide-react';
import { FormData, SchemaType } from './types';

interface Props {
  formData: FormData;
  onChange: (data: Partial<FormData>) => void;
  onNext: () => void;
}

const Step1CaseForm = ({ formData, onChange, onNext }: Props) => {
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange({ [field]: e.target.value });
  };

  const setSchema = (s: SchemaType) => {
    onChange({
      schema: s,
      treatmentCategory: s === 'ECHS' ? 'Normal' : 'Normal / Planned',
      treatmentSubcategory: '',
      beneficiaryCategory: ''
    });
  };

  const handleContinue = () => {
    if (!formData.ipNumber || !formData.treatmentCategory) return;
    setFetching(true);
    setTimeout(() => {
      setFetching(false);
      onNext();
    }, 2500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="mt-4 text-lg font-medium text-muted-foreground">Initializing portal…</p>
      </div>
    );
  }

  const schema = formData.schema;
  const categories = schema === 'ECHS'
    ? ['Normal', 'Emergency', 'Chemotherapy', 'Dialysis']
    : ['Normal / Planned', 'Emergency', 'Chemotherapy', 'Dialysis', 'Chronic Disease Management'];

  return (
    <>
      <AnimatePresence>
        {fetching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center"
          >
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">Fetching documents from HIS…</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto space-y-8 py-16"
      >
        <div className="space-y-8 px-4">
          {/* Scheme Selector */}
          <div className="space-y-4">
            <label className="gov-label text-center block text-sm font-bold opacity-70">Select Scheme</label>
            <div className="flex bg-muted/60 backdrop-blur-sm p-1.5 rounded-xl gap-2 border border-border/50">
              {(['ECHS', 'CGHS'] as SchemaType[]).map(s => (
                <button
                  key={s}
                  onClick={() => setSchema(s)}
                  className={`flex-1 py-3 px-4 rounded-lg text-xs font-bold transition-all ${schema === s
                    ? 'bg-background text-primary shadow-sm ring-1 ring-border/50'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields - Merged with background */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="gov-label text-sm font-bold opacity-70">IP Number</label>
              <div className="relative group">
                <input
                  className="gov-input pl-11 py-3.5 text-base bg-white border-border/50 focus:ring-2 focus:ring-primary/20 transition-all rounded-xl shadow-sm"
                  placeholder="Enter patient IP Number"
                  value={formData.ipNumber}
                  onChange={set('ipNumber')}
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="gov-label text-sm font-bold opacity-70">Treatment Category</label>
              <select
                className="gov-select py-3.5 text-base bg-white border-border/50 focus:ring-2 focus:ring-primary/20 transition-all rounded-xl shadow-sm"
                value={formData.treatmentCategory}
                onChange={set('treatmentCategory')}
              >
                <option value="">Select Category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={handleContinue}
            disabled={!formData.ipNumber || !formData.treatmentCategory}
            className="gov-btn-primary w-full py-4 text-base font-bold shadow-lg shadow-primary/10 hover:translate-y-[-1px] active:translate-y-0 transition-all rounded-xl"
          >
            Continue to Documents <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 pt-4">
          <div className="px-4 py-2 rounded-full bg-success/5 border border-success/10 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-success/70">HIS Central Database Connected</span>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Step1CaseForm;
