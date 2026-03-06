import { Link } from 'react-router-dom';
import './ProjectCard.css';

function ProjectCard({ project }) {
    return (
        <Link to={`/project/${project.id}`} className="project-card">
            <div className="project-card-image">
                {project.thumbnail ? (
                    <img src={project.thumbnail} alt={project.title} loading="lazy" />
                ) : (
                    <div className="image-placeholder"></div>
                )}
            </div>
            <div className="project-card-info">
                <span className="project-category text-muted text-uppercase">{project.category}</span>
                <h3 className="project-title">{project.title}</h3>

                {/* Brand and Location display added */}
                <div className="project-card-meta text-muted">
                    {project.brand && <span className="project-brand">{project.brand}</span>}
                    {project.brand && project.location && <span className="meta-separator"> | </span>}
                    {project.location && <span className="project-location">{project.location}</span>}
                </div>
            </div>
        </Link>
    );
}

export default ProjectCard;
