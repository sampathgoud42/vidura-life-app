# Old wellness app: content sources (reference only)

Copies of the data files from the earlier Vidura World wellness site, kept here so
this project never has to reach outside its own folder. Nothing imports them.

- `wellnessGoals.js`: per-goal remedies (Both / Modern / Ayurvedic × men / women),
  morning additions, foods to eat / avoid and tips.
- `wellnessData.js`: the daily morning ritual, gender additions, age notes and meal data.

Their content was ported into `src/data/content.ts` (`TRICKS`, `DAILY_RITUAL`,
`MORNING_ADDS`, `FOOD_GUIDES`, the gendered `TIPS`, and the fertility guide),
rewritten without health claims. Items with safety concerns (shilajit, guggul,
kapikacchu, daily neem, giloy) and the unsupported "testosterone secrets" were
left out; the latter are answered as myths in the fertility guide.
