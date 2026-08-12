import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import ScoreGauge from '../ScoreGauge.jsx';

describe('ScoreGauge', () => {
  test('renders the rounded score and label accessibly', () => {
    render(<ScoreGauge score={67.6} label="Promising" />);
    expect(screen.getByRole('img', { name: /StartupIQ score: 67.6 out of 100, Promising/ })).toBeInTheDocument();
    expect(screen.getByText('68')).toBeInTheDocument();
    expect(screen.getByText('Promising')).toBeInTheDocument();
  });

  test('clamps out-of-range scores into the 0-100 display', () => {
    render(<ScoreGauge score={140} label="Exceptional Potential" />);
    expect(screen.getByText('100')).toBeInTheDocument();
  });
});
