import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    const location = useLocation();
    const isHome = location.pathname === '/';

    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // If scrolled down more than 50px from top, hide it. If scrolling up, show it.
            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                setIsVisible(false);
            } else if (currentScrollY < lastScrollY) {
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <header className={`navbar ${!isVisible ? 'hidden' : ''}`}>
            <Link to="/" className="navbar-logo">
                <img src="/logo.png" alt="PopVibe Studio" className="navbar-logo-img" />
            </Link>
            <nav className="navbar-links text-uppercase">
                <a href={isHome ? "#about" : "/#about"}>About</a>
                <a href={isHome ? "#work" : "/#work"}>Work</a>
                <a href="#contact">Contact</a>
            </nav>
        </header>
    );
}

export default Navbar;
