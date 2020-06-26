/** Author: Hercules Dias Campos (ID 101091070) */

//Constants:
const SIZE = 640;
const SIDE = 64;
const ROWS = SIZE/SIDE; // 10
const COLS = ((SIZE/SIDE) + 1); // 11

//Event Listener Management:
window.addEventListener("keydown", OnKeyPressed);
window.addEventListener("keyup", OnKeyReleased);

var pressedL = false;
var pressedU = false;
var pressedR = false;
var pressedD = false;
//var isPaused = false;

//Input Handling functions
function OnKeyPressed(evt){

    switch (evt.keyCode){
        case 37:{
            if (pressedL == false)
                pressedL = true;
            break;
        }
        case 38:{
            if (pressedU == false)
                pressedU = true;
            break;
        }
        case 39:{
            if (pressedR == false)
                pressedR = true;
            break;
        }
        case 40:{
            if (pressedD == false)
                pressedD = true;
            break;
        }
        /*
        case 32:{
            isPaused = !isPaused;
            CheckPause();
            break;
        */
        default:{
            console.log("Unused key pressed.");
            break;
        }
    }
}

function OnKeyReleased(evt){

    switch(evt.keyCode){
        case 37:
            pressedL = false;
            break;
        case 38:
            pressedU = false;
            break;
        case 39:
            pressedR = false;
            break;
        case 40:
            pressedD = false;
            break;
        default:{
            console.log("Unused key released.");
            break;
        }
    }
}

//background generation (scrolling in a later function);
var ug = document.getElementById("Subterranean"); //ug for underground
    ug.width = SIZE;
    ug.height = SIZE;
var rockLayers = ug.getContext("2d");

var background = [];
var ground = new Image();
    ground.src = "Stone.png";

for (var r = 0; r < ROWS; r++){

    background[r] = [];

    for (var c = 0; c < COLS; c++){

        var tempContainer = {};
        tempContainer.x = c * SIDE;
        tempContainer.y = r * SIDE;
        tempContainer.img = ground;
        background[r][c] = tempContainer;
    }
}

//Obstacles and safe tile generation (scrolling in a later function);
var boulder = document.getElementById("Boulders");
    boulder.width = SIZE;
    boulder.height = SIZE;
    boulder.style.left = ug.offsetLeft+"px"; // these two lines were used to force the third canvas on top of the
    boulder.style.top = ug.offsetTop+"px";   // first one, matching their coordinates.
var incoming = boulder.getContext("2d");

var obstacles = [];
var rocks = new Image();
    rocks.src = "Boulder.png";
var safeTile = new Image();
    safeTile.src = "Gold.png";
var blankTile = new Image();
    blankTile.img = "Blank.png";

for (var rs = 0; rs < ROWS; rs++){ //Firefox seems to not like this loop...

    obstacles[rs] = [];

    for (var cs = 0; cs < COLS; cs++){

        var obs = {};
            obs.x = cs * SIDE;
            obs.y = rs * SIDE;
            obs.img = blankTile; // Setting all initial tiles to blank ones.

        obstacles[rs][cs] = obs;
    }
}

//Pickaxe setting and movement variables
var pickaxe = new Image();
    pickaxe.src = "Pickaxe.png";

var leftPos = SIZE/2;
var topPos = SIZE/2;

var tool = document.getElementById("Pickaxe");
    tool.width = SIDE;
    tool.height = SIDE;
    tool.style.left = (ug.offsetLeft + leftPos)+"px";
    tool.style.top = (ug.offsetTop + topPos)+"px";
    tool.img = pickaxe;
var digging = tool.getContext("2d");

var rotation = 90;

//Engine
var updateControl = setInterval(Update, 16.67); // 60 fps

//Timer
var initTime = new Date();
var beginning = initTime.getTime();
var timer = document.getElementById("Timer");

var timerControl = setInterval (TimerUpdate, 1000);

function Update(){

    ScrollUnderground();
    ScrollObstacles();
    PositionPickaxe();
    RotatePickaxe();
    Render();
    CheckCollision();
}

function ScrollUnderground(){

    for (var r = 0; r < ROWS; r++){

        for (var c = 0; c < COLS; c++){

            background[r][c].x -=4;
        }
    }

    if (background[0][0].x <= -SIDE){

        for (var rr = 0; rr < ROWS; rr++){

            background[rr].shift();

            var newTempContainer = {};
                newTempContainer.x = SIZE;
                newTempContainer.y = rr * SIDE;
                newTempContainer.img = ground;

            background[rr].push(newTempContainer);
        }
    }
}

var initRand = Math.floor(Math.random()*10); // determining where Safe tile (index) will be started
var initOdds = 8; /* this was set up thinking of program upgrades in the future. I intend to substitute 7 with a
                      function that'll increase the odds of obstacles appearing the more time the user spends in the
                      game. For now, and given the size of the boulders, I decided to leave a rather low obstacle
                      spawning rate*/

