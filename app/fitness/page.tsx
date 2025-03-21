'use client';

import React from 'react';
import ChatLayout from '../../components/ChatLayout';

const FitnessPage = () => {
  const fitnessData = {
    title: '💪 Fit & Fab Vibes',
    icon: '💪',
    description: '🔥 Get your sweat on with custom workouts, nutrition hacks, and feel-good fitness tips!',
    longDescription: 'Hey there! I\'m your fitness buddy, here to make getting fit actually fun (yes, really!). Whether you\'re a total beginner or gym regular, I\'ll hook you up with workout ideas, food tips, and motivation that fits YOUR life - no judgment, just good vibes!',
    benefits: [
      'Workouts that don\'t feel like torture (promise!)',
      'Food tips that aren\'t about sad salads',
      'Real talk about body image and progress',
      'Hacks for when you\'re crazy busy but want results',
      'Form checks so you don\'t hurt yourself',
      'Ways to actually enjoy moving your body',
      'Recovery days that don\'t feel like cheating'
    ],
    suggestedPrompts: [
      'I have zero motivation to workout, help!',
      'What should I eat if I hate cooking?',
      'I want abs but also love pizza',
      'My back hurts after sitting all day',
      'Quick workouts I can do at home',
      'How to not die during cardio'
    ],
    accentColor: '#4caf50' // a fresh green shade
  };

  return <ChatLayout {...fitnessData} />;
};

export default FitnessPage; 