import { z } from "zod";

export const PlayerSchema = z.object({
  id: z.string(),
  number: z.number().min(1).max(99),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  color: z.string(),
  isGoalkeeper: z.boolean(),
});

export const KeyframeSchema = z.object({
  objectId: z.string(),
  timestamp: z.number(),
  properties: z.object({
    left: z.number(),
    top: z.number(),
    opacity: z.number().optional(),
    angle: z.number().optional(),
  }),
});

export const AnimationPhaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  duration: z.number(),
  keyframes: z.array(KeyframeSchema),
});

export const TacticSchema = z.object({
  id: z.string(),
  name: z.string(),
  formation: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  canvasData: z.string(),
  animations: z.array(AnimationPhaseSchema),
  thumbnail: z.string().optional(),
});

export type Player = z.infer<typeof PlayerSchema>;
export type Keyframe = z.infer<typeof KeyframeSchema>;
export type AnimationPhase = z.infer<typeof AnimationPhaseSchema>;
export type Tactic = z.infer<typeof TacticSchema>;


