
<p align="center">
  <img src="https://github.com/user-attachments/assets/ee6dea56-9489-44a8-b037-d4e3c158e2b8" />
</p>

# queens
Hi everyone! This is an open-source clone of Linkedin's Queens game. My collaborator Ben (@PokerPuppy2514) and I (@zkhan04) have gotten addicted recently. However, after looking for alternatives online, we couldn't find any that have the same features as Linkedin's version, such as auto-placing X's. Therefore, we took it upon ourselves.


![image](https://github.com/user-attachments/assets/9d7a58a3-d15e-41d1-b70d-35ace6758d1b)


## v1 launch
- **Launched an initial version on December 31st, 2024**
- Using React and Typescript, I created a responsive user experience, where users can click to place dots and crowns.
  - When a user places a crown, any cells of the same row, column, or color, or directly touching the crown are automatically eliminated. This quality-of-life feature isn't available on other alternatives.
- I designed and implemented a graph-based algorithm using `graphlib` to efficiently partition n x n square boards into n contiguous color regions.
- In order to filter out bad puzzles from the generator (either 0 solutions or multiple solutions), I coded a rule-based solver. This solver is meant to emulate how a human would approach the puzzle. On large puzzles (n>=10), rule-based solvers are anywhere from 30-100 times faster than backtracking solvers.

## things i've done (but haven't launched yet)
- Introduced a database of puzzles hosted using a MongoDB Atlas cluster. Wrote an API layer using Typescript + Serverless framework to fetch and upload puzzles, hosted on AWS Lambda.
- Added difficulty calculation to puzzles, allowing for users to request easier/harder puzzles

## UPCOMING GOALS
- Stop being lazy and actually make a decent frontend :D
- Refine the user experience for mobile devices
- Write cron job for automatically populating puzzle database at night
- Add accounts, leaderboards, custom color schemes
