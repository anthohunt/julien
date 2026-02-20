import '../projects/Modal.css';

interface DeleteDatasetModalProps {
  isOpen: boolean;
  datasetName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteDatasetModal({ isOpen, datasetName, onClose, onConfirm }: DeleteDatasetModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal__title">Supprimer le dataset</h2>
        <p className="modal__text">
          Voulez-vous vraiment supprimer <strong>{datasetName}</strong> ? Cette action est irreversible.
        </p>
        <div className="modal__actions">
          <button className="modal__btn modal__btn--secondary" onClick={onClose}>
            Annuler
          </button>
          <button
            className="modal__btn modal__btn--danger"
            aria-label="Supprimer"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
