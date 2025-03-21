'use client';

import React from 'react';
import ChatLayout from '../../components/ChatLayout';

const FitnessPage = () => {
  const fitnessData = {
    title: 'Fitness Guidance',
    icon: '💪',
    description: 'Get personalized workout plans, nutrition advice, and wellness strategies for optimal physical health.',
    longDescription: 'Our AI Fitness Coach helps you achieve your physical health goals with customized guidance. Whether you\'re looking to lose weight, build muscle, improve endurance, or simply maintain a healthy lifestyle, our coach provides practical advice tailored to your specific needs and fitness level.',
    benefits: [
      'Personalized workout routines for your fitness level',
      'Nutritional guidance and meal planning',
      'Progress tracking and motivation',
      'Recovery and injury prevention tips',
      'Exercise form and technique guidance',
      'Habit formation for sustainable fitness',
      'Balance between cardio, strength, and flexibility'
    ],
    suggestedPrompts: [
      'Create a beginner workout plan',
      'Nutrition tips for muscle gain',
      'How to improve my running endurance',
      'Exercises for lower back pain',
      'Best pre-workout meals',
      'How to stay motivated to exercise'
    ],
    accentColor: '#4caf50' // a fresh green shade
  };

  return <ChatLayout {...fitnessData} />;
};

export default FitnessPage; 