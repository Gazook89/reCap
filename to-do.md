### To Do:

### Other To-Do's:
- Add "other options" button to encounter titlebar
    - add option to lock scroll position between characters within same encounter
- add "other options" button to character titlebar
    - change font of character name
    - add row to table
    - add column to table
- add ability to set turn order, changing the order of the characters.
- add free-form textarea for each turn.
- investigate better debounce method (`debounce-lead`)
- if expanding an effect into an occupied cell, create new row and move expanding effect into that row
- add effect tooltips on hover for more detailed info
- add color presets/datalist to color picker (mostly for Chrome) or add better color picker (jscolor?).
- save table information not as a .innerHTML of the whole table, but as an array of objects.
    - Each effect is an object, with keys such as "duration", "name", "default color", "description", etc.
    - The effect objects themselves are stored within another object, with keys such as "row index", "column index", and "colspan".  And to save changes from the default, the current values of "duration", "name", and "color" but maybe that is overkill....

### Longer Term:
- add fontawesome
- add ability to change row bg color
- add light theme
- improve accessibility: larger font mode, other stuff...
- export table as csv or turn-by-turn summary
- track bennies spent
- track card dealt (or more generically, turn order)
- add directory of spells
- create user accounts
