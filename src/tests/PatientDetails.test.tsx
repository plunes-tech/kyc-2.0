import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import store from '../app/store';
import { Provider } from 'react-redux';
import { createTheme, MantineProvider } from '@mantine/core';
import PatientDetails from '../pages/PatientDetails';

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
        renderWithProviders(<PatientDetails />);
        expect(screen.getByText(/All created Intimations details & updates/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /\+ add new/i })).toBeInTheDocument();
    });

    it('check if buttons are working', async () => { 
        renderWithProviders(<PatientDetails />);
        
        fireEvent.click(screen.getByRole('button', { name: /filter/i }))
        expect(screen.getByText(/Search by the following filters/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /\+ Add New/i }))
        await waitFor(() =>
            expect(screen.getByText(/Add Intimation Details/i)).toBeInTheDocument()
        )
    });
})