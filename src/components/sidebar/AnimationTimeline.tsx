"use client";

import { useState } from "react";
import { Play, Pause, Square, Plus, Trash2, Mic, MicOff, Clapperboard, CheckSquare, Square as SquareIcon } from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { AnimationPhase } from "@/types";

interface AnimationTimelineProps {
  phases: AnimationPhase[];
  currentPhaseIndex: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onAddPhase: (name: string, durationMs: number) => void;
  onDeletePhase: (phaseId: string) => void;
  onSelectPhase: (index: number) => void;
  onRenamePhase?: (phaseId: string, name: string) => void;
  onChangeDuration?: (phaseId: string, durationMs: number) => void;
  onRecordToggle?: (recording: boolean) => void;
  onSeek?: (ms: number) => void;
  onCapture?: () => void;
  isRecording?: boolean;
  currentTimeMs?: number;
  onExportVideo?: (phaseIndex: number) => void;
  selectedPhaseIds?: string[];
  onTogglePhaseSelected?: (phaseId: string) => void;
  onToggleAllSelected?: () => void;
  onCombineAndExport?: () => void;
  canCombineExport?: boolean;
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
  onRenamePhase,
  onChangeDuration,
  onRecordToggle,
  onSeek,
  onCapture,
  isRecording,
  currentTimeMs,
  onExportVideo,
  selectedPhaseIds = [],
  onTogglePhaseSelected,
  onToggleAllSelected,
  onCombineAndExport,
  canCombineExport,
}: AnimationTimelineProps) {
  const [newPhaseName, setNewPhaseName] = useState("");
  const [newPhaseDuration, setNewPhaseDuration] = useState(2);

  const handleAddPhase = () => {
    if (!newPhaseName.trim()) return;
    const durationMs = Math.max(0.5, newPhaseDuration) * 1000;
    onAddPhase(newPhaseName.trim(), durationMs);
    setNewPhaseName("");
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
          <button
            onClick={onCombineAndExport}
            className="btn btn-primary flex items-center gap-2"
            disabled={!canCombineExport}
            title="Combinar seleção e exportar vídeo"
          >
            <Clapperboard className="w-4 h-4" />
            Combinar e Exportar
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
        <input
          type="number"
          min={0.5}
          step={0.5}
          value={newPhaseDuration}
          onChange={(e) => setNewPhaseDuration(Number(e.target.value))}
          className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          title="Duração (segundos)"
        />
        <button
          onClick={handleAddPhase}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar Fase
        </button>
      </div>

      {/* Controlo de Tempo e Gravação */}
      <div className="flex items-center gap-3 mb-4 sticky bottom-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur p-2 rounded-md">
        <button
          onClick={() => onCapture?.()}
          className="btn btn-secondary text-xs"
          disabled={phases.length === 0}
        >
          Capturar estado
        </button>
        <button
          onClick={() => onRecordToggle?.(!isRecording)}
          className={`btn ${isRecording ? "btn-danger" : "btn-secondary"} flex items-center gap-2 text-xs`}
          disabled={phases.length === 0}
          title={isRecording ? "Parar gravação" : "Iniciar gravação"}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          {isRecording ? "Parar Gravação" : "Gravar"}
        </button>
        <input
          type="range"
          min={0}
          max={isRecording ? (currentTimeMs || 0) + 100 : (phases[currentPhaseIndex]?.duration || 0)}
          step={50}
          value={currentTimeMs || 0}
          onChange={(e) => onSeek?.(Number(e.target.value))}
          className="flex-1"
        />
        <div className="text-xs text-gray-600 dark:text-gray-400 w-24 text-right">
          {((currentTimeMs || 0) / 1000).toFixed(1)}s
        </div>
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
                onClick={() => onTogglePhaseSelected?.(phase.id)}
                className="p-1"
                title="Selecionar fase"
              >
                {selectedPhaseIds.includes(phase.id) ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <SquareIcon className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => onSelectPhase(index)}
                className={`w-4 h-4 rounded-full border-2 ${
                  currentPhaseIndex === index
                    ? "bg-blue-600 border-blue-600"
                    : "border-gray-400 dark:border-gray-500"
                }`}
              />
              <div>
                <div className="flex items-center gap-2">
                  <input
                    className="px-2 py-1 rounded-md bg-transparent border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    value={phase.name}
                    onChange={(e) => onRenamePhase?.(phase.id, e.target.value)}
                  />
                  <input
                    type="number"
                    min={0.5}
                    step={0.5}
                    className="w-20 px-2 py-1 rounded-md bg-transparent border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    value={(phase.duration / 1000).toFixed(1)}
                    onChange={(e) => onChangeDuration?.(phase.id, Number(e.target.value) * 1000)}
                    title="Duração (s)"
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {phase.keyframes.length} keyframes • {(phase.duration / 1000).toFixed(1)}s {selectedPhaseIds.includes(phase.id) ? '• selecionada' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onExportVideo?.(index)}
                className="btn btn-secondary p-2"
                title="Exportar vídeo desta fase"
                disabled={phase.keyframes.length === 0}
              >
                <Clapperboard className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeletePhase(phase.id)}
                className="btn btn-danger p-2"
                title="Eliminar fase"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
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


