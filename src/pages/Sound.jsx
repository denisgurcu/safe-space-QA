import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SoundCard from '../components/SoundCard';
import './Sound.css';

const predefinedCategories = [
    { title: 'Forest', query: 'forest rain, ambient nature sounds' },
    { title: 'Ocean', query: 'calming ocean, beach sounds' },
    { title: 'Rain', query: 'soothing rain, peaceful rain sounds' },
    { title: 'Piano', query: 'soft piano, peaceful piano sounds' },
];

const Sound = () => {
    const [searchQuery, setSearchQuery] = useState('ambient sounds');
    const [searchInput, setSearchInput] = useState('');
    const [sounds, setSounds] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);
    const [backgroundAudio, setBackgroundAudio] = useState(null);
    const [backgroundSound, setBackgroundSound] = useState(null);
    const [textColor, setTextColor] = useState('var(--darkblack)'); // Default text color
    const [textShadow, setTextShadow] = useState('none'); // Default shadow
    
    const navigate = useNavigate();

    useEffect(() => {
        const savedFavorites = JSON.parse(localStorage.getItem('soundFavorites')) || [];
        setFavorites(savedFavorites);
    }, []);

    // Function to determine image brightness
    const getImageBrightness = async (imageUrl) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = imageUrl;

            img.onload = function () {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0, img.width, img.height);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const pixels = imageData.data;
                let totalBrightness = 0;
                let count = 0;

                for (let i = 0; i < pixels.length; i += 4) {
                    const r = pixels[i];
                    const g = pixels[i + 1];
                    const b = pixels[i + 2];
                    const brightness = (r + g + b) / 3;
                    totalBrightness += brightness;
                    count++;
                }

                const avgBrightness = totalBrightness / count;
                resolve(avgBrightness);
            };
        });
    };

    useEffect(() => {
        const savedBackground = localStorage.getItem('breathSelectedBackground');
        if (savedBackground) {
            document.body.style.backgroundImage = `url(${savedBackground})`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundRepeat = 'no-repeat';
            document.body.style.backgroundAttachment = 'fixed';

            // Check brightness and update text color
            getImageBrightness(savedBackground).then((brightness) => {
                if (brightness < 128) {
                    setTextColor('#F8F1E5'); //  Dark background → Soft warm white
                    setTextShadow('2px 2px 6px rgba(0,0,0,0.8)'); // Strong black shadow
                } else {
                    setTextColor('#222222'); //  Bright background → Softer deep black
                    setTextShadow('2px 2px 6px rgba(255,255,255,0.3)'); // Soft white glow
                }
            });
        }

        return () => {
            if (backgroundAudio) {
                backgroundAudio.pause();
                setBackgroundAudio(null);
            }
        };
    }, []);

    const fetchSounds = async (query) => {
        if (!query.trim()) {
            setError('Please enter a search term.');
            return;
        }

        const cachedSounds = localStorage.getItem(`sounds_${query}`);
        if (cachedSounds) {
            setSounds(JSON.parse(cachedSounds));
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get('https://freesound.org/apiv2/search/text/', {
                params: {
                    query,
                    token: 'ztjtIn09cADN5OVNHx7IFDDFY1FCAHNWCDlhgcy6',
                    page_size: 12,
                },
            });

            if (response.data.results?.length) {
                const soundsWithPreviews = await Promise.all(
                    response.data.results.map(async (sound, index) => {
                        const details = await axios.get(`https://freesound.org/apiv2/sounds/${sound.id}/`, {
                            params: {
                                token: 'ztjtIn09cADN5OVNHx7IFDDFY1FCAHNWCDlhgcy6',
                            },
                        });
                        return { ...sound, previews: details.data.previews, cardNumber: index + 1 };
                    })
                );

                setSounds(soundsWithPreviews);
                localStorage.setItem(`sounds_${query}`, JSON.stringify(soundsWithPreviews));
            } else {
                setError('No sounds found for your search term.');
            }
        } catch (error) {
            console.error('Error fetching sounds:', error);
            setError('Failed to fetch sounds. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSounds(searchQuery);
    }, [searchQuery]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchInput.trim() !== '') {
            setSearchQuery(searchInput.trim());
            setActiveCategory(null);
        }
    };

    const toggleFavorite = (sound) => {
        setFavorites((prev) => {
            const updatedFavorites = prev.some((fav) => fav.id === sound.id)
                ? prev.filter((fav) => fav.id !== sound.id)
                : [...prev, sound];

            localStorage.setItem('soundFavorites', JSON.stringify(updatedFavorites));
            return updatedFavorites;
        });
    };

    const handleSetBackgroundSound = (previewUrl) => {
        if (backgroundAudio && backgroundSound === previewUrl) {
            backgroundAudio.pause();
            setBackgroundAudio(null);
            setBackgroundSound(null);
        } else {
            if (backgroundAudio) backgroundAudio.pause();
            const newAudio = new Audio(previewUrl);
            newAudio.loop = true;
            newAudio.play();
            setBackgroundAudio(newAudio);
            setBackgroundSound(previewUrl);
        }
    };
    const handleClearSearch = () => {
        setSearchInput('');
        setSearchQuery('ambient sounds'); // Reset to default search query
        setActiveCategory(null);
        fetchSounds('ambient sounds'); // Fetch default results again
    };
    const handleContinue = () => {
        navigate('/final-page', {
            state: {
                background: localStorage.getItem('breathSelectedBackground'),
                audio: backgroundSound,
            },
        });
    };

    

    return (
        <div className="sound-page">
            <h1 style={{ color: textColor, textShadow: textShadow }}>
                Which sound helps you feel at ease?
            </h1>
            <p style={{ color: textColor, textShadow: textShadow }}>
                Select an audio below to set your background sound, then click continue at the bottom!
            </p>
            <form className="search-bar" onSubmit={handleSearchSubmit}>
                <div className="search-input-wrapper">
                    <input
                        type="text"
                        placeholder="Search for a sound (e.g., waterfall, wind, flute...)"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                    {searchInput && (
                        <button type="button" className="clear-btn" onClick={handleClearSearch}>X</button>
                    )}
                </div>
                <button type="submit">Search</button>
            </form>

            <div className="categories">
                {predefinedCategories.map((category) => (
                    <button
                        key={category.title}
                        className={`category-btn ${activeCategory === category.title ? 'active' : ''}`}
                        onClick={() => {
                            setActiveCategory(category.title);
                            setSearchQuery(category.query);
                        }}
                    >
                        {category.title}
                    </button>
                ))}
                <button className="favorites-btn" onClick={() => navigate('/favs')}>
                    Favorites
                </button>
            </div>

            {error && <p className="error-message">{error}</p>}
            {loading && <div className="spinner"></div>}

            <div className="sound-results">
                {!loading && sounds.map((sound) => (
                    <SoundCard
                        key={sound.id}
                        sound={sound}
                        isFavorite={favorites.some((fav) => fav.id === sound.id)}
                        handleFavClick={toggleFavorite}
                        handleSetBackground={handleSetBackgroundSound}
                        isBackground={backgroundSound === sound.previews?.['preview-hq-mp3']}
                        cardNumber={sound.cardNumber}
                    />
                ))}
            </div>

            <div className="continue-btn-wrapper">
                <button className="continue-btn" onClick={handleContinue}>
                    Continue
                </button>
            </div>
        </div>
    );
};

export default Sound;
