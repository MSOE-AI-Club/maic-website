export const startAnimation = (canvasId: string) => {
    const COL = '#555';

    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
        console.error(`Canvas with id ${canvasId} not found.`);
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("Could not get 2d context from canvas.");
        return;
    }


    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Star {
        x: number;
        y: number;
        radius: number;
        vx: number;
        vy: number;
    }

    const stars: Star[] = [];
    const FPS = 60;
    let x = Math.sqrt(canvas.width * canvas.height) / 10;
    const mouse = {
        x: 0,
        y: 0,
    };

    x = x > 140 ? 140 : x;


    for (let i = 0; i < x; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1 + 1,
            vx: Math.floor(Math.random() * 50) - 25,
            vy: Math.floor(Math.random() * 50) - 25,
        });
    }

    function draw() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.globalCompositeOperation = "lighter";

        for (let i = 0, len = stars.length; i < len; i++) {
            const s = stars[i];

            ctx.fillStyle = COL;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = 'black';
            ctx.stroke();
        }

        ctx.beginPath();
        for (let i = 0, len = stars.length; i < len; i++) {
            const starI = stars[i];
            ctx.moveTo(starI.x, starI.y);
            if (distance(mouse, starI) < 150) ctx.lineTo(mouse.x, mouse.y);
            for (let j = 0, lenJ = stars.length; j < lenJ; j++) {
                const starII = stars[j];
                if (distance(starI, starII) < 150) {
                    ctx.lineTo(starII.x, starII.y);
                }
            }
        }
        ctx.lineWidth = 0.05;
        ctx.strokeStyle = COL;
        ctx.stroke();
    }

    function distance(point1: {x: number, y: number}, point2: {x: number, y: number}) {
        let xs = 0;
        let ys = 0;

        xs = point2.x - point1.x;
        xs = xs * xs;

        ys = point2.y - point1.y;
        ys = ys * ys;

        return Math.sqrt(xs + ys);
    }

    function update() {
        for (let i = 0, len = stars.length; i < len; i++) {
            const s = stars[i];

            s.x += s.vx / FPS;
            s.y += s.vy / FPS;

            if (s.x < 0 || s.x > canvas.width) s.vx = -s.vx;
            if (s.y < 0 || s.y > canvas.height) s.vy = -s.vy;
        }
    }
    
    const handleMouseMove = (e: MouseEvent) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    let animationFrameId: number;

    function tick() {
        draw();
        update();
        animationFrameId = requestAnimationFrame(tick);
    }

    tick();

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        cancelAnimationFrame(animationFrameId);
    };
}; 