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
}

function changeEffectColor(evt){
    const effectDiv = evt.target.parentNode;
    effectDiv.style.backgroundColor = evt.target.value;
}