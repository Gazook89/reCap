window.onload = function() {
    // record structure of table on every change.
    // check out https://codeburst.io/observe-changes-in-dom-using-mutationobserver-9c2705222751
    // mutationRecords has properties that can be accessed.  

    const encountersContainer = document.getElementById('encounters-container');
    

    showAddEncounterButton();

    if(localStorage.length){
        const data = JSON.parse(localStorage.getItem('savedSession'));
        for(let x=0;x<data.length;x++){
            addEncounter();
            let encounter = document.querySelectorAll('.encounter')[x];
            encounter.id = data[x].id;
            encounter.getElementsByClassName('encounter-name-input')[0].value = data[x].id;
            for(let y=0;y<data[x].tables.length;y++){
                if(y!=0){
                    encounter.querySelector('.new-character').click();
                }
                encounter.getElementsByClassName('character')[y].id = data[x].tables[y].charName;
                encounter.getElementsByClassName('character-name-input')[y].value = data[x].tables[y].charName;
                encounter.getElementsByClassName('table-container')[y].innerHTML = data[x].tables[y].table;
            };
        }
    }

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

    document.getElementById('clear-storage-link').onclick = ()=>{
        if(localStorage.length){
            const encounters = Array.from(document.getElementsByClassName('encounter'));
            encounters.forEach(encounter=>encounter.remove());
            localStorage.removeItem('savedSession');
        }
        return false;
    };

    let timer = null;
    let observer = new MutationObserver(mutationRecords => {
        mutationRecords.forEach((mutation)=>{
            if(mutation.addedNodes[0]?.className === 'add-action' || mutation.removedNodes[0]?.className === 'add-action'){
                return;
            } else {
                if(timer != null){
                    clearTimeout(timer);
                    timer = null;
                };
                if(document.getElementById('savedNotice')){document.getElementById('savedNotice').textContent = ''};
                timer = setTimeout(save, 5000); // 5 second delay
            }
        })
    })

    observer.observe(encountersContainer, {
        childList : true,
        subtree: true,
        attributes : true
    });
    
}

// see this S.O. answer: https://stackoverflow.com/a/3138591
function save(){
    const savedNotice = document.getElementById('savedNotice') === null ? Object.assign(document.createElement('span'), {id : 'savedNotice', className:'save-notice'}) : document.getElementById('savedNotice');
    savedNotice.textContent = 'saving';
    document.querySelector('h1').insertAdjacentElement('afterend', savedNotice);
    setTimeout(function(){
        const encounters = Array.from(document.querySelectorAll('.encounter'));
        let data = [];
        for(let x=0;x<encounters.length;x++){
            const characters = Array.from(encounters[x].querySelectorAll('.character'));
            let charData = [];
            for(let y=0;y<characters.length;y++){
                objCharacter = {charName: characters[y].id, table: characters[y].querySelector('.table-container').innerHTML}
                charData.push(objCharacter);
            }
            const objEncounter = {id: encounters[x].id, tables: charData}
            data.push(objEncounter);
        };
        localStorage.setItem('savedSession', JSON.stringify(data));
        savedNotice.textContent = 'saved';
    },1000);
    
}

function showAddEncounterButton() {
    const addEncounterButton = Object.assign(document.createElement('div'), {className:'add-encounter-button'});
    const button = Object.assign(document.createElement('div'), {className:'ui-button', title:'Add New Encounter'});
    button.textContent = '+';
    addEncounterButton.append(button);
    addEncounterButton.addEventListener('click', addEncounter, false);
    document.getElementById('encounters-container').append(addEncounterButton);
}

function addEncounter(){
    const encounterCount = document.querySelectorAll('.encounter').length;
    const encounter = Object.assign(document.createElement('div'), {id:`encounter${encounterCount}`, className:'encounter'}),
    encounterTitleBar = Object.assign(document.createElement('div'), {className:'encounter-title-bar title-bar'});
    encounter.append(encounterTitleBar);

    // add 'encounter name' input
    const inputEncounterName = Object.assign(document.createElement('input'), {type:'text', className:'encounter-name-input', placeholder:'Encounter Name'});
    ['change'].forEach(evt => inputEncounterName.addEventListener(evt, ()=>{
        encounter.id = inputEncounterName.value;
        save();
    }), false);
    encounterTitleBar.append(inputEncounterName);

    // container for the operational buttons (minimize, delete)
    const operationButtons = Object.assign(document.createElement('div'), {className:'operational-buttons'});
    encounterTitleBar.append(operationButtons);
    // add 'options' button
    const optionsBtn = options(['color','scrollLink']);
    operationButtons.append(optionsBtn);
    // add 'minimize encounter' button
    const minBtn = minimize('.encounter', '.character, .add-character');
    operationButtons.append(minBtn);
    // add 'delete encounter' button
    const deleteBtn = deleteEntry('.encounter');
    operationButtons.append(deleteBtn);    

    // add a footer to encounter
    const footerBar = Object.assign(document.createElement('div'), {className:'add-character'});
    const addNewCharacterBtn = addCharacter(encounter);
    footerBar.append(addNewCharacterBtn);

    // Add a fresh Character element to the encounter when a new encounter is created.
    addNewCharacterBtn.click();
    
    encounter.append(footerBar);
    document.getElementById('encounters-container').insertBefore(encounter, document.getElementsByClassName('add-encounter-button')[0]);
}


