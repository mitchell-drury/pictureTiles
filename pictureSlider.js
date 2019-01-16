let spin;
let rotate;
let mouseStartX;
let mouseStartY;

function makeMovable() {
    let body = document.getElementsByTagName('body')[0];
    body.addEventListener('touchmove', function(event) {
        document.elementFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY).style.opacity = 1;
    })

    let cells = document.getElementsByClassName('cell');
    for(let i = 0; i < cells.length; i++) {
        cells[i].addEventListener('touchstart', function(event) {                event.preventDefault(); grabCell(event);
        });
        cells[i].addEventListener('touchmove', function(event) {
            event.preventDefault(); event.target.style.opacity = 1; moveCell(event);
        });
        cells[i].addEventListener('touchend', function(event) {
            event.preventDefault(); releaseCell(event);
        });
    }
    calculateSizeAndPosition();
    scatterCells();
    window.onresize = calculateSizeAndPosition;
}

function scatterCells() {
    let cells = document.getElementsByClassName('cell');
    let top;
    let left;
    let cellDimensions;
    let rotation;
    for(let i = 0; i < cells.length; i++) {
        cellDimensions = cells[i].getBoundingClientRect();
        cells[i].style.left = 0;
        cells[i].style.top = 0;
        cells[i].style.transform = 'rotate(0deg)';
        let cellDiagonal = Math.sqrt(Math.pow(cellDimensions.width, 2) + Math.pow(cellDimensions.height, 2));

        console.log(document.getElementsByTagName('body')[0].clientHeight);
        let gameWidth = document.getElementsByTagName('body')[0].clientWidth
        let gameHeight = document.getElementsByTagName('body')[0].clientHeight;        
        left = Math.random()*(gameWidth - cellDiagonal/2) - cellDimensions.left;
        cells[i].style.left = left;        
        top = Math.random()*(gameHeight - cellDiagonal/2) - cellDimensions.top;
        cells[i].style.top = top;
        
        rotation = Math.random()*360;
        cells[i].style.transform = "rotate(" + rotation + "deg)";        
        cells[i].style.zIndex = i+1;    
    }
}

function scrambleCells() {

}

function calculateSizeAndPosition() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    let gridHeight;

    //sizing and positioning the grid
    if(height < width) {
        gridHeight = Math.round(height*.8);
        gridHeight = gridHeight - (gridHeight % 3)
        document.getElementById('pictureGrid').style.height = gridHeight;
        document.getElementById('pictureGrid').style.width = gridHeight;
        document.getElementById('pictureGrid').style.top = gridHeight*.1;
    } else {
        gridHeight = Math.round(width*.8);
        gridHeight = gridHeight - (gridHeight % 3)
        document.getElementById('pictureGrid').style.height = gridHeight;
        document.getElementById('pictureGrid').style.width = gridHeight;
        document.getElementById('pictureGrid').style.top = (window.innerHeight - gridHeight)/2;
    }

    //also scale the size of the tiles
    let cells = document.getElementsByClassName('cell');
    for(let i = 0; i < cells.length; i++) {
        cells[i].style.width = gridHeight/3;
        cells[i].style.height = gridHeight/3;
    }

    //position the sun
    document.getElementById('sun').style.width = gridHeight;
    document.getElementById('sun').style.height = gridHeight;
    document.getElementById('sun').style.bottom = - gridHeight/2;
    document.getElementById('sun').style.right = - gridHeight/2;
}

function mouseOver(event) {
    event.target.style.opacity = 1;
}

function grabCell(event) {
    event.target.style.cursor = 'grabbing';
    mouseStartX = event.clientX || event.targetTouches[0].clientX;
    mouseStartY = event.clientY || event.targetTouches[0].clientY;

    //shift the position of the tile to center of cursor
    let cellDimensions = event.target.getBoundingClientRect();
    let centerX = cellDimensions.x + cellDimensions.width/2;
    let centerY = cellDimensions.y + cellDimensions.height/2;
    let diffX = mouseStartX - centerX;
    let diffY = mouseStartY - centerY;
    //console.log(event.target.getBoundingClientRect(), event.clientX, event.clientY);
    event.target.style.top = parseFloat(event.target.style.top) + diffY;
    event.target.style.left = parseFloat(event.target.style.left) + diffX;

    //bring this tile to top: push everything above it down one z index
    let cells = document.getElementsByClassName('cell');
    let grabbedZIndex = event.target.style.zIndex;
    for(let i = 0; i < cells.length; i++) {
        let zIndex = parseInt(cells[i].style.zIndex);
        //console.log(zIndex, grabbedZIndex);
        if(zIndex > grabbedZIndex) {
            //console.log('under');
            zIndex -= 1;
            cells[i].style.zIndex = zIndex;
        }
    }
    event.target.style.zIndex = 9;

    //start rotation if tile is held without dragging
    rotate = setTimeout(startRotation, 250, event);

    //drag the tile if mouse moves
    event.target.onmousemove = moveCell;
}

