"use client";

import { useEffect } from "react";
import { EditorState } from "@/types";

interface KeyboardShortcutsProps {
  onSave: () => void;
  onExportPNG: () => void;
  onExportPDF: () => void;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSelectTool: (tool: EditorState["selectedTool"]) => void;
  onDeleteSelected?: () => void;
}

export function useKeyboardShortcuts({
  onSave,
  onExportPNG,
  onExportPDF,
  onPlay,
  onPause,
  onStop,
  onSelectTool,
  onDeleteSelected,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignorar se estiver a escrever em um input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const { ctrlKey, metaKey, key, shiftKey } = event;
      const isCtrlOrCmd = ctrlKey || metaKey;

      // Ctrl/Cmd + S - Guardar
      if (isCtrlOrCmd && key === "s") {
        event.preventDefault();
        onSave();
        return;
      }

      // Ctrl/Cmd + E - Exportar PNG
      if (isCtrlOrCmd && key === "e") {
        event.preventDefault();
        onExportPNG();
        return;
      }

      // Ctrl/Cmd + Shift + E - Exportar PDF
      if (isCtrlOrCmd && shiftKey && key === "E") {
        event.preventDefault();
        onExportPDF();
        return;
      }

      // Espaço - Play/Pause
      if (key === " ") {
        event.preventDefault();
        onPlay();
        return;
      }

      // Escape - Stop
      if (key === "Escape") {
        event.preventDefault();
        onStop();
        return;
      }

      // Ferramentas (1-6)
      if (key >= "1" && key <= "6") {
        event.preventDefault();
        const toolMap: { [key: string]: EditorState["selectedTool"] } = {
          "1": "select",
          "2": "player",
          "3": "arrow",
          "4": "line",
          "5": "circle",
          "6": "text",
        };
        onSelectTool(toolMap[key]);
        return;
      }

      // Delete - Eliminar objeto selecionado
      if (key === "Delete" || key === "Backspace") {
        event.preventDefault();
        onDeleteSelected?.();
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    onSave,
    onExportPNG,
    onExportPDF,
    onPlay,
    onPause,
    onStop,
    onSelectTool,
    onDeleteSelected,
  ]);
}
