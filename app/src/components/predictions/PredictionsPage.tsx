import './PredictionsPage.css';

export function PredictionsPage() {
  return (
    <div className="predictions-page">
      <header className="predictions-page__header">
        <h1 className="predictions-page__title">Predictions</h1>
      </header>
      <main className="predictions-page__content">
        <div className="predictions-page__placeholder">
          <span className="predictions-page__placeholder-icon">🎯</span>
          <p>Predictions et inference</p>
          <p className="predictions-page__placeholder-hint">Bientot disponible</p>
        </div>
      </main>
    </div>
  );
}
