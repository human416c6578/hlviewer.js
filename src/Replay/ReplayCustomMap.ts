export class Vector3 {
  constructor(public vec: [number, number, number]) { }

  // Linear interpolation
  lerp(to: Vector3, t: number): Vector3 {
    return new Vector3(
      [this.vec[0] + (to.vec[0] - this.vec[0]) * t,
      this.vec[1] + (to.vec[1] - this.vec[1]) * t,
      this.vec[2] + (to.vec[2] - this.vec[2]) * t]
    );
  }
}

export interface Header {
  timestamp: bigint;
  version: number;
  map: string;
  time: number;
  name: string;
  steamid: string;
  additionalInfo: string;
}

export interface InfoFrame {
  timestamp: number;
  origin: [number, number, number];
  rotation: [number, number];
  speed: number;
  buttons: number;
  fps: number;
  strafes: number;
  sync: number;
  grounded: boolean;
  gravity: boolean;
}

export class ReplayCustomMap {
  header: Header;
  frames: InfoFrame[];
  length: number;
  time: number;

  constructor() {
    this.header = { timestamp: BigInt(0), version: 0, map: '', time: 0, name: '', steamid: '', additionalInfo: '' };
    this.frames = [];
    this.length = 0
    this.time = 0;
  }

  addFrame(frame: InfoFrame) {
    this.frames.push(frame);
    this.length += 1;
  }

}