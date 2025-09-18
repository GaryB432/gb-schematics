import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Oven } from './oven.js';
import Victor from 'victor';

// Mock Victor
vi.mock('victor', () => {
  return {
    default: vi.fn().mockImplementation((x, y) => {
      return {
        x,
        y,
        clone: () => ({ x, y, clone: () => ({ x, y }) }),
      };
    }),
  };
});

describe('Oven', () => {
  let oven: Oven;

  beforeEach(() => {
    oven = new Oven(180);
  });

  it('should be initialized with correct temperature', () => {
    expect(oven.getTemperature()).toBe(180);
  });

  it('should change temperature', () => {
    oven.setTemperature(220);
    expect(oven.getTemperature()).toBe(220);
  });

  it('should set and get position using Victor', () => {
    oven.setPosition(10, 20);
    const position = oven.getPosition();
    expect(position.x).toBe(10);
    expect(position.y).toBe(20);

    // Verify Victor was called
    expect(Victor).toHaveBeenCalledWith(10, 20);
  });
});
