const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 900;
canvas.height = 400;


const angleInput = document.getElementById('angle');
const speedInput = document.getElementById('speed');
const gravityInput = document.getElementById('gravity');
const dragInput = document.getElementById('drag');
const fireBtn = document.getElementById('fireBtn');
const clearBtn = document.getElementById('clearBtn');
const statsHeight = document.getElementById('maxHeight');
const statsDist = document.getElementById('maxDist');
const multiModeInput = document.getElementById('multiMode');

let animationId;
let isAnimating = false;
let projectile = { x: 0, y: 0, vx: 0, vy: 0 };
let currentPath = []; 
let previousPaths = []; 
let overallMaxX = 10;   
let overallMaxY = 10;   

const padding = 10; 

function fire() {
    if (isAnimating) cancelAnimationFrame(animationId);

    const keepTrails = multiModeInput.checked;

    if (keepTrails) {
        if (currentPath.length > 0) {
            previousPaths.push([...currentPath]);
        }
    } else {
        previousPaths = [];
        overallMaxX = 10;
        overallMaxY = 10;
    }

    const angleRad = parseFloat(angleInput.value) * (Math.PI / 180);
    const speed = parseFloat(speedInput.value);
    
    if (isNaN(angleRad) || isNaN(speed)) return;

    projectile.x = 0;
    projectile.y = 0;
    projectile.vx = speed * Math.cos(angleRad);
    projectile.vy = speed * Math.sin(angleRad);
    
    currentPath = [{x: 0, y: 0}]; 
    
    statsHeight.textContent = "...";
    statsDist.textContent = "...";

    isAnimating = true;
    animate();
}

function animate() {
    const g = parseFloat(gravityInput.value) || 9.8;
    const dragCoeff = parseFloat(dragInput.value) || 0;
    const timeStep = 0.1;

    const v = Math.sqrt(projectile.vx**2 + projectile.vy**2);
    const ax_drag = -(dragCoeff * v * projectile.vx);
    const ay_drag = -(dragCoeff * v * projectile.vy);

    projectile.vx += ax_drag * timeStep;
    projectile.vy += (-g + ay_drag) * timeStep;

    projectile.x += projectile.vx * timeStep;
    projectile.y += projectile.vy * timeStep; 

    currentPath.push({ x: projectile.x, y: projectile.y });

    if (projectile.x > overallMaxX) overallMaxX = projectile.x;
    if (projectile.y > overallMaxY) overallMaxY = projectile.y;

    ctx.setTransform(1, 0, 0, 1, 0, 0); 
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const reqWidth = overallMaxX + padding;
    const reqHeight = overallMaxY + padding;
    
    const scaleX = canvas.width / reqWidth;
    const scaleY = canvas.height / reqHeight;
    let scale = Math.min(1, Math.min(scaleX, scaleY));
    
    ctx.setTransform(scale, 0, 0, -scale, 0, canvas.height);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(overallMaxX + 1000, 0); 
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 2 / scale; 
    ctx.stroke();

    ctx.lineWidth = 2 / scale;
    previousPaths.forEach(path => {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (let p of path) ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.stroke();
    });

    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let point of currentPath) ctx.lineTo(point.x, point.y);
    ctx.strokeStyle = '#e94560'; 
    ctx.lineWidth = 3 / scale; 
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, 5 / scale, 0, Math.PI * 2); 
    ctx.fillStyle = '#e94560';
    ctx.fill();

    if (projectile.y <= 0 && currentPath.length > 5) { 
        isAnimating = false;
        projectile.y = 0;
        
        let currentMaxHeight = 0;
        for(let p of currentPath) if(p.y > currentMaxHeight) currentMaxHeight = p.y;
        
        statsDist.textContent = projectile.x.toFixed(2);
        statsHeight.textContent = currentMaxHeight.toFixed(2);
        return;
    }

    animationId = requestAnimationFrame(animate);
}

clearBtn.addEventListener('click', () => {
    isAnimating = false;
    cancelAnimationFrame(animationId);
    
    currentPath = [];
    previousPaths = [];
    overallMaxX = 10;
    overallMaxY = 10;
    
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 2;
    ctx.stroke();
});

fireBtn.addEventListener('click', fire);
clearBtn.click();