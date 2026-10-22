import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n'
import merge from 'lodash.merge'
import '@rainbow-me/rainbowkit/styles.css'

import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from "react-router-dom";
import { wagmiConfig } from './config/wagmi'


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Deshabilitar ENS queries automáticas que usan eth.merkle.io
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
})

// 👇 inferimos el tipo desde darkTheme()
type RainbowTheme = ReturnType<typeof darkTheme>

const myTheme: RainbowTheme = merge(darkTheme(), {
  colors: {
    accentColor: '#4765a0ff',
    accentColorForeground: '#ffffff',
    modalBackground: '#0f172a',
    menuItemBackground: '#757981ff',

    // 👇 fuerza todo a blanco
    modalText: '#ffffff',
    modalTextSecondary: '#ffffff',
    modalTextDim: '#ffffff',
    generalBorderDim: '#ffffff',
    standby: '#ffffff',
  },
  radii: {
    connectButton: '0.75rem',
    modal: '1rem',
  },
})





ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={myTheme}
          showRecentTransactions={false}
        >
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
)
