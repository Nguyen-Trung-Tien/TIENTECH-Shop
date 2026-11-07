/**
 * notificationSound.js - Hệ thống âm thanh thông báo Web Audio API cho TIENTECH-Shop
 * Sử dụng Web Audio API synthesizer để tạo âm thanh Cyber Chime công nghệ cao,
 * không cần tải file MP3 bên ngoài, hoạt động mượt mà 60fps trên mọi trình duyệt.
 */

const SOUND_PREF_KEY = "tientech_notification_sound_enabled";

/**
 * Kiểm tra xem người dùng có bật âm thanh thông báo hay không (mặc định bật)
 */
export const isNotificationSoundEnabled = () => {
  try {
    const val = localStorage.getItem(SOUND_PREF_KEY);
    return val !== "false";
  } catch {
    return true;
  }
};

/**
 * Bật/tắt âm thanh thông báo và lưu vào localStorage
 */
export const toggleNotificationSound = () => {
  try {
    const current = isNotificationSoundEnabled();
    const next = !current;
    localStorage.setItem(SOUND_PREF_KEY, String(next));
    return next;
  } catch {
    return true;
  }
};

/**
 * Phát âm thanh Cyber Chime kép (D5 -> A5) nhẹ nhàng, tinh tế
 */
export const playNotificationChime = () => {
  if (!isNotificationSoundEnabled()) return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // Nếu AudioContext bị suspended do user gesture policy, resume khi có thể
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Nốt thứ nhất: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.25);

    // Nốt thứ hai: 880 Hz (A5) ngân dài nhẹ
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.1);

    gain2.gain.setValueAtTime(0.0001, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.15, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.1);
    osc2.stop(now + 0.55);

    // Dọn dẹp context sau khi phát xong
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 800);
  } catch (err) {
    console.debug("[NotificationSound] Audio playback ignored:", err?.message);
  }
};

