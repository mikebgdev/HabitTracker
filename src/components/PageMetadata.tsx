import React, { useEffect } from 'react';
import { useLocation } from 'wouter';

type Metadata = {
  title: string;
  description: string;
};

const metadataMap: Record<string, Metadata> = {
  '/': {
    title: 'HabitMaster - Home',
    description:
      'HabitMaster helps you build consistent habits with beautiful visuals, smart reminders, and real progress tracking.',
  },
  '/dashboard': {
    title: 'HabitMaster - Daily Routines',
    description: 'View and complete your daily routines and tasks.',
  },
  '/routines': {
    title: 'HabitMaster - My Routines',
    description: 'Create, edit, and organize your habits and routines.',
  },
  '/groups': {
    title: 'HabitMaster - Groups',
    description: 'Group your routines to stay organized by category or time of day.',
  },
  '/progress': {
    title: 'HabitMaster - Progress',
    description: 'Track your habit progress and streaks over time.',
  },
  '/account': {
    title: 'HabitMaster - Account',
    description: 'Manage your account settings and preferences.',
  },
  default: {
    title: 'HabitMaster',
    description:
      'HabitMaster is a web application to create, organize, and track your daily routines and habits.',
  },
};

const siteUrl = 'https://habits.mikebgdev.com';
const siteImage = '/socialmedia.png';
const siteCreator = '@mikebgdev';

function PageMetadata() {
  const [location] = useLocation();

  useEffect(() => {
    const meta = metadataMap[location] || metadataMap.default;
    const { title, description } = meta;
    const url = `${siteUrl}${location}`;

    document.title = title;

    const updateOrCreateMeta = (
      attr: 'name' | 'property',
      value: string,
      content: string
    ) => {
      let element = document.head.querySelector<HTMLMetaElement>(
        `meta[${attr}="${value}"]`
      );
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, value);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateOrCreateMeta('name', 'description', description);
    updateOrCreateMeta('property', 'og:title', title);
    updateOrCreateMeta('property', 'og:description', description);
    updateOrCreateMeta('property', 'og:url', url);
    updateOrCreateMeta('property', 'og:image', siteImage);

    updateOrCreateMeta('name', 'twitter:card', 'summary_large_image');
    updateOrCreateMeta('name', 'twitter:title', title);
    updateOrCreateMeta('name', 'twitter:description', description);
    updateOrCreateMeta('name', 'twitter:image', siteImage);
    updateOrCreateMeta('name', 'twitter:creator', siteCreator);

    updateOrCreateMeta('name', 'robots', 'index, follow');

    let canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', url);

    const umami = (window as any).umami;
    if (typeof umami === 'function') {
      umami.trackView();
    }
  }, [location]);

  return null;
}

export default PageMetadata;