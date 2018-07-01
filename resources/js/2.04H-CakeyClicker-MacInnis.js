//Global variables
var score = 1;
var timeMultiplier = 1.0;
var dogType = "";
var gameStarted = false;

//Monster class containing functions to move, die, kill the player and respawn.
class Monster {
    constructor(id, x, y) {
        //ID allows us to modify the <img> tag
        this.id = id;
        //Current position of our monster
        this.x = x;
        this.y = y;
        //Where the monster will return after dying
        this.startX = x;
        this.startY = y;
        //Is the monster alive?
        this.isAlive = true;
        //Used to keep code D.R.Y instead of repeating getElementById()
        this.instance = document.getElementById(id);
        
        //Initial set of position
        this.instance.style.left = x + "px";
        this.instance.style.top = y + "px";
    }

    moveToPlayer(dt, speed) {
        //Position of the entity
        var currentPosX = parseInt(this.x);
        var currentPosY = parseInt(this.y);

        //The player's position is set to top left of the image, this moves it to the center.
        var goalPosX = parseInt(document.getElementById("pugID").style.left) + 40;
        var goalPosY = parseInt(document.getElementById("pugID").style.top) + 25;
        
        //Delta variables used to calculate direction between two points.
        var dx = goalPosX - currentPosX;
        var dy = goalPosY - currentPosY;

        //Calculate the distance between the monster and the player
        var distance = Math.sqrt(dx ^ 2 + dy ^ 2)
        if (distance < 1)
            document.getElementById("deathModalID").style.visibility = "visible";

        //Calculate the direction to the player
        var directionX = Math.cos(Math.atan2(dy, dx));
        var directionY = Math.sin(Math.atan2(dy, dx));

        //The speed our entity moves
        var velocity =      speed
                            * dt
                            / 1000;

        //Move the entity toward the player by a velocity
        this.x +=       velocity 
                        * timeMultiplier
                        * directionX;
        
        this.y +=       velocity 
                        * timeMultiplier
                        * directionY;
    }

    //Using our x,y values set our position.
    updatePosition() {
        this.instance.style.left = parseInt(this.x) + "px";
        this.instance.style.top = parseInt(this.y) + "px";
    }

    respawnMonster(monster) {
        //Setting this to blank allows the animation to be played again later.
        monster.instance.style.animationName = "";

        //Hides the monster
        monster.instance.style.visibility = "hidden";

        monster.isAlive = false;

        //Set the position of the monster to its respawn point.
        monster.x = monster.startX;
        monster.y = monster.startY;

        //Re-initialize the monster
        setTimeout(function() {
            monster.isAlive = true;
            monster.instance.style.visibility = "visible";
        }, 1000);
    }

    killMonster() {
        var monster = this;

        //Make the monster vibrate on death
        monster.instance.style.animationName = "hurtAnimation";
        monster.instance.style.animationDuration = 0.65 + "s";

        //After 0.65 seconds respawn the monster.
        setTimeout(function() {
            monster.respawnMonster(monster);
        }, 650);
    }
};

//Create the instances of our monsters using image tags created in our HTML code.
var monster = new Monster("monsterID", 225, 0);
var skeleton = new Monster("monsterID1", 200, 400);
var monster1 = new Monster("monsterID2", 0, 225);
var skeleton1 = new Monster("monsterID3", 400, 225);

//Put all of the monsters in an array so we can iterate through them.
var monsters = [
    monster,
    monster1,
    skeleton,
    skeleton1
];

//Sanitize user inputs for inputting type of dog.
var dogTypeIsValid = function(dogType) {
    switch (dogType.toLowerCase()) {
        case "shiba":
            return true;
        case "pug":
            return true;
        case "labrador":
            return true;
        default:
            return false;
    }
    return false;
}

//Allows the score to increase, and monsters to move.
var loadGame = function() {
    if (dogTypeIsValid(dogType)) {
        gameStarted = true;
        document.getElementById("gameWindowID").style.visibility = "visible";
        document.getElementById("startModalID").style.visibility = "hidden";

        //Load the correct image for our player's sprite
        document.getElementById("pugID").src = "resources/images/" + dogType + ".gif";
    }

    //ERROR: Dog chosen was not an option.
    else {
        var dogInput = document.getElementById("dogLabelID");
        dogInput.placeholder = "Not a dog!";
        dogInput.value = "";
    }
}

//Allows the player to select the image of our dog via text-input.
document.getElementById("dogLabelID").onchange = function() {
    dogType = document.getElementById("dogLabelID").value.toLowerCase();
}

//Start the game
document.getElementById("startButtonID").onclick = loadGame;

//Given an ID, return the monster
function getMonsterByID(id) {
    for (monster in monsters) {
        var monsterID = monsters[monster].id;
        if (monsterID == id)
            return monsters[monster];
    }

    return null;
}

//Sets the position of the dog.
document.getElementById("pugID").style.left = 200 + "px";
document.getElementById("pugID").style.top = 150 + "px";

function update(dt) {
    //Variable that accelerates with time.
    timeMultiplier += dt / 10000;

    for (monster in monsters) {
        //Moves the sprite of the monster based on its x,y coordinates.
        monsters[monster].updatePosition();
/* 
 *   NOTE: Zombies were specifically left out of the game to avoid an edge case below.
 *   The following code serves two purpose: don't chase and kill the player once you're dead.
 *   And instead of trying to move toward the player, allow your position to be changed.
 */
        if (monsters[monster].isAlive)
            monsters[monster].moveToPlayer(dt, 10);
    }

    //Makes the score increase. Accelerates faster as time goes by.
    score = score + (0.1 * timeMultiplier);

    //Update the display of the score.
    document.getElementById("scoreID").innerHTML = "Score: " + parseInt(score) + " pts";
}

//Black magic below. Try setting timestamp to 0. I dare you.
function loop(timestamp) {
    var deltaTime = timestamp - lastRender;

    //Don't move the monsters before the game starts
    if (gameStarted)
        //Main game loop 
        update(deltaTime);

    lastRender = timestamp
    window.requestAnimationFrame(loop)
}
var lastRender = 0

//Recursive and asynchronous game loop that makes our game framerate independent.
window.requestAnimationFrame(loop)

//For each of the monsters, kill them when they are clicked.
document.getElementById("monsterID").onclick = function() {
    getMonsterByID("monsterID").killMonster();
}

document.getElementById("monsterID1").onclick = function() {
    getMonsterByID("monsterID1").killMonster();
}

document.getElementById("monsterID2").onclick = function() {
    getMonsterByID("monsterID2").killMonster();
}

document.getElementById("monsterID3").onclick = function() {
    getMonsterByID("monsterID3").killMonster();
}

//Sets the background colour using javascript
document.getElementById("bodyID").style.backgroundColor = "blanchedalmond";
//Sets the game over screen text to be italic using javascript.
document.getElementById("gameOverID").style.fontStyle = "italic";