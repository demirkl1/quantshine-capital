import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPasswordModal from './ForgotPasswordModal';

// api modülünü mock'la — gerçek HTTP yok
vi.mock('../api', () => ({
  default: { post: vi.fn() },
}));
import api from '../api';
const mockedPost = api.post as unknown as ReturnType<typeof vi.fn>;

// @testing-library/user-event v13 API (setup() yok)

describe('ForgotPasswordModal', () => {
  beforeEach(() => {
    mockedPost.mockReset();
  });

  it('isOpen=false iken hiçbir şey göstermez', () => {
    const { container } = render(<ForgotPasswordModal isOpen={false} onClose={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('3 adımı tamamlar: e-posta → kod → yeni şifre', async () => {
    mockedPost.mockResolvedValue({ data: 'ok' });
    render(<ForgotPasswordModal isOpen onClose={() => {}} />);

    // Adım 1 — e-posta
    await userEvent.type(screen.getByPlaceholderText('ornek@quantshine.com'), 'kullanici@ornek.com');
    await userEvent.click(screen.getByRole('button', { name: /Kod Gönder/i }));
    await waitFor(() =>
      expect(mockedPost).toHaveBeenCalledWith('/auth/password/forgot', { email: 'kullanici@ornek.com' })
    );

    // Adım 2 — kod
    const codeInput = await screen.findByPlaceholderText('6 haneli kod');
    await userEvent.type(codeInput, '123456');
    await userEvent.click(screen.getByRole('button', { name: /Kodu Doğrula/i }));
    await waitFor(() =>
      expect(mockedPost).toHaveBeenCalledWith('/auth/password/verify', { email: 'kullanici@ornek.com', code: '123456' })
    );

    // Adım 3 — yeni şifre (eşleşen, min 8)
    const newPass = await screen.findByPlaceholderText('En az 8 karakter');
    await userEvent.type(newPass, 'yeniSifre1');
    await userEvent.type(screen.getByPlaceholderText('Yeni şifreyi tekrar girin'), 'yeniSifre1');
    await userEvent.click(screen.getByRole('button', { name: /Şifreyi Güncelle/i }));
    await waitFor(() =>
      expect(mockedPost).toHaveBeenCalledWith('/auth/password/reset', {
        email: 'kullanici@ornek.com',
        code: '123456',
        newPassword: 'yeniSifre1',
      })
    );
  });

  it('şifreler eşleşmezse reset çağrısı yapmaz', async () => {
    mockedPost.mockResolvedValue({ data: 'ok' });
    render(<ForgotPasswordModal isOpen onClose={() => {}} />);

    await userEvent.type(screen.getByPlaceholderText('ornek@quantshine.com'), 'a@b.com');
    await userEvent.click(screen.getByRole('button', { name: /Kod Gönder/i }));
    await userEvent.type(await screen.findByPlaceholderText('6 haneli kod'), '111111');
    await userEvent.click(screen.getByRole('button', { name: /Kodu Doğrula/i }));

    await userEvent.type(await screen.findByPlaceholderText('En az 8 karakter'), 'sifre1234');
    await userEvent.type(screen.getByPlaceholderText('Yeni şifreyi tekrar girin'), 'farkli9999');
    await userEvent.click(screen.getByRole('button', { name: /Şifreyi Güncelle/i }));

    expect(await screen.findByText(/eşleşmiyor/i)).toBeInTheDocument();
    expect(mockedPost).not.toHaveBeenCalledWith('/auth/password/reset', expect.anything());
  });
});
