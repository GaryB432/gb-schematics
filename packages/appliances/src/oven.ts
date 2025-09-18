import Victor from 'victor';

export class Oven {
  private temperature: number;
  private position: Victor;

  constructor(temperature: number) {
    this.temperature = temperature;
    this.position = new Victor(0, 0);
  }

  setTemperature(temperature: number): void {
    this.temperature = temperature;
  }

  getTemperature(): number {
    return this.temperature;
  }

  setPosition(x: number, y: number): void {
    this.position = new Victor(x, y);
  }

  getPosition(): Victor {
    return this.position.clone();
  }
}