function releaseCell(event) {
    event.target.style.cursor = 'grab';
    let cellId = parseInt(event.target.id.substring(4))
    clearInterval(spin);
    clearTimeout(rotate);
    event.target.onmousemove = null;

    //snap to a 90 degree rotation if it's close, and in the box
    let end = event.target.style.transform.length - 4;
    let degreeString = event.target.style.transform.substring(7, end);
    let degrees = parseFloat(degreeString);

    if(degrees % 90 > 75 || degrees % 90 < 15) {
        let inBox = false;
        let grid = document.getElementById('pictureGrid');          let top = parseFloat(grid.style.top);
        let width = parseFloat(grid.style.width);
        let left = screen.width < 700 ? (screen.width - width)/2: (window.innerWidth - width)/2;
        console.log(width, left);
        let clientX = event.clientX || event.changedTouches[0].clientX;
        let clientY = event.clientY || event.changedTouches[0].clientY;

        //first quadrant (width and height should always be equal)
        if(clientX > (left + width/12) && clientX < (left + width*3/12) && clientY > (top + width/12) && clientY < (top + width*3/12)){
            event.target.style.top = (0 - Math.floor((cellId-1)/3))*width/3;
            event.target.style.left = (0 - (cellId-1) % 3)*width/3;
            inBox = true;
        } //second quadrant
        else if(clientX > (left + width*5/12) && clientX < (left + width*7/12) && clientY > (top + width/12) && clientY < (top + width*3/12)) { 
            event.target.style.top = (0 - Math.floor((cellId-1)/3))*width/3;
            event.target.style.left = (1 - (cellId-1) % 3)*width/3; inBox = true;        
        } //third
        else if(clientX > (left + width*9/12) && clientX < (left + width*11/12) && clientY > (top + width/12) && clientY < (top + width*3/12)) {
            event.target.style.top = (0 - Math.floor((cellId-1)/3))*width/3;
            event.target.style.left = (2 - (cellId-1) % 3)*width/3; inBox = true;        
        } //fourth
        else if(clientX > (left + width/12) && clientX < (left + width*3/12) && clientY > (top + width*5/12) && clientY < (top + width*7/12)) {
            event.target.style.top = (1 - Math.floor((cellId-1)/3))*width/3;
            event.target.style.left = (0 - (cellId-1) % 3)*width/3; inBox = true;        
        } //fifth
        else if(clientX > (left + width*5/12) && clientX < (left + width*7/12) && clientY > (top + width*5/12) && clientY < (top + width*7/12)) {
            event.target.style.top = (1 - Math.floor((cellId-1)/3))*width/3;
            event.target.style.left = (1 - (cellId-1) % 3)*width/3; inBox = true;        
        } //sixth    
        else if(clientX > (left + width*9/12) && clientX < (left + width*11/12) && clientY > (top + width*5/12) && clientY < (top + width*7/12)) {
            event.target.style.top = (1 - Math.floor((cellId-1)/3))*width/3;
            event.target.style.left = (2 - (cellId-1) % 3)*width/3; inBox = true;        
        } //seventh     
        else if(clientX > (left + width/12) && clientX < (left + width*3/12) && clientY > (top + width*9/12) && clientY < (top + width*11/12)) {
            event.target.style.top = (2 - Math.floor((cellId-1)/3))*width/3;
            event.target.style.left = (0 - (cellId-1) % 3)*width/3; inBox = true;        
        } //eigth      
        else if(clientX > (left + width*5/12) && clientX < (left + width*7/12) && clientY > (top + width*9/12) && clientY < (top + width*11/12)) {
            event.target.style.top = (2 - Math.floor((cellId-1)/3))*width/3;
            event.target.style.left = (1 - (cellId-1) % 3)*width/3; inBox = true;        
        } //ninth     
        else if(clientX > (left + width*9/12) && clientX < (left + width*11/12) && clientY > (top + width*9/12) && clientY < (top + width*11/12)) {
            event.target.style.top = (2 - Math.floor((cellId-1)/3))*width/3;
            event.target.style.left = (2 - (cellId-1) % 3)*width/3; inBox = true;        
        }        
        //if it was in a box, snap it to 90deg
        if(inBox) {
            if(degrees % 90 > 75) {
                //snap clockwise
                let difference = 90 - (degrees % 90); 
                let newDegrees = (degrees + difference) % 360;
                event.target.style.transform = 'rotate(' + newDegrees + 'deg)';
            } else if(degrees % 90 < 15) {
                //snap counter clockwise
                let difference = degrees % 90; 
                let newDegrees = (degrees - difference) % 360;
                event.target.style.transform = 'rotate(' + newDegrees + 'deg)';
            }
        }
    } 
    if(checkImageArrangement() === 'correct' && event.type === 'mouseup'){
        //play zelda sound
        document.getElementById('zelda').play();
        document.getElementById('pictureGrid').style.animationPlayState = 'running';
    } else if (checkImageArrangement() === 'needs rotation' && event.type === 'mouseup') {
        //blink sun
        document.getElementById('sun').style.animationPlayState = 'running';
        let stopSun = setTimeout(function() {document.getElementById('sun').style.animationPlayState = 'paused'}, 1400);
        console.log('neds rotate');
    }
}

