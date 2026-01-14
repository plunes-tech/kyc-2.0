import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import store from '../app/store';
import { Provider } from 'react-redux';
import { createTheme, MantineProvider } from '@mantine/core';
import AddBookingModal from '../components/modals/AddBookingModal';
import { notifications, Notifications } from '@mantine/notifications';
import { asyncForEach } from '../utils/utilits';
import userEvent from '@testing-library/user-event';

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
                <Notifications containerWidth={250} position='top-right' autoClose={false} />
                <BrowserRouter>
                    {ui}
                </BrowserRouter>
            </MantineProvider>
        </Provider>
    );
};

describe('Add Booking Modal', () => {
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

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
        // Clear any notifications that might be lingering
        notifications.clean?.();
    });

    const checkValidation = async (errMsg: RegExp, validationData: { testId: RegExp, value: string | number | null }[]) => {
        const user = userEvent.setup();
        if (validationData.length > 0) {

            await asyncForEach(validationData, async (data) => {
                const element = screen.getByTestId(data.testId);
                const role = element.getAttribute('role');
                const className = element.className;

                if (className.includes('mantine-Select-input') || role === 'combobox') {
                    // Handle Mantine Select component
                    if (data.value) {
                        try {
                            // Click the select input to open the dropdown
                            await user.click(element);

                            // Wait for the dropdown to be visible
                            await waitFor(async () => {
                                // Look for the dropdown container
                                const dropdown = document.querySelector('[data-mantine-dropdown]');
                                expect(dropdown).toBeInTheDocument();
                            });

                            // Find and click the option
                            await waitFor(async () => {
                                // Try multiple selectors for finding the option
                                let option;
                                try {
                                    // Try by role first (more reliable)
                                    option = screen.getByRole('option', { name: data.value ? data.value.toString() : '' });
                                } catch {
                                    // Fallback to text search
                                    option = screen.getByText(data.value ? data.value.toString() : '');
                                }

                                await user.click(option);
                            }, { timeout: 3000 });

                        } catch (error) {
                            console.error(`Failed to select option "${data.value}" in select component:`, error);
                            throw error;
                        }
                    }
                } else if (className.includes('mantine-DatePickerInput-input')) {
                    // Handle Mantine DatePickerInput (it's actually a button that opens a dialog)
                    if (data.value) {
                        try {
                            // Click the button to open the calendar dialog
                            await user.click(element);

                            // Wait for the dialog to open by checking aria-expanded
                            await waitFor(() => {
                                const expandedState = element.getAttribute('aria-expanded');
                                if (expandedState !== 'true') {
                                    throw new Error('Calendar dialog not opened yet');
                                }
                            }, { timeout: 3000 });

                            // Wait for the calendar table to appear
                            await waitFor(() => {
                                // Look for table that contains date picker buttons
                                const calendarTable = document.querySelector('table button.mantine-DatePickerInput-day')?.closest('table');
                                
                                if (!calendarTable) {
                                    // Alternative selectors for calendar table
                                    const alternativeTable = document.querySelector('table[role="grid"]') || 
                                                            document.querySelector('table[aria-label*="calendar"]') ||
                                                            document.querySelector('table[aria-label*="Calendar"]') ||
                                                            document.querySelector('[data-mantine-calendar] table') ||
                                                            document.querySelector('.mantine-Calendar table');
                                    
                                    if (!alternativeTable) {
                                        console.log('All tables in DOM:', document.querySelectorAll('table'));
                                        throw new Error('Calendar table not found');
                                    }
                                    return alternativeTable;
                                }
                                return calendarTable;
                            }, { timeout: 3000 });

                            // Find and click the date button in the calendar table
                            await waitFor(async () => {
                                // Look for buttons with the specific date value as text content
                                const dateButtons = document.querySelectorAll('table button.mantine-DatePickerInput-day');
                                
                                // console.log('Available date buttons:', 
                                //     Array.from(dateButtons).map(btn => ({
                                //         text: btn.textContent,
                                //         ariaLabel: btn.getAttribute('aria-label'),
                                //         dataOutside: btn.getAttribute('data-outside')
                                //     }))
                                // );

                                // Find the button with matching text content
                                const targetButton = Array.from(dateButtons).find(btn => 
                                    btn.textContent?.trim() === data.value ? data.value.toString() : ''
                                );

                                if (!targetButton) {
                                    throw new Error(`Date button with text "${data.value}" not found in calendar`);
                                }

                                // console.log('Clicking date button:', targetButton);
                                await user.click(targetButton);
                            }, { timeout: 3000 });

                            // Wait for the dialog to close (optional verification)
                            await waitFor(() => {
                                const expandedState = element.getAttribute('aria-expanded');
                                if (expandedState === 'true') {
                                    throw new Error('Calendar dialog should have closed');
                                }
                            }, { timeout: 2000 });

                        } catch (error) {
                            console.error(`Failed to select date "${data.value}" in DatePickerInput:`, error);
                            throw error;
                        }
                    }
                } else {
                    // Handle regular inputs (TextInput, Textarea, etc.)
                    // Clear the input first if it has existing content
                    if (data.value) {
                        await user.type(element, data.value.toString());
                    }
                }
            });
        }

        // Submit the form
        const submitButton = screen.getByRole('button', { name: /save/i });
        await user.click(submitButton); // Use userEvent for consistency

        // Wait for validation error
        await waitFor(() => {
            // const notificationElements = document.querySelectorAll('.mantine-Notification-description');
            // console.log(
            //     'Text in .mantine-Notification-description: ',
            //     Array.from(notificationElements).map((el) => el.textContent)
            // );
            expect(screen.getByText(errMsg)).toBeInTheDocument();
        }, { timeout: 5000 });
    };

    // const checkValidationFireEvent = async (errMsg: RegExp, validationData: { testId: RegExp, value: string | number | null }[]) => {
    //     if (validationData.length > 0) {
    //         const user = userEvent.setup();
    //         await asyncForEach(validationData, async (data) => {
    //             const element = screen.getByTestId(data.testId);

    //             // Use getAttribute for tagName, type, role, and className
    //             // const tagName = element.tagName.toLowerCase();
    //             // const type = element.getAttribute('type');
    //             const role = element.getAttribute('role');
    //             const className = element.className;

    //             if (className.includes('mantine-Select-input') || role === 'combobox') {
    //                 // Handle Mantine Select component
    //                 if (data.value) {
    //                     // Click the select input to open the dropdown
    //                     await user.click(element);

    //                     // Wait for the dropdown options to appear
    //                     await waitFor(async () => {
    //                         const option = await screen.findByText(data.value ? data.value.toString() : '');
    //                         await user.click(option); // Use userEvent to select the option
    //                     });
    //                 }
    //             } else if (className.includes('mantine-DatePickerInput-input')) {
    //                 // Handle Mantine DatePickerInput
    //                 const input = screen.getByTestId(data.testId)
    //                 console.log("input role type and rendering state =========> ", input.role);
    //                 console.log("HERE >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ", prettyDOM(document.body, Infinity));
    //                 fireEvent.click(input)
    //                 const date = screen.getByText(data.value ? data.value : '15')
    //                 fireEvent.click(date)
    //             } else {
    //                 // Handle regular inputs (TextInput, Textarea, etc.)
    //                 await user.type(element, data.value ? data.value.toString() : '');
    //             }
    //         });
    //     }
    //     const submitButton = screen.getByRole('button', { name: /save/i })
    //     fireEvent.click(submitButton)
    //     await waitFor(() => {
    //         const notificationElements = document.querySelectorAll('.mantine-Notification-description');
    //         console.log(
    //             'Text in .mantine-Notification-description: >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ',
    //             Array.from(notificationElements).map((el) => el.textContent)
    //         );
    //         expect(screen.getByText(errMsg)).toBeInTheDocument();
    //     });
    // }

    let validationData = [] as { testId: RegExp, value: string | number | null }[]

    // it('checks email validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // email
    //     await checkValidation(/please enter patient email/i, validationData)

    //     validationData = [{testId: /patient-email/i, value: 'invalidmail'}]
    //     await checkValidation(/please enter valid patient email/i, validationData)
    // })

    // it('checks name validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // name
    //     validationData = [{testId: /patient-email/i, value: 'email@test.com'}]
    //     await checkValidation(/please enter patient name/i, validationData)
    // })

    // it('checks mobile validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // mobile
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'}
    //     ]
    //     await checkValidation(/Please enter patient mobile number/i, validationData)

    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '123456789'},
    //     ]
    //     await checkValidation(/Patient mobile number must have exactly 10 digits/i, validationData)
    // })

    // it('checks address validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // address
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //     ]
    //     await checkValidation(/Please enter patient address/i, validationData)
    // })

    // it('checks dob validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // dob
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //     ]
    //     await checkValidation(/Please enter patient date of birth/i, validationData)
    // })

    // // check this later, as the input is disabled after entering the DOB which is causing the issue of not able to change the patient age
    // it('checks age validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // age
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: null},
    //     ]
    //     await checkValidation(/Please enter patient age/i, validationData)
    //     screen.debug()

    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: -10},
    //     ]
    //     await checkValidation(/Patient age cannot be negative/i, validationData)
    // })

    it('checks gender validation for the form', async () => {
        const mockSetOpenModal = vi.fn()
        renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

        // gender
        validationData = [
            { testId: /patient-email/i, value: 'email@test.com' },
            { testId: /patient-full-name/i, value: 'test name' },
            { testId: /patient-mobile/i, value: '1234567890' },
            { testId: /patient-address/i, value: 'testing address' },
            { testId: /patient-dob/i, value: '15' },
            { testId: /patient-age/i, value: 10 },
        ]

        await checkValidation(/Please select patient gender/i, validationData)

    }, 100000)

    // it('checks cp name validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // cp name
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //     ]
    //     await checkValidation(/Please enter patient's contact person name/i, validationData)
    // })

    // it('checks cp relation validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // cp relation
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //     ]
    //     await checkValidation(/Please enter patient's relation with contact person/i, validationData)
    // })

    // it('checks cp age validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // cp age
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //     ]
    //     await checkValidation(/Please enter patient's contact person age/i, validationData)

    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: -1},
    //     ]
    //     await checkValidation(/Contact person age cannot be negative/i, validationData)
    // })

    // it('checks cp gender validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // cp gender
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //     ]
    //     await checkValidation(/Please select patient's contact person gender/i, validationData)
    // })

    // it('checks cp mobile validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // cp mobile
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-gender/i, value: "M"},
    //     ]
    //     await checkValidation(/Please enter patient's contact person contact number/i, validationData)
    // })

    // it('checks cp mobile validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // cp mobile
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-gender/i, value: "M"},
    //     ]
    //     await checkValidation(/Please enter patient's contact person contact number/i, validationData)

    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-mobile/i, value: "12345678"},
    //     ]
    //     await checkValidation(/Contact person contact number must have exactly 10 digits/i, validationData)
    // })

    // it('checks cp email validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // cp email
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-mobile/i, value: "1234567890"},
    //     ]
    //     await checkValidation(/Please enter patient's contact person email address/i, validationData)

    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-email/i, value: "invalidmail"},
    //     ]
    //     await checkValidation(/Please enter valid contact person email address/i, validationData)
    // })

    // it('checks doctor name validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // doctor name
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-email/i, value: "test@email.com"},
    //     ]
    //     await checkValidation(/Please enter doctor name/i, validationData)
    // })

    // it('checks doctor number validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // doctor number
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-email/i, value: "test@email.com"},
    //         {testId: /doctor-name/i, value: "test name"},
    //     ]
    //     await checkValidation(/Please enter doctor contact number/i, validationData)

    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-email/i, value: "test@email.com"},
    //         {testId: /doctor-name/i, value: "test name"},
    //         {testId: /doctor-number/i, value: "123456"},
    //     ]
    //     await checkValidation(/Doctor contact number must have exactly 10 digits/i, validationData)
    // })

    // it('checks doctor certi validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // certi number
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-email/i, value: "test@email.com"},
    //         {testId: /doctor-name/i, value: "test name"},
    //         {testId: /doctor-number/i, value: "1234567890"},
    //     ]
    //     await checkValidation(/Please enter doctor certificate number/i, validationData)
    // })

    // it('checks treatment type validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // treatment type
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-email/i, value: "test@email.com"},
    //         {testId: /doctor-name/i, value: "test name"},
    //         {testId: /doctor-number/i, value: "1234567890"},
    //         {testId: /medical-number/i, value: "CERTI-NUMBER"},
    //     ]
    //     await checkValidation(/Please select treatment type/i, validationData)
    // })

    // it('checks treatment name validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // treatment details
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-email/i, value: "test@email.com"},
    //         {testId: /doctor-name/i, value: "test name"},
    //         {testId: /doctor-number/i, value: "1234567890"},
    //         {testId: /medical-number/i, value: "CERTI-NUMBER"},
    //         {testId: /treatment-type/i, value: "Medical Management"},
    //         {testId: /treatment-name/i, value: "test name"},
    //     ]
    //     await checkValidation(/Please enter treatment details/i, validationData)
    // })

    // it('checks doa validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // doa
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-email/i, value: "test@email.com"},
    //         {testId: /doctor-name/i, value: "test name"},
    //         {testId: /doctor-number/i, value: "1234567890"},
    //         {testId: /medical-number/i, value: "CERTI-NUMBER"},
    //         {testId: /treatment-type/i, value: "Medical Management"},
    //         {testId: /treatment-name/i, value: "test name"},
    //         {testId: /treatment-details/i, value: "test details"},
    //     ]
    //     await checkValidation(/Please select date of admission/i, validationData)
    // })

    // it('checks insurance provider validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // insuranceid
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-email/i, value: "test@email.com"},
    //         {testId: /doctor-name/i, value: "test name"},
    //         {testId: /doctor-number/i, value: "1234567890"},
    //         {testId: /medical-number/i, value: "CERTI-NUMBER"},
    //         {testId: /treatment-type/i, value: "Medical Management"},
    //         {testId: /treatment-name/i, value: "test name"},
    //         {testId: /treatment-details/i, value: "test details"},
    //         {testId: /doa/i, value: "20-May-2025"},
    //     ]
    //     await checkValidation(/Please select insurance provider/i, validationData)
    // })

    // it('checks insurance company name validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // insurance company name
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-email/i, value: "test@email.com"},
    //         {testId: /doctor-name/i, value: "test name"},
    //         {testId: /doctor-number/i, value: "1234567890"},
    //         {testId: /medical-number/i, value: "CERTI-NUMBER"},
    //         {testId: /treatment-type/i, value: "Medical Management"},
    //         {testId: /treatment-name/i, value: "test name"},
    //         {testId: /treatment-details/i, value: "test details"},
    //         {testId: /doa/i, value: "20-May-2025"},
    //         {testId: /insurance-provider/i, value: "12gdf98765cvbnmiut"},
    //     ]
    //     await checkValidation(/Please select insurance company name/i, validationData)
    // })

    // it('checks policy type validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // policy type
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-email/i, value: "test@email.com"},
    //         {testId: /doctor-name/i, value: "test name"},
    //         {testId: /doctor-number/i, value: "1234567890"},
    //         {testId: /medical-number/i, value: "CERTI-NUMBER"},
    //         {testId: /treatment-type/i, value: "Medical Management"},
    //         {testId: /treatment-name/i, value: "test name"},
    //         {testId: /treatment-details/i, value: "test details"},
    //         {testId: /doa/i, value: "20-May-2025"},
    //         {testId: /insurance-provider/i, value: "12gdf98765cvbnmiut"},
    //         {testId: /insurance-company-name/i, value: "Navi General Insurance Ltd."},
    //     ]
    //     await checkValidation(/Please select type of policy/i, validationData)
    // })

    // it('checks policy name validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // policy name
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-email/i, value: "test@email.com"},
    //         {testId: /doctor-name/i, value: "test name"},
    //         {testId: /doctor-number/i, value: "1234567890"},
    //         {testId: /medical-number/i, value: "CERTI-NUMBER"},
    //         {testId: /treatment-type/i, value: "Medical Management"},
    //         {testId: /treatment-name/i, value: "test name"},
    //         {testId: /treatment-details/i, value: "test details"},
    //         {testId: /doa/i, value: "20-May-2025"},
    //         {testId: /insurance-provider/i, value: "12gdf98765cvbnmiut"},
    //         {testId: /insurance-company-name/i, value: "Navi General Insurance Ltd."},
    //         {testId: /policy-type/i, value: "Retail Policy"},
    //     ]
    //     await checkValidation(/Please enter policy name/i, validationData)
    // })

    // it('checks doa validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // doa
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-email/i, value: "test@email.com"},
    //         {testId: /doctor-name/i, value: "test name"},
    //         {testId: /doctor-number/i, value: "1234567890"},
    //         {testId: /medical-number/i, value: "CERTI-NUMBER"},
    //         {testId: /treatment-type/i, value: "Medical Management"},
    //         {testId: /treatment-name/i, value: "test name"},
    //         {testId: /treatment-details/i, value: "test details"},
    //     ]
    //     await checkValidation(/Please select date of admission/i, validationData)
    // })

    // it('checks policy number validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // policy number
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-email/i, value: "test@email.com"},
    //         {testId: /doctor-name/i, value: "test name"},
    //         {testId: /doctor-number/i, value: "1234567890"},
    //         {testId: /medical-number/i, value: "CERTI-NUMBER"},
    //         {testId: /treatment-type/i, value: "Medical Management"},
    //         {testId: /treatment-name/i, value: "test name"},
    //         {testId: /treatment-details/i, value: "test details"},
    //         {testId: /doa/i, value: "20-May-2025"},
    //         {testId: /insurance-provider/i, value: "12gdf98765cvbnmiut"},
    //         {testId: /insurance-company-name/i, value: "Navi General Insurance Ltd."},
    //         {testId: /policy-type/i, value: "Retail Policy"},
    //         {testId: /policy-name/i, value: "Retail Name"},
    //     ]
    //     await checkValidation(/Please enter policy number/i, validationData)
    // })

    // it('checks dod validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // dod
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-email/i, value: "test@email.com"},
    //         {testId: /doctor-name/i, value: "test name"},
    //         {testId: /doctor-number/i, value: "1234567890"},
    //         {testId: /medical-number/i, value: "CERTI-NUMBER"},
    //         {testId: /treatment-type/i, value: "Medical Management"},
    //         {testId: /treatment-name/i, value: "test name"},
    //         {testId: /treatment-details/i, value: "test details"},
    //         {testId: /doa/i, value: "20-May-2025"},
    //         {testId: /insurance-provider/i, value: "12gdf98765cvbnmiut"},
    //         {testId: /insurance-company-name/i, value: "Navi General Insurance Ltd."},
    //         {testId: /policy-type/i, value: "Retail Policy"},
    //         {testId: /policy-name/i, value: "Retail Name"},
    //         {testId: /policy-number/i, value: "PLY/0978/JHKL"},
    //     ]
    //     await checkValidation(/Please select date of discharge/i, validationData)
    // })

    // it('checks uhid validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // uhid
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-email/i, value: "test@email.com"},
    //         {testId: /doctor-name/i, value: "test name"},
    //         {testId: /doctor-number/i, value: "1234567890"},
    //         {testId: /medical-number/i, value: "CERTI-NUMBER"},
    //         {testId: /treatment-type/i, value: "Medical Management"},
    //         {testId: /treatment-name/i, value: "test name"},
    //         {testId: /treatment-details/i, value: "test details"},
    //         {testId: /doa/i, value: "20-May-2025"},
    //         {testId: /insurance-provider/i, value: "12gdf98765cvbnmiut"},
    //         {testId: /insurance-company-name/i, value: "Navi General Insurance Ltd."},
    //         {testId: /policy-type/i, value: "Retail Policy"},
    //         {testId: /policy-name/i, value: "Retail Name"},
    //         {testId: /policy-number/i, value: "PLY/0978/JHKL"},
    //         {testId: /dod/i, value: "21-May-2025"},
    //     ]
    //     await checkValidation(/Please enter member ID\/UHID/i, validationData)
    // })

    // it('checks room category validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // room category
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-email/i, value: "test@email.com"},
    //         {testId: /doctor-name/i, value: "test name"},
    //         {testId: /doctor-number/i, value: "1234567890"},
    //         {testId: /medical-number/i, value: "CERTI-NUMBER"},
    //         {testId: /treatment-type/i, value: "Medical Management"},
    //         {testId: /treatment-name/i, value: "test name"},
    //         {testId: /treatment-details/i, value: "test details"},
    //         {testId: /doa/i, value: "20-May-2025"},
    //         {testId: /insurance-provider/i, value: "12gdf98765cvbnmiut"},
    //         {testId: /insurance-company-name/i, value: "Navi General Insurance Ltd."},
    //         {testId: /policy-type/i, value: "Retail Policy"},
    //         {testId: /policy-name/i, value: "Retail Name"},
    //         {testId: /policy-number/i, value: "PLY/0978/JHKL"},
    //         {testId: /dod/i, value: "21-May-2025"},
    //         {testId: /uhid/i, value: "UHI-JHKM-7678"},
    //     ]
    //     await checkValidation(/Please select room category/i, validationData)

    //     // validationData = [
    //     //     {testId: /patient-email/i, value: 'email@test.com'},
    //     //     {testId: /patient-full-name/i, value: 'test name'},
    //     //     {testId: /patient-mobile/i, value: '1234567890'},
    //     //     {testId: /patient-address/i, value: 'testing address'},
    //     //     {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //     //     {testId: /patient-age/i, value: 10},
    //     //     {testId: /patient-gender/i, value: "M"},
    //     //     {testId: /contact-person-name/i, value: "test name"},
    //     //     {testId: /contact-person-relation/i, value: "test name"},
    //     //     {testId: /contact-person-age/i, value: 10},
    //     //     {testId: /contact-person-email/i, value: "test@email.com"},
    //     //     {testId: /doctor-name/i, value: "test name"},
    //     //     {testId: /doctor-number/i, value: "1234567890"},
    //     //     {testId: /medical-number/i, value: "CERTI-NUMBER"},
    //     //     {testId: /treatment-type/i, value: "Medical Management"},
    //     //     {testId: /treatment-name/i, value: "test name"},
    //     //     {testId: /treatment-details/i, value: "test details"},
    //     //     {testId: /doa/i, value: "20-May-2025"},
    //     //     {testId: /insurance-provider/i, value: "12gdf98765cvbnmiut"},
    //     //     {testId: /insurance-company-name/i, value: "Navi General Insurance Ltd."},
    //     //     {testId: /policy-type/i, value: "Retail Policy"},
    //     //     {testId: /policy-name/i, value: "Retail Name"},
    //     //     {testId: /policy-number/i, value: "PLY/0978/JHKL"},
    //     //     {testId: /dod/i, value: "21-May-2025"},
    //     //     {testId: /room-category/i, value: "OTHERS"},
    //     // ]
    //     // await checkValidation(/Room category specification is required when room category is OTHERS/i, validationData)
    // })

    // it('checks room rent per day validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // room rent per day
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-email/i, value: "test@email.com"},
    //         {testId: /doctor-name/i, value: "test name"},
    //         {testId: /doctor-number/i, value: "1234567890"},
    //         {testId: /medical-number/i, value: "CERTI-NUMBER"},
    //         {testId: /treatment-type/i, value: "Medical Management"},
    //         {testId: /treatment-name/i, value: "test name"},
    //         {testId: /treatment-details/i, value: "test details"},
    //         {testId: /doa/i, value: "20-May-2025"},
    //         {testId: /insurance-provider/i, value: "12gdf98765cvbnmiut"},
    //         {testId: /insurance-company-name/i, value: "Navi General Insurance Ltd."},
    //         {testId: /policy-type/i, value: "Retail Policy"},
    //         {testId: /policy-name/i, value: "Retail Name"},
    //         {testId: /policy-number/i, value: "PLY/0978/JHKL"},
    //         {testId: /dod/i, value: "21-May-2025"},
    //         {testId: /room-category/i, value: "ICU"},
    //     ]
    //     await checkValidation(/Please enter room rent per day/i, validationData)

    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-email/i, value: "test@email.com"},
    //         {testId: /doctor-name/i, value: "test name"},
    //         {testId: /doctor-number/i, value: "1234567890"},
    //         {testId: /medical-number/i, value: "CERTI-NUMBER"},
    //         {testId: /treatment-type/i, value: "Medical Management"},
    //         {testId: /treatment-name/i, value: "test name"},
    //         {testId: /treatment-details/i, value: "test details"},
    //         {testId: /doa/i, value: "20-May-2025"},
    //         {testId: /insurance-provider/i, value: "12gdf98765cvbnmiut"},
    //         {testId: /insurance-company-name/i, value: "Navi General Insurance Ltd."},
    //         {testId: /policy-type/i, value: "Retail Policy"},
    //         {testId: /policy-name/i, value: "Retail Name"},
    //         {testId: /policy-number/i, value: "PLY/0978/JHKL"},
    //         {testId: /dod/i, value: "21-May-2025"},
    //         {testId: /room-category/i, value: "ICU"},
    //         {testId: /room-rent-day/i, value: -1},
    //     ]
    //     await checkValidation(/Room rent per day cannot be negative/i, validationData)
    // })

    // it('checks total room rent validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // total room rent
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-email/i, value: "test@email.com"},
    //         {testId: /doctor-name/i, value: "test name"},
    //         {testId: /doctor-number/i, value: "1234567890"},
    //         {testId: /medical-number/i, value: "CERTI-NUMBER"},
    //         {testId: /treatment-type/i, value: "Medical Management"},
    //         {testId: /treatment-name/i, value: "test name"},
    //         {testId: /treatment-details/i, value: "test details"},
    //         {testId: /doa/i, value: "20-May-2025"},
    //         {testId: /insurance-provider/i, value: "12gdf98765cvbnmiut"},
    //         {testId: /insurance-company-name/i, value: "Navi General Insurance Ltd."},
    //         {testId: /policy-type/i, value: "Retail Policy"},
    //         {testId: /policy-name/i, value: "Retail Name"},
    //         {testId: /policy-number/i, value: "PLY/0978/JHKL"},
    //         {testId: /dod/i, value: "21-May-2025"},
    //         {testId: /room-category/i, value: "ICU"},
    //         {testId: /room-rent-day/i, value: 10},
    //     ]
    //     await checkValidation(/Please enter total room rent/i, validationData)

    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-email/i, value: "test@email.com"},
    //         {testId: /doctor-name/i, value: "test name"},
    //         {testId: /doctor-number/i, value: "1234567890"},
    //         {testId: /medical-number/i, value: "CERTI-NUMBER"},
    //         {testId: /treatment-type/i, value: "Medical Management"},
    //         {testId: /treatment-name/i, value: "test name"},
    //         {testId: /treatment-details/i, value: "test details"},
    //         {testId: /doa/i, value: "20-May-2025"},
    //         {testId: /insurance-provider/i, value: "12gdf98765cvbnmiut"},
    //         {testId: /insurance-company-name/i, value: "Navi General Insurance Ltd."},
    //         {testId: /policy-type/i, value: "Retail Policy"},
    //         {testId: /policy-name/i, value: "Retail Name"},
    //         {testId: /policy-number/i, value: "PLY/0978/JHKL"},
    //         {testId: /dod/i, value: "21-May-2025"},
    //         {testId: /room-category/i, value: "ICU"},
    //         {testId: /room-rent-day/i, value: 10},
    //         {testId: /total-room-rent/i, value: -1},
    //     ]
    //     await checkValidation(/Total room rent cannot be negative/i, validationData)
    // })

    // it('checks cvc validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // cvc
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-email/i, value: "test@email.com"},
    //         {testId: /doctor-name/i, value: "test name"},
    //         {testId: /doctor-number/i, value: "1234567890"},
    //         {testId: /medical-number/i, value: "CERTI-NUMBER"},
    //         {testId: /treatment-type/i, value: "Medical Management"},
    //         {testId: /treatment-name/i, value: "test name"},
    //         {testId: /treatment-details/i, value: "test details"},
    //         {testId: /doa/i, value: "20-May-2025"},
    //         {testId: /insurance-provider/i, value: "12gdf98765cvbnmiut"},
    //         {testId: /insurance-company-name/i, value: "Navi General Insurance Ltd."},
    //         {testId: /policy-type/i, value: "Retail Policy"},
    //         {testId: /policy-name/i, value: "Retail Name"},
    //         {testId: /policy-number/i, value: "PLY/0978/JHKL"},
    //         {testId: /dod/i, value: "21-May-2025"},
    //         {testId: /room-category/i, value: "ICU"},
    //         {testId: /room-rent-day/i, value: 10},
    //         {testId: /total-room-rent/i, value: 10},
    //     ]
    //     await checkValidation(/Please enter consultation and visiting charges/i, validationData)

    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-email/i, value: "test@email.com"},
    //         {testId: /doctor-name/i, value: "test name"},
    //         {testId: /doctor-number/i, value: "1234567890"},
    //         {testId: /medical-number/i, value: "CERTI-NUMBER"},
    //         {testId: /treatment-type/i, value: "Medical Management"},
    //         {testId: /treatment-name/i, value: "test name"},
    //         {testId: /treatment-details/i, value: "test details"},
    //         {testId: /doa/i, value: "20-May-2025"},
    //         {testId: /insurance-provider/i, value: "12gdf98765cvbnmiut"},
    //         {testId: /insurance-company-name/i, value: "Navi General Insurance Ltd."},
    //         {testId: /policy-type/i, value: "Retail Policy"},
    //         {testId: /policy-name/i, value: "Retail Name"},
    //         {testId: /policy-number/i, value: "PLY/0978/JHKL"},
    //         {testId: /dod/i, value: "21-May-2025"},
    //         {testId: /room-category/i, value: "ICU"},
    //         {testId: /room-rent-day/i, value: 10},
    //         {testId: /total-room-rent/i, value: 10},
    //         {testId: /doctor-charge/i, value: -1},
    //     ]
    //     await checkValidation(/Consultation charges cannot be negative/i, validationData)
    // })

    // it('checks cost estimation validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // cost estimation
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-email/i, value: "test@email.com"},
    //         {testId: /doctor-name/i, value: "test name"},
    //         {testId: /doctor-number/i, value: "1234567890"},
    //         {testId: /medical-number/i, value: "CERTI-NUMBER"},
    //         {testId: /treatment-type/i, value: "Medical Management"},
    //         {testId: /treatment-name/i, value: "test name"},
    //         {testId: /treatment-details/i, value: "test details"},
    //         {testId: /doa/i, value: "20-May-2025"},
    //         {testId: /insurance-provider/i, value: "12gdf98765cvbnmiut"},
    //         {testId: /insurance-company-name/i, value: "Navi General Insurance Ltd."},
    //         {testId: /policy-type/i, value: "Retail Policy"},
    //         {testId: /policy-name/i, value: "Retail Name"},
    //         {testId: /policy-number/i, value: "PLY/0978/JHKL"},
    //         {testId: /dod/i, value: "21-May-2025"},
    //         {testId: /room-category/i, value: "ICU"},
    //         {testId: /room-rent-day/i, value: 10},
    //         {testId: /total-room-rent/i, value: 10},
    //         {testId: /doctor-charge/i, value: 10},
    //     ]
    //     await checkValidation(/Please enter cost estimation/i, validationData)

    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-email/i, value: "test@email.com"},
    //         {testId: /doctor-name/i, value: "test name"},
    //         {testId: /doctor-number/i, value: "1234567890"},
    //         {testId: /medical-number/i, value: "CERTI-NUMBER"},
    //         {testId: /treatment-type/i, value: "Medical Management"},
    //         {testId: /treatment-name/i, value: "test name"},
    //         {testId: /treatment-details/i, value: "test details"},
    //         {testId: /doa/i, value: "20-May-2025"},
    //         {testId: /insurance-provider/i, value: "12gdf98765cvbnmiut"},
    //         {testId: /insurance-company-name/i, value: "Navi General Insurance Ltd."},
    //         {testId: /policy-type/i, value: "Retail Policy"},
    //         {testId: /policy-name/i, value: "Retail Name"},
    //         {testId: /policy-number/i, value: "PLY/0978/JHKL"},
    //         {testId: /dod/i, value: "21-May-2025"},
    //         {testId: /room-category/i, value: "ICU"},
    //         {testId: /room-rent-day/i, value: 10},
    //         {testId: /total-room-rent/i, value: 10},
    //         {testId: /doctor-charge/i, value: 10},
    //         {testId: /cost-estimation/i, value: -1},
    //     ]
    //     await checkValidation(/Cost estimation cannot be negative/i, validationData)
    // })

    // it('checks pharmacy validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // pharmacy
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-email/i, value: "test@email.com"},
    //         {testId: /doctor-name/i, value: "test name"},
    //         {testId: /doctor-number/i, value: "1234567890"},
    //         {testId: /medical-number/i, value: "CERTI-NUMBER"},
    //         {testId: /treatment-type/i, value: "Medical Management"},
    //         {testId: /treatment-name/i, value: "test name"},
    //         {testId: /treatment-details/i, value: "test details"},
    //         {testId: /doa/i, value: "20-May-2025"},
    //         {testId: /insurance-provider/i, value: "12gdf98765cvbnmiut"},
    //         {testId: /insurance-company-name/i, value: "Navi General Insurance Ltd."},
    //         {testId: /policy-type/i, value: "Retail Policy"},
    //         {testId: /policy-name/i, value: "Retail Name"},
    //         {testId: /policy-number/i, value: "PLY/0978/JHKL"},
    //         {testId: /dod/i, value: "21-May-2025"},
    //         {testId: /room-category/i, value: "ICU"},
    //         {testId: /room-rent-day/i, value: 10},
    //         {testId: /total-room-rent/i, value: 10},
    //         {testId: /doctor-charge/i, value: 10},
    //         {testId: /cost-estimation/i, value: 10},
    //     ]
    //     await checkValidation(/Please enter pharmacy\/medicine charges/i, validationData)

    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-email/i, value: "test@email.com"},
    //         {testId: /doctor-name/i, value: "test name"},
    //         {testId: /doctor-number/i, value: "1234567890"},
    //         {testId: /medical-number/i, value: "CERTI-NUMBER"},
    //         {testId: /treatment-type/i, value: "Medical Management"},
    //         {testId: /treatment-name/i, value: "test name"},
    //         {testId: /treatment-details/i, value: "test details"},
    //         {testId: /doa/i, value: "20-May-2025"},
    //         {testId: /insurance-provider/i, value: "12gdf98765cvbnmiut"},
    //         {testId: /insurance-company-name/i, value: "Navi General Insurance Ltd."},
    //         {testId: /policy-type/i, value: "Retail Policy"},
    //         {testId: /policy-name/i, value: "Retail Name"},
    //         {testId: /policy-number/i, value: "PLY/0978/JHKL"},
    //         {testId: /dod/i, value: "21-May-2025"},
    //         {testId: /room-category/i, value: "ICU"},
    //         {testId: /room-rent-day/i, value: 10},
    //         {testId: /total-room-rent/i, value: 10},
    //         {testId: /doctor-charge/i, value: 10},
    //         {testId: /cost-estimation/i, value: 10},
    //         {testId: /pharmacy-charge/i, value: -1},
    //     ]
    //     await checkValidation(/Pharmacy charges cannot be negative/i, validationData)
    // })

    // it('checks treatment cost validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // treatment cost
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-email/i, value: "test@email.com"},
    //         {testId: /doctor-name/i, value: "test name"},
    //         {testId: /doctor-number/i, value: "1234567890"},
    //         {testId: /medical-number/i, value: "CERTI-NUMBER"},
    //         {testId: /treatment-type/i, value: "Medical Management"},
    //         {testId: /treatment-name/i, value: "test name"},
    //         {testId: /treatment-details/i, value: "test details"},
    //         {testId: /doa/i, value: "20-May-2025"},
    //         {testId: /insurance-provider/i, value: "12gdf98765cvbnmiut"},
    //         {testId: /insurance-company-name/i, value: "Navi General Insurance Ltd."},
    //         {testId: /policy-type/i, value: "Retail Policy"},
    //         {testId: /policy-name/i, value: "Retail Name"},
    //         {testId: /policy-number/i, value: "PLY/0978/JHKL"},
    //         {testId: /dod/i, value: "21-May-2025"},
    //         {testId: /room-category/i, value: "ICU"},
    //         {testId: /room-rent-day/i, value: 10},
    //         {testId: /total-room-rent/i, value: 10},
    //         {testId: /doctor-charge/i, value: 10},
    //         {testId: /cost-estimation/i, value: 10},
    //         {testId: /pharmacy-charge/i, value: 10},
    //     ]
    //     await checkValidation(/Please enter treatment cost/i, validationData)

    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-email/i, value: "test@email.com"},
    //         {testId: /doctor-name/i, value: "test name"},
    //         {testId: /doctor-number/i, value: "1234567890"},
    //         {testId: /medical-number/i, value: "CERTI-NUMBER"},
    //         {testId: /treatment-type/i, value: "Medical Management"},
    //         {testId: /treatment-name/i, value: "test name"},
    //         {testId: /treatment-details/i, value: "test details"},
    //         {testId: /doa/i, value: "20-May-2025"},
    //         {testId: /insurance-provider/i, value: "12gdf98765cvbnmiut"},
    //         {testId: /insurance-company-name/i, value: "Navi General Insurance Ltd."},
    //         {testId: /policy-type/i, value: "Retail Policy"},
    //         {testId: /policy-name/i, value: "Retail Name"},
    //         {testId: /policy-number/i, value: "PLY/0978/JHKL"},
    //         {testId: /dod/i, value: "21-May-2025"},
    //         {testId: /room-category/i, value: "ICU"},
    //         {testId: /room-rent-day/i, value: 10},
    //         {testId: /total-room-rent/i, value: 10},
    //         {testId: /doctor-charge/i, value: 10},
    //         {testId: /cost-estimation/i, value: 10},
    //         {testId: /pharmacy-charge/i, value: 10},
    //         {testId: /treatment-cost/i, value: -1},
    //     ]
    //     await checkValidation(/Treatment cost cannot be negative/i, validationData)
    // })

    // it('checks other charges validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // other charge
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-email/i, value: "test@email.com"},
    //         {testId: /doctor-name/i, value: "test name"},
    //         {testId: /doctor-number/i, value: "1234567890"},
    //         {testId: /medical-number/i, value: "CERTI-NUMBER"},
    //         {testId: /treatment-type/i, value: "Medical Management"},
    //         {testId: /treatment-name/i, value: "test name"},
    //         {testId: /treatment-details/i, value: "test details"},
    //         {testId: /doa/i, value: "20-May-2025"},
    //         {testId: /insurance-provider/i, value: "12gdf98765cvbnmiut"},
    //         {testId: /insurance-company-name/i, value: "Navi General Insurance Ltd."},
    //         {testId: /policy-type/i, value: "Retail Policy"},
    //         {testId: /policy-name/i, value: "Retail Name"},
    //         {testId: /policy-number/i, value: "PLY/0978/JHKL"},
    //         {testId: /dod/i, value: "21-May-2025"},
    //         {testId: /room-category/i, value: "ICU"},
    //         {testId: /room-rent-day/i, value: 10},
    //         {testId: /total-room-rent/i, value: 10},
    //         {testId: /doctor-charge/i, value: 10},
    //         {testId: /cost-estimation/i, value: 10},
    //         {testId: /pharmacy-charge/i, value: 10},
    //         {testId: /treatment-cost/i, value: 10},
    //         {testId: /other-charge/i, value: -1},
    //     ]
    //     await checkValidation(/Other charges cannot be negative/i, validationData)
    // })

    // it('checks investigation validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // investigation
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-email/i, value: "test@email.com"},
    //         {testId: /doctor-name/i, value: "test name"},
    //         {testId: /doctor-number/i, value: "1234567890"},
    //         {testId: /medical-number/i, value: "CERTI-NUMBER"},
    //         {testId: /treatment-type/i, value: "Medical Management"},
    //         {testId: /treatment-name/i, value: "test name"},
    //         {testId: /treatment-details/i, value: "test details"},
    //         {testId: /doa/i, value: "20-May-2025"},
    //         {testId: /insurance-provider/i, value: "12gdf98765cvbnmiut"},
    //         {testId: /insurance-company-name/i, value: "Navi General Insurance Ltd."},
    //         {testId: /policy-type/i, value: "Retail Policy"},
    //         {testId: /policy-name/i, value: "Retail Name"},
    //         {testId: /policy-number/i, value: "PLY/0978/JHKL"},
    //         {testId: /dod/i, value: "21-May-2025"},
    //         {testId: /room-category/i, value: "ICU"},
    //         {testId: /room-rent-day/i, value: 10},
    //         {testId: /total-room-rent/i, value: 10},
    //         {testId: /doctor-charge/i, value: 10},
    //         {testId: /cost-estimation/i, value: 10},
    //         {testId: /pharmacy-charge/i, value: 10},
    //         {testId: /treatment-cost/i, value: 10},
    //         {testId: /other-charge/i, value: 10},
    //         {testId: /investigation-charge/i, value: -1},
    //     ]
    //     await checkValidation(/Investigation charges cannot be negative/i, validationData)
    // })

    // it('checks discount validation for the form', async () => {
    //     const mockSetOpenModal = vi.fn()
    //     renderWithProviders(<AddBookingModal setOpenModal={mockSetOpenModal} />);

    //     // discount
    //     validationData = [
    //         {testId: /patient-email/i, value: 'email@test.com'},
    //         {testId: /patient-full-name/i, value: 'test name'},
    //         {testId: /patient-mobile/i, value: '1234567890'},
    //         {testId: /patient-address/i, value: 'testing address'},
    //         {testId: /patient-dob/i, value: new Date(Date.now()).toISOString()},
    //         {testId: /patient-age/i, value: 10},
    //         {testId: /patient-gender/i, value: "M"},
    //         {testId: /contact-person-name/i, value: "test name"},
    //         {testId: /contact-person-relation/i, value: "test name"},
    //         {testId: /contact-person-age/i, value: 10},
    //         {testId: /contact-person-email/i, value: "test@email.com"},
    //         {testId: /doctor-name/i, value: "test name"},
    //         {testId: /doctor-number/i, value: "1234567890"},
    //         {testId: /medical-number/i, value: "CERTI-NUMBER"},
    //         {testId: /treatment-type/i, value: "Medical Management"},
    //         {testId: /treatment-name/i, value: "test name"},
    //         {testId: /treatment-details/i, value: "test details"},
    //         {testId: /doa/i, value: "20-May-2025"},
    //         {testId: /insurance-provider/i, value: "12gdf98765cvbnmiut"},
    //         {testId: /insurance-company-name/i, value: "Navi General Insurance Ltd."},
    //         {testId: /policy-type/i, value: "Retail Policy"},
    //         {testId: /policy-name/i, value: "Retail Name"},
    //         {testId: /policy-number/i, value: "PLY/0978/JHKL"},
    //         {testId: /dod/i, value: "21-May-2025"},
    //         {testId: /room-category/i, value: "ICU"},
    //         {testId: /room-rent-day/i, value: 10},
    //         {testId: /total-room-rent/i, value: 10},
    //         {testId: /doctor-charge/i, value: 10},
    //         {testId: /cost-estimation/i, value: 10},
    //         {testId: /pharmacy-charge/i, value: 10},
    //         {testId: /treatment-cost/i, value: 10},
    //         {testId: /other-charge/i, value: 10},
    //         {testId: /investigation-charge/i, value: 10},
    //         {testId: /discount/i, value: -1},
    //     ]
    //     await checkValidation(/Discount cannot be negative/i, validationData)
    // })
})