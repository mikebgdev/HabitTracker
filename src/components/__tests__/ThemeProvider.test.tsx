import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeProvider';

function TestComponent() {
  const { theme, setTheme } = useTheme();
  return (
    <>
      <div>Theme is {theme}</div>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        toggle
      </button>
    </>
  );
}

describe('ThemeProvider', () => {
  afterEach(() => {
    document.documentElement.className = '';
    localStorage.clear();
  });

  it('applies default theme on mount', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <TestComponent />
      </ThemeProvider>
    );
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(screen.getByText('Theme is light')).toBeInTheDocument();
  });

  it('toggles theme and updates localStorage', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <TestComponent />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByText('toggle'));
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(screen.getByText('Theme is dark')).toBeInTheDocument();
  });
});