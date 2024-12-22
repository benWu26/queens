import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Board from './Board.tsx'
import sampleBoard from './sampleBoard.ts'
import { solvePuzzle } from './BoardLogic.ts'
import rfdc from 'rfdc'
const clone = rfdc();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Board board={sampleBoard}></Board>
    <p>possible solutions: {solvePuzzle(clone(sampleBoard)).length}</p>
  </StrictMode>,
)
