import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Board from './Board.tsx'
import rfdc from 'rfdc'
import {generateValidBoard} from './BoardGenerator.ts'

const puzzleBoard = generateValidBoard(8);


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Board board={puzzleBoard}></Board>
  </StrictMode>,
)
