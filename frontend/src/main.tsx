// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
// import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Include JavaScript for Bootstrap components


const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
 <AuthProvider>
   <App />
 </AuthProvider>
);
