import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Board from './Board.tsx'
import { solvePuzzleRuleBased, solvePuzzleRecursively } from './BoardSolver.ts'
import rfdc from 'rfdc'
import sampleBoard from './sampleBoard.ts'
const clone = rfdc();
import {generateValidBoard, testGenerationSpeed, generateOneBoard } from './BoardGenerator.ts'

//const puzzleBoard = sampleBoard;
const puzzleBoard = generateValidBoard(8);


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Board board={puzzleBoard}></Board>
    <p>possible solutions: {solvePuzzleRecursively(clone(puzzleBoard)).length}</p>
  </StrictMode>,
)
