import { FontHydrated } from 'src/data/fonts';
import FontFaceObserver from 'fontfaceobserver';

export const loadGoogleFonts = (fonts: FontHydrated[], callback?: () => void) => {
  if (fonts.length === 0) {
    return;
  }
  let urlString = 'family=Outfit';
  for (const font of fonts) {
    urlString += '&family='.concat(encodeURIComponent(font.family));
  }

  const link = document.createElement('link');
  // link.id = "ppm-fonts-el";
  link.href = `https://fonts.googleapis.com/css2?${urlString}&display=swap`;
  link.rel = 'stylesheet';

  document.head.appendChild(link);

  const observers = [];
  for (const font of fonts) {
    const obs = new FontFaceObserver(font.family);
    observers.push(obs.load());
  }

  Promise.allSettled(observers)
    .then((fonts) => {
      console.debug('Fonts load request completed', fonts);
    })
    .catch(function (err) {
      console.debug(`Some critical font are not available: ${err.toString()}`);
    })
    .finally(() => {
      callback && callback();
    });
};
