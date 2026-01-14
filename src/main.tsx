import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createTheme, MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import { Provider } from 'react-redux'
import store from './app/store.ts'

const theme = createTheme({
  fontFamily: 'Poppins, sans-serif',
  fontSizes: {
    sm: "0.7rem"
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <MantineProvider theme={theme}>
        <Notifications containerWidth={250} position='top-right'/>
        <App />
      </MantineProvider>
    </Provider>
  </StrictMode>,
)
