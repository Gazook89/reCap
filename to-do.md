### To Do:

#### Multiple Encounters:
- add button to create a new additional table for tracking either multiple characters or combat encounters.
    - on page load, 
        - for each table that exists in localStorage, create a table and then load stored table.innerHTML to that table.
        - if there are no stored tables, create a blank table.
        - programmatically add a "new encounter" button
            - onclick creates a blank table with a sequential ID, an input to change the ID (from which they *key* in localStorage is derived), and an associated toolbar.  Toolbar will have a "delete table" button to delete the encounter and remove it from localStorage.
            - also includes an "encounter group" text input, which is check against other encounters to pair them up.  Paired encounters follow the same turn tracker (columnHighlight)

##### Tasks to Complete Multi Encounters:
- [x] set up creation of blank encounter on page load.
    - [x] create an encounter wrapper div
    - [x] create encounter name input
    - [x] create table with rows & columns
    - [x] create toolbar
    - [] create add/remove column 'quick buttons' in last column header (or rethink those buttons)
- [] assign event listeners across the table
    - [] be sure functions have the necessary level of specificity so they target the correct elements
    - On creation, 
        - [] add .add-action event listener to each body cell
        - [] add .columnHighlight listener to each header



### Other To-Do's:
- add free-form textarea for each turn.
- investigate better debounce method (`debounce-lead`)
- if expanding an effect into an occupied cell, create new row and move expanding effect into that row
- add effect tooltips on hover for more detailed info
- add color presets/datalist to color picker (mostly for Chrome) or add better color picker (jscolor?).
- save table information not as a .innerHTML of the whole table, but as an array of objects.
    - Each effect is an object, with keys such as "duration", "name", "default color", "description", etc.
    - The effect objects themselves are stored within another object, with keys such as "row index", "column index", and "colspan".  And to save changes from the default, the current values of "duration", "name", and "color" but maybe that is overkill....

### Longer Term:
- add ability to change row bg color
- add light theme
- improve accessibility: larger font mode, other stuff...
- export table as csv or turn-by-turn summary
- track bennies spent
- add directory of spells
- create user accounts
