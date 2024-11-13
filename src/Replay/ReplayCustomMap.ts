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
  identifier: string;
  timestamp: string;
  additionalInfo: string;
}

export interface InfoFrame {
  origin: [number, number, number];
  rotation: [number, number, number];
  velocity: number;
  buttons: number;
  gravity: number;
  fps: number;
  strafes: number;
  sync: number;
}

export class ReplayCustomMap {
  header: Header;
  frames: InfoFrame[];
  length: number;
  time: number;

  constructor() {
    this.header = { identifier: '', timestamp: '', additionalInfo: '' }; // Initialize with default values
    this.frames = []; // Initialize frames as an empty array
    this.length = 0
    this.time = 0;
  }

  addFrame(frame: InfoFrame) {
    this.frames.push(frame);
    this.length += 1;
  }

  convertTimestamp(timeString: string): number {
    return parseTimeToMilliseconds(timeString);
  }
}

function parseTimeToMilliseconds(timeString: string): number {
  // Remove the trailing 's' if present
  const cleanedString = timeString.replace('s', '');

  // Split by the colon to separate minutes and seconds
  const [minutesStr, secondsStr] = cleanedString.split(':');

  // Extract minutes and seconds from the split parts
  const minutes = parseInt(minutesStr, 10);
  const [seconds, millisecondsStr] = secondsStr.split('.');

  // Convert seconds and milliseconds to numbers
  const secondsNumber = parseInt(seconds, 10);
  const milliseconds = parseInt(millisecondsStr || '0', 10); // Default to 0 if millisecondsStr is undefined

  // Calculate total milliseconds
  const totalMilliseconds = (minutes * 60 * 1000) + (secondsNumber * 1000) + milliseconds;
  return totalMilliseconds;
}