export function initHomeEffects() {
  const sparkleRoot = document.getElementById('sparkles');
  const doodleRoot = document.getElementById('doodles');

  if (!sparkleRoot || !doodleRoot) return;

  const colors = ['#f4b52c', '#39aee8', '#e94e75', '#6bbf45', '#8f6bd9'];

  // 中上部星点
  for (let i = 0; i < 42; i++) {
    const item = document.createElement('span');
    const isStar = i % 7 === 0;
    item.className = isStar ? 'sparkle-star' : 'sparkle-dot';
    item.style.left = `${Math.random() * 96 + 2}%`;
    item.style.top = `${Math.random() * 68 + 4}%`;
    item.style.animationDelay = `${Math.random() * 5}s`;
    item.style.animationDuration = `${3 + Math.random() * 5}s`;
    item.style.color = colors[Math.floor(Math.random() * colors.length)];

    if (!isStar) {
      const size = 4 + Math.random() * 7;
      item.style.width = `${size}px`;
      item.style.height = `${size}px`;
      item.style.background = colors[Math.floor(Math.random() * colors.length)];
    }
    sparkleRoot.appendChild(item);
  }

  // 底部草地花点
  for (let i = 0; i < 28; i++) {
    const flower = document.createElement('span');
    flower.className = 'flower-dot';
    flower.style.left = `${Math.random() * 96 + 2}%`;
    flower.style.bottom = `${Math.random() * 9 + 1}%`;
    flower.style.background = colors[Math.floor(Math.random() * colors.length)];
    flower.style.animationDelay = `${Math.random() * 5}s`;
    flower.style.animationDuration = `${4 + Math.random() * 4}s`;
    doodleRoot.appendChild(flower);
  }

  // 底部草线
  for (let i = 0; i < 34; i++) {
    const grass = document.createElement('span');
    grass.className = 'grass-stroke';
    grass.style.left = `${Math.random() * 98}%`;
    grass.style.bottom = `${Math.random() * 18 + 3}%`;
    grass.style.transform = `rotate(${Math.random() * 60 - 30}deg)`;
    grass.style.opacity = `${0.25 + Math.random() * 0.38}`;
    doodleRoot.appendChild(grass);
  }

  // 桌游格子轻微错落
  document.querySelectorAll('.tile').forEach((tile, index) => {
    (tile as HTMLElement).style.animation = `tileWiggle ${5 + (index % 4)}s ease-in-out ${index * 0.13}s infinite`;
  });

  const style = document.createElement('style');
  style.textContent = `
    @keyframes tileWiggle {
      0%, 100% { margin-bottom: 0; }
      50% { margin-bottom: ${window.innerHeight < 720 ? '1px' : '3px'}; }
    }
  `;
  document.head.appendChild(style);

  // 手机端横屏适配
  const setViewportVars = () => {
    document.documentElement.style.setProperty('--real-vh', `${window.innerHeight * 0.01}px`);
    document.documentElement.style.setProperty('--real-vw', `${window.innerWidth * 0.01}px`);
  };
  setViewportVars();
  window.addEventListener('resize', setViewportVars, { passive: true });
  window.addEventListener('orientationchange', () => setTimeout(setViewportVars, 250), { passive: true });
}
