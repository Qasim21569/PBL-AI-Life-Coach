'use client';

import React from 'react';
import ChatLayout from '../../components/ChatLayout';

const CareerPage = () => {
  const careerData = {
    title: 'Career Guidance',
    icon: '💼',
    description: 'Get personalized career advice, job search strategies, and professional development tips.',
    longDescription: 'Our AI Career Coach helps you navigate your professional journey with personalized guidance. Whether you\'re looking to advance in your current role, exploring new opportunities, or just starting your career, our coach provides actionable insights tailored to your unique situation.',
    benefits: [
      'Personalized career planning and goal setting',
      'Resume and cover letter optimization',
      'Interview preparation and feedback',
      'Salary negotiation strategies',
      'Skill development recommendations',
      'Work-life balance guidance',
      'Networking and personal branding tips'
    ],
    suggestedPrompts: [
      'How can I improve my resume?',
      'Tips for my upcoming interview',
      'How to ask for a promotion',
      'Switching careers to tech',
      'Dealing with workplace conflict',
      'Developing leadership skills'
    ],
    accentColor: '#3f51b5' // a professional blue shade
  };

  return <ChatLayout {...careerData} />;
};

export default CareerPage; 