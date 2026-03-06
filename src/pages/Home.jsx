import { projectsData } from '../data/projects';
import ProjectCard from '../components/ProjectCard';
import './Home.css';

function Home() {
    return (
        <div className="home-page">


            {/* About Section */}
            <section id="about" className="about-section container animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="about-content">
                    <h2 className="text-bold text-uppercase">About</h2>
                    <div className="about-text">
                        <p>
                            I am Bruce, a Project Manager with extensive experience in managing retail and pop-up store projects, specializing in exhibitions, store installations, and beauty counter setups. I have a strong track record of coordinating cross-functional teams, managing timelines, and delivering projects that meet client expectations with high quality and efficiency.
                        </p>
                        <br />
                        <p>
                            My expertise lies in project planning, client communication, and on-site execution, ensuring smooth operations from concept to completion. I am committed to leveraging my skills to drive successful project outcomes and contribute to business growth.
                        </p>
                    </div>
                </div>
            </section>

            {/* Projects Grid Section */}
            <section id="work" className="work-section container animate-fade-in" style={{ animationDelay: '0.2s', opacity: 0 }}>
                <div className="projects-grid">
                    {projectsData.map(project => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            </section>
        </div>
    );
}

export default Home;
