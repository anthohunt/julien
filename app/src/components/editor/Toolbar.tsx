import { useNetworkStore } from '@/stores/networkStore';
import './Toolbar.css';

export function Toolbar() {
  const undo = useNetworkStore((s) => s.undo);
  const redo = useNetworkStore((s) => s.redo);
  const canUndo = useNetworkStore((s) => s.canUndo);
  const canRedo = useNetworkStore((s) => s.canRedo);
  const exportJSON = useNetworkStore((s) => s.exportJSON);

  const handleExport = () => {
    const json = exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'architecture.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="toolbar" data-testid="toolbar">
      <div className="toolbar__group">
        <button
          className="toolbar__btn"
          onClick={undo}
          disabled={!canUndo()}
          aria-label="Undo"
          title="Annuler (Ctrl+Z)"
        >
          ↶ Undo
        </button>
        <button
          className="toolbar__btn"
          onClick={redo}
          disabled={!canRedo()}
          aria-label="Redo"
          title="Rétablir (Ctrl+Y)"
        >
          ↷ Redo
        </button>
      </div>
      <div className="toolbar__group">
        <button className="toolbar__btn toolbar__btn--accent" onClick={handleExport} aria-label="Export JSON">
          Export JSON
        </button>
      </div>
    </div>
  );
}
