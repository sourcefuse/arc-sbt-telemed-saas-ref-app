export function getAudioDuration(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    if (audio.readyState > 1) {
      resolve(audio.duration);
      return;
    }
    audio.onloadedmetadata = () => {
      resolve(audio.duration);
    };
    audio.onerror = () => {
      reject();
    };
  });
}
