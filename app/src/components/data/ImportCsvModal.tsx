import { useState, useCallback } from 'react';
import '../projects/Modal.css';
import './ImportCsvModal.css';

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (fileName: string, content: string) => void;
}

export function ImportCsvModal({ isOpen, onClose, onImport }: ImportCsvModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      setError(null);

      const file = e.dataTransfer.files[0];
      if (!file) return;

      if (!file.name.endsWith('.csv')) {
        setError('CSV uniquement');
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        onImport(file.name, content);
      };
      reader.readAsText(file);
    },
    [onImport]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragActive(false);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal__title">Importer un fichier CSV</h2>

        <div
          data-testid="drop-zone"
          className={`drop-zone ${dragActive ? 'drop-zone--active' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <p className="drop-zone__text">Glissez-deposez un fichier CSV ici</p>
          <p className="drop-zone__hint">Format attendu : id, unique_id, ds, y</p>
        </div>

        {error && <p className="import-error">{error}</p>}

        <div className="modal__actions">
          <button className="modal__btn modal__btn--secondary" onClick={onClose}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