function addCharacter(parent){
    const button = Object.assign(document.createElement('div'), {className:'ui-button new-character', title:'Add New Character'});
    button.textContent = '+';
    button.addEventListener('click', ()=>{
        const character = Object.assign(document.createElement('div'), {id:'', className:'character'}),

        // title bar of the character element
        characterTitleBar = Object.assign(document.createElement('div'), {className:'character-title-bar title-bar'}),
            // character name input
        characterInputName = Object.assign(document.createElement('input'), {type:'text', className:'character-name-input', placeholder:'Character Name'});
        ['change'].forEach(evt => characterInputName.addEventListener(evt, ()=>{
            character.id = characterInputName.value;
            save();
        }), false);
        
        characterTitleBar.append(characterInputName);

        const operationButtons = Object.assign(document.createElement('div'), {className:'operational-buttons'});
        characterTitleBar.append(operationButtons);
            // title bar operational buttons (options, minimize, remove)
        // add 'options' button
        const optionsBtn = options(['color']);
        operationButtons.append(optionsBtn);
        const minBtn = minimize('.character', '.table-container');
        operationButtons.append(minBtn);
        const deleteBtn = deleteEntry('.character');
        operationButtons.append(deleteBtn);

        // the turn tracking table
        tableContainer = createTable();

        character.append(characterTitleBar, tableContainer);
        parent.insertBefore(character, parent.querySelector('.add-character'));
    });
    return button;
}

function options(option){
    const button = Object.assign(document.createElement('div'), {className:'ui-button options', title:'Options'});
    button.textContent = '...';
    button.addEventListener('click', (evt)=>{
        if(evt.target.style.backgroundColor === 'ghostwhite'){
            evt.target.style.backgroundColor = null;
            const options = Array.from(evt.target.parentNode.getElementsByClassName('option'));
            options.forEach(element=>element.remove());
        } else {
            // scroll linking option
            if(option.includes('scrollLink')){
                const scrollBtn = addScrollLinkBtn();
                evt.target.parentNode.insertBefore(scrollBtn, button);
            };

            // color option
            if(option.includes('color')){
                const colorBtn = color();
                evt.target.parentNode.insertBefore(colorBtn, button);
            };

            
            

            // toggle background color
            evt.target.style.backgroundColor = 'ghostwhite';
        }
    }, false);
    return button;
}

function addScrollLinkBtn(){
    const button = Object.assign(document.createElement('div'), {className:'ui-button scroll option', title:'Scroll Link'});
    button.textContent = '➠';
    button.addEventListener('click', (evt)=>{
        const encounter = evt.target.closest('.encounter');
        const characters = Array.from(encounter.querySelectorAll('.character .table-container'));
        characters.forEach(character=>{
            if(evt.target.classList.contains('toggled')){
                character.removeEventListener('scroll', matchScroll);
            } else {
                character.addEventListener('scroll', matchScroll);
            }
        });
        evt.target.classList.toggle('toggled');
        });
    return button;
}

function matchScroll(scrollEvt) {
    const encounter = scrollEvt.target.closest('.encounter');
    const characters = Array.from(encounter.querySelectorAll('.character .table-container'));
    characters.forEach(el=>{
        el.scrollLeft = scrollEvt.target.scrollLeft;
    });
};



