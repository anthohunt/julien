import { useState, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import { SplashScreen } from '@/components/SplashScreen';
import { ProjectsPage } from '@/components/projects/ProjectsPage';
import { NetworkEditor } from '@/components/editor/NetworkEditor';

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
        <Route
          path="/editor"
          element={
            <ReactFlowProvider>
              <NetworkEditor />
            </ReactFlowProvider>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
