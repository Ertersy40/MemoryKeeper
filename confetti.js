const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
const confettiCount = 100;
const confetti = [];
const colors = ['#FF1461', '#FF69B4', '#FFB6C1', '#FF6347'];

function randomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Heart {
    constructor() {
        this.x = canvas.width / 2;
        this.y = 0;
        this.size = Math.random() * 20 + 10;
        this.color = randomColor();
        const angle = Math.random() * Math.PI * 1.3 + 5.8;
        this.speedX = Math.cos(angle) * (Math.random() * 10 + 5); // Start fast, slow down
        this.speedY = Math.sin(angle) * (Math.random() * 10 + 5); // Start fast, slow down
        this.friction = 0.98; // Slow down over time
        this.gravity = 0.5; // Constant gravity
    }

    update() {
        this.speedX *= this.friction;
        this.speedY *= this.friction;
        this.speedY += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY;
    }

    draw() {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.translate(this.x, this.y);
        this.drawHeart(ctx, 0, 0, this.size); // Draw a heart
        ctx.restore();
    }

    drawHeart(ctx, x, y, size) {
        ctx.beginPath();
        const topCurveHeight = size * 0.3;
        ctx.moveTo(x, y + topCurveHeight);
        // Top left curve
        ctx.bezierCurveTo(
            x, y, 
            x - size / 2, y, 
            x - size / 2, y + topCurveHeight
        );
        // Bottom point
        ctx.bezierCurveTo(
            x - size / 2, y + (size + topCurveHeight) / 2,
            x, y + (size + topCurveHeight) / 2,
            x, y + size
        );
        // Top right curve
        ctx.bezierCurveTo(
            x, y + (size + topCurveHeight) / 2,
            x + size / 2, y + (size + topCurveHeight) / 2,
            x + size / 2, y + topCurveHeight
        );
        // Closing the heart shape
        ctx.bezierCurveTo(
            x + size / 2, y, 
            x, y, 
            x, y + topCurveHeight
        );
        ctx.closePath();
        ctx.fill();
    }
}

function burstHearts() {
    canvas.style.display = "block";
    for (let i = 0; i < confettiCount; i++) {
        confetti.push(new Heart());
    }
    render();
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confetti.forEach((heart) => {
        heart.update();
        heart.draw();
    });
    if (confetti.some(heart => heart.y < canvas.height)) {
        requestAnimationFrame(render);
    } else {
        canvas.style.display = "none";
        confetti.length = 0; // Clear the array for the next burst
    }
}
