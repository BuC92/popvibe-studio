import './Footer.css';

function Footer() {
    return (
        <footer id="contact" className="footer container">
            <div className="footer-content">
                <h2 className="text-bold text-uppercase">Contact</h2>
                <a href="mailto:popvibepv@gmail.com" className="footer-link">popvibepv@gmail.com</a>
                <a href="tel:+85267321992" className="footer-link">+852 6732 1992</a>
            </div>
            <div className="footer-bottom text-muted text-uppercase">
                <span>© {new Date().getFullYear()} PopVibe Studio. All rights reserved.</span>
                <span>Hong Kong</span>
            </div>
        </footer>
    );
}

export default Footer;
