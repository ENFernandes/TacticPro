import { fabric } from "fabric";
import { Keyframe, AnimationPhase } from "@/types";

export class AnimationManager {
  private canvas: fabric.Canvas;
  private phases: AnimationPhase[] = [];
  private currentPhaseIndex = 0;
  private isPlaying = false;
  private animationId: number | null = null;
  private startTime: number = 0;

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

  addKeyframe(phaseId: string, objectId: string, properties: Keyframe["properties"]): void {
    const phase = this.phases.find(p => p.id === phaseId);
    if (!phase) return;

    const keyframe: Keyframe = {
      objectId,
      timestamp: Date.now() - this.startTime,
      properties,
    };

    phase.keyframes.push(keyframe);
  }

  captureCurrentPositions(phaseId: string): void {
    const phase = this.phases.find(p => p.id === phaseId);
    if (!phase) return;

    const objects = this.canvas.getObjects();
    objects.forEach(obj => {
      if (obj.name === "player" || obj.type === "group") {
        const objectId = (obj.name || obj.type || "object") as string;
        this.addKeyframe(phaseId, objectId, {
          left: obj.left || 0,
          top: obj.top || 0,
          opacity: obj.opacity || 1,
          angle: obj.angle || 0,
        });
      }
    });
  }

  play(phaseIndex?: number): void {
    if (phaseIndex !== undefined) {
      this.currentPhaseIndex = phaseIndex;
    }

    const phase = this.phases[this.currentPhaseIndex];
    if (!phase || phase.keyframes.length === 0) return;

    this.isPlaying = true;
    this.startTime = Date.now();

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
  }

  stop(): void {
    this.pause();
    this.currentPhaseIndex = 0;
    this.startTime = 0;
  }

  private interpolateKeyframes(phase: AnimationPhase, progress: number): void {
    const objects = this.canvas.getObjects();
    
    objects.forEach(obj => {
      const objectKeyframes = phase.keyframes.filter(kf => kf.objectId === (obj.name || obj.type || "object"));
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