function color(){
    const button = Object.assign(document.createElement('div'), {className:'ui-button color option', title:'Color'});
    button.textContent = '';
    const swatch = Object.assign(document.createElement('input'), {type:'color', value:'#444444'});
    swatch.addEventListener('input', (evt)=>{
        let parent;
        evt.target.closest('.character') === null ?  parent = evt.target.closest('.encounter') : parent = evt.target.closest('.character');  //  TODO:  this needs to be fixed
        let colorableSelectors = [];
            if(parent.className == 'character'){ 
                colorableSelectors = [
                    {selector:'.character-title-bar', properties:[]},
                    {selector:'table', properties:['backgroundColor']}
                ];
            } else {
                colorableSelectors = [
                    {selector:'.encounter-title-bar', properties:['backgroundColor']},
                    {selector:'encounter', properties:['borderColor']}
                ];
            };

        for(let x=0;x<colorableSelectors.length;x++){
            const colorableElements = Array.from(parent.querySelectorAll(colorableSelectors[x].selector));
            if(parent.classList.contains(colorableSelectors[x].selector)){
                colorableElements.push(parent);
            };
            for(let y=0;y<colorableElements.length;y++){
                const element = colorableElements[y];
                colorableSelectors[x].properties.forEach((property)=>{
                    element.style[property] = swatch.value;

                });
            };
            
        }
        // if the above works with 'colorableElements', will then need to figure out how to style the 'parent' (.encounter or .character) themselves.
    });
    button.append(swatch);
    return button;
}

function minimize(parentElement, element){
    const button = Object.assign(document.createElement('div'), {className:'ui-button minimize', title:'Minimize'});
    button.textContent = '_';
    button.addEventListener('click', (evt)=>{
        // look at this SO answer in the future if needed: https://stackoverflow.com/a/7648323... 
        // something tells me i could use it to reduce this function to one parameter rather than two,
        // determining the common ancestor of the collapsing element (given by parameter) and the evt.target.
        const collapseElement = evt.target.closest(parentElement);
        const hiddenElements = collapseElement.querySelectorAll(element);
        for(let x=0;x<hiddenElements.length;x++){
            // could one day change this to do a transition between 0% and 100%, or change it just display:none;
            if(hiddenElements[x].style.display === 'none'){
                hiddenElements[x].style.display = null;
                collapseElement.style.paddingBottom = null;
                evt.target.style.backgroundColor = null;
            }  else {
                hiddenElements[x].style.display = 'none';
                collapseElement.style.paddingBottom = '0';
                evt.target.style.backgroundColor = 'ghostwhite';
            }
        };
    }, false);
    return button;
}

function deleteEntry(parentElement){
    const button = Object.assign(document.createElement('div'), {className:'ui-button delete', title:'Remove Entry'});
    button.textContent = 'x';
    button.addEventListener('click', (evt)=>{
        const outerElement = evt.target.closest(parentElement);
        outerElement.querySelectorAll('*').forEach(el=>el.style.filter='blur(1px)');
        const overlay = Object.assign(document.createElement('div'), {className:'color-overlay'});
        const dialog = Object.assign(document.createElement('div'),{className:'dialog'});
        dialog.innerHTML = `<span>Remove ${outerElement.className}: ${outerElement.id}?</span>`;
        const buttonY = Object.assign(document.createElement('div'), {className:'ui-button'})
        buttonY.textContent = 'y';
        const buttonN = Object.assign(document.createElement('div'), {className:'ui-button'})
        buttonN.textContent = 'n';
        buttonY.addEventListener('click', ()=>{outerElement.remove()});
        buttonN.addEventListener('click', ()=>{overlay.remove(); outerElement.querySelectorAll('*').forEach(el=>el.style.filter=null);})
        dialog.append(buttonY, buttonN);
        overlay.append(dialog);
        outerElement.append(overlay);
    }, false);
    return button;
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
    const startingColor = '#808080';
    effect.innerHTML = `<input type='color' value='${startingColor}' /><input type='text' title='' value='' placeholder='Effect' /><div class='turn-duration'><div class='number-spinner' onclick='this.nextSibling.value -= 1'></div><input type='number' value='1'  size='3' onclick='this.select();' /><div class='number-spinner' onclick='this.previousSibling.value = parseInt(this.previousSibling.value) + 1'></div></div>`;
    effect.style.backgroundColor = startingColor;
    slotTD.append(effect);
    ['mouseout'].forEach(evt => effect.querySelector('input[type="number"]').addEventListener(evt, changeColumnSpan, false));
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
    const newRow = Object.assign(document.createElement('tr'),{className : 'row'});
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
    const headerIndex = elem.currentTarget.cellIndex;
    const encounter = elem.currentTarget.closest('.encounter');
    const highlightHeaders = encounter.querySelectorAll('th[style*="background"]');
    highlightHeaders.forEach(header=>header.removeAttribute('style'));
    const tables = Array.from(encounter.getElementsByTagName('table'));
    tables.forEach((table)=>{
        table.rows[0].cells[headerIndex].style.backgroundColor = 'rgb(255, 183, 47)';
        table.rows[0].cells[headerIndex].style.color = '#222';
    })
}
