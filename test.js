// Create the canvas
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// Start screen
var start = function () {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "rgb(70, 222, 146)";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "48px Helvetica";
	ctx.textAlign = "center";
	ctx.textBaseline = "center";
	ctx.fillText("CLICK TO START", 485, 236);

	// Starts game when clicked
	$(canvas).click(function() {
		init();
	});
}

// Ends the game
var end = function (score) {
	window.cancelAnimationFrame(run);
	if (score >= 5)
	{
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "rgb(70, 222, 146)";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "rgb(250, 250, 250)";
		ctx.font = "48px Helvetica";
		ctx.textAlign = "center";
		ctx.textBaseline = "center";
		ctx.fillText("YOU WIN :)", 485, 236);
	}
	else
	{
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "rgb(70, 222, 146)";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "rgb(250, 250, 250)";
		ctx.font = "48px Helvetica";
		ctx.textAlign = "center";
		ctx.textBaseline = "center";
		ctx.fillText("YOU LOSE :(", 485, 236);
	}
}

// Initialization
var init = function () {
	// Starting position of player, AIs, and ball
	player.x = canvas.width / 2 - 125;
	player.y = canvas.height / 2 - 15;
	ai.x = canvas.width / 2 + 110;
	ai.y = canvas.height / 2 - 15;
	ai2.x = canvas.width / 2 + 180;
	ai2.y = canvas.height / 2 - 15;
	ball.x = canvas.width / 2 - 15; 
	ball.y = canvas.height / 2 - 15;
	x_dist = 0;
	// Set score to 0
	player_score = 0;
	window.requestAnimationFrame(draw);
}

/***********************************************************************/

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

// Load AI image
var aiReady = false;
var aiImage = new Image();
aiImage.onload = function () {
	aiReady = true;	
};
aiImage.src = "img/test/ai.png";

// Load AI2 image
var ai2Ready = false;
var ai2Image = new Image();
ai2Image.onload = function () {
	ai2Ready = true;	
};
ai2Image.src = "img/test/ai.png";

/***********************************************************************/

// Array that holds keypresses
var keysDown = {};

// Global variable to hold score
var player_score = 0;
var ai_score = 0;

// User variables
var player = {
	speed: 3, // movement in pixels per second
	x: 0,
	y: 0
};

// AI variables
var ai = {
	speed: 8,
	angle: 0, 
	weights:[[-1.098435474656182, 0.6589064295051409, -0.7390573375911145, -0.6989480706606246, -1.0322066785193227], 
		[-0.5615227913298615, -0.11591445532422427, -0.15676586775256468, 0.6172299160162027, 0.8983686257605342], 
		[0.5591761812956685, -0.6749809133882746, 0.026847750609672514, -0.8616799960725277, 0.1940568944057437], 
		[-1.1773188370604548, 0.6282954708562554, -0.751484119068484, -0.6732556314057755], 
		[-0.5103879833774485, 0.02035234500389063, -0.2663091274743478, 0.5839138375464418]],
	x: 0,
	y: 0
}

var ai2 = {
	speed: 5,
	angle: 0,
	weights: [[-0.09655688093652559, -0.7615585444413946, 0.5414085758894509, -0.033130135422735796, 0.5598706925580452], 
		[-0.0758237996433353, 0.18875194143348017, -0.7716866592852418, 0.7588086773560305, 0.0706159718901811], 
		[-0.7060055518810278, -0.1358595518075274, 0.6405557293572048, 0.9845050972605527, 0.0880200605408108], 
		[0.9340992208900911, 0.7507981392940073, 0.5844972549773635, 0.1252587105259162], 
		[-0.11555075636981105, 0.6353184869292472, 0.5140870541181128, 0.06414295820266158]],
	x: 0,
	y: 0
}

// Ball variables
var ball = {
	velocity: [0, 0],
	x: 0,
	y: 0
}

/***********************************************************************/

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

/***********************************************************************/

// Displaces the ball
function displace(object, ball) {
	x_dist = ball.x - object.x;
	y_dist = ball.y - object.y;
	dist = Math.sqrt(Math.pow(x_dist, 2) + Math.pow(y_dist, 2));
	displacement = 32 - dist;
	x_displacement = x_dist * displacement / dist;
	y_displacement = y_dist * displacement / dist;

	// Detect if ball and object are touching
	if (dist < 32) {
		// Move ball out of way of object
		ball.x += x_displacement;
		ball.y += y_displacement;
		
		// Update speed of ball
		ball.velocity[0] += x_displacement;
		ball.velocity[1] += y_displacement;
	}
}

function output(total) {
	return 2 / (1 + Math.pow(2.718, (-3 * total))) - 1;
}

function cos(num) {
	return Math.cos(num * Math.PI / 180);
}

function sin(num) {
	return Math.sin(num * Math.PI / 180);
}

