// ===========================================
// Sound Service
// Handles game UI sounds and haptic feedback
// ===========================================

const SOUNDS = {
  MESSAGE_IN: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3', // Soft pop
  MESSAGE_OUT: 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3', // Slight click
  DEAL_WON: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // Win fanfare
  DEAL_LOST: 'https://assets.mixkit.co/active_storage/sfx/253/253-preview.mp3', // Error buzz
  TYPING: 'https://assets.mixkit.co/active_storage/sfx/2360/2360-preview.mp3', // Ghostly typing
};

class SoundService {
  constructor() {
    this.audioCache = {};
    this.enabled = true;
  }

  play(soundName) {
    if (!this.enabled || !SOUNDS[soundName]) return;

    try {
      if (!this.audioCache[soundName]) {
        this.audioCache[soundName] = new Audio(SOUNDS[soundName]);
      }
      
      const audio = this.audioCache[soundName];
      audio.currentTime = 0;
      audio.volume = 0.4;
      audio.play().catch(() => {
        // Handle browser autoplay restrictions (silence)
      });

      // Haptic feedback (Mobile only)
      if ('vibrate' in navigator) {
        if (soundName === 'DEAL_WON') navigator.vibrate([100, 50, 100]);
        else if (soundName === 'DEAL_LOST') navigator.vibrate(200);
        else navigator.vibrate(10);
      }
    } catch (e) {
      console.warn('Sound play failed:', e);
    }
  }

  toggle(state) {
    this.enabled = state !== undefined ? state : !this.enabled;
    return this.enabled;
  }
}

export default new SoundService();
