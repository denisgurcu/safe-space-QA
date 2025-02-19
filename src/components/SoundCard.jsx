import React, { useState, useRef, useEffect } from 'react';
import IonIcon from '@reacticons/ionicons';
import './SoundCard.css';

const SoundCard = ({ sound, isFavorite, handleFavClick, handleSetBackground, handleDetailsClick, cardNumber, isBackground }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [remainingTime, setRemainingTime] = useState("00:00"); // Countdown Time
    const audioRef = useRef(null);

    // Toggle Play/Pause
    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch((error) => console.error("Playback failed", error));
        }
        setIsPlaying(!isPlaying);
    };

    // Update Progress & Remaining Time
    const updateProgress = () => {
        if (audioRef.current) {
            const currentTime = audioRef.current.currentTime;
            const duration = audioRef.current.duration;
            if (duration > 0 && !isNaN(duration)) {
                setProgress((currentTime / duration) * 100);
                const timeLeft = duration - currentTime;
                setRemainingTime(formatTime(timeLeft));
            }
        }
    };

    // Format time in mm:ss
    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // Handle Volume Change
    const handleVolumeChange = (newVolume) => {
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };

    // Attach Event Listeners on Mount
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.addEventListener('timeupdate', updateProgress);
            audioRef.current.volume = volume;
        }
        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener('timeupdate', updateProgress);
            }
        };
    }, []);

    return (
        <div className="sound-card">
            {/* Header - Number, Heart, Info */}
            <div className="sound-card-header">
                <span className="sound-card-number">[{cardNumber}]</span>
                <div className="sound-card-actions">
                    <button className={`sound-heart-icon ${isFavorite ? 'favorited' : ''}`} onClick={() => handleFavClick(sound)}>
                        <IonIcon name="heart" />
                    </button>
                </div>
            </div>

            {/* Custom Audio Player */}
            <div className="sound-audio-container">
                <button className="sound-play-button" onClick={togglePlay}>
                    <IonIcon name={isPlaying ? "pause" : "play"} />
                </button>
                <div className="sound-progress-bar">
                    <div className="sound-progress" style={{ width: `${progress}%` }}></div>
                </div>
                {/* Styled Remaining Time */}
                <span className="sound-time">{remainingTime}</span>
                <audio ref={audioRef}>
                    {sound.previews && sound.previews['preview-hq-mp3'] && (
                        <source src={sound.previews['preview-hq-mp3']} type="audio/mp3" />
                    )}
                    Your browser does not support the audio element.
                </audio>
            </div>

            {/* Volume Bar Indicator */}
            <div className="sound-volume-container">
                <div className="sound-volume-bars">
                    {[...Array(10)].map((_, i) => (
                        <div
                            key={i}
                            className={`sound-volume-bar ${i < Math.round(volume * 10) ? 'active' : ''}`}
                            style={{ height: `${4 + i * 3}px` }} // Gradually increasing height
                            onClick={() => handleVolumeChange((i + 1) / 10)}
                        ></div>
                    ))}
                </div>
            </div>

            {/* Song Name at the Bottom */}
            <div className="sound-info">
                <span className="sound-name">{sound.name}</span>
            </div>

            {/* Set as Background Button */}
            <div className="sound-button-container">
                <button className={`sound-set-bg-btn ${isBackground ? 'playing' : ''}`} onClick={() => handleSetBackground(sound.previews?.['preview-hq-mp3'] || '')}>
                    {isBackground ? 'Stop Background' : 'Set as Background'}
                </button>
            </div>
        </div>
    );
};

export default SoundCard;
