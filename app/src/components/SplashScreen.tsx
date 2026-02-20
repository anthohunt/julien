import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './SplashScreen.css';

interface ModelStatus {
  ready: boolean;
  backend: string;
}

interface SplashScreenProps {
  onReady: () => void;
}

export function SplashScreen({ onReady }: SplashScreenProps) {
  const [status, setStatus] = useState<string>('Connecting to backend...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 5;

    async function checkBackend() {
      while (attempts < maxAttempts && !cancelled) {
        try {
          const result = await invoke<ModelStatus>('get_model_status');
          if (cancelled) return;
          if (result.ready) {
            setStatus(`Backend ready (${result.backend})`);
            setTimeout(() => {
              if (!cancelled) onReady();
            }, 400);
            return;
          }
          setStatus('Model not initialized yet, starting initialization...');
        } catch (err) {
          attempts++;
          if (attempts >= maxAttempts) {
            setError(`Failed to connect to backend: ${err}`);
            return;
          }
          setStatus(`Retrying connection (${attempts}/${maxAttempts})...`);
        }
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    checkBackend();
    return () => { cancelled = true; };
  }, [onReady]);

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <h1 className="splash-title">NeuralForge</h1>
        <p className="splash-subtitle">Visual Neural Network Builder</p>
        {error ? (
          <div className="splash-error">
            <p className="splash-error-title">Initialization Error</p>
            <p>{error}</p>
          </div>
        ) : (
          <div className="splash-loader">
            <div className="splash-spinner" />
            <p className="splash-status">{status}</p>
          </div>
        )}
      </div>
    </div>
  );
}
