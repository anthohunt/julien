import './TrainingPage.css';

export function TrainingPage() {
  return (
    <div className="training-page">
      <header className="training-page__header">
        <h1 className="training-page__title">Entrainement</h1>
      </header>
      <main className="training-page__content">
        <div className="training-page__placeholder">
          <span className="training-page__placeholder-icon">⚡</span>
          <p>Entrainement de modeles</p>
          <p className="training-page__placeholder-hint">Bientot disponible</p>
        </div>
      </main>
    </div>
  );
}
