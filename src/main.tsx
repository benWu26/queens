import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Board from './Board.tsx'
import sampleBoard from './sampleBoard.ts'
import { solvePuzzle } from './BoardLogic.ts'
import rfdc from 'rfdc'
const clone = rfdc();
import { createGraph, colorGraph, generateBoard } from './BoardLogic.ts'

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
