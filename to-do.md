### To Do:
- add 'collapsed' to list of things that gets reloaded on page reload.  Likely depends on updating the Options menu function to only hide/show the options, rather than recreating them on each click.


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