import { Outlet } from 'react-router-dom';
import { ProjectSidebar } from './ProjectSidebar';
import './ProjectLayout.css';

export function ProjectLayout() {
  return (
    <div className="project-layout">
      <ProjectSidebar />
      <div className="project-layout__content">
        <Outlet />
      </div>
    </div>
  );
}
