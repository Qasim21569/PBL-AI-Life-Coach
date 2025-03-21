'use client';

import React from 'react';
import ChatLayout from '../../components/ChatLayout';

const CareerPage = () => {
  const careerData = {
    title: '🚀 Career Boosters',
    icon: '🚀',
    description: '✨ Wanna crush that next interview or land your dream job? I\'ve got your back!',
    longDescription: 'Hey friend! I\'m your career bestie here to help you nail that job hunt, level up your professional game, or totally reinvent your career path. No boring corporate speak - just real talk and actionable advice that actually works!',
    benefits: [
      'Resume makeovers that actually get callbacks',
      'Interview prep so you can walk in confident AF',
      'Salary negotiation tricks (get that $$$)',
      'Career change roadmaps when you\'re SO over your current gig',
      'LinkedIn and personal branding that doesn\'t feel fake',
      'Work-life balance hacks (because burnout is NOT the vibe)',
      'Networking for people who hate networking'
    ],
    suggestedPrompts: [
      'Help me fix my boring resume',
      'I have an interview tomorrow, HELP!',
      'How do I ask for more money without being awkward?',
      'I hate my job, what now?',
      'How to deal with my annoying coworker',
      'I want to start a side hustle'
    ],
    accentColor: '#3f51b5' // a professional blue shade
  };

  return <ChatLayout {...careerData} />;
};

export default CareerPage; 