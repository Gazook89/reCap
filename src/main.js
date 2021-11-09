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
    slotTD.removeEventListener('mouseleave', removeChild )
    console.log(slotTD);
    const effect = Object.assign(document.createElement('div'), {
        className : 'effect',
    });
    effect.innerHTML = `<input type='number' value='' placeholder='n' /><input type='text' placeholder='Effect' /><input type='color' value='#808080' />`;
    slotTD.append(effect);
    ['onkeyup','change'].forEach(evt => effect.querySelector('input[type="number"]').addEventListener(evt, changeRowSpan, false));
    ['input'].forEach(evt => effect.querySelector('input[type="color"]').addEventListener(evt, changeEffectColor, false));

    slot.remove()
}

function changeRowSpan(evt){
    const tableCellOfInput = evt.target.closest('td');
    tableCellOfInput.setAttribute('colspan', evt.target.value);

    const table = document.getElementById('main-table');
    const tableBodyRows = document.querySelectorAll('tbody>tr');
    
    let cellsInEachRow = [];
    console.log('**** NEW LINE ****');
    for(let x=0;x<table.rows.length;x++){
        let cellCount = 0;
        let row = table.rows[x];
        for(let y=0;y<row.cells.length;y++){
            let cell = row.cells[y];
            cellCount += cell.colSpan;
            cell = null;
        }
        cellsInEachRow.push(cellCount);
        console.log(`Row ${x}: ${cellCount}`);
    }
    longestRow = Math.max(...cellsInEachRow);
    let headerCount = table.getElementsByTagName('th').length;
    // if(headerCount < longestRow){
        for(let x=headerCount;headerCount<longestRow;headerCount++){
            const th = Object.assign(document.createElement('th'), {textContent : x});

            table.firstElementChild.firstElementChild.append(th);
        }
        tableBodyRows.forEach(evt=>{
            let tdCount = evt.cells.length;
            for(let x=tdCount; x < longestRow;x++){
                const td = document.createElement('td');
                evt.append(td);
            }
        })
    // }
    

    
    
}

function changeEffectColor(evt){
    const effectDiv = evt.target.parentNode;
    effectDiv.style.backgroundColor = evt.target.value;
}