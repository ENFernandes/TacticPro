import { fabric } from "fabric";
import { Tactic, TacticSchema } from "./schemas";

export class TacticsStorage {
  private static readonly STORAGE_KEY = "tactics-storage";
  private static readonly CURRENT_TACTIC_KEY = "current-tactic";

  static saveTactic(tactic: Tactic): void {
    try {
      const tactics = this.getAllTactics();
      const existingIndex = tactics.findIndex(t => t.id === tactic.id);
      
      if (existingIndex >= 0) {
        tactics[existingIndex] = { ...tactic, updatedAt: new Date() };
      } else {
        tactics.push(tactic);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tactics));
    } catch (error) {
      console.error("Erro ao guardar tática:", error);
    }
  }

  static getAllTactics(): Tactic[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const tactics = JSON.parse(stored);
      return tactics.map((tactic: any) => ({
        ...tactic,
        createdAt: new Date(tactic.createdAt),
        updatedAt: new Date(tactic.updatedAt),
      }));
    } catch (error) {
      console.error("Erro ao carregar táticas:", error);
      return [];
    }
  }

  static getTactic(id: string): Tactic | null {
    const tactics = this.getAllTactics();
    return tactics.find(t => t.id === id) || null;
  }

  static deleteTactic(id: string): void {
    try {
      const tactics = this.getAllTactics();
      const filteredTactics = tactics.filter(t => t.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredTactics));
    } catch (error) {
      console.error("Erro ao eliminar tática:", error);
    }
  }

  static saveCurrentTactic(tactic: Tactic): void {
    try {
      localStorage.setItem(this.CURRENT_TACTIC_KEY, JSON.stringify(tactic));
    } catch (error) {
      console.error("Erro ao guardar tática atual:", error);
    }
  }

  static getCurrentTactic(): Tactic | null {
    try {
      const stored = localStorage.getItem(this.CURRENT_TACTIC_KEY);
      if (!stored) return null;

      const tactic = JSON.parse(stored);
      return {
        ...tactic,
        createdAt: new Date(tactic.createdAt),
        updatedAt: new Date(tactic.updatedAt),
      };
    } catch (error) {
      console.error("Erro ao carregar tática atual:", error);
      return null;
    }
  }

  static clearCurrentTactic(): void {
    localStorage.removeItem(this.CURRENT_TACTIC_KEY);
  }

  static exportTactic(tactic: Tactic): string {
    return JSON.stringify(tactic, null, 2);
  }

  static importTactic(jsonString: string): Tactic | null {
    try {
      const tactic = JSON.parse(jsonString);
      const validatedTactic = TacticSchema.parse({
        ...tactic,
        createdAt: new Date(tactic.createdAt),
        updatedAt: new Date(tactic.updatedAt),
      });
      return validatedTactic;
    } catch (error) {
      console.error("Erro ao importar tática:", error);
      return null;
    }
  }

  static generateThumbnail(canvas: fabric.Canvas): string {
    try {
      return canvas.toDataURL({
        format: "png",
        quality: 0.8,
        multiplier: 0.5,
      });
    } catch (error) {
      console.error("Erro ao gerar thumbnail:", error);
      return "";
    }
  }

  static serializeCanvas(canvas: fabric.Canvas): string {
    try {
      return JSON.stringify(canvas.toJSON());
    } catch (error) {
      console.error("Erro ao serializar canvas:", error);
      return "";
    }
  }

  static deserializeCanvas(canvas: fabric.Canvas, jsonString: string): void {
    try {
      const canvasData = JSON.parse(jsonString);
      canvas.loadFromJSON(canvasData, () => {
        canvas.renderAll();
      });
    } catch (error) {
      console.error("Erro ao deserializar canvas:", error);
    }
  }
}


