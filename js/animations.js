// Particle System for Background
class ParticleSystem {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.init();
    }

    init() {
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '0';
        document.body.prepend(this.canvas);

        this.resize();
        window.addEventListener('resize', () => this.resize());

        for (let i = 0; i < 50; i++) {
            this.particles.push(this.createParticle());
        }

        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5 + 0.2
        };
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            if (particle.x < 0 || particle.x > this.canvas.width) particle.speedX *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.speedY *= -1;

            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(99, 102, 241, ${particle.opacity})`;
            this.ctx.fill();
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Ripple Effect
function createRipple(e, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple-effect');

    element.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
}

// Confetti Animation
function createConfetti() {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 5000);
    }
}

// Typing Animation
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Shake Animation
function shake(element) {
    element.style.animation = 'shake 0.5s';
    setTimeout(() => {
        element.style.animation = '';
    }, 500);
}

// Glow Effect
function addGlow(element, color = '99, 102, 241') {
    element.style.boxShadow = `0 0 20px rgba(${color}, 0.6), 0 0 40px rgba(${color}, 0.4)`;
    setTimeout(() => {
        element.style.boxShadow = '';
    }, 1000);
}

// Number Counter Animation
function animateNumber(element, start, end, duration = 1000) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current);
    }, 16);
}

// Floating Animation
function floatElement(element) {
    let position = 0;
    let direction = 1;

    setInterval(() => {
        position += 0.5 * direction;
        if (position > 10 || position < -10) direction *= -1;
        element.style.transform = `translateY(${position}px)`;
    }, 50);
}

// Pulse Animation
function pulse(element) {
    element.style.animation = 'pulse 0.5s';
    setTimeout(() => {
        element.style.animation = '';
    }, 500);
}

// Slide In Animation
function slideIn(element, direction = 'left') {
    const animations = {
        left: 'slideInLeft',
        right: 'slideInRight',
        top: 'slideInTop',
        bottom: 'slideInBottom'
    };
    
    element.style.animation = `${animations[direction]} 0.5s ease-out`;
}

// Fade In Animation
function fadeIn(element, duration = 500) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    let opacity = 0;
    const increment = 50 / duration;
    
    const timer = setInterval(() => {
        opacity += increment;
        if (opacity >= 1) {
            opacity = 1;
            clearInterval(timer);
        }
        element.style.opacity = opacity;
    }, 50);
}

// Bounce Animation
function bounce(element) {
    element.style.animation = 'bounce 0.6s';
    setTimeout(() => {
        element.style.animation = '';
    }, 600);
}

// Rotate Animation
function rotate(element, degrees = 360, duration = 500) {
    element.style.transition = `transform ${duration}ms ease`;
    element.style.transform = `rotate(${degrees}deg)`;
    
    setTimeout(() => {
        element.style.transform = '';
    }, duration);
}

// Scale Animation
function scale(element, scaleTo = 1.2, duration = 300) {
    element.style.transition = `transform ${duration}ms ease`;
    element.style.transform = `scale(${scaleTo})`;
    
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, duration);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
        20%, 40%, 60%, 80% { transform: translateX(10px); }
    }

    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
    }

    @keyframes slideInLeft {
        from { transform: translateX(-100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }

    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }

    @keyframes slideInTop {
        from { transform: translateY(-100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }

    @keyframes slideInBottom {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }

    .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    }

    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }

    .confetti {
        position: fixed;
        width: 10px;
        height: 10px;
        top: -10px;
        z-index: 9999;
        animation: confettiFall linear forwards;
    }

    @keyframes confettiFall {
        to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize Particle System
const particleSystem = new ParticleSystem();

// Export functions
window.animations = {
    createRipple,
    createConfetti,
    typeWriter,
    shake,
    addGlow,
    animateNumber,
    floatElement,
    pulse,
    slideIn,
    fadeIn,
    bounce,
    rotate,
    scale
};
