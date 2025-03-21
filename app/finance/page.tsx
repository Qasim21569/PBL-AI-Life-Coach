'use client';

import React from 'react';
import ChatLayout from '../../components/ChatLayout';

const FinancePage = () => {
  const financeData = {
    title: 'Financial Guidance',
    icon: '💰',
    description: 'Get personalized financial advice, investment strategies, and money management tips for financial freedom.',
    longDescription: 'Our AI Financial Coach helps you navigate the complex world of personal finance with customized guidance. Whether you\'re looking to save for a major purchase, invest for retirement, pay off debt, or build wealth, our coach provides practical advice tailored to your financial situation and goals.',
    benefits: [
      'Personalized budgeting and spending plans',
      'Debt reduction strategies',
      'Investment portfolio recommendations',
      'Retirement planning guidance',
      'Tax optimization tips',
      'Wealth building principles',
      'Financial goal setting and tracking'
    ],
    suggestedPrompts: [
      'How to create a monthly budget',
      'Best strategies to pay off debt',
      'Beginning investment advice',
      'Saving for retirement in my 30s',
      'Tips for first-time home buyers',
      'How to improve my credit score'
    ],
    accentColor: '#ffc107' // a gold/amber shade
  };

  return <ChatLayout {...financeData} />;
};

export default FinancePage; 