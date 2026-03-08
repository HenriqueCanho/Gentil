import { COLORS } from './colors';
import type { AppThemeMode } from '../lib/appPreferences';

export type ThemeColors = {
  bg?: string;
  accent: string;
  accentDim?: string;
  text: string;
  muted: string;
  border: string;
  inputBg: string;
  error: string;
  overlay: string;
  card?: string;
  chip?: string;
};

export const THEMES: Record<AppThemeMode, ThemeColors> = {
  gentil: COLORS,
  'gentil invertido': {
    bg: '#FFFFFF',
    accent: '#1A3A34',
    text: '#1A3A34',
    muted: 'rgba(26,58,52,0.6)',
    border: '#1A3A34',
    inputBg: 'rgba(26,58,52,0.1)',
    error: '#EF4444',
    overlay: 'rgba(255,255,255,0.5)',
    card: '#F0F0F0',
    chip: '#E0E0E0',
  },
  light: {
    bg: '#F7F0E8',
    accent: '#7b5108ff',
    text: '#2b1e1b',
    muted: 'rgba(43,30,27,0.6)',
    border: 'rgba(43,30,27,0.2)',
    inputBg: 'rgba(43,30,27,0.1)',
    error: '#EF4444',
    overlay: 'rgba(247,240,232,0.5)',
    card: '#EADBC8',
    chip: '#DCC3A8',
  },
  warm: {
    bg: '#FFF8EB',
    accent: '#2b6258ff',
    text: '#1A3A34',
    muted: 'rgba(26,58,52,0.6)',
    border: 'rgba(26,58,52,0.2)',
    inputBg: 'rgba(26,58,52,0.1)',
    error: '#EF4444',
    overlay: 'rgba(255,248,235,0.5)',
    card: '#FFE8C8',
    chip: '#FFD8A8',
  },
  fada: {
    bg: '#f4c9e9ff',
    accent: '#b1238bff',
    text: '#550540ff',
    muted: '#740657ff',
    border: '#e24fbbff',
    inputBg: 'rgba(255,245,240,0.1)',
    error: '#EF4444',
    overlay: 'rgba(0,0,0,0.5)',
    card: '#D050B0',
    chip: '#C040A0',
  },
  storm: {
    bg: '#2f2d50ff',
    accent: '#beaafcff',
    text: '#c0b2ebff',
    muted: '#d4c7fbff',
    border: 'rgba(247,240,232,0.2)',
    inputBg: 'rgba(247,240,232,0.1)',
    error: '#EF4443',
    overlay: 'rgba(0,0,0,0.5)',
    card: '#2D2B4C',
    chip: '#1D1B3C',
  },
};
