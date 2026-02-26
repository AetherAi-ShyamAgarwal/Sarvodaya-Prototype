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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-10 py-12"
      >

        <div className="gov-card p-10 space-y-8 shadow-2xl border-primary/5 bg-card/50 backdrop-blur-sm">
          {/* Toggle Selector (Schema) */}
          <div className="space-y-4">
            <label className="gov-label text-center block text-base">Select Scheme</label>
            <div className="flex bg-muted p-1.5 rounded-xl gap-1.5">
              {(['ECHS', 'CGHS'] as SchemaType[]).map(s => (
                <button
                  key={s}
                  onClick={() => setSchema(s)}
                  className={`flex-1 py-3 px-6 rounded-lg text-base font-bold transition-all ${schema === s
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="gov-label text-base">IP Number</label>
              <div className="relative group">
                <input
                  className="gov-input pl-12 py-4 text-lg bg-background border-2 focus:ring-4 transition-all"
                  placeholder="Enter patient IP Number"
                  value={formData.ipNumber}
                  onChange={set('ipNumber')}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="gov-label text-base">Treatment Category</label>
              <select
                className="gov-select py-4 text-lg bg-background border-2 focus:ring-4 transition-all"
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
            className="gov-btn-primary w-full py-5 text-xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:grayscale transition-all"
          >
            Continue to Documents <ArrowRight className="ml-2 w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm font-medium">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          Connected to HIS Central Database
        </div>
      </motion.div>
    </>
  );
};

export default Step1CaseForm;
