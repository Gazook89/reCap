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
    effect.innerHTML = `<input type='color' /><input type='text' /><input type='number' />`;
    slotTD.append(effect);
    slot.remove()
}