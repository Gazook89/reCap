window.onload = function() {
    // record structure of table on every change.
    // check out https://codeburst.io/observe-changes-in-dom-using-mutationobserver-9c2705222751
    // mutationRecords has properties that can be accessed.  

    const encountersContainer = document.getElementById('encounters-container');
    

    showNewEventButton();

    if(localStorage.length){
        const data = JSON.parse(localStorage.getItem('savedSession'));
        
        for(let x=data.length - 1;x>=0;x--){
            if(data[x].eventType === 'encounter story-event'){
                addStoryEvent('encounter');
            } else if(data[x].eventType === 'plot story-event'){
                addStoryEvent('plot');
            };
            
            let storyEvent = document.querySelectorAll('.story-event')[0];
            storyEvent.id = data[x].id;
            storyEvent.querySelector(`.event-name-input`).value = data[x].eventName;
            storyEvent.style.borderColor = data[x].eventColor;
            storyEvent.querySelector('.title-bar').style.backgroundColor = data[x].eventColor;
            if(data[x].eventType === 'encounter story-event'){
                for(let y=0;y<data[x].characters.length;y++){
                    if(y!=0){
                        storyEvent.querySelector('.new-character').click();
                    }
                    storyEvent.getElementsByClassName('character')[y].id = data[x].characters[y].charName;
                    storyEvent.getElementsByClassName('character-name-input')[y].value = data[x].characters[y].charName;
                    storyEvent.getElementsByClassName('table-container')[y].replaceWith(createTable(data[x].characters[y].tableSize));
                    storyEvent.querySelectorAll('.table-container table')[y].style.backgroundColor = data[x].characters[y].charColor;
                    if(data[x].turn){
                        storyEvent.querySelectorAll('table')[y].querySelectorAll('th')[data[x].turn].style.backgroundColor = 'rgb(255, 183, 47)';
                        storyEvent.querySelectorAll('table')[y].querySelectorAll('th')[data[x].turn].style.color = '#222';
                    }
                    
                    data[x].characters[y].actions.forEach((action, index)=>{
                        const cells = Array.from(storyEvent.querySelectorAll('.table-container')[y].querySelectorAll('td'));
                        cells[action.actionCellIndex].removeEventListener('mouseover', showActionButton);
                        cells[action.actionCellIndex].colSpan = data[x].characters[y].actions[index].actionDuration;
                        for(let i=1;i<data[x].characters[y].actions[index].actionDuration;i++){
                            cells[action.actionCellIndex].nextElementSibling.remove();
                        };
                        cells[action.actionCellIndex].innerHTML = `<div class='effect' style='background-color:${data[x].characters[y].actions[index].actionColor}'><input class='effect-color' type='color' value='${data[x].characters[y].actions[index].actionColor}' /><input class='effect-name' type='text' title='' value='${data[x].characters[y].actions[index].actionName}' placeholder='Effect' /><div class='turn-duration'><div class='number-spinner' onclick='this.nextSibling.value -= 1'><i class="fas fa-caret-left"></i></div><input type='number' value='${data[x].characters[y].actions[index].actionDuration}'  size='3' onclick='this.select();' /><div class='number-spinner' onclick='this.previousSibling.value = parseInt(this.previousSibling.value) + 1'><i class="fas fa-caret-right"></div></div></div>`;
                    });
                };
            } else if(data[x].eventType === 'plot story-event'){
                storyEvent.querySelector('.plot-text').textContent = data[x].plotPoint;
            }

        };
    };

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
            ['mouseout','change'].forEach(evt => cells[x].querySelector('.turn-duration').addEventListener(evt, changeColumnSpan, false));
            ['input'].forEach(evt => cells[x].querySelector('input[type="color"]').addEventListener(evt, changeEffectColor, false));
            ['input'].forEach(evt => cells[x].querySelector('input[type="text"]').addEventListener(evt, changeValue, false));
        }
    };

    document.getElementById('clear-storage-link').onclick = ()=>{
        if(localStorage.length){
            const storyEvents = Array.from(document.getElementsByClassName('story-event'));
            storyEvents.forEach(event=>event.remove());
            localStorage.removeItem('savedSession');
        }
        return false;
    };

    let timer = null;
    let observer = new MutationObserver(mutationRecords => {
        mutationRecords.forEach((mutation)=>{
            if(mutation.addedNodes[0]?.className === 'add-action' || mutation.removedNodes[0]?.className === 'add-action' || mutation.attributeName?.includes('aria')){
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
        attributes : true,
        characterData : true
    });
    
}

// see this S.O. answer: https://stackoverflow.com/a/3138591

function save(){    // for save revision branch
    const savedNotice = document.getElementById('savedNotice') === null ? Object.assign(document.createElement('span'), {id : 'savedNotice', className:'save-notice'}) : document.getElementById('savedNotice');
    savedNotice.textContent = 'saving';
    document.querySelector('h1').insertAdjacentElement('afterend', savedNotice);
    setTimeout(function(){
        const storyEvents = Array.from(document.querySelectorAll('.story-event'));
        let data = [];
        for(let x=0;x<storyEvents.length;x++){
            const objStoryEvent = {
                id: x, 
                eventType: storyEvents[x].className, 
                eventName: storyEvents[x].querySelector('.event-name-input').value, 
                eventColor: storyEvents[x].style.borderColor, 
                collapsed: storyEvents[x].querySelector('.ui-button.minimize')?.getAttribute('style')?.includes('background-color')   // todo: needs to save as 'false' if no style attribute exists at all.  Also, need to add color/minize/delete buttons to plot elements
            };
            
            if(objStoryEvent.eventType === 'encounter story-event'){
                objStoryEvent.turn = storyEvents[x].querySelector('th[style]')?.cellIndex || null;
                const characters = Array.from(storyEvents[x].querySelectorAll('.character'));
                let charData = [];
                for(let y=0;y<characters.length;y++){
                    const tableCells = Array.from(characters[y].querySelectorAll('td'));
                    let tableData = [];
                    for(let z=0;z<tableCells.length;z++){
                        if(tableCells[z].childElementCount > 0 && tableCells[z].firstElementChild.className !== 'add-action'){
                            objAction = {
                                actionName: tableCells[z].querySelector('.effect-name').value || '',
                                actionColor: tableCells[z].querySelector('.effect-color').value,
                                actionDuration: parseInt(tableCells[z].querySelector('.turn-duration input').value),
                                actionCellIndex: z
                            }
                            tableData.push(objAction);
                        }
                    };
                    objCharacter = {
                        charName: characters[y].id, 
                        charColor: characters[y].querySelector('table').style.backgroundColor,
                        collapsed: characters[y].querySelector('.ui-button.minimize').getAttribute('style')?.includes('background-color'),
                        tableSize: [characters[y].querySelectorAll('th').length - 1, characters[y].querySelectorAll('tr').length - 1],   // subtract one from columns due to how to 'pre-combat' column is made...possibly should revise to be more clear.  Same with rows (thead/tbody)
                        actions: tableData}   
                    charData.push(objCharacter);
                }
                objStoryEvent.characters = charData;
            } else if (objStoryEvent.eventType === 'plot story-event'){
                objStoryEvent.plotPoint = storyEvents[x].querySelector('.plot-text').textContent;
            }

            data.push(objStoryEvent);
        };
        localStorage.setItem('savedSession', JSON.stringify(data));
        savedNotice.textContent = 'saved';
        document.getElementById('download-storage-link').setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(localStorage.getItem('savedSession')));
        document.getElementById('download-storage-link').setAttribute('download','reCapSession.json');
        const storageSize = new Blob(Object.values(localStorage)).size / Math.pow(1024,1);
        document.getElementById('download-storage-link').textContent = `Download as JSON ${storageSize.toFixed(1)} KB/5120 KB`;
    },1000);
    
}

function importJSON(input) {
    let jsonFile = input.files[0];
    let reader = new FileReader();
    reader.readAsText(jsonFile);
    reader.onload = function() {
        console.log(reader.result);
        localStorage.setItem('savedSession', reader.result);
        window.location.reload();
    };
    reader.onerror = function() {
        console.log((reader.error));
    }
}

// for STORYLINE - 

function showNewEventButton() {
    const addEventButton = Object.assign(document.createElement('div'), {className:'add-event-button'});
    const button = Object.assign(document.createElement('div'), {className:'ui-button', title:'Add New Event'});
    button.textContent = '+';
    addEventButton.append(button);
    addEventButton.addEventListener('click', ()=>{
        addEventButton.style.display = 'none';
        const dialog = Object.assign(document.createElement('div'), {className:'dialog new-event'});
        dialog.innerHTML = `<span>Create new...</span>`;
        const encounterBtn = Object.assign(document.createElement('div'), {className:'ui-button'})
        encounterBtn.textContent = 'Combat Encounter';
        const plotBtn = Object.assign(document.createElement('div'), {className:'ui-button'})
        plotBtn.textContent = 'Plot Point';
        encounterBtn.addEventListener('click', ()=>{addStoryEvent('encounter'); dialog.remove()});
        plotBtn.addEventListener('click', ()=>{addStoryEvent('plot'); dialog.remove()});
        dialog.append(encounterBtn,plotBtn);
        addEventButton.insertAdjacentElement('afterend', dialog);
    }, false);
    document.getElementById('encounters-container').append(addEventButton);
}



function addStoryEvent(eventType){
    const eventCount = document.querySelectorAll(`.story-event`).length;
    const eventElement = Object.assign(document.createElement('div'), {id:`${eventType}${eventCount}`, className:`${eventType} story-event`}),
    eventTitleBar = Object.assign(document.createElement('div'), {className:`${eventType}-title-bar title-bar`});
    eventElement.append(eventTitleBar);

    // add 'encounter name' input
    const inputEventName = Object.assign(document.createElement('input'), {type:'text', className:`event-name-input`, placeholder:`${eventType[0].toUpperCase() + eventType.slice(1)} Name`});
    ['change'].forEach(evt => inputEventName.addEventListener(evt, ()=>{
        eventElement.id = inputEventName.value;
        save();
    }), false);
    eventTitleBar.append(inputEventName);

    if(eventType === 'encounter'){
        // container for the operational buttons (minimize, delete)
        const operationButtons = Object.assign(document.createElement('div'), {className:'operational-buttons'});
        eventTitleBar.append(operationButtons);
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
        const addNewCharacterBtn = addCharacter(eventElement);
        footerBar.append(addNewCharacterBtn);

        // Add a fresh Character element to the encounter when a new encounter is created.
        addNewCharacterBtn.click();
        
        eventElement.append(footerBar);
    } else if(eventType === 'plot') {
        // container for the operational buttons (minimize, delete)
        const operationButtons = Object.assign(document.createElement('div'), {className:'operational-buttons'});
        eventTitleBar.append(operationButtons);
        // add 'options' button
        const optionsBtn = options(['color', 'spellchecker']);
        operationButtons.append(optionsBtn);
        // add 'minimize encounter' button
        const minBtn = minimize('.plot', '.plot-text');
        operationButtons.append(minBtn);
        // add 'delete encounter' button
        const deleteBtn = deleteEntry('.plot');
        operationButtons.append(deleteBtn);

        const textarea = Object.assign(document.createElement('div'), {className:'editable-div plot-text', contentEditable:'true', spellcheck:false});
        textarea.textContent = '...and then what happened?';
        eventElement.append(textarea);
    }

        document.getElementsByClassName('add-event-button')[0].insertAdjacentElement('afterend', eventElement);
        document.getElementsByClassName('add-event-button')[0].style.display = 'flex';

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
        tableContainer = createTable([10,4]); // columns (includes '0'), rows in TBODY

        character.append(characterTitleBar, tableContainer);
        parent.insertBefore(character, parent.querySelector('.add-character'));
    });
    return button;
}

