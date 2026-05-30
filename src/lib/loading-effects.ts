const DESIGN_WIDTH = 1024;
const DESIGN_HEIGHT = 640;
const TOTAL_DURATION = 10000;
const RIGHT_START_DELAY = 2000;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function initLoadingEffects(onComplete: () => void) {
  const stage = document.getElementById('stage')!;
  const taskItems = Array.from(document.querySelectorAll('.task-item'));
  const routeLine = document.getElementById('routeLine')!;
  const routeNodes = Array.from(document.querySelectorAll('.route-map .node'));
  const barFillOne = document.getElementById('barFillOne')!;
  const barFillTwo = document.getElementById('barFillTwo')!;
  const bottomHint = document.getElementById('bottomHint')!;
  const hintText = document.getElementById('hintText')!;

  let cleanupResize: (() => void) | null = null;

  function fitStage() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isPortrait = vh > vw;
    const isSmallDevice = Math.min(vw, vh) <= 820;
    let scale: number;
    let rotation = 0;

    if (isPortrait && isSmallDevice) {
      scale = Math.min(vw / DESIGN_HEIGHT, vh / DESIGN_WIDTH);
      rotation = 90;
    } else {
      scale = Math.min(vw / DESIGN_WIDTH, vh / DESIGN_HEIGHT);
    }

    scale = Math.max(0.1, scale * 0.985);
    stage.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`;
  }

  function resetDemoState() {
    taskItems.forEach((item) => {
      item.classList.remove('loading', 'done');
      item.classList.add('pending');
      (item as HTMLElement).style.removeProperty('--spin-duration');
    });

    routeLine.classList.remove('is-drawing');
    routeLine.style.removeProperty('animation-duration');

    routeNodes.forEach((node) => node.classList.remove('show'));

    barFillOne.style.width = '0%';
    barFillTwo.style.width = '0%';

    hintText.textContent = 'AI 正在理解这个视频的真实成本';
    bottomHint.classList.remove('ready');
  }

  async function runLeftLoadingOnce() {
    const initialDelay = 180;
    const gap = 150;
    const itemDuration = (TOTAL_DURATION - initialDelay - gap * (taskItems.length - 1)) / taskItems.length;
    const spinDurationSeconds = itemDuration / 1000;

    await wait(initialDelay);

    for (let index = 0; index < taskItems.length; index += 1) {
      const item = taskItems[index] as HTMLElement;
      item.classList.remove('pending');
      item.classList.add('loading');
      item.style.setProperty('--spin-duration', `${spinDurationSeconds}s`);

      await wait(itemDuration);

      item.classList.remove('loading');
      item.classList.add('done');

      if (index < taskItems.length - 1) {
        await wait(gap);
      }
    }
  }

  function prepareRouteLine() {
    const line = routeLine as unknown as SVGPathElement;
    const length = line.getTotalLength();
    routeLine.style.setProperty('--route-length', String(length));
    routeLine.style.strokeDasharray = String(length);
    routeLine.style.strokeDashoffset = String(length);
  }

  function animateBar(el: HTMLElement, duration: number) {
    return new Promise<void>((resolve) => {
      const start = performance.now();

      function frame(now: number) {
        const elapsed = now - start;
        const raw = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - raw, 3);
        el.style.width = `${eased * 100}%`;

        if (raw < 1) {
          requestAnimationFrame(frame);
        } else {
          el.style.width = '100%';
          resolve();
        }
      }

      requestAnimationFrame(frame);
    });
  }

  async function runRightLoadingOnce() {
    prepareRouteLine();

    await wait(RIGHT_START_DELAY);

    const rightDuration = TOTAL_DURATION - RIGHT_START_DELAY;

    routeLine.style.animationDuration = '4.8s';
    routeLine.classList.add('is-drawing');

    routeNodes.forEach((node) => {
      const el = node as HTMLElement;
      const delay = Number(el.dataset.delay || 0);
      setTimeout(() => {
        el.classList.add('show');
      }, 360 + delay);
    });

    const greenDuration = rightDuration - 1100;
    const orangeDuration = rightDuration;

    await Promise.all([animateBar(barFillOne, greenDuration), animateBar(barFillTwo, orangeDuration)]);
  }

  async function runDemo() {
    resetDemoState();

    const leftDone = runLeftLoadingOnce();
    const rightDone = runRightLoadingOnce();

    await Promise.all([leftDone, rightDone]);

    hintText.textContent = '开始你的TripSim';
    bottomHint.classList.add('ready');

    await wait(600);
    onComplete();
  }

  // 初始适配
  fitStage();
  setTimeout(fitStage, 600);
  setTimeout(fitStage, 1400);
  setTimeout(fitStage, 2400);

  // 窗口大小变化时适配
  const onResize = () => fitStage();
  const onOrientationChange = () => {
    setTimeout(fitStage, 250);
  };
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onOrientationChange);
  cleanupResize = () => {
    window.removeEventListener('resize', onResize);
    window.removeEventListener('orientationchange', onOrientationChange);
  };

  // 启动演示
  runDemo();

  return () => {
    cleanupResize?.();
  };
}
