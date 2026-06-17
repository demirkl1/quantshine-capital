import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

// Hata fırlatan yardımcı bileşen
const Boom = (): React.JSX.Element => {
  throw new Error('patladı');
};

describe('ErrorBoundary', () => {
  // Hata sınırı testlerinde React, yakalanan hatayı yine de console.error'a yazar.
  let consoleError: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    consoleError.mockRestore();
  });

  it('alt bileşen hata fırlatmazsa içeriği gösterir', () => {
    render(
      <ErrorBoundary>
        <span>her şey yolunda</span>
      </ErrorBoundary>
    );
    expect(screen.getByText('her şey yolunda')).toBeInTheDocument();
  });

  it('alt bileşen hata fırlatırsa yedek arayüzü gösterir', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Beklenmeyen bir hata oluştu/i)).toBeInTheDocument();
  });
});
