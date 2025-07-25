import React, { useEffect, useRef } from "react";

interface Point {
  x: number;
  y: number;
}

interface Star extends Point {
  radius: number;
  vx: number;
  vy: number;
}

const CanvasBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const COL = "#555";
    const stars: Star[] = [];
    const FPS = 60;
    let x = Math.sqrt(canvas.width * canvas.height) / 10;
    const mouse: Point = {
      x: 0,
      y: 0,
    };

    x = x > 140 ? 140 : x;
    console.log("num bg points:", x);

    for (let i = 0; i < x; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1 + 1,
        vx: Math.floor(Math.random() * 50) - 25,
        vy: Math.floor(Math.random() * 50) - 25,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        ctx.fillStyle = COL;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.stroke();
      }

      ctx.beginPath();
      for (let i = 0; i < stars.length; i++) {
        const starI = stars[i];
        ctx.moveTo(starI.x, starI.y);
        if (distance(mouse, starI) < 150) ctx.lineTo(mouse.x, mouse.y);
        for (let j = 0; j < stars.length; j++) {
          const starII = stars[j];
          if (distance(starI, starII) < 150) {
            //ctx.globalAlpha = (1 / 150 * distance(starI, starII).toFixed(1));
            ctx.lineTo(starII.x, starII.y);
          }
        }
      }
      ctx.lineWidth = 0.05;
      ctx.strokeStyle = COL;
      ctx.stroke();
    };

    const distance = (point1: Point, point2: Point) => {
      let xs = 0;
      let ys = 0;

      xs = point2.x - point1.x;
      xs *= xs;

      ys = point2.y - point1.y;
      ys *= ys;

      return Math.sqrt(xs + ys);
    };

    const update = () => {
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        s.x += s.vx / FPS;
        s.y += s.vy / FPS;

        if (s.x < 0 || s.x > canvas.width) s.vx = -s.vx;
        if (s.y < 0 || s.y > canvas.height) s.vy = -s.vy;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    let animationFrameId: number;

    const tick = () => {
      draw();
      update();
      animationFrameId = requestAnimationFrame(tick);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    tick();

    // Cleanup function
    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      style={{
        position: "fixed",
        top: "0",
        left: "0",
        zIndex: "-1000",
        background: "linear-gradient(to bottom, rgb(153, 136, 204), #6492bb)"
      }}
      ref={canvasRef}
      id="splash-bg"
    ></canvas>
  );
};

export default CanvasBackground;
