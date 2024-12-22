import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Board from './Board.tsx'
import { solvePuzzle } from './BoardLogic.ts'
import rfdc from 'rfdc'
const clone = rfdc();
import {generateValidBoard, testGenerationSpeed, generateOneBoard } from './BoardGenerator.ts'

const puzzleBoard = generateValidBoard(9);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Board board={puzzleBoard}></Board>
    <p>possible solutions: {solvePuzzle(clone(puzzleBoard)).length}</p>
  </StrictMode>,
)
