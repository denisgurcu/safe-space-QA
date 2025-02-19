    import React, { useState, useEffect } from 'react';
    import { NavLink, useNavigate, useLocation } from 'react-router-dom';
    import './Header.css';

    const Header = ({ selectedImage }) => {
        const [isOpen, setIsOpen] = useState(false);
        const [textColor, setTextColor] = useState('var(--darkblack)'); // Default text color
        const [textShadow, setTextShadow] = useState('none'); // Default: no shadow
        const navigate = useNavigate();
        const location = useLocation();

        const toggleMenu = () => {
            setIsOpen(!isOpen);
        };

        // Check if the current page is the homepage
        const isHomePage = location.pathname === "/";

        // Function to analyze image brightness
        const getImageBrightness = async (imageUrl) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = "Anonymous";
                img.src = imageUrl;

                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0, img.width, img.height);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    let totalBrightness = 0;
                    const pixels = imageData.data;

                    for (let i = 0; i < pixels.length; i += 4) {
                        const r = pixels[i];
                        const g = pixels[i + 1];
                        const b = pixels[i + 2];
                        totalBrightness += (r + g + b) / 3;
                    }

                    const averageBrightness = totalBrightness / (pixels.length / 4);
                    resolve(averageBrightness);
                };
            });
        };

        useEffect(() => {
            if (selectedImage && !isHomePage) { //  Only update if NOT on the home page
                getImageBrightness(selectedImage).then((brightness) => {
                    if (brightness < 128) {
                        setTextColor('#F8F1E5'); //  Dark background → Soft warm white
                        setTextShadow('2px 2px 6px rgba(0,0,0,0.8)'); // Strong black shadow
                    } else {
                        setTextColor('#222222'); //  Bright background → Softer deep black
                        setTextShadow('2px 2px 6px rgba(255,255,255,0.3)'); // Soft white glow
                    }
                });
            } else {
                setTextColor('var(--darkblack)'); //  Reset to default color on home page
                setTextShadow('none'); //  Reset shadow
            }
        }, [selectedImage, isHomePage]);

        return (
            <>
                <header className="header">
                    {/* Show Back button only if NOT on home page */}
                    {!isHomePage && (
                        <button
                            className="menu-item-back"
                            onClick={() => navigate(-1)}
                            style={{ 
                                color: textColor, // Back button changes based on background
                                textShadow: textShadow 
                            }}
                        >
                            [BACK]
                        </button>
                    )}
                    {isHomePage && <div className="menu-item-back-placeholder"></div>}

                    {/* Always keep the hamburger menu centered */}
                    <div className="menu-item center" onClick={toggleMenu}>
                        <div className={`hamburger ${isOpen ? 'open' : ''}`}>
                            {/* Reset to default black on home page */}
                            <span style={{ backgroundColor: isHomePage ? 'var(--darkblack)' : textColor }}></span>
                            <span style={{ backgroundColor: isHomePage ? 'var(--darkblack)' : textColor }}></span>
                            <span style={{ backgroundColor: isHomePage ? 'var(--darkblack)' : textColor }}></span>

                            {/* Expanding Bubble */}
                            <div className={`menu-items-container ${isOpen ? 'visible' : ''}`}>
                                <ul className="menu-items">
                                <li><NavLink to="/" onClick={toggleMenu} className="menu-link">Home</NavLink></li>
                                <li><NavLink to="/breath" onClick={toggleMenu} className="menu-link">A Breath of Fresh Air</NavLink></li>
                                <li><NavLink to="/coming-soon" onClick={toggleMenu} className="menu-link">The Mood Cupid</NavLink></li>
                                <li><NavLink to="/coming-soon" onClick={toggleMenu} className="menu-link">Did You Mean...?</NavLink></li>
                                <li><NavLink to="/favs" onClick={toggleMenu} className="menu-link">Favorites</NavLink></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Show Home button only if NOT on home page */}
                    {!isHomePage && (
                        <NavLink
                            to="/"
                            className="menu-item"
                            style={{ 
                                color: textColor, // Home button changes based on background
                                textShadow: textShadow 
                            }}
                        >
                            [HOME]
                        </NavLink>
                    )}
                    {isHomePage && <div className="menu-item-placeholder"></div>}
                </header>
            </>
        );
    };

    export default Header;
