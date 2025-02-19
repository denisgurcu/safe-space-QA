import React from 'react';
import './ExerciseCard.css';

const ExerciseCard = ({ title, image, number, description }) => {
    return (
        <div className="excard-container">
            <div className="excard-inner">
                {/* FRONT SIDE */}
                <div className="excard-front">
                    <div className="excard-header">
                        <span className="excard-number">[{number}]</span>
                    </div>
                    <img src={image} alt={title} className="excard-image" />
                    <div className="excard-title">{title}</div>
                </div>

                {/* BACK SIDE */}
                <div className="excard-back">
                    <div className="excard-back-content">
                        <h3 className="excard-back-title">{title}</h3>
                        <p className="excard-info">{description}</p>
                        <button className="excard-start-btn">Start Exercise</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExerciseCard;
