import React from "react";
import { Link } from "react-router-dom";
import ExerciseCard from "../components/ExerciseCard"; 
import "./Home.css"; 

import breathImage from "../assets/breath.png";
import cupidImage from "../assets/cupid.png";
import dymImage from "../assets/dym.png";

const exercises = [
  {
    title: "A Breath of Fresh Air",
    image: breathImage,
    description: "A breathing exercise to calm your mind. Select a background image and soothing audio, then follow the on-screen prompts to breathe deeply and steadily.",
    path: "/breath",
    number: 1
  },
  {
    title: "The Mood Cupid",
    image: cupidImage,
    description: "A mood-matching exercise to find activities that suit your current emotional state. Drag each mood icon to its matching activity.",
    path: "/coming-soon",
    number: 2
  },
  {
    title: "Did You Mean...?",
    image: dymImage,
    description: "A reframing exercise to reshape your perspective. Share what’s on your mind, and we'll guide you to see it through a more positive lens.",
    path: "/coming-soon",
    number: 3
  },
];

const Home = () => {
  return (
    <div className="landing-page">
      <div className="flip-card-container">
        {exercises.map((exercise, index) => (
          <Link key={index} to={exercise.path} className="exercise-card-link">
            <ExerciseCard
              title={exercise.title}
              image={exercise.image}
              number={exercise.number}
              description={exercise.description}
            />
          </Link>
        ))}
      </div>
      <div className="intro-section">
        <h1>INTERACTIVE MENTAL HEALTH EXERCISES</h1>
      </div>

      {/* SAFE SPACE Title */}
      <div className="safe-space-title">SAFE SPACE</div>

      {/* Page Description  */}
      <div className="page-description">
        <p>Safe Space is an interactive mental health exercise platform designed to help you navigate your emotions with ease. Each exercise is a guided experience aimed at boosting your mood, sharpening your mental clarity, and building emotional resilience. Choose an activity, engage with it, and take a step toward a calmer mind.</p>
      </div>
    </div>
  );
};

export default Home;