function options(option){
    const button = Object.assign(document.createElement('div'), {className:'ui-button options', title:'Options'});
    button.innerHTML = '<i class="fas fa-cogs"></i>';
    button.addEventListener('click', (evt)=>{
        if(evt.currentTarget.style.backgroundColor === 'ghostwhite'){
            evt.currentTarget.style.backgroundColor = null;
            const options = Array.from(evt.currentTarget.parentNode.getElementsByClassName('option'));
            options.forEach(element=>element.remove());
        } else {
            // scroll linking option
            if(option.includes('scrollLink')){
                const scrollBtn = addScrollLinkBtn();
                evt.currentTarget.parentNode.insertBefore(scrollBtn, button);
            };

            // color option
            if(option.includes('color')){
                const colorBtn = color();
                evt.currentTarget.parentNode.insertBefore(colorBtn, button);
            };

            // spellchecker option
            if(option.includes('spellchecker')){
                const spellcheckerBtn = spellchecker();
                evt.currentTarget.parentNode.insertBefore(spellcheckerBtn, button);
            };
            

            // toggle background color
            evt.currentTarget.style.backgroundColor = 'ghostwhite';
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

function spellchecker(){
    const button = Object.assign(document.createElement('div'), {className:'ui-button spellchecker option', title:'Spellchecker'});
    button.innerHTML = `<i class="fas fa-spell-check"></i>`;
    button.addEventListener('click', (evt)=>{
        const textarea = evt.currentTarget.parentElement.parentElement.nextElementSibling;
        textarea.spellcheck === true ? textarea.spellcheck = false : textarea.spellcheck = true ;
        textarea.focus();
        textarea.blur();
        evt.currentTarget.classList.toggle('toggled');
    });
    return button;
}


function color(){
    const button = Object.assign(document.createElement('div'), {className:'ui-button color option', title:'Color'});
    button.textContent = '';
    const swatch = Object.assign(document.createElement('input'), {type:'color', value:'#444444'});
    swatch.addEventListener('input', (evt)=>{
        let parent;
        evt.target.closest('.character') === null ?  parent = evt.target.closest('.story-event') : parent = evt.target.closest('.character');  //  TODO:  this needs to be fixed
        let colorableSelectors = [];
            if(parent.className == 'character'){ 
                colorableSelectors = [
                    {selector:'.character-title-bar', properties:[]},
                    {selector:'table', properties:['backgroundColor']}
                ];
            } else {
                colorableSelectors = [
                    {selector:'.story-event > .title-bar', properties:['backgroundColor']},
                    {selector:'story-event', properties:['borderColor']}
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
    button.innerHTML = '<i class="fas fa-window-minimize"></i>';
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
                evt.currentTarget.style.backgroundColor = null;
            }  else {
                hiddenElements[x].style.display = 'none';
                collapseElement.style.paddingBottom = '0';
                evt.currentTarget.style.backgroundColor = 'ghostwhite';
            }
        };
    }, false);
    return button;
}

function deleteEntry(parentElement){
    const button = Object.assign(document.createElement('div'), {className:'ui-button delete', title:'Remove Entry'});
    button.innerHTML = '<i class="fas fa-trash"></i>';
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


function createTable(tableSize){
    const tableContainer = Object.assign(document.createElement('div'), {className: 'table-container'});
    const table = document.createElement('table'), thead = document.createElement('thead'), tbody = document.createElement('tbody');
    [{tag: thead, count: 1},{tag: tbody, count: tableSize[1]}].forEach(elem => {
        for(let x=0;x<elem.count;x++){
            let row = document.createElement('tr');
            for(let y=0;y <= tableSize[0];y++){
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

const actions = [];

const action = {
    uid: '',   // Unique ID .... just didn't want to use ID to avoid confusion...
    name: '',
    type: '',
    color: '',
    turn: [],  // row, column
    duration: [],   // both turn counter integer (1 turn, 2 turns, etc) and action pixel width
    namePlaceholder() {
        switch(this.type){
            case 'emit':
                return `${this.type} from your PC`;
            case 'absorb':
                return `${this.type} by your PC`;
            case 'game':
                return `${this.type} mechanic`;
            case 'misc':
                return `${this.type} action`;
            default:
                return `${this.type}`
        }
    },
    render() {
        return [
            `<td>`,
                `<div id='${this.uid}' class='action ${this.type}'>`,
                    `<i class="fas fa-grip-vertical grip"></i>`,
                    `<i class="fas fa-caret-right expand"></i>`,
                    `<div class='action-options'>`,
                        `<i class="fas fa-clone clone"></i>`,
                    `</div>`,
                    `<input type='text' placeholder='${this.namePlaceholder()}'></input>`,
                    `<div class='resizer'></div>`,
                `</div>`,
            `</td>`
            ].join('\n');
    }
}

function createUID(arr, prefix){
    if(arr.length === 0){
        return (prefix + 0);
    } else {
        const orderedArr = arr.sort((a,b)=>a.uid - b.uid);
        return prefix + (parseInt(orderedArr[orderedArr.length - 1].uid.slice(1)) + 1);
    }
}


function showActionButton(evt) {

    let targetCell = evt.target;
    if(targetCell.innerHTML === ''){

        targetCell.addEventListener('mouseleave', removeChild);
        const addActionButton = Object.assign(document.createElement('div'), {className : 'add-action'});
        addActionButton.innerHTML = '+';

        addActionButton.addEventListener('click', (evt)=>{
            
            cursor = [window.scrollX + evt.clientX, window.scrollY + evt.clientY];
            const radialMenu = Object.assign(document.createElement('div'), {className:'radial-menu'});
            radialMenu.style.left = cursor[0] + 'px';
            radialMenu.style.top = cursor[1] + 'px';
            const options = ['Emit', 'Absorb', 'Game', 'Misc'];
            options.forEach((option, index)=>{
                const button = Object.assign(document.createElement('div'), {className:'radial-item'});
                button.textContent = options[index];
                button.addEventListener('click', (evt)=>{
                    const newAction = Object.create(action);
                    newAction.uid = createUID(actions, 'A');
                    newAction.name = 'Name';
                    newAction.type = evt.currentTarget.textContent.toLowerCase();
                    newAction.turn = [targetCell.parentElement.rowIndex, targetCell.cellIndex];
                    newAction.duration = [1, undefined];
                    targetCell.outerHTML = newAction.render();
                    document.getElementById(`${newAction.uid}`).getElementsByClassName('resizer')[0].addEventListener('mousedown', initResize, false);
                    document.getElementById(`${newAction.uid}`).getElementsByClassName('grip')[0].addEventListener('mousedown', initMove, false);
                    document.getElementById(`${newAction.uid}`).getElementsByClassName('expand')[0].addEventListener('click', expandAction, false);
                    document.getElementById(`${newAction.uid}`).getElementsByClassName('clone')[0].addEventListener('click', initClone, false);
                    actions.push(newAction);
                })
                radialMenu.append(button);
            });

            // if clicking outside the add-action-button, delete the radial-menu and add-action-button
            function removeRadial_Handler(e){
                if(e.target != addActionButton){
                    addActionButton.remove();
                    document.body.removeEventListener('click', removeRadial_Handler);
                    radialMenu.remove();
                }
                if(document.getElementsByClassName('radial-menu').length > 1){
                    radialMenu.remove();
                }
            };
            document.body.addEventListener('click', removeRadial_Handler)

            document.getElementsByTagName('body')[0].append(radialMenu);
            targetCell.removeEventListener('mouseleave', removeChild);
        });
        targetCell.append(addActionButton);
    }
};

function expandAction(evt) {
    const expandBtn = evt.target;
    const action = evt.target.closest('.action');
    const actionObj = actions.find(x=>x.uid === action.id);
    action.getElementsByTagName('INPUT')[0].style.display = 'none';
    
    const actionDetail = Object.assign(document.createElement('div'), {className: 'action-detail'});
    const detailTop = action.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop) + action.offsetHeight;
    const detailLeft = action.getBoundingClientRect().left + (window.pageXOffset || document.documentElement.scrollLeft) + ((action.offsetWidth - action.clientWidth) / 2);
    Object.assign(actionDetail.style,{top:detailTop + 'px',left:detailLeft + 'px',width:action.clientWidth + 'px'});
    actionDetail.id = actionObj.uid + '-detail';
    actionDetail.setAttribute('data-id', actionObj.uid)
    actionDetail.innerHTML = [
        `<h1>${actionObj.name}</h1>`,
        `<textarea class='description' placeholder='Description of action'></textarea>`
    ].join('\n');

    // action.append(actionDetail)
    document.body.append(actionDetail)

    evt.target.removeEventListener('click', expandAction);
    evt.target.addEventListener('click', minimizeAction);
    function minimizeAction(evt) {
        actionDetail.remove();
        action.getElementsByTagName('INPUT')[0].style.display = null;
        evt.target.removeEventListener('click', minimizeAction);
        evt.target.addEventListener('click', expandAction);
    }

    console.log(evt.target.closest('.table-container'));
    evt.target.closest('.table-container').addEventListener('scroll', minimizeOnScroll)
    function minimizeOnScroll(evt){
        actionDetail.remove();
        console.log(evt.target);
        evt.target.removeEventListener('scroll', minimizeOnScroll);
    }
}

function initClone(evt) {
    evt.preventDefault();

    const originalAction = evt.target.closest('.action');
    const actionWidth = originalAction.clientWidth;
    const cloneAction = originalAction.cloneNode(true);
    cloneAction.style.width = actionWidth + 'px';

    let currentDroppable = null;

    let shiftX = evt.clientX - originalAction.getBoundingClientRect().left;
    let shiftY = evt.clientY - originalAction.getBoundingClientRect().top;
    cloneAction.style.position = 'absolute';
    cloneAction.style.zIndex = 500;
    document.body.append(cloneAction);

    moveAt(evt.pageX, evt.pageY);
    
    function moveAt(pageX, pageY) {
        cloneAction.style.left = pageX - shiftX + 'px';
        cloneAction.style.top = pageY - shiftY + 'px'
    }

    function onMouseMove(evt) {
        moveAt(evt.pageX, evt.pageY);

        cloneAction.style.visibility = 'hidden';
        let elemBelow = document.elementFromPoint(evt.clientX, evt.clientY);
        cloneAction.style.visibility = 'visible';

        if(!elemBelow.closest('tbody')) return;
        let droppableBelow = elemBelow.closest('td');
        if(currentDroppable != droppableBelow) {
            if(currentDroppable) {
                currentDroppable.removeAttribute('style');
            }
            currentDroppable = droppableBelow;
            if(currentDroppable){
                currentDroppable.style.backgroundColor = '#0003';
            }
        }
    }

    document.addEventListener('mousemove', onMouseMove);

    cloneAction.onclick = function() {
        if(currentDroppable === null || currentDroppable.firstChild || !currentDroppable.closest('tbody')){
            return;
        } else {
            document.removeEventListener('mousemove', onMouseMove);
            cloneAction.onclick = null;
            currentDroppable.append(cloneAction);
            currentDroppable.removeAttribute('style');
            currentDroppable.removeEventListener('mouseover', showActionButton);
            currentDroppable.removeEventListener('mouseleave', removeChild);
            Object.assign(cloneAction.style,{position:null,zIndex:null,left:null,top:null});
            const cloneActionObject = { ...actions.find(x=>x.uid === originalAction.id)}
            cloneActionObject.uid = createUID(actions, 'A');
            actions.push(cloneActionObject);
            cloneAction.id = cloneActionObject.uid;
            cloneAction.getElementsByClassName('grip')[0].addEventListener('mousedown', initMove, false);
            cloneAction.getElementsByClassName('clone')[0].addEventListener('click', initClone, false);
            actions.find(x=>x.uid === cloneAction.id).turn = [currentDroppable.parentElement.rowIndex, currentDroppable.cellIndex];
        }
        
    }

}


function initMove(evt) {
    evt.preventDefault();

    const action = evt.target.closest('.action');
    const actionWidth = action.clientWidth;
    action.style.width = actionWidth + 'px';

    const startCell = action.parentNode;
    
    
    let currentDroppable = null;

    let shiftX = evt.clientX - action.getBoundingClientRect().left;
    let shiftY = evt.clientY - action.getBoundingClientRect().top;

    action.style.position = 'absolute';
    action.style.zIndex = 500;
    document.body.append(action);
    startCell.innerHTML = '';

    moveAt(evt.pageX, evt.pageY);
    
    function moveAt(pageX, pageY) {
        action.style.left = pageX - shiftX + 'px';
        action.style.top = pageY - shiftY + 'px'
    }

    function onMouseMove(evt) {
        moveAt(evt.pageX, evt.pageY);

        action.style.visibility = 'hidden';
        let elemBelow = document.elementFromPoint(evt.clientX, evt.clientY);
        action.style.visibility = 'visible';

        if(!elemBelow.closest('tbody')) return;
        let droppableBelow = elemBelow.closest('td');
        if(currentDroppable != droppableBelow) {
            if(currentDroppable) {
                currentDroppable.removeAttribute('style');
            }
            currentDroppable = droppableBelow;
            if(currentDroppable){
                currentDroppable.style.backgroundColor = '#0003';
            }
        }
    }

    document.addEventListener('mousemove', onMouseMove);

    action.onmouseup = function() {
        document.removeEventListener('mousemove', onMouseMove);
        action.onmouseup = null;
        if(currentDroppable === null || currentDroppable.firstChild || !currentDroppable.closest('tbody') || currentDroppable == startCell){
            startCell.append(action);
        } else {
            currentDroppable.append(action);
            currentDroppable.removeAttribute('style');
            currentDroppable.removeEventListener('mouseover', showActionButton);
            currentDroppable.removeEventListener('mouseleave', removeChild)
            startCell.addEventListener('mouseover', showActionButton);
            actions.find(x=>x.uid === action.id).turn = [currentDroppable.parentElement.rowIndex, currentDroppable.cellIndex];
        }
        action.style.position = null;
        action.style.zIndex = null;
        action.style.left = null;
        action.style.top = null;
    }
}

// Resize Action boxes, remove and add listeners as necessary if action overlaps adjacent cells.
function initResize(evt) {
    evt.preventDefault();
    
    const action = evt.target.parentElement;
    const colWidth = action.parentElement.offsetWidth;
    const startWidth = action.offsetWidth;
    const startSpan = Math.ceil(startWidth / colWidth);
    let shiftX = evt.clientX - evt.target.getBoundingClientRect().left;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    let newLeft;
    function onMouseMove(evt){
        newLeft = evt.clientX - shiftX - action.getBoundingClientRect().left;

        if(newLeft < 0) {
            newLeft = 0;
        }

        // newLeft = Math.floor(newLeft / 33) * 33;  // uncomment if looking to snap to positions
        action.style.width = newLeft + 'px';   // change to `%` if snapping to position
    }

    function onMouseUp() {
        
        const actionCellIndex = Array.from(action.closest('tr').children).indexOf(action.parentElement);
        const endSpan = Math.ceil(newLeft / colWidth);
        let modifyColumns;
        if(newLeft > startWidth){
            modifyColumns = Array.from(action.closest('tr').children).slice(actionCellIndex, actionCellIndex + endSpan);
            modifyColumns.forEach(cell=>{cell.removeEventListener('mouseover', showActionButton)});
        } else if(newLeft < startWidth) {
            modifyColumns = Array.from(action.closest('tr').children).slice(actionCellIndex + endSpan, actionCellIndex + startSpan);
            modifyColumns.forEach(cell=>{cell.addEventListener('mouseover', showActionButton)});
        };

        // set the action duration (both turn count, and pixel width)
        actions.find(x=>x.uid === action.id).duration = [endSpan, action.offsetWidth];

        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('mousemove', onMouseMove);
    }
}








// function displayActionDetails(action){
//     const detailArea = Object.assign(document.createElement('div'), {className:'detail-area'});
//     const nameInput = Object.assign(document.createElement('input'), {className:'action-name-input'});
//     const actionTypeDisplay = Object.assign(document.createElement('div'), {className:'action-type-display'});
//     actionTypeDisplay.textContent = action.type;
//     const actionTurnDurationDisplay = Object.assign(document.createElement('input'), {className:'action-duration-display'});
//     detailArea.append(nameInput, actionTypeDisplay, actionTurnDurationDisplay);
//     action.startElement.closest('.character').append(detailArea)
// }





// function addAction(evt) {
//     const slot = evt.target;
//     console.log(slot);
//     const slotTD = slot.parentNode;
//     slot.removeEventListener('click', addAction);
//     slotTD.removeEventListener('mouseover', showActionButton);
//     slotTD.removeEventListener('mouseleave', removeChild );
//     const effect = Object.assign(document.createElement('div'), {
//         className : 'effect'
//     });
//     const startingColor = '#808080';
//     effect.innerHTML = `<i class="fas fa-ellipsis-v"></i><input class='effect-color' type='color' value='${startingColor}' /><input class='effect-name' type='text' title='' value='' placeholder='Effect' /><div class='turn-duration'><div class='number-spinner' onclick='this.nextSibling.value -= 1'><i class="fas fa-caret-left"></i></div><input type='number' value='1'  size='3' onclick='this.select();' /><div class='number-spinner' onclick='this.previousSibling.value = parseInt(this.previousSibling.value) + 1'><i class="fas fa-caret-right"></div></div>`;
//     effect.style.backgroundColor = startingColor;
//     slotTD.append(effect);
//     // ['click'].forEach(evt => effect.querySelector('.fa-ellipsis-v').addEventListener(evt, actionDetails, false));
//     ['mouseout','change'].forEach(evt => effect.querySelector('.turn-duration').addEventListener(evt, changeColumnSpan, false));
//     ['input'].forEach(evt => effect.querySelector('input[type="color"]').addEventListener(evt, changeEffectColor, false));
//     ['input'].forEach(evt => effect.querySelector('input[type="text"]').addEventListener(evt, changeValue, false));
//     slot.remove();
//     if(slotTD.parentNode.nextElementSibling == null){
//         addRowAfter(slotTD.parentElement)
//     };
//     // pretty much a duplicate of the 'highlightHeader()' function, could probably refactor that to remove this
//     const highlightHeaders = slotTD.closest('.encounter').querySelectorAll('th[style*="background"]');
//     highlightHeaders.forEach(header=>header.removeAttribute('style'));
//     const tables = Array.from(slotTD.closest('.encounter').getElementsByTagName('table'));
//     tables.forEach((table)=>{
//         table.querySelectorAll('th')[slotTD.cellIndex].style.backgroundColor = 'rgb(255, 183, 47)';   
//         table.querySelectorAll('th')[slotTD.cellIndex].style.color = '#222';
//     })
    
// }




function changeValue(evt){
    evt.target.setAttribute('value', evt.target.value);
    evt.target.setAttribute('title', evt.target.value);
}

function changeColumnSpan(evt){
    const durationField = evt.currentTarget.getElementsByTagName('input')[0];
    let turnCount = durationField?.value;
    if(turnCount > 200){                                                                //  Couldn't find a way to validate if text rather than number
        console.log('Error: Cannot increase by more than 200 turns at a time.');        //  Firefox number input returns '0' if text is entered
        let effectName = evt.target.previousElementSibling.value;                           //  but 0 is also needed later in the function.
        evt.target.previousElementSibling.value = 'max 200';                                //  Tried using regex and NaN to no avail.
        setTimeout(()=>{evt.target.nextElementSibling.value = effectName}, 1500);       //  So now it doesn't validate text but instead treats it as '0' so it deletes the effect.
        durationField.value = evt.target.closest('td').colSpan;
        return;
    };

    durationField.setAttribute('value', durationField.value);
    const tableCellOfInput = durationField.closest('td');
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
                durationField.value--;
                durationField.setAttribute('value', durationField.value);
            } else {
                tableCellOfInput.nextElementSibling.remove();
            };
            tableCellOfInputSpan += 1;
        }
    };

    // Now that the empty cells have been set up, finally adjust the actual colspan of the target cell.
    tableCellOfInput.setAttribute('colspan', durationField.value);

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