function ScrollObstacles(){

    for (var rrs = 0; rrs < ROWS; rrs++){

        for (var cls = 0; cls < COLS; cls++){

            obstacles[rrs][cls].x -= 4;
        }
    }

    if (obstacles[0][0].x <= -SIDE){

        for (var delRow = 0; delRow < ROWS; delRow++){

            //Setup of random obstacle generation
            var randomness = (Math.floor(Math.random()*10));
            //console.log(randomness); // THIS WAS JUST A CHECK

            obstacles[delRow].shift();

            var newObs = {};
                newObs.x = SIZE;
                newObs.y = delRow * SIDE;

            if (delRow == initRand)
                newObs.img = safeTile;
            else if (randomness > initOdds)
                newObs.img = rocks;
            else
                newObs.img = blankTile;

            obstacles[delRow].push(newObs);
        }
        initRand = SafeShift(initRand);
    }
}

function SafeShift(startingRow){ /* the idea is that this will change the index on the go, by shifting it every time
                                    the tile placement runs. It has a 20% chance of staying in place, 40% chance of
                                    shifting down and 40% chance of shifting up. If it is already in one of the borders,
                                    it is set to not move outside the boundaries of the array. It'll have a 60% chance
                                    of staying in that row if it's already on one of the edges.*/

    var chances = Math.floor(Math.random()*10);

    if (chances < 4 && startingRow > 0){
        startingRow--;
        return startingRow;
    }else if (chances < 4 && startingRow == 0){
        return startingRow;
    }else if (chances > 5 && startingRow < 9){
        startingRow++;
        return startingRow;
    }else if (chances > 5 && startingRow == 9){
        return startingRow;
    }else{
        return startingRow;
    }
}

function PositionPickaxe() {

    var displacement = 8; //Created this one to be able to change update speed at once for the pickaxe

    if (pressedL == true) {
        if (leftPos <= 12) { /* added empty if in if-else statements to check boundaries.
                                Could've done differently (I know), but it made sense at the time,
                                and I felt unnecessary to change it*/
        }
        else {
            leftPos -= displacement;
        }
    }
    if (pressedU == true) {
        if (topPos <= 12) {
        }
        else {
            topPos -= displacement;
        }
    }
    if (pressedR == true) {
        if (leftPos >= (SIZE - (SIDE + 12))){
        }
        else {
            leftPos += displacement;
        }
    }
    if (pressedD == true) {
        if (topPos >= (SIZE - (SIDE + 12))){
        }

        else {
            topPos += displacement;
        }
    }

    tool.style.left = (ug.offsetLeft + leftPos)+"px";
    tool.style.top = (ug.offsetTop + topPos)+"px";
}

function RotatePickaxe() {

    rotation += 15;
    tool.style.transform = "rotate("+rotation+"deg)";
}

function Render() {

    rockLayers.clearRect(0, 0, SIZE, SIZE);
    incoming.clearRect(0, 0, SIZE, SIZE);
    digging.clearRect(0, 0, SIDE, SIDE);

    for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
            rockLayers.drawImage(background[r][c].img, background[r][c].x, background[r][c].y);
            incoming.drawImage(obstacles[r][c].img, obstacles[r][c].x, obstacles[r][c].y);
        }
    }

    digging.drawImage(tool.img, 0, 0);
}

function TimerUpdate(){
    var time = new Date();
    var elapsedTime = time.getTime();

    timer.innerHTML = parseInt((elapsedTime - beginning)/1000);
}

function CheckCollision(){ // REQUIRES REFINING

    var collisionOffset = 12; // Created this variable to be more forgiving of the players

    for (var rows = 0; rows < ROWS; rows++){

        for (var cols = 0; cols < COLS; cols++){

            if (obstacles[rows][cols].img == rocks){

                if (   ((obstacles[rows][cols].x + ug.offsetLeft + collisionOffset) > (tool.offsetLeft + SIDE - collisionOffset) == false)
                    && ((obstacles[rows][cols].x + ug.offsetLeft + SIDE - collisionOffset) < (tool.offsetLeft + collisionOffset) == false)
                    && ((obstacles[rows][cols].y + ug.offsetTop + collisionOffset) > (tool.offsetTop + SIDE - collisionOffset) == false)
                    && ((obstacles[rows][cols].y + ug.offsetTop + SIDE - collisionOffset) < (tool.offsetTop + collisionOffset) == false)){

                    clearInterval(updateControl);
                    clearInterval(timerControl);
                    console.log(  "Boulder left: " + obstacles[rows][cols].x + " Pickaxe right: " + (tool.offsetLeft + SIDE) +
                                "\nBoulder right: " + (obstacles[rows][cols].x + SIDE) + " Pickaxe left: " + tool.offsetLeft +
                                "\nBoulder top: " + obstacles[rows][cols].y + " Pickaxe bottom: " + (tool.offsetTop + SIDE)+
                                "\nBoulder bottom: " + (obstacles[rows][cols].y + SIDE) + " Pickaxe top: " + tool.offsetTop);
                    window.alert("You've hit an impassable rock.");
                }
            }
        }
    }
}

/*
function CheckPause(){ // PAUSE FUNCTION FOR LATER IMPLEMENTATION
    if (isPaused){

    }else{
    clearInterval(timerControl);
    clearInterval(updateControl);
    }
}
 */