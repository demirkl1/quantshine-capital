import React from 'react';
import { render, screen } from '@testing-library/react';
import NotFound from './NotFound';

// Test için react-router-dom'un Link'ini basit bir <a> ile mock'luyoruz
// (yönlendirme davranışı bu birim testinin kapsamı dışında).
vi.mock('react-router-dom', () => ({
  Link: ({ to, children, ...rest }: { to: string; children: React.ReactNode }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

describe('NotFound', () => {
  it('404 mesajını ve ana sayfa bağlantısını gösterir', () => {
    render(<NotFound />);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText(/Sayfa bulunamadı/i)).toBeInTheDocument();

    const homeLink = screen.getByRole('link', { name: /Ana sayfaya dön/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });
});
