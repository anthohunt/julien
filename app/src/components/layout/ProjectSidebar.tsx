import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useProjectStore } from '@/stores/projectStore';
import './ProjectSidebar.css';

const NAV_ITEMS = [
  { path: '/editor', label: 'Editeur Reseau', icon: '⬡' },
  { path: '/data', label: 'Donnees', icon: '📊' },
  { path: '/training', label: 'Entrainement', icon: '⚡' },
  { path: '/predictions', label: 'Predictions', icon: '🎯' },
];

export function ProjectSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const projects = useProjectStore((s) => s.projects);
  const project = projects.find((p) => p.id === projectId);

  return (
    <aside className="project-sidebar" data-testid="project-sidebar">
      <button
        className="project-sidebar__back"
        onClick={() => navigate('/')}
      >
        ← Projets
      </button>

      <div className="project-sidebar__project-name">
        {project?.name ?? 'Projet'}
      </div>

      <nav className="project-sidebar__nav">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              className={`project-sidebar__link${isActive ? ' project-sidebar__link--active' : ''}`}
              onClick={() => navigate(`${item.path}?project=${projectId ?? ''}`)}
            >
              <span className="project-sidebar__icon">{item.icon}</span>
              <span className="project-sidebar__label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
