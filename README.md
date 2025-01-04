
<p align="center">
  <img src="https://github.com/user-attachments/assets/ee6dea56-9489-44a8-b037-d4e3c158e2b8" />
</p>

# queens
Hi everyone! This is an open-source clone of Linkedin's Queens game. My collaborator Ben (@PokerPuppy2514) and I (@zkhan04) have gotten addicted recently. However, after looking for alternatives online, we couldn't find any that have the same features as Linkedin's version, such as auto-placing X's. Therefore, we took it upon ourselves.


![image](https://github.com/user-attachments/assets/9d7a58a3-d15e-41d1-b70d-35ace6758d1b)


## CURRENT PROGRESS
- **Launched an initial version on December 31st, 2024**
- Using React and Typescript, I created a responsive user experience, where users can click to place dots and crowns.
  - When a user places a crown, any cells of the same row, column, or color, or directly touching the crown are automatically eliminated. This quality-of-life feature isn't available on other alternatives.
- I designed and implemented a graph-based algorithm using `graphlib` to efficiently partition n x n square boards into n contiguous color regions.
- In order to filter out bad puzzles from the generator (either 0 solutions or multiple solutions), I coded a rule-based solver. This solver is meant to emulate how a human would approach the puzzle. On large puzzles (n>=10), rule-based solvers are anywhere from 10-100 times faster than backtracking solvers.

## UPCOMING GOALS
- Refine the user experience for mobile devices
- Generate puzzles server-side instead of client-side
- Add a timer and leaderboard
