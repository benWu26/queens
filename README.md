# queens
Hi everyone! This is a clone of Linkedin's Queens game. My collaborator Ben (@PokerPuppy2514) and I (@zkhan04) have gotten addicted recently. However, after looking for alternatives online, we couldn't find any that have the same features as Linkedin's version, such as auto-placing X's. Therefore, we took it upon ourselves.

## RULE OVERVIEW
![image](https://github.com/user-attachments/assets/26d271ac-ac80-4414-90db-ae3a4693b8f7)

The board is an n x n grid like the one shown above. The user must place n crowns on the board such that:
- there is only one crown in each row, column, and color group.
- no two crowns can touch, even diagonally.
  
Below is the solution for this board:

![image](https://github.com/user-attachments/assets/2c69633c-2cf4-491c-a131-0e79f8964098)

## CURRENT PROGRESS
- Using React and Typescript, I created a responsive user experience, where users can click to place dots and crowns.
  - When a user places a crown, any cells of the same row, column, or color, or directly touching the crown are automatically eliminated. This quality-of-life feature isn't available on other alternatives.
- I designed and implemented a graph-based algorithm using `graphlib` to efficiently partition n x n square boards into n contiguous color regions.
- In order to filter out bad puzzles from the generator (either 0 solutions or multiple solutions), I coded a rule-based solver. This solver is meant to emulate how a human would approach the puzzle. On large puzzles (n>=10), rule-based solvers are anywhere from 10-100 times faster than backtracking solvers.

## UPCOMING GOALS
- Launch a first version after implementing some UX features
- Refine the user experience for mobile devices
- Generate puzzles server-side instead of client-side
- Add a timer and leaderboard

## IF YOU WANT TO TRY IT YOURSELF
- clone the repository onto your laptop
- download [Node.js](https://nodejs.org/en/download) if you don't already have it
- cd into the repository folder, run `npm install` to install all dependencies
- run `npm run dev`, and open the localhost port on your browser
