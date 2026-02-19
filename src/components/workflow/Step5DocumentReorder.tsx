import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical, FileText, Save, RefreshCw, CheckCircle2, ShieldCheck,
  Loader2, AlertTriangle, Upload, ChevronRight
} from 'lucide-react';
import { DocumentItem } from './types';

// --- Simulated backend response ---
interface PdfSegment {
  id: number;
  name: string;
  pages: number;
}

interface DetectedError {
  id: number;
  message: string;
}

interface BackendResponse {
  totalGeneratedPdfs: number;
  files: PdfSegment[];
  detectedErrors: DetectedError[];
}

const SIMULATED_BACKEND: BackendResponse = {
  totalGeneratedPdfs: 22,
  files: [
    { id: 1, name: 'Aadhaar Card PDF', pages: 2 },
    { id: 2, name: 'PAN Card PDF', pages: 1 },
    { id: 3, name: 'CT-Scan Report PDF', pages: 5 },
    { id: 4, name: 'Discharge Summary PDF', pages: 3 },
    { id: 5, name: 'Admission Note PDF', pages: 2 },
    { id: 6, name: 'Lab Reports PDF', pages: 4 },
    { id: 7, name: 'Prescription PDF', pages: 1 },
    { id: 8, name: 'Referral Letter PDF', pages: 2 },
    { id: 9, name: 'Final Bill PDF', pages: 2 },
  ],
  detectedErrors: [
    { id: 1, message: 'Aadhaar Card PDF not detected.' },
    { id: 2, message: 'Referral Letter missing signature.' },
  ],
};

// --- Mini PDF Thumbnail ---
const MiniThumbnail = ({ name }: { name: string }) => (
  <div className="w-full aspect-[3/4] bg-background rounded-lg border border-border flex flex-col items-center justify-center p-2 gap-1.5">
    <div className="w-8 h-1.5 bg-muted-foreground/20 rounded-full" />
    <div className="w-10 h-1.5 bg-muted-foreground/15 rounded-full" />
    <div className="w-6 h-6 bg-muted rounded my-1" />
    <div className="w-9 h-1 bg-muted-foreground/15 rounded-full" />
    <div className="w-7 h-1 bg-muted-foreground/15 rounded-full" />
    <span className="text-[8px] text-muted-foreground text-center leading-tight mt-auto truncate w-full">{name}</span>
  </div>
);

// --- Sortable Card ---
const SortableCard = ({ segment, order }: { segment: PdfSegment; order: number }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: segment.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      className={`gov-card !p-0 overflow-hidden transition-shadow duration-200 ${
        isDragging ? 'shadow-xl ring-2 ring-primary/30 scale-[1.02]' : 'hover:shadow-md'
      }`}
    >
      {/* Order Badge */}
      <div className="relative">
        <div className="absolute top-3 left-3 z-10 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-sm">
          {order}
        </div>
      </div>

      <div className="p-4 pt-3">
        {/* Thumbnail */}
        <div className="mb-3 mx-auto w-24">
          <MiniThumbnail name={segment.name} />
        </div>

        {/* Info */}
        <div className="text-center space-y-1">
          <h4 className="text-sm font-semibold text-foreground leading-tight">{segment.name}</h4>
          <p className="text-xs text-muted-foreground">{segment.pages} {segment.pages === 1 ? 'Page' : 'Pages'}</p>
        </div>

        {/* Drag Handle */}
        <div className="flex justify-center mt-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <GripVertical className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// --- Simulated PDF Page ---
const SimulatedPdfPage = ({ segmentName, pageNum, globalPage, totalPages }: {
  segmentName: string;
  pageNum: number;
  globalPage: number;
  totalPages: number;
}) => (
  <div className="w-[400px] min-h-[400px] bg-card rounded-lg border border-border shadow-md mx-auto flex flex-col">
    {/* Page Header */}
    <div className="text-center pt-6 pb-3 border-b border-border mx-6">
      <p className="text-sm font-semibold text-foreground">{segmentName}</p>
      <p className="text-xs text-muted-foreground">Page {pageNum}</p>
    </div>

    {/* Content Simulation */}
    <div className="flex-1 px-8 py-5 space-y-3">
      {/* Image block */}
      <div className="w-full h-16 bg-muted rounded-md" />
      {/* Text lines */}
      <div className="space-y-2">
        <div className="h-2 bg-muted-foreground/15 rounded-full w-full" />
        <div className="h-2 bg-muted-foreground/12 rounded-full w-11/12" />
        <div className="h-2 bg-muted-foreground/10 rounded-full w-4/5" />
        <div className="h-2 bg-muted-foreground/15 rounded-full w-full" />
        <div className="h-2 bg-muted-foreground/12 rounded-full w-3/4" />
      </div>
      {/* Small blocks */}
      <div className="flex gap-3 pt-2">
        <div className="h-8 w-20 bg-muted rounded" />
        <div className="h-8 w-16 bg-muted rounded" />
      </div>
    </div>

    {/* Footer */}
    <div className="text-center py-3 border-t border-border mx-6">
      <p className="text-xs text-muted-foreground">
        Compiled Page <span className="font-semibold text-foreground">{globalPage}</span> of{' '}
        <span className="font-semibold text-foreground">{totalPages}</span>
      </p>
    </div>
  </div>
);

// --- Override Confirmation Modal ---
const OverrideModal = ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm"
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      className="gov-card max-w-md w-full mx-4 space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-warning" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Override Confirmation</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        You are proceeding despite backend-detected errors. This action confirms you have manually reviewed all flagged documents and accept responsibility for accuracy.
      </p>
      <div className="flex gap-3 justify-end pt-2">
        <button onClick={onCancel} className="gov-btn-secondary">Cancel</button>
        <button onClick={onConfirm} className="gov-btn-primary">Confirm &amp; Proceed</button>
      </div>
    </motion.div>
  </motion.div>
);

