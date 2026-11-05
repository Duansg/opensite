export async function initPixelPortrait() {
  const canvas = document.querySelector<HTMLCanvasElement>('#pixel-portrait');
  const portrait = canvas?.closest<HTMLElement>('.hero-portrait');
  const image = portrait?.querySelector<HTMLImageElement>('.hero-avatar-fallback');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx || !portrait || !image) return;

  // Sample the shared avatar into the same 64 × 64 grid used by the UI icons.
  // Keep the HTML image visible if decoding or canvas setup fails.
  const size = 64;
  const sample = document.createElement('canvas');
  sample.width = sample.height = size;
  const sampler = sample.getContext('2d', { willReadFrequently: true });
  if (!sampler) return;
  let data: Uint8ClampedArray;
  try {
    await image.decode();
    sampler.imageSmoothingEnabled = false;
    sampler.drawImage(image, 0, 0, size, size);
    data = sampler.getImageData(0, 0, size, size).data;
  } catch {
    return;
  }

  const cell = canvas.width / size;
  const pixels: { x: number; y: number; color: string; dx: number; dy: number }[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const offset = (y * size + x) * 4;
      const [r, g, b, alpha] = data.subarray(offset, offset + 4);
      if (alpha === 0) continue;
      pixels.push({
        x: x * cell,
        y: y * cell,
        color: `rgba(${r}, ${g}, ${b}, ${alpha / 255})`,
        dx: 0,
        dy: 0,
      });
    }
  }

  let pointer: { x: number; y: number } | null = null;
  let frame = 0;
  let visible = true;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  function draw() {
    frame = 0;
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let moving = false;
    pixels.forEach((pixel) => {
      let targetX = 0,
        targetY = 0;
      if (pointer && !reduced.matches) {
        const vx = pixel.x + cell / 2 - pointer.x;
        const vy = pixel.y + cell / 2 - pointer.y;
        const distance = Math.hypot(vx, vy);
        if (distance < 120) {
          const force = (120 - distance) * 0.7;
          targetX = (vx / (distance || 1)) * force;
          targetY = (vy / (distance || 1)) * force;
        }
      }
      if (reduced.matches) {
        pixel.dx = pixel.dy = 0;
      } else {
        pixel.dx += (targetX - pixel.dx) * 0.14;
        pixel.dy += (targetY - pixel.dy) * 0.14;
        if (Math.abs(targetX - pixel.dx) + Math.abs(targetY - pixel.dy) > 0.1) moving = true;
      }
      ctx.fillStyle = pixel.color;
      ctx.fillRect(Math.round(pixel.x + pixel.dx), Math.round(pixel.y + pixel.dy), cell, cell);
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
      x: ((event.clientX - bounds.left) / bounds.width) * canvas.width,
      y: ((event.clientY - bounds.top) / bounds.height) * canvas.height,
    };
    schedule();
  });
  canvas.addEventListener('pointerleave', () => {
    pointer = null;
    schedule();
  });
  reduced.addEventListener('change', schedule);
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible) schedule();
    else {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }).observe(canvas);
  draw();
  canvas.hidden = false;
  portrait.classList.add('is-interactive');
}
