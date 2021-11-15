window.onload = function() {
    // record structure of table on every change.
    // check out https://codeburst.io/observe-changes-in-dom-using-mutationobserver-9c2705222751
    // mutationRecords has properties that can be accessed.  

    // const table = document.getElementById('main-table');
    // let timer = null;
    // let observer = new MutationObserver(mutationRecords => { 
    //     mutationRecords.forEach((mutation)=>{
    //         if( mutation.addedNodes[0]?.className === 'add-action' || mutation.removedNodes[0]?.className === 'add-action'){
    //             return;
    //         } else {
    //             if(timer != null){                                      
    //                 clearTimeout(timer);
    //                 timer = null;
    //             };
    //             if(document.getElementById('savedNotice')){document.getElementById('savedNotice').textContent = ''};
    //             timer = setTimeout(save, 5000); // 5 second delay
    //         }
    //     })
        
    // });

    // observer.observe(table, {
    //     childList : true,
    //     subtree: true,
    //     attributes : true
    // });

    
    // If previous table exists in storage, restore it:
    // if('table' in localStorage){
    //     table.innerHTML = localStorage.getItem('table');
    // }

    showAddEncounterButton();
    
    // addEncounter();

    // Once table is built, apply event listeners.
    const cells = document.querySelectorAll('th,td');
    for(let x=0;x<cells.length;x++){
        if(cells[x].nodeName === 'TH'){
            cells[x].addEventListener('click', highlightHeader, false);
        } else if(cells[x].childElementCount == 0){
            cells[x].addEventListener('mouseover', showActionButton)
        } else if(cells[x].firstElementChild.className === 'add-action'){
            const newCell = document.createElement('td');
            newCell.addEventListener('mouseover', showActionButton);
            cells[x].replaceWith(newCell);
        } else if(cells[x].firstElementChild.className === 'effect'){
            ['onkeyup','change'].forEach(evt => cells[x].querySelector('input[type="number"]').addEventListener(evt, changeColumnSpan, false));
            ['input'].forEach(evt => cells[x].querySelector('input[type="color"]').addEventListener(evt, changeEffectColor, false));
            ['input'].forEach(evt => cells[x].querySelector('input[type="text"]').addEventListener(evt, changeValue, false));
        }
    };
    
}

function showAddEncounterButton() {
    const addEncounterButton = Object.assign(document.createElement('div'), {className:'add-encounter-button'});
    addEncounterButton.append(createButton('Add Encounter'));
    addEncounterButton.addEventListener('click', addEncounter, false);
    document.getElementsByTagName('main')[0].insertBefore(addEncounterButton,document.getElementsByTagName('h1')[0].nextElementSibling);
}

function addEncounter(){
    const encounter = Object.assign(document.createElement('div'), {id:'', className:'encounter'}),
    encounterTitleBar = Object.assign(document.createElement('div'), {className:'encounter-title-bar'}),
    inputEncounterName = Object.assign(document.createElement('input'), {type:'text', className:'encounter-name-input', placeholder:'Encounter Name'});
    ['change'].forEach(evt => inputEncounterName.addEventListener(evt, ()=>{inputEncounterName.parentElement.id = inputEncounterName.value}), false);
    encounterTitleBar.append(inputEncounterName, createButton('x'));
    encounter.append(encounterTitleBar);
    addCharacter(encounter);
    // encounter.append(character);
    const footerBar = Object.assign(document.createElement('div'), {className:'add-character'});
    
    footerBar.append(createButton('+', 'addCharacter(this.closest(".encounter"))'));
    encounter.append(footerBar);
    document.getElementsByTagName('main')[0].insertBefore(encounter, document.getElementsByClassName('add-encounter-button')[0]);
}

function addCharacter(parent){
    const character = Object.assign(document.createElement('div'), {id:'', className:'character'}),
    characterTitleBar = Object.assign(document.createElement('div'), {className:'character-title-bar'}),
    characterInputName = Object.assign(document.createElement('input'), {type:'text', className:'character-name-input', placeholder:'Character Name'}),
    titleBarButtons = [{text: '...', action: 'MenuOptions'},{text: '_', action: 'MinimizeButton'},{text: 'x', action: 'DeleteButton'}];

    characterTitleBar.append(characterInputName);
    titleBarButtons.forEach(element => {
        characterTitleBar.append(createButton(element.text, element.action));
    });
    
    tableContainer = createTable();
    character.append(characterTitleBar, tableContainer);
    console.log(parent);
    parent.insertBefore(character, parent.querySelector('.add-character'));
    // return character;
}

