"use client";

import { useState, useRef, useEffect } from "react";
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
  const [isRecording, setIsRecording] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const lastAutoCaptureRef = useRef<Record<string, number>>({});
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [canvasPlayers, setCanvasPlayers] = useState<any[]>([]);
  const canvasRef = useRef<fabric.Canvas | null>(null);

  // Filtrar warning de textBaseline 'alphabetical' gerado pelo Fabric/Canvas
  useEffect(() => {
    const originalWarn = console.warn;
    const pattern = "The provided value 'alphabetical' is not a valid enum value of type CanvasTextBaseline.";
    console.warn = (...args: any[]) => {
      if (typeof args[0] === 'string' && args[0].includes(pattern)) return;
      return originalWarn(...args);
    };
    return () => { console.warn = originalWarn; };
  }, []);


  const handleDeleteSelected = () => {
    if (canvasRef.current) {
      const activeObject = canvasRef.current.getActiveObject();
      if (activeObject && activeObject.name !== 'field-marking') {
        canvasRef.current.remove(activeObject);
        canvasRef.current.renderAll();
      }
    }
  };

  // Manter AnimationManager sincronizado após Fast Refresh/HMR
  useEffect(() => {
    if (!animationManager) return;
    const mgrPhases = animationManager.getPhases();
    if (phases.length > 0 && mgrPhases.length !== phases.length) {
      animationManager.setPhases(phases);
    }
  }, [animationManager, phases]);

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
      setCurrentTimeMs(0);
    }
  };

  const handleAddPhase = (name: string, durationMs: number) => {
    if (!animationManager) return;
    const phase = animationManager.addPhase(name || `Fase ${phases.length + 1}`, durationMs || 2000);
    setPhases([...phases, phase]);
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
    setCurrentTimeMs(0);
  };

  const handleCaptureKeyframe = () => {
    if (animationManager && phases.length > 0) {
      const currentPhase = phases[currentPhaseIndex];
      animationManager.captureCurrentPositions(currentPhase.id, currentTimeMs);
      setPhases([...phases]); // Trigger re-render
    }
  };

  const handleRenamePhase = (phaseId: string, name: string) => {
    if (!animationManager) return;
    animationManager.renamePhase(phaseId, name);
    setPhases(animationManager.getPhases().map(p => ({ ...p })));
  };

  const handleChangeDuration = (phaseId: string, durationMs: number) => {
    if (!animationManager) return;
    animationManager.setPhaseDuration(phaseId, durationMs);
    setPhases(animationManager.getPhases().map(p => ({ ...p })));
  };

  const handleRecordToggle = (recording: boolean) => {
    if (!animationManager) return;
    if (recording) {
      // Garantir que existe pelo menos uma fase
      if (phases.length === 0) {
        const created = animationManager.addPhase(`Fase 1`, 4000);
        setPhases([created]);
        setCurrentPhaseIndex(0);
      }
      animationManager.startRecording(currentPhaseIndex);
      setIsRecording(true);
      // Capturar estado inicial t=0
      const currentPhase = phases[currentPhaseIndex];
      const phaseToUse = currentPhase || animationManager.getPhases()[0];
      if (phaseToUse) {
        animationManager.captureCurrentPositions(phaseToUse.id, 0);
        setPhases([...phases]);
      }
    } else {
      // Capturar estado final antes de parar
      const currentPhase = phases[currentPhaseIndex];
      if (currentPhase) {
        const ts = animationManager.getCurrentTimeMs();
        animationManager.captureCurrentPositions(currentPhase.id, ts);
        setPhases([...phases]);
      }
      animationManager.stopRecording();
      setIsRecording(false);
    }
  };

  const handleSeek = (ms: number) => {
    if (!animationManager) return;
    setCurrentTimeMs(ms);
    animationManager.seek(currentPhaseIndex, ms);
  };

  // Captura automática de keyframes quando objetos são modificados durante a gravação
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !animationManager) return;

    const handleObjectModified = (e: any) => {
      if (!isRecording) return;
      const phase = phases[currentPhaseIndex];
      if (!phase) return;
      const obj = e?.target as any;
      if (!obj) return;

      const objectId = obj.playerId || obj.arrowId || obj.customId || obj.name || obj.type;
      if (!objectId) return;
      const nowTs = animationManager.getCurrentTimeMs();
      const lastTs = lastAutoCaptureRef.current[objectId] ?? -Infinity;
      if (nowTs - lastTs < 80) return;
      lastAutoCaptureRef.current[objectId] = nowTs;
      animationManager.addKeyframe(phase.id, objectId, {
        left: obj.left || 0,
        top: obj.top || 0,
        opacity: obj.opacity || 1,
        angle: obj.angle || 0,
      }, nowTs);
      setPhases([...phases]);
    };

    canvas.on('object:modified', handleObjectModified);
    return () => {
      canvas.off('object:modified', handleObjectModified);
    };
  }, [canvasRef.current, isRecording, animationManager, phases, currentPhaseIndex]);

  // Avançar o slider durante reprodução
  useEffect(() => {
    if (!isPlaying || !animationManager) return;
    let raf: number;
    const tick = () => {
      const t = animationManager.getCurrentTimeMs();
      const phase = phases[currentPhaseIndex];
      if (phase) {
        setCurrentTimeMs(Math.min(t, phase.duration));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, animationManager, phases, currentPhaseIndex]);

  // Avançar o slider de tempo enquanto grava
  useEffect(() => {
    if (!isRecording || !animationManager) return;
    let raf: number;
    const tick = () => {
      const t = animationManager.getCurrentTimeMs();
      setCurrentTimeMs(t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isRecording, animationManager, phases, currentPhaseIndex]);

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

  const handleExportVideo = async (phaseIndex: number) => {
    if (!canvasRef.current || !animationManager) return;
    try {
      await ExportManager.exportPhaseToVideo(
        canvasRef.current,
        animationManager,
        phaseIndex,
        { fps: 60, filename: `${tacticName}-fase-${phaseIndex + 1}.webm` }
      );
    } catch (error) {
      alert("Exportação de vídeo não suportada neste browser.");
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
    onToggleRecord: () => handleRecordToggle(!isRecording),
    onCapture: handleCaptureKeyframe,
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
                <button
                  onClick={() => setSelectedTool("ball")}
                  className={`p-2 rounded-md text-xs transition-colors ${
                    state.selectedTool === "ball"
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                  title="Adicionar bola"
                >
                  Bola
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
            isRecording={isRecording}
            currentTimeMs={currentTimeMs}
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
          onRenamePhase={handleRenamePhase}
          onChangeDuration={handleChangeDuration}
          onRecordToggle={handleRecordToggle}
          onSeek={handleSeek}
          onCapture={handleCaptureKeyframe}
          isRecording={isRecording}
          currentTimeMs={currentTimeMs}
          onExportVideo={handleExportVideo}
        />
    </div>
  );
}
