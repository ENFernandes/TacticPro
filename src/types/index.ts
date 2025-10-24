export interface Player {
  id: string;
  number: number;
  position: {
    x: number;
    y: number;
  };
  color: string;
  isGoalkeeper: boolean;
}

export interface Formation {
  id: string;
  name: string;
  players: Omit<Player, "id">[];
}

export interface DrawingObject {
  id: string;
  type: "arrow" | "line" | "circle" | "rectangle" | "text";
  properties: Record<string, unknown>;
}

export interface Keyframe {
  objectId: string;
  timestamp: number;
  properties: {
    left: number;
    top: number;
    opacity?: number;
    angle?: number;
  };
}

export interface AnimationPhase {
  id: string;
  name: string;
  duration: number;
  keyframes: Keyframe[];
}

export interface Tactic {
  id: string;
  name: string;
  formation: string;
  createdAt: Date;
  updatedAt: Date;
  canvasData: string;
  animations: AnimationPhase[];
  thumbnail?: string;
}

export interface EditorState {
  selectedTool: "select" | "player" | "arrow" | "line" | "circle" | "rectangle" | "text" | "ball";
  selectedFormation: string;
  isAnimating: boolean;
  currentPhase: number;
  zoomMode: "full" | "half";
}
