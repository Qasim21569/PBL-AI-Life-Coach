'use client';

import React from 'react';
import ChatLayout from '../../components/ChatLayout';

const MentalHealthPage = () => {
  const mentalHealthData = {
    title: '🌈 Mind Spa',
    icon: '🌈',
    description: '🧘‍♀️ Your chill zone for stress relief, mindfulness, and emotional wellness. Recharge and refocus!',
    longDescription: 'Hey there! Think of me as your mental wellness bestie - here to help you navigate life\'s chaos with a side of calm. We all get overwhelmed, stressed, or just plain tired sometimes - I\'m here with judgment-free support, practical coping strategies, and a virtual shoulder whenever you need it!',
    benefits: [
      'Stress-busting techniques that actually work',
      'Self-care that isn\'t just about bubble baths',
      'Boundary setting without the guilt',
      'Mindfulness for people who can\'t sit still',
      'Mood boosters when life feels extra',
      'Sleep hacks when your brain won\'t shut up',
      'Relationship advice that keeps it real'
    ],
    suggestedPrompts: [
      'My brain won\'t stop overthinking',
      'How to not lose it when I\'m stressed',
      'I need a quick mood boost now',
      'I can\'t sleep, help!',
      'My toxic friend is draining me',
      'I need some me-time ideas'
    ],
    accentColor: '#9c27b0' // a calming purple shade
  };

  return <ChatLayout {...mentalHealthData} />;
};

export default MentalHealthPage; 