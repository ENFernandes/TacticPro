import { fabric } from "fabric";
import { Keyframe, AnimationPhase } from "@/types";

export class AnimationManager {
  private canvas: fabric.Canvas;
  private phases: AnimationPhase[] = [];
  private currentPhaseIndex = 0;
  private isPlaying = false;
  private animationId: number | null = null;
  private startTime: number = 0;
  private pausedAtMs: number = 0;
  private isRecording = false;
  private recordingStartTime: number = 0;

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
  }

  addPhase(name: string, duration: number = 2000): AnimationPhase {
    const phase: AnimationPhase = {
      id: `phase-${Date.now()}`,
      name,
      duration,
      keyframes: [],
    };
    this.phases.push(phase);
    return phase;
  }

  addKeyframe(phaseId: string, objectId: string, properties: Keyframe["properties"], timestamp?: number): void {
    const phase = this.phases.find(p => p.id === phaseId);
    if (!phase) return;

    const keyframe: Keyframe = {
      objectId,
      timestamp: typeof timestamp === 'number' ? timestamp : Math.max(0, (Date.now() - (this.isRecording ? this.recordingStartTime : this.startTime))),
      properties,
    };

    phase.keyframes.push(keyframe);
    // Estender duração automaticamente durante a gravação ou edição
    phase.duration = Math.max(phase.duration, keyframe.timestamp);
  }

  captureCurrentPositions(phaseId: string, timestamp?: number): void {
    const phase = this.phases.find(p => p.id === phaseId);
    if (!phase) return;

    const objects = this.canvas.getObjects();
    objects.forEach(obj => {
      const objectId = this.getStableObjectId(obj);
      if (!objectId) return;
      this.addKeyframe(phaseId, objectId, {
        left: obj.left || 0,
        top: obj.top || 0,
        opacity: obj.opacity || 1,
        angle: obj.angle || 0,
      }, timestamp);
    });
  }

  play(phaseIndex?: number, fromMs?: number): void {
    if (phaseIndex !== undefined) {
      this.currentPhaseIndex = phaseIndex;
    }

    const phase = this.phases[this.currentPhaseIndex];
    if (!phase || phase.keyframes.length === 0) return;

    this.isPlaying = true;
    const base = typeof fromMs === 'number' ? (Date.now() - fromMs) : (this.pausedAtMs ? (Date.now() - this.pausedAtMs) : Date.now());
    this.startTime = base;
    this.pausedAtMs = 0;

    const animate = () => {
      if (!this.isPlaying) return;

      const elapsed = Date.now() - this.startTime;
      const progress = Math.min(elapsed / phase.duration, 1);

      // Interpolar entre keyframes
      this.interpolateKeyframes(phase, progress);

      if (progress < 1) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        this.isPlaying = false;
        this.animationId = null;
      }
    };

    animate();
  }

  pause(): void {
    this.isPlaying = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    const phase = this.phases[this.currentPhaseIndex];
    if (phase) {
      const elapsed = Math.min(Date.now() - this.startTime, phase.duration);
      this.pausedAtMs = Math.max(0, elapsed);
    }
  }

  stop(): void {
    this.pause();
    this.currentPhaseIndex = 0;
    this.startTime = 0;
    this.pausedAtMs = 0;
    const phase = this.phases[this.currentPhaseIndex];
    if (phase) {
      this.seek(this.currentPhaseIndex, 0);
    }
  }

  startRecording(phaseIndex: number): void {
    this.currentPhaseIndex = phaseIndex;
    this.isRecording = true;
    this.recordingStartTime = Date.now();
  }

  stopRecording(): void {
    this.isRecording = false;
    this.recordingStartTime = 0;
  }

  seek(phaseIndex: number, tMs: number): void {
    if (phaseIndex !== this.currentPhaseIndex) this.currentPhaseIndex = phaseIndex;
    const phase = this.phases[this.currentPhaseIndex];
    if (!phase) return;

    const objects = this.canvas.getObjects();
    const currentTime = Math.max(0, Math.min(tMs, phase.duration));

    objects.forEach(obj => {
      const objectId = this.getStableObjectId(obj);
      if (!objectId) return;

      const objectKeyframes = phase.keyframes.filter(kf => kf.objectId === objectId);
      if (objectKeyframes.length === 0) return;

      const sortedKeyframes = objectKeyframes.sort((a, b) => a.timestamp - b.timestamp);

      let fromKeyframe: Keyframe | null = null;
      let toKeyframe: Keyframe | null = null;
      for (let i = 0; i < sortedKeyframes.length; i++) {
        if (sortedKeyframes[i].timestamp <= currentTime) {
          fromKeyframe = sortedKeyframes[i];
        }
        if (sortedKeyframes[i].timestamp >= currentTime) {
          toKeyframe = sortedKeyframes[i];
          break;
        }
      }

      if (!fromKeyframe && toKeyframe) fromKeyframe = toKeyframe;
      if (!toKeyframe && fromKeyframe) toKeyframe = fromKeyframe;

      if (fromKeyframe && toKeyframe) {
        const denom = Math.max(1, toKeyframe.timestamp - fromKeyframe.timestamp);
        const keyframeProgress = Math.max(0, Math.min(1, (currentTime - fromKeyframe.timestamp) / denom));
        const left = this.lerp(fromKeyframe.properties.left, toKeyframe.properties.left, keyframeProgress);
        const top = this.lerp(fromKeyframe.properties.top, toKeyframe.properties.top, keyframeProgress);
        const opacity = this.lerp(fromKeyframe.properties.opacity || 1, toKeyframe.properties.opacity || 1, keyframeProgress);
        const angle = this.lerp(fromKeyframe.properties.angle || 0, toKeyframe.properties.angle || 0, keyframeProgress);

        obj.set({ left, top, opacity, angle });
      }
    });

    this.canvas.renderAll();
  }

  setPhaseDuration(phaseId: string, durationMs: number): void {
    const phase = this.phases.find(p => p.id === phaseId);
    if (phase) phase.duration = Math.max(0, durationMs);
  }

  renamePhase(phaseId: string, name: string): void {
    const phase = this.phases.find(p => p.id === phaseId);
    if (phase) phase.name = name;
  }

  deletePhase(phaseId: string): void {
    this.phases = this.phases.filter(p => p.id !== phaseId);
    this.currentPhaseIndex = Math.max(0, Math.min(this.currentPhaseIndex, this.phases.length - 1));
  }

  setPhases(phases: AnimationPhase[]): void {
    this.phases = phases;
    this.currentPhaseIndex = Math.max(0, Math.min(this.currentPhaseIndex, this.phases.length - 1));
  }

  getCurrentTimeMs(): number {
    if (this.isPlaying) {
      const phase = this.phases[this.currentPhaseIndex];
      if (!phase) return 0;
      return Math.max(0, Math.min(Date.now() - this.startTime, phase.duration));
    }
    if (this.isRecording) {
      return Math.max(0, Date.now() - this.recordingStartTime);
    }
    return this.pausedAtMs || 0;
  }

  private getStableObjectId(obj: fabric.Object): string | null {
    const anyObj = obj as any;
    if (anyObj.name === 'player-group' && typeof anyObj.playerId === 'string') return anyObj.playerId;
    if (anyObj.name === 'arrow' && typeof anyObj.arrowId === 'string') return anyObj.arrowId;
    if (typeof anyObj.customId === 'string') return anyObj.customId;
    const nameOrType = (anyObj.name as string) || (anyObj.type as string);
    return nameOrType || null;
  }

  private interpolateKeyframes(phase: AnimationPhase, progress: number): void {
    const objects = this.canvas.getObjects();
    
    objects.forEach(obj => {
      const objectId = this.getStableObjectId(obj);
      const objectKeyframes = objectId ? phase.keyframes.filter(kf => kf.objectId === objectId) : [];
      if (objectKeyframes.length === 0) return;

      // Encontrar keyframes relevantes para o progresso atual
      const sortedKeyframes = objectKeyframes.sort((a, b) => a.timestamp - b.timestamp);
      const currentTime = progress * phase.duration;

      let fromKeyframe: Keyframe | null = null;
      let toKeyframe: Keyframe | null = null;

      for (let i = 0; i < sortedKeyframes.length; i++) {
        if (sortedKeyframes[i].timestamp <= currentTime) {
          fromKeyframe = sortedKeyframes[i];
        }
        if (sortedKeyframes[i].timestamp >= currentTime) {
          toKeyframe = sortedKeyframes[i];
          break;
        }
      }

      if (fromKeyframe && toKeyframe) {
        const keyframeProgress = (currentTime - fromKeyframe.timestamp) / 
          (toKeyframe.timestamp - fromKeyframe.timestamp);
        
        // Interpolar propriedades
        const left = this.lerp(fromKeyframe.properties.left, toKeyframe.properties.left, keyframeProgress);
        const top = this.lerp(fromKeyframe.properties.top, toKeyframe.properties.top, keyframeProgress);
        const opacity = this.lerp(fromKeyframe.properties.opacity || 1, toKeyframe.properties.opacity || 1, keyframeProgress);
        const angle = this.lerp(fromKeyframe.properties.angle || 0, toKeyframe.properties.angle || 0, keyframeProgress);

        obj.set({
          left,
          top,
          opacity,
          angle,
        });
      }
    });

    this.canvas.renderAll();
  }

  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  getPhases(): AnimationPhase[] {
    return this.phases;
  }

  getCurrentPhaseIndex(): number {
    return this.currentPhaseIndex;
  }

  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  clearPhases(): void {
    this.phases = [];
    this.currentPhaseIndex = 0;
    this.stop();
  }
}
