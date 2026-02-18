import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, FileText, Save, RefreshCw, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { DocumentItem } from './types';

interface Props {
  documents: DocumentItem[];
}

const SortableItem = ({ doc }: { doc: DocumentItem }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: doc.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`gov-card !p-3 flex items-center gap-3 ${isDragging ? 'shadow-lg ring-2 ring-primary/20 z-10' : ''}`}
    >
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
        <GripVertical className="w-4 h-4" />
      </button>
      <FileText className="w-4 h-4 text-primary shrink-0" />
      <span className="text-sm font-medium text-foreground truncate">{doc.name}</span>
      {doc.mandatory && <span className="gov-badge-mandatory ml-auto">Mandatory</span>}
    </div>
  );
};

const Step5DocumentReorder = ({ documents: initialDocs }: Props) => {
  const [documents, setDocuments] = useState(initialDocs.filter(d => d.status !== 'pending'));
  const [phase, setPhase] = useState<'reorder' | 'generating' | 'done'>('reorder');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setDocuments(items => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleRegenerate = () => {
    setPhase('generating');
    setTimeout(() => setPhase('done'), 3000);
  };

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

  if (phase === 'generating') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium text-foreground">Generating Final Compiled File…</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex gap-6">
      {/* Left: Draggable List */}
      <div className="flex-1 space-y-4">
        <h3 className="text-base font-semibold text-foreground">Arrange Document Order</h3>
        <p className="text-sm text-muted-foreground">Drag documents to reorder them in the final compiled PDF.</p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={documents.map(d => d.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {documents.map(doc => (
                <SortableItem key={doc.id} doc={doc} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <div className="flex gap-3 pt-4">
          <button className="gov-btn-secondary">
            <Save className="w-4 h-4" /> Save Order
          </button>
          <button onClick={handleRegenerate} className="gov-btn-primary">
            <RefreshCw className="w-4 h-4" /> Regenerate Final PDF
          </button>
        </div>
      </div>

      {/* Right: Preview Placeholder */}
      <div className="hidden lg:block w-80 shrink-0">
        <div className="sticky top-6 gov-card space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Live Preview</h3>
          <div className="space-y-2">
            {documents.map((doc, i) => (
              <div key={doc.id} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                <span className="text-xs font-mono text-muted-foreground w-5">{i + 1}.</span>
                <span className="text-xs text-foreground truncate">{doc.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Step5DocumentReorder;
