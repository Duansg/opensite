export function initPixelPortrait() {
  const canvas = document.querySelector<HTMLCanvasElement>('#pixel-portrait');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  // Original 24 × 24 pixel portrait with pointer-driven scatter and reassembly.
  const rows = [
    '........................',
    '........................',
    '........................',
    '........KKKKKKKK........',
    '.......KMMMMMMMMK.......',
    '......KMMTMMTMMTMK......',
    '......KMMMMMMMMMMK......',
    '.....KKKKKKKKKKKKKK.....',
    '......KSSSSSSSSSSK......',
    '......KSDSSSSSSSSK......',
    '......KKKKKKKKKKKKK.....',
    '......KKLLKKKLLKSKK.....',
    '......KKLWKSKLWKSK......',
    '......KKKKKSKKKKSK......',
    '.....GKDDSSSSSSSSK......',
    '.....GKDDSSSSDSSSK......',
    '......KDDSSSSDDSSK......',
    '......KDDSSKKKKSSK......',
    '......KDDSSSSSSSSK......',
    '......KDDSSSSSSSK.......',
    '......KDDSSSKKKK........',
    '......KDDSSSK...........',
    '......KDDSSSK...........',
    '......KDDSSSK...........',
  ];
  const palette: Record<string, string> = {
    K: '#0d0f12',
    S: '#d9ab82',
    D: '#b98057',
    M: '#5ef0b8',
    T: '#2ba478',
    L: '#b7a6ff',
    W: '#ffffff',
    G: '#ffcf3f',
  };
  const pixels: { x: number; y: number; color: string; dx: number; dy: number }[] = [];
  rows.forEach((row, y) =>
    [...row].forEach((color, x) => {
      if (palette[color]) pixels.push({ x, y, color: palette[color], dx: 0, dy: 0 });
    }),
  );
  let pointer: { x: number; y: number } | null = null;
  let frame = 0;
  let visible = true;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  function draw() {
    frame = 0;
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, 520, 520);
    let moving = false;
    pixels.forEach((pixel) => {
      const x = pixel.x * 21.67;
      const y = pixel.y * 21.67;
      let targetX = 0,
        targetY = 0;
      if (pointer && !reduced.matches) {
        const vx = x - pointer.x;
        const vy = y - pointer.y;
        const distance = Math.hypot(vx, vy);
        if (distance < 120) {
          const force = (120 - distance) * 0.7;
          targetX = (vx / (distance || 1)) * force;
          targetY = (vy / (distance || 1)) * force;
        }
      }
      pixel.dx += (targetX - pixel.dx) * 0.14;
      pixel.dy += (targetY - pixel.dy) * 0.14;
      if (Math.abs(targetX - pixel.dx) + Math.abs(targetY - pixel.dy) > 0.1) moving = true;
      ctx.fillStyle = pixel.color;
      ctx.fillRect(Math.round(x + pixel.dx), Math.round(y + pixel.dy), 22, 22);
    });
    if (moving && visible) frame = requestAnimationFrame(draw);
  }
  function schedule() {
    if (!frame && visible) frame = requestAnimationFrame(draw);
  }
  canvas.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    const bounds = canvas.getBoundingClientRect();
    pointer = {
      x: ((event.clientX - bounds.left) / bounds.width) * 520,
      y: ((event.clientY - bounds.top) / bounds.height) * 520,
    };
    schedule();
  });
  canvas.addEventListener('pointerleave', () => {
    pointer = null;
    schedule();
  });
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible) schedule();
    else {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }).observe(canvas);
  draw();
}
