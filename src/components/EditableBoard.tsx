import React, { useState, useEffect, useRef } from 'react';
import { GripVertical } from 'lucide-react';

export interface BoardWidget {
  id: string;
  colSpan: number; // 3..12 on 12-col grid
  heightPx: number; // custom height in px
  content: React.ReactNode;
}

interface SavedLayout {
  order: string[];
  sizes: Record<string, { colSpan: number; heightPx: number }>;
}

interface EditableBoardProps {
  boardKey: string;
  widgets: BoardWidget[];
  editMode: boolean;
  resetSignal: number;
}

export const EditableBoard: React.FC<EditableBoardProps> = ({
  boardKey,
  widgets,
  editMode,
  resetSignal,
}) => {
  const storageKey = `crimsonpulse-layout-${boardKey}`;

  const [layout, setLayout] = useState<SavedLayout>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw) as SavedLayout;
    } catch {
      // ignore storage errors
    }
    return {
      order: widgets.map((w) => w.id),
      sizes: Object.fromEntries(
        widgets.map((w) => [w.id, { colSpan: w.colSpan, heightPx: w.heightPx }])
      ),
    };
  });

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Reset layout when requested
  useEffect(() => {
    if (resetSignal === 0) return;
    const fresh: SavedLayout = {
      order: widgets.map((w) => w.id),
      sizes: Object.fromEntries(
        widgets.map((w) => [w.id, { colSpan: w.colSpan, heightPx: w.heightPx }])
      ),
    };
    setLayout(fresh);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }, [resetSignal]);

  // Persist layout changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(layout));
    } catch {
      // ignore
    }
  }, [layout, storageKey]);

  const orderedWidgets = [...widgets].sort((a, b) => {
    const ia = layout.order.indexOf(a.id);
    const ib = layout.order.indexOf(b.id);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }
    setLayout((prev) => {
      const currentOrder = prev.order.length ? [...prev.order] : widgets.map((w) => w.id);
      const fromIdx = currentOrder.indexOf(draggedId);
      const toIdx = currentOrder.indexOf(targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const [moved] = currentOrder.splice(fromIdx, 1);
      currentOrder.splice(toIdx, 0, moved);
      return { ...prev, order: currentOrder };
    });
    setDraggedId(null);
    setDragOverId(null);
  };

  const startResize = (
    e: React.PointerEvent<HTMLDivElement>,
    id: string,
    initSpan: number,
    initHeight: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const gridWidth = gridRef.current?.clientWidth || 1200;
    const colWidth = gridWidth / 12;

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const spanDelta = Math.round(dx / colWidth);
      const nextSpan = Math.min(12, Math.max(3, initSpan + spanDelta));
      const nextHeight = Math.min(540, Math.max(105, Math.round(initHeight + dy)));

      setLayout((prev) => ({
        ...prev,
        sizes: {
          ...prev.sizes,
          [id]: { colSpan: nextSpan, heightPx: nextHeight },
        },
      }));
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <div
      ref={gridRef}
      className="flex-1 min-h-0 grid grid-cols-12 gap-3 content-start overflow-y-auto pr-0.5"
    >
      {orderedWidgets.map((w) => {
        const size = layout.sizes[w.id] ?? { colSpan: w.colSpan, heightPx: w.heightPx };
        const isOver = dragOverId === w.id && draggedId !== w.id;

        return (
          <div
            key={w.id}
            draggable={editMode}
            onDragStart={(e) => {
              if (!editMode) return;
              setDraggedId(w.id);
              e.dataTransfer.effectAllowed = 'move';
            }}
            onDragOver={(e) => {
              if (!editMode) return;
              e.preventDefault();
              setDragOverId(w.id);
            }}
            onDragLeave={() => setDragOverId(null)}
            onDrop={(e) => {
              if (!editMode) return;
              e.preventDefault();
              handleDrop(w.id);
            }}
            onDragEnd={() => {
              setDraggedId(null);
              setDragOverId(null);
            }}
            style={{
              gridColumn: `span ${size.colSpan} / span ${size.colSpan}`,
              height: `${size.heightPx}px`,
            }}
            className={`relative min-h-0 flex flex-col transition-shadow ${
              editMode
                ? 'ring-1 ring-dashed ring-[#6B0F1A]/45 rounded-3xl cursor-grab active:cursor-grabbing'
                : ''
            } ${isOver ? 'ring-2 ring-[#6B0F1A] scale-[0.99]' : ''}`}
          >
            {/* Drag Handle (only visible in Edit Layout mode, ignored in snapshots) */}
            {editMode && (
              <div
                data-snapshot-ignore="true"
                className="absolute right-3 top-2.5 z-20 flex items-center gap-1 rounded-full bg-[#26060B] text-white px-2 py-0.5 text-[10px] font-semibold shadow cursor-grab"
                title="Drag card to reorder"
              >
                <GripVertical className="h-3 w-3" />
                <span>{size.colSpan}/12</span>
              </div>
            )}

            <div className="flex-1 min-h-0 flex flex-col [&>*]:flex-1 [&>*]:min-h-0">
              {w.content}
            </div>

            {/* Bottom-right Resize Handle (only visible in Edit Layout mode) */}
            {editMode && (
              <div
                data-snapshot-ignore="true"
                onPointerDown={(e) => startResize(e, w.id, size.colSpan, size.heightPx)}
                title="Drag corner to resize width & height"
                className="absolute right-1.5 bottom-1.5 z-20 h-4 w-4 cursor-nwse-resize flex items-end justify-end p-0.5 text-[#6B0F1A]"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" className="opacity-80">
                  <path
                    d="M9 1L1 9M9 5L5 9"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
