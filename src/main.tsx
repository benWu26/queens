import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Board from './Board.tsx'
import { solvePuzzleRuleBased, solvePuzzleRecursively } from './BoardSolver.ts'
import rfdc from 'rfdc'
const clone = rfdc();
import {generateValidBoard, testGenerationSpeed, generateOneBoard } from './BoardGenerator.ts'

const puzzleBoard = generateValidBoard(8);
solvePuzzleRuleBased(puzzleBoard);


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Board board={puzzleBoard}></Board>
    <p>possible solutions: {solvePuzzleRecursively(clone(puzzleBoard)).length}</p>
  </StrictMode>,
)
