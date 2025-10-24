"use client";

import { useEffect, useRef } from "react";
import { fabric } from "fabric";
import { TacticsStorage } from "@/lib/storage/tactics-storage";
import { Tactic } from "@/types";

interface UseAutoSaveProps {
  canvas: fabric.Canvas | null;
  tacticName: string;
  formation: string;
  animations: any[];
  enabled?: boolean;
  interval?: number;
}

export function useAutoSave({
  canvas,
  tacticName,
  formation,
  animations,
  enabled = true,
  interval = 30000, // 30 segundos
}: UseAutoSaveProps) {
  const lastSaveRef = useRef<string>("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveTactic = () => {
    if (!canvas || !tacticName.trim()) return;

    const canvasData = TacticsStorage.serializeCanvas(canvas);
    const thumbnail = TacticsStorage.generateThumbnail(canvas);
    
    const currentState = JSON.stringify({
      canvasData,
      tacticName,
      formation,
      animations,
      thumbnail,
    });

    // Só guarda se houve mudanças
    if (currentState !== lastSaveRef.current) {
      const tactic: Tactic = {
        id: crypto.randomUUID(),
        name: tacticName,
        formation,
        createdAt: new Date(),
        updatedAt: new Date(),
        canvasData,
        animations,
        thumbnail,
      };

      TacticsStorage.saveCurrentTactic(tactic);
      lastSaveRef.current = currentState;
      
      console.log("Auto-save executado:", tacticName);
    }
  };

  useEffect(() => {
    if (!enabled) return;

    const scheduleSave = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        saveTactic();
        scheduleSave(); // Agendar próximo save
      }, interval);
    };

    scheduleSave();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [canvas, tacticName, formation, animations, enabled, interval]);

  // Save imediato quando há mudanças significativas
  useEffect(() => {
    if (enabled && canvas) {
      const handleCanvasChange = () => {
        saveTactic();
      };

      canvas.on("object:added", handleCanvasChange);
      canvas.on("object:removed", handleCanvasChange);
      canvas.on("object:modified", handleCanvasChange);

      return () => {
        canvas.off("object:added", handleCanvasChange);
        canvas.off("object:removed", handleCanvasChange);
        canvas.off("object:modified", handleCanvasChange);
      };
    }
  }, [canvas, enabled]);

  return {
    saveTactic,
  };
}



