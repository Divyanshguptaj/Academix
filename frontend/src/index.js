import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter} from 'react-router-dom'
import {Provider} from 'react-redux'
import rootReducer from './reducer';
import {configureStore} from '@reduxjs/toolkit'
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from './contexts/SocketContext';
const store = configureStore({
  reducer: rootReducer,
})
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <SocketProvider>
          <App />
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1d1d1d',
                color: '#CFCFCF',
                border: '1px solid #262626',
                borderRadius: '8px',
                fontSize: '14px',
                maxWidth: '360px',
                padding: '12px 16px',
              },
              success: {
                iconTheme: { primary: '#facc15', secondary: '#1d1d1d' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#1d1d1d' },
              },
              loading: {
                iconTheme: { primary: '#facc15', secondary: '#1d1d1d' },
              },
            }}
          />
        </SocketProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
