import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Board from './Board.tsx'
import rfdc from 'rfdc'
import {generateValidBoardRuleBased, generateValidBoardRecursive} from './BoardGenerator.ts'

const puzzleBoard = generateValidBoardRuleBased(10);


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Board board={puzzleBoard}></Board>
  </StrictMode>,
)
