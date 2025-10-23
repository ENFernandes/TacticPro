import { create } from "zustand";
import { EditorState } from "@/types";

interface EditorStore {
  state: EditorState;
  playerNames: Record<number, string>; // Mapeia número do jogador para nome
  setSelectedTool: (tool: EditorState["selectedTool"]) => void;
  setSelectedFormation: (formation: string) => void;
  setIsAnimating: (isAnimating: boolean) => void;
  setCurrentPhase: (phase: number) => void;
  setZoomMode: (mode: "full" | "half") => void;
  setPlayerName: (playerNumber: number, name: string) => void;
  resetEditor: () => void;
}

const initialState: EditorState = {
  selectedTool: "select",
  selectedFormation: "4-4-2",
  isAnimating: false,
  currentPhase: 0,
  zoomMode: "full",
};

export const useEditorStore = create<EditorStore>((set) => ({
  state: initialState,
  playerNames: {},

  setSelectedTool: (tool) =>
    set((state) => ({
      state: { ...state.state, selectedTool: tool },
    })),

  setSelectedFormation: (formation) =>
    set((state) => ({
      state: { ...state.state, selectedFormation: formation },
    })),

  setIsAnimating: (isAnimating) =>
    set((state) => ({
      state: { ...state.state, isAnimating },
    })),

  setCurrentPhase: (currentPhase) =>
    set((state) => ({
      state: { ...state.state, currentPhase },
    })),

  setZoomMode: (zoomMode) =>
    set((state) => ({
      state: { ...state.state, zoomMode },
    })),

  setPlayerName: (playerNumber, name) =>
    set((state) => ({
      playerNames: { ...state.playerNames, [playerNumber]: name },
    })),

  resetEditor: () => set({ state: initialState, playerNames: {} }),
}));
