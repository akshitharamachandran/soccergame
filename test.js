// Create the canvas
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// Initialization
var init = function () {
	// Starting position of player and ball
	player.x = canvas.width / 2 - 125;
	player.y = canvas.height / 2 - 15;
	ball.x = canvas.width / 2 - 15; 
	ball.y = canvas.height / 2 - 15;
	window.requestAnimationFrame(draw);
}

// Array that holds keypresses
var keysDown = {};

// Load background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "img/test/background.png";

// Load player image
var playerReady = false;
var playerImage = new Image();
playerImage.onload = function () {
	playerReady = true;	
};
playerImage.src = "img/test/player.png";

// Load ball image
var ballReady = false;
var ballImage = new Image();
ballImage.onload = function () {
	ballReady = true;
};
ballImage.src = "img/test/soccerball.png";

// User variables
var player = {
	speed: 3, // movement in pixels per second
	velocity: [0, 0], 
	x: 0,
	y: 0
};

// Ball variables
var ball = {
	speed: 0, // movement in pixels per second
	x: 0,
	y: 0
}

$(canvas).mouseenter(function() {
	// Handle keyboard controls
	$(document).on("keydown", function (e) {
		e.preventDefault();
		keysDown[e.keyCode] = true;
	});

	$(document).on("keyup", function (e) {
		delete keysDown[e.keyCode];
	});
});

$(canvas).mouseleave(function() {
	$(document).off("keydown");
	$(document).off("keyup");
});

// Move the player
var update = function () {
	player.velocity = [0,0];
	if (38 in keysDown) { // up
		//player.y -= player.speed;
		player.velocity[1] = -player.speed; 
	}
	if (40 in keysDown) { // down
		//player.y += player.speed;
		player.velocity[1] = player.speed;
	}
	if (37 in keysDown) { // left
		//player.x -= player.speed;
		player.velocity[0] = -player.speed;
	}
	if (39 in keysDown) { // right
		//player.x += player.speed;
		player.velocity[0] = player.speed;
	}
	player.x += player.velocity[0];
	player.y += player.velocity[1];

	
	ball.speed /= 1.0175; // slows the ball down every frame
	// detect if ball and player are touching
	if (
		player.x <= (ball.x + 32)
		&& ball.x <= (player.x + 32)
		&& player.y <= (ball.y + 32)
		&& ball.y <= (player.y + 32)
	) {
		x_dist = ball.x - player.x;
		y_dist = ball.y - player.y;
		ball.speed = Math.min(.1, .002 * Math.sqrt(Math.pow(ball.x, 2) + Math.pow(ball.y, 2)));
		// move ball out of way of player
		ball.x += x_dist / 50;
		ball.y += y_dist / 50;
	}


	if (ball.speed > 0)
	{
		ball.x += x_dist * ball.speed;
		ball.y += y_dist * ball.speed;
	}

	return false;
};

// Render images
var render = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}

	if (playerReady) {
		ctx.drawImage(playerImage, player.x, player.y);
	}

	if (ballReady) {
		ctx.drawImage(ballImage, ball.x, ball.y);
	}
};

// The main game loop
var draw = function () {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	update();
	render();

	// Request to do this again ASAP
	requestAnimationFrame(draw);
};

init();