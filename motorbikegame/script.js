// script.js

// =======================
// Canvas Setup
// =======================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

// =======================
// Game Variables
// =======================
let lives = 3;
let level = getTodayLevel();
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;

document.getElementById('lives').innerText = `Lives: ${lives}`;
document.getElementById('level').innerText = `Level: ${level}`;
document.getElementById('score').innerText = `Score: ${score}`;
document.getElementById('highScore').innerText = `High Score: ${highScore}`;

let obstacles = [];
let obstacleFrequency = 1500; // milliseconds
let lastObstacleTime = Date.now();

// =======================
// Motorbike Variables
// =======================
const bike = {
    x: 50,
    y: CANVAS_HEIGHT - 100, // Starting y position based on ground level
    width: 100,              // Width of the motorbike
    height: 60,              // Height of the motorbike
    dy: 0,                   // Vertical velocity
    gravity: 0.6,            // Gravity affecting the motorbike
    jumpForce: -15,          // Initial jump velocity
    onGround: true,          // Flag to check if motorbike is on the ground
    image: new Image(),      // Image object for the motorbike
};

// =======================
// Load Motorbike Image (Embedded SVG)
// =======================
bike.image.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjYwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxyZWN0IHg9IjEwIiB5PSIzMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjIwIiBmaWxsPSJibHVlIiAvPgogIDxjaXJjbGUgY3g9IjI1IiBjeT0iNTAiIHI9IjEwIiBmaWxsPSJibGFjayIgLz4KICA8Y2lyY2xlIGN4PSI3NSIgY3k9IjUwIiByPSIxMCIgZmlsbD0iYmxhY2siIC8+CiAgPHJlY3QgeD0iNTAiIHk9IjIwIiB3aWR0aD0iMzAiIGhlaWdodD0iMTUiIGZpbGw9ImJsdWUiIC8+Cjwvc3ZnPg==";

// =======================
// Obstacle Images
// =======================
const obstacleImages = {
    rock: new Image(),
    barrier: new Image()
};

// =======================
// Load Obstacle Images (Embedded SVGs)
// =======================

// Rock Obstacle SVG (Gray Ellipses)
obstacleImages.rock.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGVsbGlwc2UgY3g9IjI1IiBjeT0iMjUiIHJ4PSIyMCIgcnk9IjE1IiBmaWxsPSJncmF5IiAvPgogIDxlbGxpcHNlIGN4PSIyNSIgY3k9IjI1IiByeD0iMTAiIHJ5PSI1IiBmaWxsPSJkYXJrZ3JheSIgLz4KPC9zdmc+";

// Barrier Obstacle SVG (Red Rectangle with Diagonal Lines)
obstacleImages.barrier.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9InJlZCIgLz4KICA8bGluZSB4MT0iMTAiIHkxPSIxMCIgeDI9IjQwIiB5Mj0iNDAiIHN0cm9rZT0iZGFya3JlZCIgc3Ryb2tlLXdpZHRoPSIyIiAvPgogIDxsaW5lIHgxPSI0MCIgeTE9IjEwIiB4Mj0iMTAiIHkyPSI0MCIgc3Ryb2tlPSJkYXJrcmVkIiBzdHJva2Utd2lkdGg9IjIiIC8+Cjwvc3ZnPg==";

// =======================
// Ground Image
// =======================
const groundImage = new Image();
groundImage.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjMwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iMzAiIGZpbGw9IiM2NTQzMjEiIC8+Cjwvc3ZnPg==";

// =======================
// Background Image for Scrolling (Embedded SVG)
// =======================
const backgroundImage = new Image();
backgroundImage.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzg3Y2VlZWIiIC8+Cjwvc3ZnPg==";

// =======================
// Load Sounds
// =======================

// Replace the following paths with the actual paths to your audio files
// Ensure that the audio files are placed in the 'assets/audio/' directory
// Uncomment the lines below once you have the audio files ready

// const jumpSound = new Audio('assets/audio/jump.wav');           // Sound played on jump
// const collisionSound = new Audio('assets/audio/collision.wav'); // Sound played on collision
// const backgroundMusic = new Audio('assets/audio/background.mp3'); // Background music

// // Set background music properties
// backgroundMusic.loop = true;
// backgroundMusic.volume = 0.5;

// =======================
// Key Press Handling
// =======================
let keys = {};

document.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if ((e.code === 'Space' || e.code === 'ArrowUp') && bike.onGround) {
        bike.dy = bike.jumpForce;
        bike.onGround = false;
        // Uncomment the line below to play jump sound when available
        // jumpSound.play();
    }
});

document.addEventListener('keyup', function(e) {
    keys[e.code] = false;
});

// =======================
// Touch Controls for Mobile
// =======================
canvas.addEventListener('touchstart', function(e) {
    e.preventDefault(); // Prevent scrolling
    if (bike.onGround) {
        bike.dy = bike.jumpForce;
        bike.onGround = false;
        // Uncomment the line below to play jump sound when available
        // jumpSound.play();
    }
}, { passive: false });

// =======================
// Obstacle Class
// =======================
class Obstacle {
    constructor(x, type, speed) {
        this.x = x;
        this.type = type; // 'rock' or 'barrier'
        this.speed = speed;
        this.image = obstacleImages[type];
        this.width = 50;  // Width based on SVG dimensions
        this.height = 50; // Height based on SVG dimensions
        this.y = CANVAS_HEIGHT - 30 - this.height; // Position above the ground
    }