function createTable(){
    const tableContainer = Object.assign(document.createElement('div'), {className: 'table-container'});
    const table = document.createElement('table'), thead = document.createElement('thead'), tbody = document.createElement('tbody');
    [{tag: thead, count: 1},{tag: tbody, count: 4}].forEach(elem => {
        for(let x=0;x<elem.count;x++){
            let row = document.createElement('tr');
            for(let y=0;y <= 10;y++){
                let cell;
                if(elem.tag === thead && x === 0){
                    cell = document.createElement('th'); cell.textContent = y === 0 ? 'Pre Combat' : y ;
                    cell.addEventListener('click', highlightHeader, false);
                } else {
                    cell = document.createElement('td'); 
                    cell.addEventListener('mouseover', showActionButton);
                }
                row.append(cell);
            }
            elem.tag.append(row);
        }
    });
    
    
    table.append(thead,tbody);
    tableContainer.append(table);
    return tableContainer;
}

function createToolbar(){
    const toolbar = Object.assign(document.createElement('div'), {className: 'toolbar'});
    const tools = [
        {id: 'add-col', className: 'tool', function: 'addColumn()', text: 'Add Column'},
        {id: 'rem-col', className: 'tool', function: 'removeColumn()', text: 'Remove Column'},
        {id: 'add-row', className: 'tool', function: 'addRowAfter()', text: 'Add Row'},
        {id: 'rem-row', className: 'tool', function: 'removeRow()', text: 'Remove Row'}, 
        {id: 'clear-table', className: 'tool', function: 'clearTable()', text: 'Clear', children: '<span class="tooltiptext">Clear entire table & local storage</span>'}
    ];
    tools.forEach(i => {const tool = Object.assign(document.createElement('div'), {id: i.id, className: i.className, onclick: i.function}); tool.innerHTML = i.children ? i.text + i.children: i.text; toolbar.append(tool)});
    return toolbar;
}

function createButton(symbol, action) {
    const button = Object.assign(document.createElement('div'), {className:'ui-button'});
    button.setAttribute('onclick', action);
    button.textContent = symbol;
    return button;
}



function save(){
    const savedNotice = document.getElementById('savedNotice') === null ? Object.assign(document.createElement('span'), {id : 'savedNotice'}) : document.getElementById('savedNotice');
    savedNotice.textContent = 'saving';
    document.querySelector('h1').insertAdjacentElement('afterend', savedNotice);
    setTimeout(function(){
        const table = document.getElementById('main-table');
        localStorage.setItem('table', table.innerHTML);
        savedNotice.textContent = 'saved';
    },1000);
    
}

function clearTable(elem){
    const rows = document.getElementsByTagName('tr');
    for(let x=rows.length - 1;x>0;x--){
        rows[x].remove();
        addRowAfter();
    }
    localStorage.removeItem('table');
    elem.textContent = 'Cleared';
    setTimeout(function(){
        elem.textContent = 'Clear';
    },5000);
}

function removeChild(evt){
    evt.target.firstChild?.remove()
}

function showActionButton(evt) {
    let targetCell = evt.target;
    if(targetCell.innerHTML === ''){
        const addActionButton = Object.assign(document.createElement('div'), {
            className : 'add-action'
        });
        addActionButton.innerHTML = '+';
        addActionButton.addEventListener('click', addAction);
        targetCell.append(addActionButton);
        targetCell.addEventListener('mouseleave', removeChild)
    }
}


function addAction(evt) {
    const slot = evt.target;
    const slotTD = slot.parentNode;
    slot.removeEventListener('click', addAction);
    slotTD.removeEventListener('mouseover', showActionButton);
    slotTD.removeEventListener('mouseleave', removeChild );
    const effect = Object.assign(document.createElement('div'), {
        className : 'effect',
    });
    effect.innerHTML = `<input type='number' value='1'  size='3' onclick='this.select();' /><input type='text' title='' value='' placeholder='Effect' /><input type='color' value='#808080' />`;
    slotTD.append(effect);
    ['onkeyup','change'].forEach(evt => effect.querySelector('input[type="number"]').addEventListener(evt, changeColumnSpan, false));
    ['input'].forEach(evt => effect.querySelector('input[type="color"]').addEventListener(evt, changeEffectColor, false));
    ['input'].forEach(evt => effect.querySelector('input[type="text"]').addEventListener(evt, changeValue, false));
    slot.remove();
    if(slotTD.parentNode.nextElementSibling == null){
        addRowAfter(slotTD.parentElement)
    };
    // pretty much a duplicate of the 'highlightHeader()' function, could probably refactor that to remove this
    document.querySelector('th[style*="background"]')?.removeAttribute('style');
    slotTD.closest('table').querySelectorAll('th')[slotTD.cellIndex].style.backgroundColor = 'rgb(255, 183, 47)';   
    slotTD.closest('table').querySelectorAll('th')[slotTD.cellIndex].style.color = '#222';
}

function changeValue(evt){
    evt.target.setAttribute('value', evt.target.value);
    evt.target.setAttribute('title', evt.target.value);
}

