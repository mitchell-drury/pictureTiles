let spin;
let rotate;

function makeMovable() {
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
        
        left = Math.random()*(window.innerWidth - 20) - cellDimensions.left - 10;
        cells[i].style.left = left;        
        
        top = Math.random()*(window.innerHeight - 20) - cellDimensions.top - 10;
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

    //sizing and positioning the grid
    if(height < width) {
        document.getElementById('pictureGrid').style.height = height*.8;
        document.getElementById('pictureGrid').style.width = height*.8;
        document.getElementById('pictureGrid').style.top = height*.1;
    } else {
        document.getElementById('pictureGrid').style.height = width*.8;
        document.getElementById('pictureGrid').style.width = width*.8;  
        document.getElementById('pictureGrid').style.top = (height-.8*width)/2;    
    }
}

function mouseOver(event) {
    event.target.style.opacity = 1;
}

function grabCell(event) {
    event.target.style.cursor = 'grabbing';
    let cellDimensions = event.target.getBoundingClientRect();
    let centerX = cellDimensions.x + cellDimensions.width/2;
    let centerY = cellDimensions.y + cellDimensions.height/2;

    let diffX = event.clientX - centerX;
    let diffY = event.clientY - centerY;

    //shift the position of the tile to center of cursor
    console.log(event.target.getBoundingClientRect(), event.clientX, event.clientY);
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
    document.onmousemove = moveCell;
}

function releaseCell(event) {
    event.target.style.cursor = 'grab';
    clearInterval(spin);
    clearTimeout(rotate);
    document.onmousemove = null;

    //snap to a 90 degree rotation if it's close, and in the box
    let end = event.target.style.transform.length - 4;
    let degreeString = event.target.style.transform.substring(7, end);
    let degrees = parseFloat(degreeString);

    if(degrees % 90 > 75 || degrees % 90 < 15) {
        let inBox = false;
        let grid = document.getElementById('pictureGrid');          let top = parseFloat(grid.style.top);
        let width = parseFloat(grid.style.width);
        let left = (window.innerWidth - width)/2;

        console.log(event.clientX, event.clientY, 'topbound:', top + width/12, 'bottombound:', top + width/4, 'leftbound:', left + width/12, 'rightbound:', left + width/4);

        //first quadrant (width and height should always be equal)
        if(event.clientX > (left + width/12) && event.clientX < (left + width*3/12) && event.clientY > (top + width/12) && event.clientY < (top + width*3/12)){
            event.target.style.top = (top) + 'px';
            event.target.style.left = (left) + 'px';
            inBox = true;
        } //second quadrant
        else if(event.clientX > (left + width*5/12) && event.clientX < (left + width*7/12) && event.clientY > (top + width/12) && event.clientY < (top + width*3/12)) { 
        
            inBox = true;        
        } //third
        else if(event.clientX > (left + width*5/12) && event.clientX < (left + width*9/12) && event.clientY > (top + width/12) && event.clientY < (top + width*3/12)) {
            
            inBox = true;
        }

        //if it was in a box, spin it also
        if(inBox) {
            if(degrees % 90 > 75) {
                //snap clockwise
                let difference = 90 - (degrees % 90); 
                let newDegrees = degrees + difference;
                event.target.style.transform = 'rotate(' + newDegrees + 'deg)';
            } else if(degrees % 90 < 15) {
                //snap counter clockwise
                let difference = degrees % 90; 
                let newDegrees = degrees - difference;
                event.target.style.transform = 'rotate(' + newDegrees + 'deg)';
            }
        }
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
    
    event.target.style.top = event.clientY - parseFloat(event.target.style.height)/2
    event.target.style.left = event.clientX - parseFloat(event.target.style.width)/2
}

function setCellPositionPercentage() {
    //after dragging, so that they will still move with screen resize
}