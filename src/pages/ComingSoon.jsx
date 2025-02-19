import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ComingSoon.css';

const ComingSoon = () => {
    const navigate = useNavigate();

    return (
        <div className="coming-soon-container">
            <h1>Coming Soon</h1>
            <p>This feature is under development. Stay tuned!</p>
        </div>
    );
};

export default ComingSoon;
