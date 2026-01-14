import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import store from '../app/store';
import { Provider } from 'react-redux';
import { createTheme, MantineProvider } from '@mantine/core';
import TransactionDetails from '../pages/TransactionDetails';

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

describe('Patient Details Page', () => {
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

    it('check patient details table', () => { 
        renderWithProviders(<TransactionDetails />);
        expect(screen.getByText(/All Transaction details & updates/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();
    });

    it('check if buttons are working', async () => { 
        renderWithProviders(<TransactionDetails />);
        
        fireEvent.click(screen.getByRole('button', { name: /filter/i }))
        expect(screen.getByText(/Search by the following filters/i)).toBeInTheDocument();
    });
})