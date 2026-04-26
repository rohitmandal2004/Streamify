// Notification sound utility using Web Audio API (no external files needed)
const AudioContext = window.AudioContext || window.webkitAudioContext;

function playTone(frequency, duration, type = 'sine', volume = 0.15) {
    try {
        const ctx = new AudioContext();
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);

        setTimeout(() => ctx.close(), (duration + 0.1) * 1000);
    } catch (e) {
        // Silently fail if audio context is not available
    }
}

export function playJoinSound() {
    // Pleasant ascending two-tone chime
    playTone(523, 0.15, 'sine', 0.12);  // C5
    setTimeout(() => playTone(659, 0.2, 'sine', 0.12), 120);  // E5
}

export function playLeaveSound() {
    // Soft descending tone
    playTone(440, 0.15, 'sine', 0.1);  // A4
    setTimeout(() => playTone(330, 0.25, 'sine', 0.08), 120);  // E4
}

export function playChatSound() {
    // Quick subtle pop
    playTone(880, 0.08, 'sine', 0.08);  // A5
    setTimeout(() => playTone(1047, 0.1, 'sine', 0.06), 60);  // C6
}
