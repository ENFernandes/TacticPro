import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Tactic, TacticSchema } from "./schemas";

interface TacticsStore {
  tactics: Tactic[];
  currentTactic: Tactic | null;
  addTactic: (tactic: Omit<Tactic, "id" | "createdAt" | "updatedAt">) => void;
  updateTactic: (id: string, updates: Partial<Tactic>) => void;
  deleteTactic: (id: string) => void;
  setCurrentTactic: (tactic: Tactic | null) => void;
  loadTactic: (id: string) => Tactic | null;
}

export const useTacticsStore = create<TacticsStore>()(
  persist(
    (set, get) => ({
      tactics: [],
      currentTactic: null,

      addTactic: (tacticData) => {
        const newTactic: Tactic = {
          ...tacticData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          tactics: [...state.tactics, newTactic],
        }));
      },

      updateTactic: (id, updates) => {
        set((state) => ({
          tactics: state.tactics.map((tactic) =>
            tactic.id === id
              ? { ...tactic, ...updates, updatedAt: new Date() }
              : tactic
          ),
          currentTactic:
            state.currentTactic?.id === id
              ? { ...state.currentTactic, ...updates, updatedAt: new Date() }
              : state.currentTactic,
        }));
      },

      deleteTactic: (id) => {
        set((state) => ({
          tactics: state.tactics.filter((tactic) => tactic.id !== id),
          currentTactic:
            state.currentTactic?.id === id ? null : state.currentTactic,
        }));
      },

      setCurrentTactic: (tactic) => {
        set({ currentTactic: tactic });
      },

      loadTactic: (id) => {
        const tactic = get().tactics.find((t) => t.id === id);
        return tactic || null;
      },
    }),
    {
      name: "tactics-storage",
      partialize: (state) => ({ tactics: state.tactics }),
    }
  )
);

