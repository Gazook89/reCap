### To Do:
- Need to revise the saving method so that it is more *condensed* than just saving the whole table structure, and more flexible.  
    - possibly save as csv-like?
    - should capture non-table information, such as encounter and character names, as well as plot point data.
    - ideally well segmented, so data points can be dropped off as storage capacity fills up.


### Other To-Do's:
- add WYSIWYG editor to plot points (CKEditor5?)
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
- add ability to change row bg color
- add light theme
- improve accessibility: larger font mode, other stuff...
- export table as csv or turn-by-turn summary
- track bennies spent
- track card dealt (or more generically, turn order)
- add directory of spells
- create user accounts

## Saving Revision


saved = [
    {  // Event
        id: 1,
        type: 'Encounter'  // or Plot Point,
        name: 'The Coliseum',
        color: 'blue',
        collapsed: false,
        turn: 5,
        characters: [
            {
                name: 'Dekk Ashfang',
                color: 'red',
                collapsed: false,
                tableSize: [11, 5],
                actions: [
                    {
                        name: 'divine smite',
                        duration: 5,
                        color: 'blue',
                        cellIndex: 10   //  get the total count of cells, and then just grab the cell's index if counting left to right, top to bottom
                    },
                    {
                        name: 'boost strength',
                        duration: 5,
                        color: 'yellow',
                        cellIndex: 24
                    },
                    {
                        name: 'Prismatic Wall',
                        duration: 10,
                        color: 'green',
                        cellIndex: 28
                    },
                ]
            },
            {
                name: 'Jack Mehoff',
                color: 'green',
                collapsed: true,
                tableSize: [11, 5],
                actions: [
                    {
                        name: 'Fear',
                        duration: 1,
                        color: 'blue',
                        cellIndex: 2
                    },
                    {
                        name: 'boost strength',
                        duration: 5,
                        color: 'yellow',
                        cellIndex: 12
                    }
                ]
            }
        ]
    },
    {
        id: 2,
        type: 'Plot',
        name: 'A challenger appears...',
        collapsed: false,
        color: 'red',
        text: 'Lorem ipsum....'
    }
]