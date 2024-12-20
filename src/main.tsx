import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Board from './Board.tsx'
import sampleBoard from './sampleBoard.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Board board={sampleBoard}></Board>
  </StrictMode>,
)
