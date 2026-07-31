import { useEffect, useRef, useState } from 'react';

const Squares = ({ 
  direction = 'right', 
  speed = 0.5, 
  borderColor = 'rgba(99, 102, 241, 0.08)', 
  squareSize = 40,
  hoverFillColor = 'rgba(99, 102, 241, 0.15)'
}) => {
  const canvasRef = useRef(null);
  const [hoverPos, setHoverPos] = useState({ x: -1, y: -1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let offset = 0;

    const resizeCanvas = () => {
      if (!canvas.parentElement) return;
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };

    resizeCanvas();
    
    // Create a ResizeObserver to handle element size changes dynamically
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const cols = Math.ceil(canvas.width / squareSize) + 2;
      const rows = Math.ceil(canvas.height / squareSize) + 2;

      // Update offset for scrolling background
      offset = (offset + speed) % squareSize;

      // Adjust offset direction
      let ox = 0, oy = 0;
      if (direction === 'right') ox = -offset;
      else if (direction === 'left') ox = offset - squareSize;
      else if (direction === 'down') oy = -offset;
      else if (direction === 'up') oy = offset - squareSize;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * squareSize + ox;
          const y = j * squareSize + oy;

          // Draw square border
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x, y, squareSize, squareSize);

          // Random blinking effect
          const hash = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453;
          const noise = hash - Math.floor(hash);
          const timeFactor = Math.sin(Date.now() * 0.001 * speed + noise * 10);
          if (timeFactor > 0.96) {
            ctx.fillStyle = `rgba(99, 102, 241, ${0.08 * (timeFactor - 0.96) / 0.04})`;
            ctx.fillRect(x + 0.5, y + 0.5, squareSize - 1, squareSize - 1);
          }

          // Hover highlights
          if (
            hoverPos.x >= x && 
            hoverPos.x < x + squareSize && 
            hoverPos.y >= y && 
            hoverPos.y < y + squareSize
          ) {
            ctx.fillStyle = hoverFillColor;
            ctx.fillRect(x + 0.5, y + 0.5, squareSize - 1, squareSize - 1);
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
    };
  }, [direction, speed, borderColor, squareSize, hoverFillColor, hoverPos]);

  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setHoverPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseLeave = () => {
    setHoverPos({ x: -1, y: -1 });
  };

  return (
    <canvas 
      ref={canvasRef} 
      onMouseMove={handleMouseMove} 
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'all',
        zIndex: 0
      }}
    />
  );
};

export default Squares;
