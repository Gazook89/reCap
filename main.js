window.onload = function() {
    const tdCells = document.getElementsByTagName('td');
    let arrCells = [];
    for(let x=0;x<tdCells.length;x++){
        arrCells.push(tdCells[x]);
    }
    arrCells.forEach(element => {
        if(element.innerHTML === ''){
            element.addEventListener('mouseover', showActionButton);
        }
        
    });

    // record structure of table on every change.
    // check out https://codeburst.io/observe-changes-in-dom-using-mutationobserver-9c2705222751
    // mutationRecords has properties that can be accessed.  

    const table = document.getElementById('main-table');
    let timer = null;
    let observer = new MutationObserver(mutationRecords => { 
        mutationRecords.forEach((mutation)=>{
            if( mutation.addedNodes[0]?.className === 'add-action' || mutation.removedNodes[0]?.className === 'add-action'){
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
        
    });


    observer.observe(table, {
        childList : true,
        subtree: true,
        attributes : true
    });

    

    if('table' in localStorage){
        table.innerHTML = localStorage.getItem('table');
        
        const cells = document.getElementsByTagName('td');
        for(let x=0;x<cells.length;x++){
            if(cells[x].childElementCount == 0){
                cells[x].addEventListener('mouseover', showActionButton)
            } else if(cells[x].firstElementChild.className === 'add-action'){
                const newCell = document.createElement('td');
                newCell.addEventListener('mouseover', showActionButton);
                cells[x].replaceWith(newCell);
            } else if(cells[x].firstElementChild.className === 'effect'){
                ['onkeyup','change'].forEach(evt => cells[x].querySelector('input[type="number"]').addEventListener(evt, changeRowSpan, false));
                ['input'].forEach(evt => cells[x].querySelector('input[type="color"]').addEventListener(evt, changeEffectColor, false));
                ['input'].forEach(evt => cells[x].querySelector('input[type="text"]').addEventListener(evt, changeValue, false));
            }
        };
    }
    
}



function save(){
    const savedNotice = document.getElementById('savedNotice') === null ? Object.assign(document.createElement('span'), {id : 'savedNotice'}) : document.getElementById('savedNotice');
    savedNotice.textContent = 'saving';
    document.querySelector('h1').insertAdjacentElement('afterend', savedNotice);
    setTimeout(()=>{text = 'saving'},0);
    setTimeout(function(){
        const table = document.getElementById('main-table');
        localStorage.setItem('table', table.innerHTML);
        savedNotice.textContent = 'saved';
    },1000);
    
}

// TODO: currently this doesn't work with colspan'd rows
// The function is just taking existing cells and replacing them with empty cells,
// but if a row has a colspan'd cell, it isn't creating any extra empty cells.  
// Likely need ot take the currently unused 'columns' variable to determine how many cells needed in each row

function clearTable(elem){
    const cells = document.getElementsByTagName('td');
    const columns = document.getElementsByTagName('th').length;  
    for(let x = cells.length - 1;x>0;x--){
        const newCell = document.createElement('td');
        newCell.addEventListener('mouseover', showActionButton);
        cells[x].replaceWith(newCell);
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
    let targetCellID = targetCell.tagName;
    if(targetCell.innerHTML === ''){
        // evt.target.removeEventListener('mouseover', showActionButton);
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
    effect.innerHTML = `<input type='number' value='1' placeholder='n' /><input type='text' value='' placeholder='Effect' /><input type='color' value='#808080' />`;
    slotTD.append(effect);
    ['onkeyup','change'].forEach(evt => effect.querySelector('input[type="number"]').addEventListener(evt, changeRowSpan, false));
    ['input'].forEach(evt => effect.querySelector('input[type="color"]').addEventListener(evt, changeEffectColor, false));
    ['input'].forEach(evt => effect.querySelector('input[type="text"]').addEventListener(evt, changeValue, false));

    slot.remove()

    

}

function changeValue(evt){
    evt.target.setAttribute('value', evt.target.value);
}

function changeRowSpan(evt){
    evt.target.setAttribute('value', evt.target.value);
    let turnCount = evt.target.value;
    const tableCellOfInput = evt.target.closest('td');
    const tableCellOfInputSpan = tableCellOfInput.colSpan;
    if(turnCount == 0){
        const cell = document.createElement('td');
        cell.addEventListener('mouseover', showActionButton);
        tableCellOfInput.replaceWith(cell);
        return;
    } else if(turnCount < tableCellOfInputSpan) {
        tableCellOfInput.colSpan = turnCount;
        const cell = document.createElement('td');
        cell.addEventListener('mouseover', showActionButton);
        tableCellOfInput.parentNode.insertBefore(cell,tableCellOfInput.nextElementSibling);
        return;
    } else {
        if(tableCellOfInput.nextElementSibling == null){
            console.log('no next cell');
            evt.target.value--;
            evt.target.setAttribute('value', evt.target.value);
            return;
        } else if(tableCellOfInput.nextElementSibling.firstChild?.className === 'effect') {
            console.log('another effect in the way');
            evt.target.value--;
            evt.target.setAttribute('value', evt.target.value);
            // add another <tr> row below and move this effect to that row.
            return;
        } else {
            tableCellOfInput.nextElementSibling.remove();
        };
    };
    
    
    tableCellOfInput.setAttribute('colspan', evt.target.value);

    const table = document.getElementById('main-table');
    
    let cellsInEachRow = [];
    // console.log('**** NEW LINE ****');
    for(let x=0;x<table.rows.length;x++){
        let cellCount = 0;
        let row = table.rows[x];
        for(let y=0;y<row.cells.length;y++){
            let cell = row.cells[y];
            cellCount = cell.colSpan >= 1 ? cellCount + cell.colSpan : cellCount + 1;
        };
        cellsInEachRow.push(cellCount);
        // console.log(`Row ${x}: ${cellCount}`);
    };

    let longestRow = Math.max(...cellsInEachRow);
    
    // for(x=0;x<table.rows.length;x++){
    //     for(let y=0; y < longestRow - table.rows[x].cells.length;y++){
    //         const newCell = table.rows[x].parentNode.tagName === 'THEAD' ? document.createElement('th') : document.createElement('td');
    //         table.rows[x].append(newCell);
    //     }
    // }
    
    
}

function changeEffectColor(evt){
    evt.target.setAttribute('value', evt.target.value);
    const effectDiv = evt.target.parentNode;
    effectDiv.style.backgroundColor = evt.target.value;
}

function removeColumn(elem){
    const table = document.getElementById('main-table');
    const colControls = elem.parentNode;
    const lastColumn = colControls.parentNode.cellIndex;

    colControls.parentNode.previousElementSibling.append(colControls)
    for(let x = 0; x < table.rows.length; x++){
        if(table.rows[x].cells[lastColumn] == undefined){
            const cellCount = table.rows[x].cells.length - 1;
            const lastCell = table.rows[x].cells[cellCount];
            // if(lastCell has a colspan, reduce the colspan...if no colspan, remove the cell)
            lastCell.colSpan <= 1 || lastCell.hasAttribute('colSpan') === false ? lastCell.remove() : lastCell.colSpan = lastCell.colSpan - 1 ;
            // lastCell.colSpan = lastCell.colSpan - 1;
        } else {
        table.rows[x].cells[lastColumn].remove();
        };
    };

}

function addColumn(elem){
    const table = document.getElementById('main-table');
    const colControls = elem.parentNode;
    const lastColumn = colControls.parentNode.cellIndex;

    for(x=0;x<table.rows.length;x++){   // add a cell to each row
        let newCell;
        if(table.rows[x].parentNode.tagName === 'THEAD'){ // add column controls and column number to header
            newCell = document.createElement('th');
            newCell.textContent = lastColumn + 1;  
            newCell.append(colControls);
        } else {
            newCell = document.createElement('td'); //  otherwise if not a header, just add a cell.
            newCell.addEventListener('mouseover', showActionButton);
        }
        table.rows[x].append(newCell)
    }
}



function addRowAfter(currentRow){
    const newRow = Object.assign(document.createElement('tr'),{className : 'spells'});
    const columns = document.getElementsByTagName('th').length; 
    for(let x=0;x<columns;x++){
        const newCell = document.createElement('td');
        newCell.addEventListener('mouseover', showActionButton);
        newRow.append(newCell);
    };
    currentRow.parentNode.append(newRow);
}

function removeRow(targetRow){
    targetRow.remove()
}

function addTableCell(type){  // Attempt to pull all "create new cell" code into single function
    let newCell;
    if(type === 'th'){
        newCell = document.createElement('th')
    }
}