import { useState, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import { SplashScreen } from '@/components/SplashScreen';
import { ProjectsPage } from '@/components/projects/ProjectsPage';
import { ProjectLayout } from '@/components/layout/ProjectLayout';
import { NetworkEditor } from '@/components/editor/NetworkEditor';
import { DataManagementPage } from '@/components/data/DataManagementPage';
import { TrainingPage } from '@/components/training/TrainingPage';
import { PredictionsPage } from '@/components/predictions/PredictionsPage';

function App() {
  const [ready, setReady] = useState(false);
  const handleReady = useCallback(() => setReady(true), []);

  if (!ready) {
    return <SplashScreen onReady={handleReady} />;
  }

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<ProjectsPage />} />
        <Route element={<ProjectLayout />}>
          <Route
            path="/editor"
            element={
              <ReactFlowProvider>
                <NetworkEditor />
              </ReactFlowProvider>
            }
          />
          <Route path="/data" element={<DataManagementPage />} />
          <Route path="/training" element={<TrainingPage />} />
          <Route path="/predictions" element={<PredictionsPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
