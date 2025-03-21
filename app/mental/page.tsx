'use client';

import React from 'react';
import ChatLayout from '../../components/ChatLayout';

const MentalHealthPage = () => {
  const mentalHealthData = {
    title: 'Mental Health Guidance',
    icon: '🧠',
    description: 'Get personalized mental wellness strategies, stress management techniques, and emotional support.',
    longDescription: 'Our AI Mental Health Coach helps you nurture your psychological well-being with compassionate guidance. Whether you\'re dealing with everyday stress, working on personal growth, or seeking strategies for specific challenges, our coach provides supportive advice tailored to your mental health needs and goals.',
    benefits: [
      'Personalized stress management techniques',
      'Mindfulness and meditation practices',
      'Emotional regulation strategies',
      'Self-care routine development',
      'Sleep improvement guidance',
      'Cognitive reframing exercises',
      'Healthy boundary setting and relationship tips'
    ],
    suggestedPrompts: [
      'How to manage daily stress',
      'Techniques for better sleep',
      'Dealing with anxiety at work',
      'Building a meditation practice',
      'Ways to improve self-confidence',
      'Balancing work and personal life'
    ],
    accentColor: '#9c27b0' // a calming purple shade
  };

  return <ChatLayout {...mentalHealthData} />;
};

export default MentalHealthPage; 