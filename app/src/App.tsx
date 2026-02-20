import { Routes, Route } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import { ProjectsPage } from '@/components/projects/ProjectsPage';
import { NetworkEditor } from '@/components/editor/NetworkEditor';

function App() {
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
