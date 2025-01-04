import { glMatrix } from 'gl-matrix'
import { createNanoEvents, Emitter as EventEmitter } from 'nanoevents'
import { Game } from './Game'
import { Replay } from './Replay/Replay'
import { ReplayState } from './Replay/ReplayState'
import { InfoFrame, Vector3 } from './Replay/ReplayCustomMap'

const IN_JUMP = 1 << 0;
const IN_DUCK = 1 << 1;
const IN_FORWARD = 1 << 2;
const IN_BACK = 1 << 3;
const IN_MOVELEFT = 1 << 4;
const IN_MOVERIGHT = 1 << 5;


const updateGame = (game: Game, state: ReplayState) => {
  game.camera.position[0] = state.cameraPos[0]
  game.camera.position[1] = state.cameraPos[1]
  game.camera.position[2] = state.cameraPos[2]
  game.camera.rotation[0] = glMatrix.toRadian(state.cameraRot[0])
  game.camera.rotation[1] = glMatrix.toRadian(state.cameraRot[1])
  game.camera.rotation[2] = glMatrix.toRadian(state.cameraRot[2])
}

export class ReplayPlayer {
  game: Game
  state: ReplayState
  replay: any
  events: EventEmitter

  oldButtons: number = 0
  oldGravity: boolean = false

  prevFrame: number = 0
  nextFrame: number = 0

  timeOffset: number = 0
  frameTime: number = 0
  currentFrame: number = 0
 
  currentTime: number = 0
  isPlaying: boolean = false
  isPaused: boolean = false
  speed: number = 1

  constructor(game: Game) {
    this.reset()
    this.game = game
    this.state = new ReplayState()
    this.replay = null
    this.events = createNanoEvents()
  }

  msToFullTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = ms % 1000;
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
  
    // Format hours, minutes, seconds, and milliseconds
    const mm = String(minutes).padStart(2, '0');
    const ss = String(remainingSeconds).padStart(2, '0');
    const msStr = String(milliseconds).padStart(3, '0');
  
    return `${mm}:${ss}.${msStr}`;
  }

  reset() {
    this.nextFrame = 0
    this.prevFrame = 0

    this.frameTime = 0
    this.currentFrame = 0
    this.timeOffset = 0

    this.currentTime = 0
    this.isPlaying = false
    this.isPaused = false
    this.speed = 1

    if (this.replay) {
      this.game.setTitle(this.replay.data.header.name + " " + this.replay.data.header.additionalInfo + " " + this.msToFullTime(this.replay.data.header.time));
      let firstFrame: InfoFrame = this.replay.data.frames[0]
      
      let state = new ReplayState();
      state.cameraPos = firstFrame.origin
      state.cameraRot = firstFrame.rotation
      this.state = state
      this.frameTime = (this.replay.data.time / this.replay.data.frames.length) / 1000
    }
  }

  changeReplay(replay: Replay) {
    this.replay = replay
    this.reset()
  }

  play() {
    if (!this.isPlaying) {
      this.isPlaying = true
    } else if (this.isPaused) {
      this.isPaused = false
    }

    this.events.emit('play')
  }

  pause() {
    if (this.isPlaying) {
      this.isPaused = true
    }

    this.events.emit('pause')
  }

  stop() {
    this.reset()
    this.events.emit('stop')
  }

  speedUp() {
    this.speed = Math.min(this.speed * 2, 1)
  }

  speedDown() {
    this.speed = Math.max(this.speed / 2, 0.12)
  }

  seek(dt: number) {
    if (this.currentFrame >= this.replay.data.frames.length - 1) {
        this.reset();
    }
    dt *= this.speed;

    this.currentTime += dt;
    const frameDuration = this.frameTime;

    this.timeOffset += dt;

    if (this.timeOffset >= frameDuration) {
        this.timeOffset = this.timeOffset - frameDuration;

        this.prevFrame = this.currentFrame;
        this.nextFrame = this.currentFrame + 1;

        const currentFrameData : InfoFrame = this.replay.data.frames[this.currentFrame];
        const { timestamp, speed, fps, buttons, strafes, sync, gravity } = currentFrameData;

        if(timestamp > 0)
          this.frameTime = timestamp / 1000.0;
        
        this.game.setSpeed(speed.toString());
        this.game.setFps(fps.toString());

        if(gravity !== this.oldGravity){
          this.oldGravity = gravity;
          this.game.setGravity(gravity)
        }

        if(buttons !== this.oldButtons){
          const btnString = this.formatKeys(buttons);
          this.game.setButtons(btnString);
        }
          
        if(strafes)
          this.game.setStrafes(`Strafes: ${strafes}\nSync: ${sync}`);


        this.currentFrame++;
    }
    if (this.currentFrame > 0) {
        const t = this.timeOffset / frameDuration > 1.0 ? 1.0 : this.timeOffset / frameDuration;
  
        const prevFrameData = this.replay.data.frames[this.prevFrame];
        const nextFrameData = this.replay.data.frames[this.nextFrame];

        const interpolatedPos = new Vector3(prevFrameData.origin).lerp(new Vector3(nextFrameData.origin), t);

        const interpolatedRot: [number, number, number] = [0, 0, 0];

        interpolatedRot[0] = this.slerp(prevFrameData.rotation[0], nextFrameData.rotation[0], t);
        interpolatedRot[1] = this.slerp(prevFrameData.rotation[1], nextFrameData.rotation[1], t);

        this.state.cameraPos = interpolatedPos.vec;
        this.state.cameraRot = interpolatedRot;
        updateGame(this.game, this.state);
    }
    
}

