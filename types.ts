import React from 'react';

export interface ExperienceItem {
  period: string;
  company: string;
  role: string;
  description: string;
  logo?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  subtitle: string;
  tags: string[];
  videoUrl?: string;
  imageUrl: string;
}

export interface FlagshipDetails {
  id: string;
  title: string;
  role: string;
  content: React.ReactNode;
}