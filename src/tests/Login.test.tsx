import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import store from '../app/store';
import { Provider } from 'react-redux';
import { createTheme, MantineProvider } from '@mantine/core';

const theme = createTheme({
    fontFamily: 'Poppins, sans-serif',
    fontSizes: {
        sm: "0.7rem"
    }
})

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <Provider store={store}>
            <MantineProvider theme={theme}>
                <BrowserRouter>
                    {ui}
                </BrowserRouter>
            </MantineProvider>
        </Provider>
    );
};

describe('Login Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        if (!window.matchMedia) {
            window.matchMedia = vi.fn().mockImplementation((query) => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(), // deprecated
                removeListener: vi.fn(), // deprecated
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            }));
        }
    });

    it('renders all login input fields', () => { 
        renderWithProviders(<Login />);
        expect(screen.getByPlaceholderText(/example@email\.com/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('validates empty fields and invalid inputs', async () => {
        renderWithProviders(<Login />);
        await userEvent.click(screen.getByRole('button', { name: /login/i }));
        expect(await screen.findByText(/email is required/i)).toBeInTheDocument();

        // Fill invalid email
        const emailInput = screen.getByPlaceholderText(/example@email\.com/i);
        const passwordInput = screen.getByPlaceholderText(/enter password/i);
        
        await userEvent.type(emailInput, 'invalidemail');
        await userEvent.click(screen.getByRole('button', { name: /login/i }));
        expect(await screen.findByText(/please provide a valid email address/i)).toBeInTheDocument();

        // Clear and fill valid email, test password required
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'testing@email.com');
        await userEvent.click(screen.getByRole('button', { name: /login/i }));
        expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
        
        // Test short password
        await userEvent.clear(emailInput);
        await userEvent.clear(passwordInput);
        await userEvent.type(emailInput, 'testing@email.com');
        await userEvent.type(passwordInput, 'short');
        await userEvent.click(screen.getByRole('button', { name: /login/i }));
        expect(await screen.findByText(/password must contain at least 8 characters/i)).toBeInTheDocument();

        // Test long password
        await userEvent.clear(emailInput);
        await userEvent.clear(passwordInput);
        await userEvent.type(emailInput, 'testing@email.com');
        await userEvent.type(passwordInput, 'this is a very long password which is exceeding 30 character limits');
        await userEvent.click(screen.getByRole('button', { name: /login/i }));
        expect(await screen.findByText(/password must not exceed 30 characters/i)).toBeInTheDocument();
    });

    it('shows "Invalid login data" on login failure', async () => {
        const dispatchMock = vi.fn().mockReturnValue({
            unwrap: () => Promise.reject({ message: 'Invalid credentials' }),
        });

        vi.mock('../app/hooks', async () => {
            const actual = await vi.importActual<any>('../app/hooks');
            return {
                ...actual,
                useAppDispatch: () => dispatchMock,
            };
        });

        renderWithProviders(<Login />);

        await userEvent.type(screen.getByPlaceholderText(/example@email\.com/i), 'qwer@poiuy.poiu');
        await userEvent.type(screen.getByPlaceholderText(/enter password/i), 'poiuhjkrerr');
        await userEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() =>
            expect(screen.getByText(/invalid login data/i)).toBeInTheDocument()
        );
    });

    // forgot password test cases
    it('open forgot password modal and checks for input validations', async () => {
        renderWithProviders(<Login />);
        await userEvent.click(screen.getByRole('button', { name: /forgot your password?/i }));
        expect(await screen.findByText(/Please enter your email address to receive a reset code/i)).toBeInTheDocument();
    });
});