formatKeys(buttons: number): string {
  return `${(buttons & IN_FORWARD ? "W" : "    ")}    ${(buttons & IN_JUMP ? "JUMP" : "         ")}\n` +
         `${(buttons & IN_MOVELEFT ? "A" : "    ")}${(buttons & IN_BACK ? "S" : "    ")}${(buttons & IN_MOVERIGHT ? "D" : "    ")}    ${(buttons & IN_DUCK ? "DUCK" : "         ")}\n`;
}

slerp(a: number, b: number, dt: number): number {
  // Ensure angles are within the range [0, 360)
  a = a % 360;
  b = b % 360;

  // Calculate the shortest distance between angles
  const dist = this.getDist(a, b);

  if (Math.abs(a - b) > 180) {
      // Handle wrap-around cases
      if (a < b) {
          // Moving backward
          return (a + 180 - dist * dt + 360) % 360 - 180;
      } else {
          // Moving forward
          return (a + 180 + dist * dt + 360) % 360 - 180;
      }
  } else {
      // Handle direct cases
      if (a < b) {
          // Moving forward
          return (a + 180 + dist * dt + 360) % 360 - 180;
      } else {
          // Moving backward
          return (a + 180 - dist * dt + 360) % 360 - 180;
      }
  }
}

getDist(a: number, b: number): number {
  // Compute the absolute difference between the two angles
  const rawDiff = Math.abs(a - b);

  // Compute the shortest angular distance
  return 180.0 - Math.abs(rawDiff - 180.0);
}


seekByPercent(value: number) {
  value = Math.max(0, Math.min(value, 100)) / 100;
  this.currentTime = this.replay.data.time * value / 1000;
  this.currentFrame = Math.round(this.replay.data.frames.length * value);
  this.prevFrame = this.currentFrame;
  this.nextFrame = this.currentFrame;
  this.state.cameraPos = this.replay.data.frames[this.currentFrame].origin;
  this.state.cameraRot = this.replay.data.frames[this.currentFrame].rotation;
  updateGame(this.game, this.state);
}

update(dt: number) {
  if (!this.isPlaying || this.isPaused) {
    return
  }
  this.seek(dt)


  let hitStop = false;

  if (hitStop) {
    this.stop()
  }
}
}
