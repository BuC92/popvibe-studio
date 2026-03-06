import { useParams, Navigate } from 'react-router-dom';
import { projectsData } from '../data/projects';
import './ProjectDetail.css';

function ProjectDetail() {
    const { id } = useParams();
    const project = projectsData.find(p => p.id === id);

    if (!project) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="project-detail-page animate-fade-in" style={{ opacity: 0 }}>
            <div className="container project-layout">

                {/* Left Side: Images Grid */}
                <div className="project-images">
                    {project.heroImage ? (
                        <img src={project.heroImage} alt={`${project.title} Hero`} className="detail-hero-image" />
                    ) : (
                        <div className="detail-hero-image image-placeholder" style={{ backgroundColor: '#f5f5f5' }}></div>
                    )}
                    {project.images && project.images.map((img, idx) => (
                        <img key={idx} src={img} alt={`${project.title} Setup ${idx + 1}`} className="detail-gallery-image" />
                    ))}
                </div>

                {/* Right Side: Information Panel */}
                <div className="project-info-sidebar">
                    <div className="project-header">
                        <h1 className="project-detail-title text-bold">{project.category}</h1>
                        <h2 className="project-detail-subtitle text-uppercase text-muted">{project.title}</h2>
                    </div>

                    <table className="project-meta-table">
                        <tbody>
                            <tr>
                                <td className="meta-label">Brand</td>
                                <td className="meta-value text-bold">{project.brand}</td>
                            </tr>
                            <tr>
                                <td className="meta-label">Location</td>
                                <td className="meta-value text-bold">{project.location}</td>
                            </tr>
                            <tr>
                                <td className="meta-label">Date</td>
                                <td className="meta-value text-bold">{project.date}</td>
                            </tr>
                            <tr>
                                <td className="meta-label">Market</td>
                                <td className="meta-value text-bold">{project.market}</td>
                            </tr>
                            <tr>
                                <td className="meta-label">Role</td>
                                <td className="meta-value text-bold">{project.role}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="project-description">
                        <p>{project.description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProjectDetail;