function orient(ai, ball, goalX) {
	ball_x = ball.x - ai.x;
	ball_y = ai.y - ball.y + 7.5;
	goal_x = goalX - ai.x;
	goal_y = ai.y - 235;
	d = 90 - ai.angle;
	
	new_ball_x = cos(d) * ball_x - sin(d) * ball_y;
	new_ball_y = sin(d) * ball_x + cos(d) * ball_y;
	new_goal_x = cos(d) * goal_x - sin(d) * goal_y;
	new_goal_y = sin(d) * goal_x + cos(d) * goal_y;

	new_ball_x /= (Math.abs(new_ball_x) + .001);
	new_ball_y /= (Math.abs(new_ball_y) + .001);
	new_goal_x /= (Math.abs(new_goal_x) + .001);
	new_goal_y /= (Math.abs(new_goal_y) + .001);

	return [new_goal_x, new_goal_y, new_ball_x, new_ball_y];
}

function map_weights(input_layer, weights) {
	next_layer = [];
	for (n in weights) {
		node = weights[n];
		total = 0;
		for (input_number = 0; input_number < node.length - 1; input_number++) {
			total += node[input_number] * input_layer[input_number];
		}
		total += node[node.length - 1];
		next_layer.push(output(total));
	}
	return next_layer;
}

function makeMove(ai, ball, goalX) {
	inputs = orient(ai, ball, goalX);
	middle_layer = map_weights(inputs, ai.weights.slice(0, 3));
	output_layer = map_weights(middle_layer, ai.weights.slice(3, 5));
	left_wheel = output_layer[0];
	right_wheel = output_layer[1];
	forward = ai.speed * (left_wheel + right_wheel) / 2;
	turn = (right_wheel - left_wheel) * 15;
	ai.x += cos(ai.angle) * forward;
	ai.y -= sin(ai.angle) * forward;
	ai.angle += turn;
	if (ai.angle > 360){
		ai.angle -= 360;
	}
}

/***********************************************************************/

// Update the game pieces
var update = function () {
	// Detect player input
	if (38 in keysDown) { // up
		player.y -= player.speed; 
	}
	if (40 in keysDown) { // down
		player.y += player.speed;
	}
	if (37 in keysDown) { // left
		player.x -= player.speed;
	}
	if (39 in keysDown) { // right
		player.x += player.speed;
	}

	/*
	if (87 in keysDown) { // up
		ai.y -= ai.speed; 
	}
	if (83 in keysDown) { // down
		ai.y += ai.speed;
	}
	if (65 in keysDown) { // left
		ai.x -= ai.speed;
	}
	if (68 in keysDown) { // right
		ai.x += ai.speed;
	}*/

	// Make the ai move
	makeMove(ai, ball, 0);
	makeMove(ai2, ball, 970);

	// Slows the ball down every frame
	ball.velocity[0] /= 1.0175;
	ball.velocity[1] /= 1.0175;

	// Moves ball
	displace(player, ball);
	displace(ai, ball);
	displace(ai2, ball);

	ball.x += ball.velocity[0];
	ball.y += ball.velocity[1];
	
	// Checks goals
	if (
		ball.x <= 0
		&& ball.y >= 120
		&& ball.y <= 350
	) {
		ball.x = 485;
		ball.y = 235;
		ball.velocity = [0, 0];
		ai_score++; // Update AI Goals

		player.x = canvas.width / 2 - 125;
		player.y = canvas.height / 2 - 15;
		ai.x = canvas.width / 2 + 110;
		ai.y = canvas.height / 2 - 15;
		ai2.x = canvas.width / 2 + 180;
		ai2.y = canvas.height / 2 - 15;
	}

	if (
		ball.x >= 970
		&& ball.y >= 120
		&& ball.y <= 350
	) {
		ball.x = 485;
		ball.y = 235;
		ball.velocity = [0, 0];
		player_score++; // Update Player Goals

		player.x = canvas.width / 2 - 125;
		player.y = canvas.height / 2 - 15;
		ai.x = canvas.width / 2 + 110;
		ai.y = canvas.height / 2 - 15;
		ai2.x = canvas.width / 2 + 180;
		ai2.y = canvas.height / 2 - 15;
	}

	// Checks boundaries
	if (ball.x <= 0) {
		ball.x = 1;
		ball.velocity[0] *= -1;
	}

	if (ball.x >= 970) {
		ball.x = 969;
		ball.velocity[0] *= -1;
	}

	if (ball.y <= 0) {
		ball.y = 1;
		ball.velocity[1] *= -1;
	}

	if (ball.y >= 470) {
		ball.y = 469;
		ball.velocity[1] *= -1;
	}

	return false;
};

// Render game images
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

	if (aiReady) {
		ctx.drawImage(aiImage, ai.x, ai.y);
	}

	if (ai2Ready) {
		ctx.drawImage(ai2Image, ai2.x, ai2.y);
	}

	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Argentina: " + player_score, 32, 32);

	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "right";
	ctx.textBaseline = "top";
	ctx.fillText("Brazil: " + ai_score, 968, 32);
};

/***********************************************************************/

// The main game loop
var draw = function () {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	update();
	render();

	// Checks for winner
	if (player_score == 5 || ai_score == 5)
	{
		end(player_score);
		return;
	}

	// Request to do this again ASAP
	run = requestAnimationFrame(draw);
};

start();