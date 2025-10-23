"use client";

import { useState, useEffect } from "react";
import { Play, Pause, Square, Plus, Trash2 } from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { AnimationPhase } from "@/types";

interface AnimationTimelineProps {
  phases: AnimationPhase[];
  currentPhaseIndex: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onAddPhase: () => void;
  onDeletePhase: (phaseId: string) => void;
  onSelectPhase: (index: number) => void;
}

export default function AnimationTimeline({
  phases,
  currentPhaseIndex,
  isPlaying,
  onPlay,
  onPause,
  onStop,
  onAddPhase,
  onDeletePhase,
  onSelectPhase,
}: AnimationTimelineProps) {
  const [newPhaseName, setNewPhaseName] = useState("");

  const handleAddPhase = () => {
    if (newPhaseName.trim()) {
      onAddPhase();
      setNewPhaseName("");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Timeline de Animação
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={isPlaying ? onPause : onPlay}
            className="btn btn-primary flex items-center gap-2"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? "Pausar" : "Play"}
          </button>
          <button
            onClick={onStop}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Square className="w-4 h-4" />
            Stop
          </button>
        </div>
      </div>

      {/* Adicionar Nova Fase */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={newPhaseName}
          onChange={(e) => setNewPhaseName(e.target.value)}
          placeholder="Nome da fase..."
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <button
          onClick={handleAddPhase}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar Fase
        </button>
      </div>

      {/* Lista de Fases */}
      <div className="space-y-2">
        {phases.map((phase, index) => (
          <div
            key={phase.id}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              currentPhaseIndex === index
                ? "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700"
                : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => onSelectPhase(index)}
                className={`w-4 h-4 rounded-full border-2 ${
                  currentPhaseIndex === index
                    ? "bg-blue-600 border-blue-600"
                    : "border-gray-400 dark:border-gray-500"
                }`}
              />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {phase.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {phase.keyframes.length} keyframes • {(phase.duration / 1000).toFixed(1)}s
                </p>
              </div>
            </div>
            <button
              onClick={() => onDeletePhase(phase.id)}
              className="btn btn-danger p-2"
              title="Eliminar fase"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {phases.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>Nenhuma fase de animação criada.</p>
            <p className="text-sm">Adicione uma fase para começar a criar animações.</p>
          </div>
        )}
      </div>
    </div>
  );
}

