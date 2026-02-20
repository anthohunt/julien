import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { load } from '@tauri-apps/plugin-store';
import { useNetworkStore } from '@/stores/networkStore';
import './Toolbar.css';

export function Toolbar() {
  const undo = useNetworkStore((s) => s.undo);
  const redo = useNetworkStore((s) => s.redo);
  const canUndo = useNetworkStore((s) => s.canUndo);
  const canRedo = useNetworkStore((s) => s.canRedo);
  const exportJSON = useNetworkStore((s) => s.exportJSON);
  const [searchParams] = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);

  const projectId = searchParams.get('project');

  const handleSave = useCallback(async () => {
    if (!projectId || saving) return;
    setSaving(true);
    try {
      const json = exportJSON();
      const store = await load(`project-${projectId}.json`);
      await store.set('architecture', JSON.parse(json));
      await store.save();
      setSaveFlash(true);
      setTimeout(() => setSaveFlash(false), 1200);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }, [projectId, exportJSON, saving]);

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
        <button
          className={`toolbar__btn toolbar__btn--save${saveFlash ? ' toolbar__btn--saved' : ''}`}
          onClick={handleSave}
          disabled={!projectId || saving}
          aria-label="Save"
          title="Sauvegarder (Ctrl+S)"
        >
          {saving ? 'Saving...' : saveFlash ? 'Saved!' : 'Save'}
        </button>
        <button className="toolbar__btn toolbar__btn--accent" onClick={handleExport} aria-label="Export JSON">
          Export JSON
        </button>
      </div>
    </div>
  );
}
