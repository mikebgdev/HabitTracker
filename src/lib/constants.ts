import type { DayKey } from './types';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BatteryMedium,
  Bike,
  Book,
  BrainCircuit,
  Coffee,
  Dumbbell,
  Flame,
  Footprints,
  HandPlatter,
  Heart,
  Laptop,
  Microscope,
  Music,
  Palette,
  Pen,
  Smartphone,
  Sparkles,
  Timer,
  Utensils,
  Waves,
} from 'lucide-react';

export const WEEKDAYS: { key: DayKey; label: string }[] = [
  { key: 'monday', label: 'L' },
  { key: 'tuesday', label: 'M' },
  { key: 'wednesday', label: 'X' },
  { key: 'thursday', label: 'J' },
  { key: 'friday', label: 'V' },
  { key: 'saturday', label: 'S' },
  { key: 'sunday', label: 'D' },
];

export const dayToggleClass = (selected: boolean) =>
  `text-xs font-medium text-center px-2 py-1 rounded border transition-colors duration-150 ${
    selected
      ? 'bg-blue-600 text-white border-blue-700 shadow'
      : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
  }`;

export const dayDisplayClass = (active: boolean) =>
  `w-6 h-6 flex items-center justify-center rounded text-xs font-semibold transition-colors ${
    active
      ? 'bg-blue-600 text-white shadow'
      : 'text-gray-400 dark:text-gray-500'
  }`;

export const ICON_CATEGORIES = [
  {
    nameKey: 'activities',
    icons: [
      { name: 'activity', icon: Activity, labelKey: 'activity' },
      { name: 'bike', icon: Bike, labelKey: 'bike' },
      { name: 'footprints', icon: Footprints, labelKey: 'footprints' },
      { name: 'dumbbell', icon: Dumbbell, labelKey: 'dumbbell' },
      { name: 'palette', icon: Palette, labelKey: 'palette' },
      { name: 'music', icon: Music, labelKey: 'music' },
      { name: 'waves', icon: Waves, labelKey: 'waves' },
    ],
  },
  {
    nameKey: 'workStudy',
    icons: [
      { name: 'book', icon: Book, labelKey: 'book' },
      { name: 'brain', icon: BrainCircuit, labelKey: 'brain' },
      { name: 'laptop', icon: Laptop, labelKey: 'laptop' },
      { name: 'microscope', icon: Microscope, labelKey: 'microscope' },
      { name: 'pen', icon: Pen, labelKey: 'pen' },
      { name: 'phone', icon: Smartphone, labelKey: 'phone' },
    ],
  },
  {
    nameKey: 'healthWellness',
    icons: [
      { name: 'coffee', icon: Coffee, labelKey: 'coffee' },
      { name: 'food', icon: HandPlatter, labelKey: 'food' },
      { name: 'heart', icon: Heart, labelKey: 'heart' },
      { name: 'sparkles', icon: Sparkles, labelKey: 'sparkles' },
      { name: 'utensils', icon: Utensils, labelKey: 'utensils' },
    ],
  },
];

export const ROUTINE_ICONS = ICON_CATEGORIES.flatMap((c) =>
  c.icons.map(({ name, icon }) => ({ name, icon })),
);

export const PRIORITY_ICONS: Record<
  'high' | 'medium' | 'low',
  { icon: LucideIcon; color: string; badge: string }
> = {
  high: {
    icon: Flame,
    color: 'text-red-500',
    badge:
      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
  },
  medium: {
    icon: BatteryMedium,
    color: 'text-yellow-500',
    badge:
      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  },
  low: {
    icon: Timer,
    color: 'text-blue-500',
    badge:
      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
};

export const ROUTINE_ICON_MAP: Record<string, LucideIcon> = {
  activity: Activity,
  bike: Bike,
  book: Book,
  brain: BrainCircuit,
  coffee: Coffee,
  dumbbell: Dumbbell,
  footprints: Footprints,
  food: HandPlatter,
  heart: Heart,
  laptop: Laptop,
  microscope: Microscope,
  music: Music,
  palette: Palette,
  pen: Pen,
  phone: Smartphone,
  sparkles: Sparkles,
  utensils: Utensils,
  waves: Waves,
};

export const GROUP_ICON_OPTIONS: {
  value: string;
  label: string;
  color: string;
}[] = [
  { value: 'fa-sun', label: 'Morning', color: 'text-amber-500' },
  { value: 'fa-briefcase', label: 'Work', color: 'text-blue-500' },
  { value: 'fa-moon', label: 'Evening', color: 'text-purple-500' },
  { value: 'fa-dumbbell', label: 'Fitness', color: 'text-red-500' },
  { value: 'fa-book', label: 'Study', color: 'text-green-500' },
  { value: 'fa-layer-group', label: 'General', color: 'text-gray-500' },
];
