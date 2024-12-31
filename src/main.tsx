import { InputHTMLAttributes, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import FullGame from './FullGame.tsx'
import React from 'react';
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App></App>
    </BrowserRouter>
    
    

  </StrictMode>,
)