// --- Main Component ---
interface Props {
  documents: DocumentItem[];
}

const Step5DocumentReorder = ({ documents: _docs }: Props) => {
  const [segments, setSegments] = useState<PdfSegment[]>(SIMULATED_BACKEND.files);
  const [errors] = useState<DetectedError[]>(SIMULATED_BACKEND.detectedErrors);
  const [errorsReviewed, setErrorsReviewed] = useState(false);
  const [errorsDismissed, setErrorsDismissed] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [phase, setPhase] = useState<'reorder' | 'generating' | 'done'>('reorder');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const totalPages = useMemo(() => segments.reduce((sum, s) => sum + s.pages, 0), [segments]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSegments(items => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleProceedAnyway = () => {
    setShowOverrideModal(true);
  };

  const handleOverrideConfirm = () => {
    setShowOverrideModal(false);
    setErrorsDismissed(true);
  };

  const handleRegenerate = () => {
    setPhase('generating');
    setTimeout(() => setPhase('done'), 3000);
  };

  // Build preview pages
  const previewPages = useMemo(() => {
    const pages: { segmentName: string; pageNum: number; globalPage: number }[] = [];
    let globalPage = 1;
    for (const seg of segments) {
      for (let p = 1; p <= seg.pages; p++) {
        pages.push({ segmentName: seg.name, pageNum: p, globalPage });
        globalPage++;
      }
    }
    return pages;
  }, [segments]);

  // --- DONE STATE ---
  if (phase === 'done') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto text-center py-16 space-y-6">
        <div className="w-24 h-24 mx-auto rounded-full bg-success/10 flex items-center justify-center border-4 border-success/20">
          <ShieldCheck className="w-12 h-12 text-success" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Submission Successful</h2>
          <p className="text-muted-foreground">Case Status: Under Government Review</p>
        </div>
        <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          Official Submission Complete
        </div>
      </motion.div>
    );
  }

  // --- GENERATING STATE ---
  if (phase === 'generating') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium text-foreground">Generating Final Compiled File…</p>
      </motion.div>
    );
  }

  // --- REORDER STATE ---
  const hasErrors = errors.length > 0 && !errorsDismissed;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Override Modal */}
      <AnimatePresence>
        {showOverrideModal && (
          <OverrideModal onConfirm={handleOverrideConfirm} onCancel={() => setShowOverrideModal(false)} />
        )}
      </AnimatePresence>

      {/* 🟥 ERROR PANEL */}
      {hasErrors && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h3 className="text-base font-semibold text-foreground">Backend Document Review Alerts</h3>
          </div>

          <ul className="space-y-2">
            {errors.map(err => (
              <li key={err.id} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                {err.message}
              </li>
            ))}
          </ul>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={errorsReviewed}
              onChange={e => setErrorsReviewed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/30 accent-primary"
            />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              I have manually reviewed the documents and confirm they are correct.
            </span>
          </label>

          <div className="flex gap-3 pt-1">
            <button className="gov-btn-secondary">
              <Upload className="w-4 h-4" /> Re-upload Documents
            </button>
            <button
              onClick={handleProceedAnyway}
              disabled={!errorsReviewed}
              className="gov-btn-primary"
            >
              Proceed to Compile Anyway <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* MAIN SPLIT VIEW */}
      <div className="flex gap-6">
        {/* 🟦 LEFT PANEL – Draggable Cards */}
        <div className="w-[40%] shrink-0 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">Compiled PDF Segments</h3>
            <p className="text-sm text-muted-foreground mt-1">Drag cards to rearrange final compilation order</p>
          </div>

          <div className="max-h-[70vh] overflow-y-auto pr-1 space-y-3">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={segments.map(s => s.id)} strategy={verticalListSortingStrategy}>
                <div className="grid grid-cols-2 gap-3">
                  {segments.map((seg, i) => (
                    <SortableCard key={seg.id} segment={seg} order={i + 1} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          <div className="flex gap-3 pt-2">
            <button className="gov-btn-secondary">
              <Save className="w-4 h-4" /> Save Order
            </button>
            <button onClick={handleRegenerate} className="gov-btn-primary">
              <RefreshCw className="w-4 h-4" /> Regenerate Final PDF
            </button>
          </div>
        </div>

        {/* 🟩 RIGHT PANEL – Scrollable PDF Preview */}
        <div className="flex-1 min-w-0">
          <div className="sticky top-6">
            <div className="gov-card !p-5 space-y-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">Live PDF Preview</h3>
                <p className="text-sm text-muted-foreground mt-1">Scrollable preview reflecting current order</p>
              </div>

              <div className="max-h-[65vh] overflow-y-auto space-y-4 px-1 py-2">
                {previewPages.map((page, idx) => (
                  <motion.div key={`${page.segmentName}-${page.pageNum}`} layout transition={{ duration: 0.3 }}>
                    <SimulatedPdfPage
                      segmentName={page.segmentName}
                      pageNum={page.pageNum}
                      globalPage={page.globalPage}
                      totalPages={totalPages}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Step5DocumentReorder;
