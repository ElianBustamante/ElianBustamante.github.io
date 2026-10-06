export const slowScrollTo = (target) => {
  if (!target) return;
  const start = window.scrollY;
  const distance = target.getBoundingClientRect().top;
  let startT = null;
  // Curva de aceleración y desaceleración suave (ease-in-out)
  const ease = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; 
  
  const anim = (t) => {
    if (!startT) startT = t;
    const progress = Math.min((t - startT) / 1200, 1); // 1200ms = 1.2 segundos (Lento y cinematográfico)
    window.scrollTo(0, start + distance * ease(progress));
    if (progress < 1) requestAnimationFrame(anim);
  };
  requestAnimationFrame(anim);
}