    update() {
        this.x -= this.speed;
    }

    draw() {
        if (this.image.complete) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }
}

// =======================
// Particle Class for Dust Effects
// =======================
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * -2 - 1;
        this.alpha = 1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= 0.02;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = '#654321'; // Dust color
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

let particles = [];

// =======================
// Obstacle Generation
// =======================
function generateObstacle() {
    const seed = level + obstacles.length;
    const rand = seededRandom(seed);
    const type = rand > 0.5 ? 'rock' : 'barrier';
    const speed = 5 + rand * 3; // Speed between 5 and 8

    const obstacle = new Obstacle(CANVAS_WIDTH, type, speed);
    obstacles.push(obstacle);
}

// =======================
// Game Over Handling
// =======================
function showGameOverScreen() {
    finalScore.innerText = score;
    gameOverScreen.style.display = 'flex';
}

// =======================
// Reset Game Function
// =======================
function resetGame() {
    lives = 3;
    score = 0;
    obstacles = [];
    particles = [];
    document.getElementById('lives').innerText = `Lives: ${lives}`;
    document.getElementById('score').innerText = `Score: ${score}`;
    document.getElementById('highScore').innerText = `High Score: ${highScore}`;
    gameOver = false;
    // Uncomment the line below to restart background music when available
    // backgroundMusic.currentTime = 0;
    // backgroundMusic.play();
    gameLoop();
}

// =======================
// Update Game State
// =======================
function update() {
    if (gameOver) return;

    // Update motorbike physics
    bike.dy += bike.gravity;
    bike.y += bike.dy;

    if (bike.y >= CANVAS_HEIGHT - 100) { // Ground level
        if (!bike.onGround) {
            // Emit particles on landing
            for (let i = 0; i < 10; i++) {
                particles.push(new Particle(bike.x + bike.width / 2, CANVAS_HEIGHT - 30));
            }
        }
        bike.y = CANVAS_HEIGHT - 100;
        bike.dy = 0;
        bike.onGround = true;
    }

    // Generate obstacles based on frequency and seed
    const currentTime = Date.now();
    if (currentTime - lastObstacleTime > obstacleFrequency) {
        generateObstacle();
        lastObstacleTime = currentTime;
    }

    // Update obstacles
    obstacles.forEach((obstacle, index) => {
        obstacle.update();

        // Remove off-screen obstacles and update score
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
            score += 10; // Increment score for avoiding obstacle
            document.getElementById('score').innerText = `Score: ${score}`;

            // Update high score if necessary
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('highScore', highScore);
                document.getElementById('highScore').innerText = `High Score: ${highScore}`;
            }
        }

        // Check collision with motorbike
        if (isColliding(bike, obstacle)) {
            obstacles.splice(index, 1);
            lives--;
            document.getElementById('lives').innerText = `Lives: ${lives}`;
            // Uncomment the line below to play collision sound when available
            // collisionSound.play();
            if (lives <= 0) {
                gameOver = true;
                // Uncomment the lines below to pause background music when available
                // backgroundMusic.pause();
                setTimeout(() => showGameOverScreen(), 100);
            }
        }
    });

    // Update particles
    particles.forEach((particle, index) => {
        particle.update();
        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        }
    });

    // Update background position for scrolling effect
    backgroundX -= 2; // backgroundSpeed
    if (backgroundX <= -CANVAS_WIDTH) {
        backgroundX = 0;
    }
}

// =======================
// Collision Detection
// =======================
function isColliding(bike, obstacle) {
    return (
        bike.x < obstacle.x + obstacle.width &&
        bike.x + bike.width > obstacle.x &&
        bike.y < obstacle.y + obstacle.height &&
        bike.y + bike.height > obstacle.y
    );
}

// =======================
// Draw Game Objects
// =======================
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw scrolling background
    if (backgroundImage.complete) {
        ctx.drawImage(backgroundImage, backgroundX, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.drawImage(backgroundImage, backgroundX + CANVAS_WIDTH, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // Draw ground
    if (groundImage.complete) {
        ctx.drawImage(groundImage, 0, CANVAS_HEIGHT - 30, CANVAS_WIDTH, 30);
    }

    // Draw motorbike
    if (bike.image.complete) {
        ctx.drawImage(bike.image, bike.x, bike.y, bike.width, bike.height);
    }

    // Draw obstacles
    obstacles.forEach(obstacle => obstacle.draw());

    // Draw particles
    particles.forEach(particle => particle.draw());
}

// =======================
// Game Loop
// =======================
function gameLoop() {
    update();
    draw();
    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// =======================
// Start and Game Over Screens Handling
// =======================
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const gameOverScreen = document.getElementById('gameOverScreen');
const restartButton = document.getElementById('restartButton');
const finalScore = document.getElementById('finalScore');

// Start game on button click
startButton.addEventListener('click', () => {
    startScreen.style.display = 'none';
    resetGame();
});

// Restart game on button click
restartButton.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    resetGame();
});

// =======================
// Initialize and Start Game
// =======================
window.onload = function() {
    // Uncomment the line below to play background music when available
    // backgroundMusic.play();
    gameLoop();
};

// =======================
// Utility Functions
// =======================

// Determine today's level based on date
function getTodayLevel() {
    const today = new Date();
    // Create a seed based on the current date
    const seed = today.getFullYear() + today.getMonth() + today.getDate();
    // Initialize a random number generator with the seed
    return seed;
}

// Simple seeded random function
function seededRandom(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}