function changeColumnSpan(evt){
    let turnCount = evt.target.value;
    if(turnCount > 200){                                                                //  Couldn't find a way to validate if text rather than number
        console.log('Error: Cannot increase by more than 200 turns at a time.');        //  Firefox number input returns '0' if text is entered
        let effectName = evt.target.nextElementSibling.value;                           //  but 0 is also needed later in the function.
        evt.target.nextElementSibling.value = 'max 200';                                //  Tried using regex and NaN to no avail.
        setTimeout(()=>{evt.target.nextElementSibling.value = effectName}, 1500);       //  So now it doesn't validate text but instead treats it as '0' so it deletes the effect.
        evt.target.value = evt.target.closest('td').colSpan;
        return;
    };

    evt.target.setAttribute('value', evt.target.value);
    const tableCellOfInput = evt.target.closest('td');
    let tableCellOfInputSpan = tableCellOfInput.colSpan;

    // if the turnCount input is not the same as it's table cell colspan, create an empty td cell and...
    while(turnCount != tableCellOfInputSpan){
        const emptyCell = document.createElement('td');
        emptyCell.addEventListener('mouseover', showActionButton);

        // if the turnCount is reduced....
        if(turnCount < tableCellOfInputSpan) { 
            // and it's set to zero, remove it entirely, but
            if(tableCellOfInputSpan == 1){
                tableCellOfInput.replaceWith(emptyCell);
            };
            //  otherwise just reduce the colspan and replace the empty space with empty cells.
            tableCellOfInputSpan -= 1;
            tableCellOfInput.parentNode?.insertBefore(emptyCell,tableCellOfInput.nextElementSibling);
        //  otherwise, assume the turnCounter has been increased, in which case....
        } else {
            //  If no more columns exist to expand into, create a new column...
            if(tableCellOfInput.nextElementSibling == null){ 
                addColumn(tableCellOfInput);
                tableCellOfInput.nextElementSibling.remove();
            //   If another effect occupies the next cell, do not expand into that cell and prevent change to turn counter...
            } else if(tableCellOfInput.nextElementSibling.firstChild?.className === 'effect') {
                console.log('another effect in the way');
                evt.target.value--;
                evt.target.setAttribute('value', evt.target.value);
            } else {
                tableCellOfInput.nextElementSibling.remove();
            };
            tableCellOfInputSpan += 1;
        }
    };

    // Now that the empty cells have been set up, finally adjust the actual colspan of the target cell.
    tableCellOfInput.setAttribute('colspan', evt.target.value);

}

function changeEffectColor(evt){
    evt.target.setAttribute('value', evt.target.value);
    const effectDiv = evt.target.parentNode;
    effectDiv.style.backgroundColor = evt.target.value;
}

function removeColumn(){
    const table = document.getElementById('main-table');
    const colControls = document.getElementById('column-control');
    const lastColumn = colControls.parentNode.cellIndex;

    colControls.parentNode.previousElementSibling.append(colControls)
    for(let x = 0; x < table.rows.length; x++){
        if(table.rows[x].cells[lastColumn] == undefined){
            const cellCount = table.rows[x].cells.length - 1;
            const lastCell = table.rows[x].cells[cellCount];
            // if(lastCell has a colspan, reduce the colspan...if no colspan, remove the cell)
            lastCell.colSpan <= 1 || lastCell.hasAttribute('colSpan') === false ? lastCell.remove() : lastCell.colSpan = lastCell.colSpan - 1 ;
        } else {
        table.rows[x].cells[lastColumn].remove();
        };
    };

}

function addColumn(elem){
    const table = elem.closest('table');
    const lastColumn = table.getElementsByTagName('TH').length;

    for(x=0;x<table.rows.length;x++){   // add a cell to each row
        let newCell;
        if(table.rows[x].parentNode.tagName === 'THEAD'){ // add column controls and column number to header
            newCell = document.createElement('th');
            newCell.textContent = lastColumn;  
            // newCell.append(colControls);
        } else {
            newCell = document.createElement('td'); //  otherwise if not a header, just add a cell.
            newCell.addEventListener('mouseover', showActionButton);
        }
        table.rows[x].append(newCell)
    }
}



function addRowAfter(currentRow){
    const newRow = Object.assign(document.createElement('tr'),{className : 'spells'});
    const columns = currentRow.closest('table').querySelectorAll('thead th').length; 
    for(let x=0;x<columns;x++){
        const newCell = document.createElement('td');
        newCell.addEventListener('mouseover', showActionButton);
        newRow.append(newCell);
    };
    currentRow ? currentRow.parentNode.append(newRow) : document.getElementsByTagName('tbody')[0].append(newRow);
}

function removeRow(targetRow){
    targetRow?.remove();
}

function highlightHeader(elem) {
    if(elem.target.nodeName === 'DIV'){ return };
    document.querySelector('th[style*="background"]')?.removeAttribute('style');
    elem.currentTarget.style.backgroundColor = 'rgb(255, 183, 47)';
    elem.currentTarget.style.color = '#222'
}
