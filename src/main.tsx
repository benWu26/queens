import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Board from './Board.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Board></Board>
  </StrictMode>,
)
