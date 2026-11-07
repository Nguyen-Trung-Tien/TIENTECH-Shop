import { describe, it, expect, beforeEach } from "vitest";
import {
  isNotificationSoundEnabled,
  toggleNotificationSound,
  playNotificationChime,
} from "../utils/notificationSound";

describe("notificationSound", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults sound enabled to true", () => {
    expect(isNotificationSoundEnabled()).toBe(true);
  });

  it("toggles sound enabled state and persists in localStorage", () => {
    const afterFirstToggle = toggleNotificationSound();
    expect(afterFirstToggle).toBe(false);
    expect(isNotificationSoundEnabled()).toBe(false);

    const afterSecondToggle = toggleNotificationSound();
    expect(afterSecondToggle).toBe(true);
    expect(isNotificationSoundEnabled()).toBe(true);
  });

  it("safely executes playNotificationChime without crashing when Web Audio is mock/absent", () => {
    expect(() => playNotificationChime()).not.toThrow();
  });
});

