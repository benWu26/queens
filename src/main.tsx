import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Board from './Board.tsx'
import { solvePuzzle } from './BoardLogic.ts'
import rfdc from 'rfdc'
const clone = rfdc();
import {generateBoard } from './BoardGenerator.ts'

let validPuzzleGenerated = false;
let puzzleBoard;

do {
  puzzleBoard = generateBoard(8);
    if (solvePuzzle(clone(puzzleBoard)).length === 1){
      validPuzzleGenerated = true;
    }
} while (!validPuzzleGenerated)


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Board board={puzzleBoard}></Board>
    <p>{solvePuzzle(clone(puzzleBoard)).length}</p>
  </StrictMode>,
)
