import { InputHTMLAttributes, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Board from './Board.tsx'
import rfdc from 'rfdc'
import {generateValidBoardRuleBased, generateValidBoardRecursive} from './BoardGenerator.ts'
import FullGame from './FullGame.tsx'
//const puzzleBoard = generateValidBoardRuleBased(10);


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FullGame></FullGame>
    

  </StrictMode>,
)
