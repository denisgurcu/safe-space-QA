import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./FinalPage.css";

const FinalPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [animationStopped, setAnimationStopped] = useState(false);
  const backgroundAudioRef = useRef(null);
  const backgroundSound = location.state?.audio;
  const backgroundImage =
    location.state?.background || localStorage.getItem("breathSelectedBackground");

  const [time, setTime] = useState(600); // 10 minutes default
  const [isRunning, setIsRunning] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customTime, setCustomTime] = useState("10:00"); // Default time as string
  const [textColor, setTextColor] = useState('var(--darkblack)'); // Default text color
  const [textShadow, setTextShadow] = useState('none'); // Default shadow

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
    const savedSound = location.state?.audio || sessionStorage.getItem("backgroundSound");
    const savedBackground = location.state?.background || localStorage.getItem("breathSelectedBackground");

    if (savedBackground) {
      document.body.style.backgroundImage = `url(${savedBackground})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundRepeat = "no-repeat";
      document.body.style.backgroundAttachment = "fixed";
      // Check brightness and update text color
      getImageBrightness(savedBackground).then((brightness) => {
        if (brightness < 128) {
          setTextColor('#F8F1E5'); // 🌙 Dark background → Soft warm white
          setTextShadow('2px 2px 6px rgba(0,0,0,0.8)'); // Strong black shadow
        } else {
          setTextColor('#222222'); // 🌞 Bright background → Softer deep black
          setTextShadow('2px 2px 6px rgba(255,255,255,0.3)'); // Soft white glow
        }
      });
    }

    return () => {
      document.body.style.backgroundImage = "none";

      if (backgroundAudioRef.current) {
        backgroundAudioRef.current.pause();
        backgroundAudioRef.current = null;
        sessionStorage.removeItem("backgroundSound");
      }
      document.body.style.backgroundImage = "none";
    };
  }, [location.pathname]);

  useEffect(() => {
    let timer;
    if (isRunning && time > 0) {
      timer = setInterval(() => setTime((prev) => prev - 1), 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRunning, time]);

  const stopBackgroundSound = () => {
    if (backgroundAudioRef.current) {
      backgroundAudioRef.current.pause();
      backgroundAudioRef.current = null;
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleCustomTimeClick = () => {
    console.log("Entering custom time mode...");
    setIsEditing(true);
  };

  const handleSetTimeClick = () => {
    const [minutes, seconds] = customTime.split(":").map(Number);
    if (!isNaN(minutes) && !isNaN(seconds) && minutes >= 0 && seconds >= 0) {
      setTime(minutes * 60 + seconds);
    }
    setIsEditing(false);
  };

  const handleCustomTimeChange = (e) => {
    const value = e.target.value.replace(/[^0-9:]/g, ""); // Only allow numbers and ":"
    if (/^\d{0,2}:\d{0,2}$/.test(value)) {
      setCustomTime(value);
    }
  };

  return (
    <div className="final-page">
      <div className="content-wrapper">
        {/* Instruction */}
        <div className="instruction-container">
          <h2 style={{ color: textColor, textShadow: textShadow }}>Now, let's breathe!</h2>
        </div>

        {/* Breathing Circles */}
        <div className={`wrap ${animationStopped ? "paused" : ""}`}>
          {Array.from({ length: 10 }, (_, i) => (
            <div className="circle" key={i} style={{ transform: `rotate(${36 * (i + 1)}deg)` }}>
              <div className="circle-inner"></div>
            </div>
          ))}
        </div>

        {/* Timer Section */}
        <div className="timer-container">
          {isEditing ? (
            <input
              type="text"
              className="timer-input"
              value={customTime}
              onChange={handleCustomTimeChange}
              onBlur={(e) => {
                if (e.target.value === customTime) {
                  return; // Prevent exit if they didn't change the time
                }
              }}
              autoFocus
            />
          ) : (
            <div className="timer-display" style={{ color: textColor, textShadow: textShadow }}>
              {formatTime(time)}
            </div>
          )}
          <div className="timer-controls">
            {isEditing ? (
              <button onClick={handleSetTimeClick}>Set Time</button>
            ) : (
              <button onClick={handleCustomTimeClick}>Custom Time</button>
            )}
            <button onClick={() => setIsRunning(!isRunning)} disabled={isEditing}>
              {isRunning ? "Pause" : "Start"}
            </button>
            <button onClick={() => {
              setIsRunning(false);
              setTime(600);
              setCustomTime("10:00");
              setIsEditing(false); // Ensure it exits input mode
            }}>
              Reset
            </button>
          </div>
        </div>

        {/* Additional Buttons (Below Timer) */}
        <div className="button-container">
          <button className="control-btn" onClick={() => setAnimationStopped(!animationStopped)}>
            {animationStopped ? "Resume Animation" : "Stop Animation"}
          </button>
          <button className="control-btn" onClick={stopBackgroundSound}>
            Stop Sound
          </button>
          <button className="control-btn" onClick={() => navigate("/breath")}>
            Change Image
          </button>
          <button className="control-btn" onClick={() => navigate("/sound")}>
            Change Sound
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalPage;
