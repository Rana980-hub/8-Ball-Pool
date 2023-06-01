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

        // --- SHADOW ---
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(this.x + 3, this.y + 4, r * 0.9, r * 0.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,0,0,${this.shadowAlpha})`;
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.translate(this.x, this.y);

        // --- BASE SPHERE GRADIENT ---
        const sphereGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
        
        if (this.isStripe) {
            // Stripe Base (White with slight grey)
            sphereGrad.addColorStop(0, '#ffffff');
            sphereGrad.addColorStop(0.7, '#f0f0f0');
            sphereGrad.addColorStop(1, '#d0d0d0');
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fillStyle = sphereGrad;
            ctx.fill();

            // The Stripe Band
            ctx.save();
            ctx.clip(); // Clip to the circle
            const stripeGrad = ctx.createLinearGradient(0, -r, 0, r);
            stripeGrad.addColorStop(0, darkenColor(this.color, 40));
            stripeGrad.addColorStop(0.5, this.color);
            stripeGrad.addColorStop(1, darkenColor(this.color, 40));
            ctx.fillStyle = stripeGrad;
            ctx.fillRect(-r, -r * 0.45, r * 2, r * 0.9);
            ctx.restore();
        } else {
            // Solid Ball
            sphereGrad.addColorStop(0, lightenColor(this.color, 80));
            sphereGrad.addColorStop(0.3, this.color);
            sphereGrad.addColorStop(1, darkenColor(this.color, 60));
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fillStyle = sphereGrad;
            ctx.fill();
        }

        // --- NUMBER PLATE ---
        if (this.number !== 0) {
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.95)';
            ctx.fill();
            
            // Subtle inset shadow on number plate
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Number text
            ctx.fillStyle = '#111';
            ctx.font = `bold ${r * 0.55}px Orbitron, Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.number, 0, 0.5);
        }

        // --- GLOSS HIGHLIGHTS ---
        // Main Shine
        const gloss = ctx.createRadialGradient(-r * 0.35, -r * 0.35, 0, -r * 0.35, -r * 0.35, r * 0.4);
        gloss.addColorStop(0, 'rgba(255,255,255,0.7)');
        gloss.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.beginPath();
        ctx.arc(-r * 0.35, -r * 0.35, r * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = gloss;
        ctx.fill();

        // Rim Light
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
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

export { Ball, CueBall, resolveCollision, wallBounce, checkPocket, BALL_RADIUS };