function startRotation(event) {
    spin = setInterval(spinCell, 5, event);
}

function spinCell(event) {
    let end = event.target.style.transform.length - 4;
    let degreeString = event.target.style.transform.substring(7, end);

    let degrees = parseFloat(degreeString);
    degrees += .4;  
    event.target.style.transform = "rotate(" + degrees + "deg)";
}

function moveCell(event) {
    //stop spinning if the tile is being moved
    clearInterval(spin);
    
    let newX = event.clientX || event.touches[0].clientX;
    let newY = event.clientY || event.touches[0].clientY;
    event.target.style.left = parseFloat(event.target.style.left) + newX - mouseStartX;
    event.target.style.top = parseFloat(event.target.style.top) + newY - mouseStartY;
    mouseStartX = event.clientX || event.touches[0].clientX;
    mouseStartY = event.clientY || event.touches[0].clientY;
}

function setCellPositionPercentage() {
    //after dragging, so that they will still move with screen resize
}

function checkImageArrangement() {
    let cells = document.getElementsByClassName('cell');
    let cellWidth = parseInt(document.getElementById('pictureGrid').style.height)/3;
    let end;
    let degrees;
    if( parseFloat(cells[0].style.top) === 0 && 
        parseFloat(cells[0].style.left) === 2*cellWidth &&
        cells[0].style.transform === 'rotate(90deg)' && 
        parseFloat(cells[1].style.top) === cellWidth && 
        parseFloat(cells[1].style.left) === cellWidth &&
        cells[1].style.transform === 'rotate(90deg)' && 
        parseFloat(cells[2].style.top) === 2*cellWidth && 
        parseFloat(cells[2].style.left) === 0 &&
        cells[2].style.transform === 'rotate(90deg)' && 
        parseFloat(cells[3].style.top) === -cellWidth && 
        parseFloat(cells[3].style.left) === cellWidth &&
        cells[3].style.transform === 'rotate(90deg)' && 
        parseFloat(cells[4].style.top) === 0 && 
        parseFloat(cells[4].style.left) === 0 &&
        cells[4].style.transform === 'rotate(90deg)' && 
        parseFloat(cells[5].style.top) === cellWidth && 
        parseFloat(cells[5].style.left) === -cellWidth &&
        cells[5].style.transform === 'rotate(90deg)' && 
        parseFloat(cells[6].style.top) === -2*cellWidth && 
        parseFloat(cells[6].style.left) === 0 &&
        cells[6].style.transform === 'rotate(90deg)' && 
        parseFloat(cells[7].style.top) === -cellWidth && 
        parseFloat(cells[7].style.left) === -cellWidth &&
        cells[7].style.transform === 'rotate(90deg)' && 
        parseFloat(cells[8].style.top) === 0 && 
        parseFloat(cells[8].style.left) === -2*cellWidth &&
        cells[8].style.transform === 'rotate(90deg)' 
    ) {return 'needs rotation';} 
    else if (
        parseFloat(cells[0].style.top) === 2*cellWidth && 
        parseFloat(cells[0].style.left) === 2*cellWidth &&
        cells[0].style.transform === 'rotate(180deg)' && 
        parseFloat(cells[1].style.top) === 2*cellWidth && 
        parseFloat(cells[1].style.left) === 0 &&
        cells[1].style.transform === 'rotate(180deg)' && 
        parseFloat(cells[2].style.top) === 2*cellWidth && 
        parseFloat(cells[2].style.left) === -2*cellWidth &&
        cells[2].style.transform === 'rotate(180deg)' && 
        parseFloat(cells[3].style.top) === 0 && 
        parseFloat(cells[3].style.left) === 2*cellWidth &&
        cells[3].style.transform === 'rotate(180deg)' && 
        parseFloat(cells[4].style.top) === 0 && 
        parseFloat(cells[4].style.left) === 0 &&
        cells[4].style.transform === 'rotate(180deg)' && 
        parseFloat(cells[5].style.top) === 0 && 
        parseFloat(cells[5].style.left) === -2*cellWidth &&
        cells[5].style.transform === 'rotate(180deg)' && 
        parseFloat(cells[6].style.top) === -2*cellWidth && 
        parseFloat(cells[6].style.left) === 2*cellWidth &&
        cells[6].style.transform === 'rotate(180deg)' && 
        parseFloat(cells[7].style.top) === -2*cellWidth && 
        parseFloat(cells[7].style.left) === 0 &&
        cells[7].style.transform === 'rotate(180deg)' && 
        parseFloat(cells[8].style.top) === -2*cellWidth && 
        parseFloat(cells[8].style.left) === -2*cellWidth &&
        cells[8].style.transform === 'rotate(180deg)' ) 
        {return 'needs rotation';} 
    else if (
        parseFloat(cells[0].style.top) === 2*cellWidth && 
        parseFloat(cells[0].style.left) === 0 &&
        cells[0].style.transform === 'rotate(270deg)' && 
        parseFloat(cells[1].style.top) === cellWidth && 
        parseFloat(cells[1].style.left) === -cellWidth &&
        cells[1].style.transform === 'rotate(270deg)' && 
        parseFloat(cells[2].style.top) === 0 && 
        parseFloat(cells[2].style.left) === -2*cellWidth &&
        cells[2].style.transform === 'rotate(270deg)' && 
        parseFloat(cells[3].style.top) === cellWidth && 
        parseFloat(cells[3].style.left) === cellWidth &&
        cells[3].style.transform === 'rotate(270deg)' && 
        parseFloat(cells[4].style.top) === 0 && 
        parseFloat(cells[4].style.left) === 0 &&
        cells[4].style.transform === 'rotate(270deg)' && 
        parseFloat(cells[5].style.top) === -cellWidth && 
        parseFloat(cells[5].style.left) === -cellWidth &&
        cells[5].style.transform === 'rotate(270deg)' && 
        parseFloat(cells[6].style.top) === 0 && 
        parseFloat(cells[6].style.left) === 2*cellWidth &&
        cells[6].style.transform === 'rotate(270deg)' && 
        parseFloat(cells[7].style.top) === -cellWidth && 
        parseFloat(cells[7].style.left) === cellWidth &&
        cells[7].style.transform === 'rotate(270deg)' && 
        parseFloat(cells[8].style.top) === -2*cellWidth && 
        parseFloat(cells[8].style.left) === 0 &&
        cells[8].style.transform === 'rotate(270deg)' 
    ) {return 'needs rotation';} 
    
    for(let i = 0; i < cells.length; i++) {
        end = cells[i].style.transform.length - 4;
        degrees = parseInt(cells[i].style.transform.substring(7, end));
        if(cells[i].style.top !== '0px' || cells[i].style.left !== '0px' || degrees !== 0) {
            return false;
        }
    }
    return 'correct';
}

/*FOR TOUCH EVENTS */
function preventScrolling(event) {
    console.log('preventing');
    event.preventDefault();
}
