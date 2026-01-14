import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import store from '../app/store';
import { Provider } from 'react-redux';
import { createTheme, MantineProvider } from '@mantine/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Dashboard from '../pages/Dashboard';
import FillPatientDetails from '../components/dashboard/FillPatientDetails';
import userEvent from '@testing-library/user-event';

const theme = createTheme({
    fontFamily: 'Poppins, sans-serif',
    fontSizes: {
        sm: "0.7rem"
    }
})

const renderWithProviders = (ui: React.ReactElement) => {
    try {
        return render(
            <Provider store={store}>
                <MantineProvider theme={theme}>
                    <BrowserRouter>
                        {ui}
                    </BrowserRouter>
                </MantineProvider>
            </Provider>
        );
    } catch (error) {
        console.error('Render error:', error);
        throw error;
    }
};

describe('Dashboard Page', () => {
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

    // dashboard test cases
    it('renders dashboard', async () => {
        renderWithProviders(<Dashboard />);
        expect(screen.getByText(/fill patient details/i)).toBeInTheDocument();
        expect(screen.getByText(/insurance provider ratio/i)).toBeInTheDocument();
        expect(screen.getByText(/real time patient status/i)).toBeInTheDocument();
        expect(screen.getByText(/dpa account statement/i)).toBeInTheDocument();
        expect(screen.getByText(/all successful transaction details/i)).toBeInTheDocument();
        expect(screen.getByText(/patient profile list/i)).toBeInTheDocument();
    });

    it('renders all four buttons with initial white background', () => {
        renderWithProviders(<Dashboard />);
        const buttons = [
            screen.getByRole('button', { name: /today/i }),
            screen.getByRole('button', { name: /yesterday/i }),
            screen.getByRole('button', { name: /last week/i }),
            screen.getByRole('button', { name: /this week/i }),
            screen.getByRole('button', { name: /month/i }),
            screen.getByRole('button', { name: /year/i }),
            screen.getByRole('button', { name: /select range/i }),
        ];

        buttons.forEach((button) => {
            expect(button).toBeInTheDocument();
        });
    });

    // Fill Patient Details
    describe('Patient Status', () => {
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

        it('renders all four buttons with initial white background', () => {
            renderWithProviders(<FillPatientDetails />);
            const inputs = [
                screen.getByPlaceholderText(/enter patient name/i),
                screen.getByPlaceholderText(/00 yrs/i),
                screen.getByPlaceholderText(/select gender/i),
                screen.getByPlaceholderText(/\+91 0000000000/i),
                screen.getByPlaceholderText(/example@gmail.com/i),
                screen.getByRole('button', { name: /submit patient details/i }),
            ];

            inputs.forEach((item) => {
                expect(item).toBeInTheDocument();
            });
        });

        it('open add booking modal', async () => {
            renderWithProviders(<FillPatientDetails />);

            await userEvent.click(screen.getByRole('button', { name: /submit patient details/i }));
            expect(await screen.findByText(/Add Intimation Details/i)).toBeInTheDocument();
        });

    })
})