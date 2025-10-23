"use client";

import { useState, useRef } from "react";
import { fabric } from "fabric";
import PitchCanvas from "@/components/pitch/PitchCanvas";
import AnimationTimeline from "@/components/sidebar/AnimationTimeline";
import { useEditorStore } from "@/store/editor-store";
import { FORMATIONS } from "@/lib/formations";
import { AnimationManager } from "@/lib/fabric/animation-manager";
import { AnimationPhase } from "@/types";
import { useAutoSave } from "@/hooks/useAutoSave";
import { TacticsStorage } from "@/lib/storage/tactics-storage";
import { ExportManager } from "@/lib/export/export-manager";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import PlayersSidebar from "@/components/ui/PlayersSidebar";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Save, Download, Play, Pause, FileText, Image, Trash2, Maximize2, Minimize2 } from "lucide-react";

export default function EditorPage() {
  const { state, setSelectedTool, setSelectedFormation, setZoomMode, setPlayerName } = useEditorStore();
  const [tacticName, setTacticName] = useState("Nova Tática");
  const [animationManager, setAnimationManager] = useState<AnimationManager | null>(null);
  const [phases, setPhases] = useState<AnimationPhase[]>([]);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [canvasPlayers, setCanvasPlayers] = useState<any[]>([]);
  const canvasRef = useRef<fabric.Canvas | null>(null);


  const handleDeleteSelected = () => {
    if (canvasRef.current) {
      const activeObject = canvasRef.current.getActiveObject();
      if (activeObject && activeObject.name !== 'field-marking') {
        canvasRef.current.remove(activeObject);
        canvasRef.current.renderAll();
      }
    }
  };

  const handleToggleZoomMode = () => {
    const newMode = state.zoomMode === "full" ? "half" : "full";
    setZoomMode(newMode);
  };

  const handleAnimationManagerReady = (manager: AnimationManager) => {
    setAnimationManager(manager);
  };

  const handleCanvasReady = (canvas: fabric.Canvas) => {
    canvasRef.current = canvas;
  };

  const handlePlayersUpdate = (players: any[]) => {
    setCanvasPlayers(players);
  };

  const handlePlayerNameChange = (playerIndex: number, newName: string) => {
    if (canvasRef.current) {
      const players = canvasRef.current.getObjects().filter(obj => obj.name === "player-group");
      if (players[playerIndex]) {
        const player = players[playerIndex] as any;
        
        // Usar o método updatePlayerName se disponível
        if (player.updatePlayerName) {
          player.updatePlayerName(newName);
        } else {
          // Fallback para método manual
          player.playerName = newName;
          const textObject = player.getObjects().find((obj: any) => obj.type === 'text');
          if (textObject) {
            textObject.set('text', newName);
          }
        }
        
        // Salvar nome no store para preservar entre mudanças de formação
        setPlayerName(player.playerNumber, newName);
        
        canvasRef.current.renderAll();
        
        // Atualizar estado local
        setCanvasPlayers(prev => prev.map((p, index) => 
          index === playerIndex ? { ...p, name: newName } : p
        ));
      }
    }
  };

  const handleSaveTactic = () => {
    if (!canvasRef.current || !tacticName.trim()) return;

    const canvasData = TacticsStorage.serializeCanvas(canvasRef.current);
    const thumbnail = TacticsStorage.generateThumbnail(canvasRef.current);
    
    const tactic = {
      id: crypto.randomUUID(),
      name: tacticName,
      formation: state.selectedFormation,
      createdAt: new Date(),
      updatedAt: new Date(),
      canvasData,
      animations: phases,
      thumbnail,
    };

    TacticsStorage.saveTactic(tactic);
    alert("Tática guardada com sucesso!");
  };

  const handlePlay = () => {
    if (animationManager) {
      animationManager.play(currentPhaseIndex);
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (animationManager) {
      animationManager.pause();
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (animationManager) {
      animationManager.stop();
      setIsPlaying(false);
      setCurrentPhaseIndex(0);
    }
  };

  const handleAddPhase = () => {
    if (animationManager) {
      const phase = animationManager.addPhase(`Fase ${phases.length + 1}`);
      setPhases([...phases, phase]);
    }
  };

  const handleDeletePhase = (phaseId: string) => {
    if (animationManager) {
      const updatedPhases = phases.filter(p => p.id !== phaseId);
      setPhases(updatedPhases);
      animationManager.clearPhases();
      updatedPhases.forEach(phase => animationManager.addPhase(phase.name, phase.duration));
    }
  };

  const handleSelectPhase = (index: number) => {
    setCurrentPhaseIndex(index);
  };

  const handleCaptureKeyframe = () => {
    if (animationManager && phases.length > 0) {
      const currentPhase = phases[currentPhaseIndex];
      animationManager.captureCurrentPositions(currentPhase.id);
      setPhases([...phases]); // Trigger re-render
    }
  };

  const handleExportPNG = async () => {
    if (!canvasRef.current) return;
    try {
      await ExportManager.exportToPNG(canvasRef.current, `${tacticName}.png`);
    } catch (error) {
      alert("Erro ao exportar PNG");
    }
  };

  const handleExportJPG = async () => {
    if (!canvasRef.current) return;
    try {
      await ExportManager.exportToJPG(canvasRef.current, `${tacticName}.jpg`);
    } catch (error) {
      alert("Erro ao exportar JPG");
    }
  };

  const handleExportPDF = async () => {
    if (!canvasRef.current) return;
    try {
      const tactic = {
        id: crypto.randomUUID(),
        name: tacticName,
        formation: state.selectedFormation,
        createdAt: new Date(),
        updatedAt: new Date(),
        canvasData: TacticsStorage.serializeCanvas(canvasRef.current),
        animations: phases,
        thumbnail: TacticsStorage.generateThumbnail(canvasRef.current),
      };
      
      await ExportManager.exportToPDF(tactic, canvasRef.current);
    } catch (error) {
      alert("Erro ao exportar PDF");
    }
  };

  const handleExportJSON = () => {
    if (!canvasRef.current) return;
    try {
      const tactic = {
        id: crypto.randomUUID(),
        name: tacticName,
        formation: state.selectedFormation,
        createdAt: new Date(),
        updatedAt: new Date(),
        canvasData: TacticsStorage.serializeCanvas(canvasRef.current),
        animations: phases,
        thumbnail: TacticsStorage.generateThumbnail(canvasRef.current),
      };
      
      ExportManager.exportToJSON(tactic);
    } catch (error) {
      alert("Erro ao exportar JSON");
    }
  };

  // Auto-save hook
  useAutoSave({
    canvas: canvasRef.current,
    tacticName,
    formation: state.selectedFormation,
    animations: phases,
    enabled: true,
    interval: 30000,
  });

  // Atalhos de teclado
  useKeyboardShortcuts({
    onSave: handleSaveTactic,
    onExportPNG: handleExportPNG,
    onExportPDF: handleExportPDF,
    onPlay: handlePlay,
    onPause: handlePause,
    onStop: handleStop,
    onSelectTool: setSelectedTool,
    onDeleteSelected: handleDeleteSelected,
  });

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Editor de Táticas
            </h1>
            <input
              type="text"
              value={tacticName}
              onChange={(e) => setTacticName(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button 
              onClick={handleSaveTactic}
              className="btn btn-secondary flex items-center gap-2"
              title="Guardar tática (Ctrl+S)"
            >
              <Save className="w-4 h-4" />
              Guardar
            </button>
            <button 
              onClick={handleDeleteSelected}
              className="btn btn-danger flex items-center gap-2"
              title="Eliminar objeto selecionado (Delete)"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="btn btn-primary flex items-center gap-2"
                title="Exportar tática (Ctrl+E)"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        handleExportPNG();
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Image className="w-4 h-4" />
                      PNG
                    </button>
                    <button
                      onClick={() => {
                        handleExportJPG();
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Image className="w-4 h-4" />
                      JPG
                    </button>
                    <button
                      onClick={() => {
                        handleExportPDF();
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      PDF
                    </button>
                    <button
                      onClick={() => {
                        handleExportJSON();
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      JSON
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar Esquerdo */}
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
          <div className="space-y-6">
            {/* Formações */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Formações
              </h3>
              <div className="space-y-2">
                {FORMATIONS.map((formation) => (
                  <button
                    key={formation.id}
                    onClick={() => setSelectedFormation(formation.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      state.selectedFormation === formation.id
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {formation.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Ferramentas */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Ferramentas
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedTool("select")}
                  className={`p-2 rounded-md text-xs transition-colors ${
                    state.selectedTool === "select"
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                  title="Selecionar objetos (1)"
                >
                  Selecionar
                </button>
                <button
                  onClick={() => setSelectedTool("player")}
                  className={`p-2 rounded-md text-xs transition-colors ${
                    state.selectedTool === "player"
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                  title="Adicionar jogador (duplo clique para editar)"
                >
                  Jogador
                </button>
                <button
                  onClick={() => setSelectedTool("arrow")}
                  className={`p-2 rounded-md text-xs transition-colors ${
                    state.selectedTool === "arrow"
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Seta
                </button>
                <button
                  onClick={() => setSelectedTool("line")}
                  className={`p-2 rounded-md text-xs transition-colors ${
                    state.selectedTool === "line"
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Linha
                </button>
                <button
                  onClick={() => setSelectedTool("circle")}
                  className={`p-2 rounded-md text-xs transition-colors ${
                    state.selectedTool === "circle"
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Círculo
                </button>
                <button
                  onClick={() => setSelectedTool("text")}
                  className={`p-2 rounded-md text-xs transition-colors ${
                    state.selectedTool === "text"
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Texto
                </button>
              </div>
            </div>

            {/* Controlos de Campo */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Campo
              </h3>
              <div className="space-y-2">
                <button
                  onClick={handleToggleZoomMode}
                  className={`w-full btn text-xs ${
                    state.zoomMode === "full" 
                      ? "btn-primary" 
                      : "btn-secondary"
                  }`}
                  title={`Modo atual: ${state.zoomMode === "full" ? "Campo Inteiro" : "Meio Campo"}`}
                >
                  {state.zoomMode === "full" ? (
                    <>
                      <Maximize2 className="w-3 h-3 mr-1" />
                      Campo Inteiro
                    </>
                  ) : (
                    <>
                      <Minimize2 className="w-3 h-3 mr-1" />
                      Meio Campo
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Animações */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Animações
              </h3>
              <div className="space-y-2">
                <button
                  onClick={handleCaptureKeyframe}
                  className="w-full btn btn-secondary text-xs"
                  disabled={phases.length === 0}
                >
                  Capturar Posição
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePlay}
                    className="btn btn-secondary flex items-center gap-2"
                    disabled={phases.length === 0}
                  >
                    <Play className="w-4 h-4" />
                    Play
                  </button>
                  <button
                    onClick={handlePause}
                    className="btn btn-secondary flex items-center gap-2"
                    disabled={phases.length === 0}
                  >
                    <Pause className="w-4 h-4" />
                    Pause
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Canvas Principal */}
        <main className="flex-1 p-4">
          <div className="h-full flex items-center justify-center">
            <PitchCanvas 
              className="w-full h-full max-w-none max-h-none" 
              onAnimationManagerReady={handleAnimationManagerReady}
              onCanvasReady={handleCanvasReady}
              onPlayersUpdate={handlePlayersUpdate}
            />
          </div>
        </main>

        {/* Sidebar Direito - Jogadores */}
        <PlayersSidebar 
          className="w-80" 
          players={canvasPlayers}
          onPlayerNameChange={handlePlayerNameChange}
        />
      </div>

      {/* Timeline de Animação */}
      {phases.length > 0 && (
        <AnimationTimeline
          phases={phases}
          currentPhaseIndex={currentPhaseIndex}
          isPlaying={isPlaying}
          onPlay={handlePlay}
          onPause={handlePause}
          onStop={handleStop}
          onAddPhase={handleAddPhase}
          onDeletePhase={handleDeletePhase}
          onSelectPhase={handleSelectPhase}
        />
      )}
    </div>
  );
}
