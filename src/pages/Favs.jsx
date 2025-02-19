import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import ImageCard from '../components/ImageCard';
import SoundCard from '../components/SoundCard';
import './Favs.css';

const Favs = () => {
    const { selectedImage, setSelectedImage } = useOutletContext(); // Use shared state
    const [activeTab, setActiveTab] = useState('images');
    const [favoriteImages, setFavoriteImages] = useState([]);
    const [favoriteSounds, setFavoriteSounds] = useState([]);
    const [textColor, setTextColor] = useState('var(--darkblack)'); // Default text color
    const [textShadow, setTextShadow] = useState('none'); // Default: no shadow
    const navigate = useNavigate();

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

    //  Remove image from favorites
    const handleRemoveFavoriteImage = (imageId) => {
        const updatedFavorites = favoriteImages.filter(image => image.id !== imageId);
        setFavoriteImages(updatedFavorites);
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    };

    // Remove sound from favorites
    const handleRemoveFavoriteSound = (soundId) => {
        const updatedFavorites = favoriteSounds.filter(sound => sound.id !== soundId);
        setFavoriteSounds(updatedFavorites);
        localStorage.setItem('soundFavorites', JSON.stringify(updatedFavorites));
    };

    //  Load favorites from localStorage on mount
    useEffect(() => {
        const savedImages = JSON.parse(localStorage.getItem('favorites')) || [];
        const savedSounds = JSON.parse(localStorage.getItem('soundFavorites')) || [];
        setFavoriteImages(savedImages);
        setFavoriteSounds(savedSounds);
    }, []);

    const handleSetBackground = (imageUrl) => {
        setSelectedImage(imageUrl); //  Updates global state in `Layout.jsx`
        localStorage.setItem('breathSelectedBackground', imageUrl); // Store globally

        //  Apply background instantly
        document.body.style.backgroundImage = `url(${imageUrl})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundAttachment = 'fixed';

        // Dynamically adjust text color
        getImageBrightness(imageUrl).then((brightness) => {
            if (brightness < 128) {
                setTextColor('#F8F1E5');
                setTextShadow('2px 2px 6px rgba(0,0,0,0.8)');
            } else {
                setTextColor('#222222');
                setTextShadow('2px 2px 6px rgba(255,255,255,0.3)');
            }
        });
    };

    //  Ensure background updates when selectedImage changes
    useEffect(() => {
        const savedBackground = localStorage.getItem('breathSelectedBackground');

        if (selectedImage) {
            document.body.style.backgroundImage = `url(${selectedImage})`;
        } else if (savedBackground) {
            document.body.style.backgroundImage = `url(${savedBackground})`;
        } else {
            document.body.style.backgroundImage = 'none';
        }

        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundAttachment = 'fixed';

    }, [selectedImage]); //  Ensure useEffect triggers when background changes

    const handleDetailsClick = (image) => {
        navigate('/details', {
            state: {
                image: {
                    ...image,
                    src: {
                        ...image.src,
                        large: image.src.original, // Ensure original image is passed
                    }
                },
                favorites: favoriteImages //  Pass current favorites
            }
        });
    };


    return (
        <div className="favorites-page">
            <h1 style={{ color: textColor, textShadow: textShadow }}>Your Favorites</h1>

            {/* Category Toggle */}
            <div className="fav-category-toggle">
                <button
                    className={`fav-toggle-btn ${activeTab === 'images' ? 'active' : ''}`}
                    onClick={() => setActiveTab('images')}
                >
                    Images
                </button>
                <button
                    className={`fav-toggle-btn ${activeTab === 'sounds' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sounds')}
                >
                    Sounds
                </button>
            </div>

            {/* Images Favorites */}
            {activeTab === 'images' && (
                <>
                    {favoriteImages.length > 0 ? (
                        <div className="favorites-grid">
                            {favoriteImages.map((image, index) => (
                                <ImageCard
                                    key={image.id}
                                    image={image}
                                    isFavorite={true}
                                    handleFavClick={() => handleRemoveFavoriteImage(image.id)} //  Remove favorite
                                    handleSetBackground={() => handleSetBackground(image.src.original)} //  Update background
                                    handleDetailsClick={() => handleDetailsClick(image)} //  Open image details
                                    isDetailsPage={location.pathname === '/details'}
                                    cardNumber={index + 1}
                                />

                            ))}
                        </div>
                    ) : (
                        <p className="no-favorites-message" style={{ color: textColor, textShadow: textShadow }}>
                            No favorite images yet!
                        </p>
                    )}
                </>
            )}

            {/* Sounds Favorites */}
            {activeTab === 'sounds' && (
                <>
                    {favoriteSounds.length > 0 ? (
                        <div className="favorites-grid">
                            {favoriteSounds.map((sound, index) => (
                                <SoundCard
                                    key={sound.id}
                                    sound={sound}
                                    isFavorite={true}
                                    handleFavClick={() => handleRemoveFavoriteSound(sound.id)} //  Remove favorite
                                    cardNumber={index + 1} //  Pass card number
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="no-favorites-message" style={{ color: textColor, textShadow: textShadow }}>
                            No favorite sounds yet!
                        </p>
                    )}
                </>
            )}
        </div>
    );
};

export default Favs;
