import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Global hata sınırı — alt ağaçtaki herhangi bir render/lifecycle hatasını
 * yakalar ve tüm uygulamanın beyaz ekrana düşmesini engeller.
 * Sınıf bileşeni zorunlu: hata sınırı API'si (getDerivedStateFromError /
 * componentDidCatch) yalnızca sınıf bileşenlerinde mevcuttur.
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // Üretimde harici bir hata izleme servisine (ör. Sentry) gönderilmeli.
    // Şimdilik geliştirme ortamında konsola yazılır (prod'da index.tsx susturur).
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] Yakalanan hata:', error, info.componentStack);
  }

  private handleReload = (): void => {
    this.setState({ hasError: false });
    window.location.assign('/');
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            minHeight: '100vh',
            padding: '2rem',
            textAlign: 'center',
            background: '#020b18',
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          <h1 style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '1.5rem', margin: 0 }}>
            Beklenmeyen bir hata oluştu
          </h1>
          <p style={{ color: '#94a3b8', maxWidth: 420, margin: 0 }}>
            Sayfa yüklenirken bir sorunla karşılaştık. Lütfen tekrar deneyin.
            Sorun devam ederse bizimle iletişime geçin.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            style={{
              marginTop: '0.5rem',
              padding: '0.65rem 1.5rem',
              borderRadius: 8,
              border: '1px solid #334155',
              background: '#1e293b',
              color: '#f1f5f9',
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              cursor: 'pointer',
            }}
          >
            Ana sayfaya dön
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
