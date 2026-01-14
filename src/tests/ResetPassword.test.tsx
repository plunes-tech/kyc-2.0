import { fireEvent, render, screen, waitFor } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import store from '../app/store';
import { Provider } from 'react-redux';
import { createTheme, MantineProvider } from '@mantine/core';
import ResetPassword from '../pages/ResetPassword';

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

describe('reset-password page', () => {
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

    it('renders all reset password input fields', () => {
        renderWithProviders(<ResetPassword />);
        expect(screen.getByPlaceholderText(/enter old password/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/enter new password/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/confirm new password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    // Test 1: Verify all inputs are mandatory
    it('shows error messages when submitting with empty inputs', async () => {
        renderWithProviders(<ResetPassword />);

        const submitButton = screen.getByRole('button', { name: /submit/i });
        fireEvent.click(submitButton);
        expect(await screen.findByText(/please enter your old password/i)).toBeInTheDocument();

        const oldPasswordInput = screen.getByPlaceholderText(/enter old password/i);
        fireEvent.change(oldPasswordInput, { target: { value: 'Name@Test123' } })
        fireEvent.click(submitButton);
        await waitFor(() => {
            expect(screen.getByText(/please enter your new password/i)).toBeInTheDocument();
        });

        fireEvent.change(oldPasswordInput, { target: { value: 'Name@Test123' } })
        const newPasswordInput = screen.getByPlaceholderText(/enter new password/i);
        fireEvent.change(newPasswordInput, { target: { value: 'Name@Test123' } })
        fireEvent.click(submitButton);
        await waitFor(() => {
            expect(screen.getByText(/please confirm your new password/i)).toBeInTheDocument();
        });
    });

    // Test 2: Verify password validation (8–30 characters for New Password and Confirm Password)
    it('shows error for passwords shorter than 8 or longer than 30 characters', async () => {
        renderWithProviders(<ResetPassword />);

        const oldPasswordInput = screen.getByPlaceholderText(/enter old password/i);
        const newPasswordInput = screen.getByPlaceholderText(/enter new password/i);
        const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i)
        const submitButton = screen.getByRole('button', { name: /submit/i });

        // Test short password
        fireEvent.change(oldPasswordInput, { target: { value: "Name@Tests123" } });
        fireEvent.change(newPasswordInput, { target: { value: "short" } });
        fireEvent.click(submitButton);
        await waitFor(() => {
            expect(screen.getByText(/Your new password must contain at least 8 characters/i)).toBeInTheDocument();
        });

        // Test long password
        fireEvent.change(oldPasswordInput, { target: { value: "Name@Tests123" } });
        fireEvent.change(newPasswordInput, { target: { value: "short".repeat(10) } });
        fireEvent.click(submitButton);
        await waitFor(() => {
            expect(screen.getByText(/Your new password must not exceed 30 characters/i)).toBeInTheDocument();
        });

        // Test short password
        fireEvent.change(oldPasswordInput, { target: { value: "Name@Tests123" } });
        fireEvent.change(newPasswordInput, { target: { value: "Name@Tests123" } });
        fireEvent.change(confirmPasswordInput, { target: { value: "short" } });
        fireEvent.click(submitButton);
        await waitFor(() => {
            expect(screen.getByText(/New passowrd and confirm password did not match/i)).toBeInTheDocument();
        });
    });
})