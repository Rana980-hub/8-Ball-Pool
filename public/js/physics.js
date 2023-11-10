// ===== PHYSICS ENGINE =====

const FRICTION = 0.985;
const MIN_SPEED = 0.08;
const BALL_RADIUS = 13;
const RESTITUTION = 0.92;

class Ball {
    constructor(x, y, number, color, isStripe = false) {
        this.x = x; this.y = y;
        this.vx = 0; this.vy = 0;
        this.number = number;
        this.color = color;
        this.isStripe = isStripe;
        this.radius = BALL_RADIUS;
        this.pocketed = false;
        this.spinning = false;
        this.angle = 0;
        this.shadowAlpha = 0.4;
    }

    update() {
        if (this.pocketed) return;
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= FRICTION;
        this.vy *= FRICTION;
        this.angle += Math.sqrt(this.vx * this.vx + this.vy * this.vy) * 0.1;
        if (Math.abs(this.vx) < MIN_SPEED) this.vx = 0;
        if (Math.abs(this.vy) < MIN_SPEED) this.vy = 0;
    }

    isMoving() {
        return Math.abs(this.vx) > MIN_SPEED || Math.abs(this.vy) > MIN_SPEED;
    }

    draw(ctx) {
        if (this.pocketed) return;
        const r = this.radius;

        // Shadow
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(this.x + 3, this.y + 4, r * 0.9, r * 0.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,0,0,${this.shadowAlpha})`;
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.translate(this.x, this.y);

        // Base circle
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);

        if (this.isStripe) {
            // White base
            ctx.fillStyle = '#f5f5f5';
            ctx.fill();
            // Stripe band
            ctx.save();
            ctx.clip();
            ctx.fillStyle = this.color;
            ctx.fillRect(-r, -r * 0.45, r * 2, r * 0.9);
            ctx.restore();
        } else {
            // Solid ball gradient
            const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.05, 0, 0, r);
            grad.addColorStop(0, lightenColor(this.color, 60));
            grad.addColorStop(0.5, this.color);
            grad.addColorStop(1, darkenColor(this.color, 50));
            ctx.fillStyle = grad;
            ctx.fill();
        }

        // Number circle (white)
        if (this.number !== 0) {
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.92)';
            ctx.fill();
            // Number text
            ctx.fillStyle = '#111';
            ctx.font = `bold ${r * 0.55}px Orbitron, Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.number, 0, 0.5);
        }

        // Shine highlight
        ctx.beginPath();
        ctx.arc(-r * 0.28, -r * 0.32, r * 0.28, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fill();

        // Outer ring
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
    }
}

class CueBall extends Ball {
    constructor(x, y) {
        super(x, y, 0, '#f5f5f5', false);
    }

    draw(ctx) {
        if (this.pocketed) return;
        const r = this.radius;

        // Shadow
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(this.x + 3, this.y + 4, r * 0.9, r * 0.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.translate(this.x, this.y);

        const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.05, 0, 0, r);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.6, '#e8e8e8');
        grad.addColorStop(1, '#c0c0c0');

        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Shine
        ctx.beginPath();
        ctx.arc(-r * 0.28, -r * 0.32, r * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
    }
}

function lightenColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + amount);
    const g = Math.min(255, ((num >> 8) & 0xff) + amount);
    const b = Math.min(255, (num & 0xff) + amount);
    return `rgb(${r},${g},${b})`;
}

function darkenColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - amount);
    const g = Math.max(0, ((num >> 8) & 0xff) - amount);
    const b = Math.max(0, (num & 0xff) - amount);
    return `rgb(${r},${g},${b})`;
}

function resolveCollision(b1, b2) {
    const dx = b2.x - b1.x;
    const dy = b2.y - b1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = b1.radius + b2.radius;

    if (dist >= minDist || dist === 0) return false;

    // Separate overlapping balls
    const overlap = (minDist - dist) / 2;
    const nx = dx / dist;
    const ny = dy / dist;

    b1.x -= nx * overlap;
    b1.y -= ny * overlap;
    b2.x += nx * overlap;
    b2.y += ny * overlap;

    // Relative velocity
    const dvx = b1.vx - b2.vx;
    const dvy = b1.vy - b2.vy;
    const dot = dvx * nx + dvy * ny;

    if (dot > 0) return false;

    const impulse = dot * RESTITUTION;
    b1.vx -= impulse * nx;
    b1.vy -= impulse * ny;
    b2.vx += impulse * nx;
    b2.vy += impulse * ny;

    return true;
}

function wallBounce(ball, minX, maxX, minY, maxY) {
    const r = ball.radius;
    let bounced = false;

    if (ball.x - r < minX) {
        ball.x = minX + r;
        ball.vx = Math.abs(ball.vx) * RESTITUTION;
        bounced = true;
    } else if (ball.x + r > maxX) {
        ball.x = maxX - r;
        ball.vx = -Math.abs(ball.vx) * RESTITUTION;
        bounced = true;
    }

    if (ball.y - r < minY) {
        ball.y = minY + r;
        ball.vy = Math.abs(ball.vy) * RESTITUTION;
        bounced = true;
    } else if (ball.y + r > maxY) {
        ball.y = maxY - r;
        ball.vy = -Math.abs(ball.vy) * RESTITUTION;
        bounced = true;
    }

    return bounced;
}

function checkPocket(ball, pockets, pocketRadius) {
    for (const p of pockets) {
        const dx = ball.x - p.x;
        const dy = ball.y - p.y;
        if (Math.sqrt(dx * dx + dy * dy) < pocketRadius) {
            return true;
        }
    }
    return false;
}
