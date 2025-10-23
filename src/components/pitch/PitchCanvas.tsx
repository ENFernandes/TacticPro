"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { fabric } from "fabric";
import { useEditorStore } from "@/store/editor-store";
import { FORMATIONS } from "@/lib/formations";
import { PlayerObject } from "@/lib/fabric/player-objects";
import { ArrowObject } from "@/lib/fabric/arrow-objects";
import { AnimationManager } from "@/lib/fabric/animation-manager";
import PlayerEditor from "@/components/ui/PlayerEditor";

interface PitchCanvasProps {
  className?: string;
  animationManager?: AnimationManager;
  onAnimationManagerReady?: (manager: AnimationManager) => void;
  onCanvasReady?: (canvas: fabric.Canvas) => void;
  onPlayersUpdate?: (players: any[]) => void;
}

export default function PitchCanvas({ className, onAnimationManagerReady, onCanvasReady, onPlayersUpdate }: PitchCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const animationManagerRef = useRef<AnimationManager | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<PlayerObject | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 1200, height: 800 });
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  const fieldImageRef = useRef<fabric.Image | null>(null);
  const { state, setZoomMode, playerNames, setPlayerName } = useEditorStore();

  // Função para gerenciar teclas (Delete/Backspace/E)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Se estamos editando texto, desativar completamente a função de eliminar
    if (isEditingText) {
      console.log('Editando texto - função de eliminar desativada');
      return;
    }
    
    // Função de eliminar elementos (só funciona quando NÃO estamos editando texto)
    if (e.key === 'Delete' || e.key === 'Backspace') {
      const activeObject = fabricCanvasRef.current?.getActiveObject();
      if (activeObject && activeObject.name !== 'field-marking') {
        console.log('Eliminando elemento:', activeObject.name);
        fabricCanvasRef.current?.remove(activeObject);
        fabricCanvasRef.current?.renderAll();
      }
    } else if (e.key === 'e' || e.key === 'E') {
      // Tecla E para editar texto
      const activeObject = fabricCanvasRef.current?.getActiveObject();
      if (activeObject && activeObject.type === 'text') {
        console.log('Tecla E pressionada - tentando editar texto');
        const textObject = activeObject as fabric.Text;
        fabricCanvasRef.current?.setActiveObject(textObject);
        fabricCanvasRef.current?.renderAll();
        
        // Tentar entrar no modo de edição
        setTimeout(() => {
          if (textObject && typeof (textObject as any).enterEditing === 'function') {
            (textObject as any).enterEditing();
          }
        }, 100);
      }
    }
  }, [isEditingText]);

  // useEffect para gerenciar o event listener de teclado
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  // Função para obter jogadores do canvas
  const getCanvasPlayers = () => {
    if (!fabricCanvasRef.current) return [];
    
    const players = fabricCanvasRef.current.getObjects().filter(obj => obj.name === "player-group");
    return players.map((player, index) => ({
      id: `player-${index}`,
      number: index + 1,
      name: (player as any).playerName || `Jogador ${index + 1}`,
      position: (player as any).position || "CM",
      fabricObject: player
    }));
  };

  // Função para atualizar nome do jogador no canvas
  const updatePlayerName = (playerIndex: number, newName: string) => {
    if (!fabricCanvasRef.current) return;
    
    const players = fabricCanvasRef.current.getObjects().filter(obj => obj.name === "player-group");
    if (players[playerIndex]) {
      const player = players[playerIndex] as PlayerObject;
      
      // Usar o método updatePlayerName da classe PlayerObject
      player.updatePlayerName(newName);
      
      // Salvar nome no store para preservar entre mudanças de formação
      if (setPlayerName) {
        setPlayerName(player.playerNumber, newName);
      }
      
      fabricCanvasRef.current.renderAll();
      
      // Notificar mudanças
      if (onPlayersUpdate) {
        onPlayersUpdate(getCanvasPlayers());
      }
    }
  };

  // Função para calcular dimensões responsivas
  const calculateCanvasDimensions = () => {
    const container = canvasRef.current?.parentElement;
    if (!container) return { width: 1200, height: 800 };
    
    // Obter dimensões do container
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Se o container não tem dimensões válidas, usar dimensões padrão
    if (containerWidth <= 0 || containerHeight <= 0) {
      const isHalfField = state?.zoomMode === 'half';
      return isHalfField ? { width: 1000, height: 1000 } : { width: 1200, height: 800 };
    }
    
    // Verificar se é meio campo
    const isHalfField = state?.zoomMode === 'half';
    
    if (isHalfField) {
      // Para meio campo, usar dimensões retangulares (1200x800)
      const idealRatio = 3 / 2; // 600x400 = 3:2
      const containerRatio = containerWidth / containerHeight;
      
      let width, height;
      
      if (containerRatio > idealRatio) {
        // Container é mais largo que o ideal
        height = Math.min(containerHeight - 40, 800);
        width = height * idealRatio;
      } else {
        // Container é mais alto que o ideal
        width = Math.min(containerWidth - 40, 1200);
        height = width / idealRatio;
      }
      
      return { width, height };
    }
    
    // Calcular proporção ideal do campo (16:10 para campo de futebol)
    const idealRatio = 16 / 10;
    const containerRatio = containerWidth / containerHeight;
    
    let width, height;
    
    if (containerRatio > idealRatio) {
      // Container é mais largo que o ideal - usar altura como referência
      height = Math.max(containerHeight - 40, 300); // Mais margem
      width = height * idealRatio;
    } else {
      // Container é mais alto que o ideal - usar largura como referência
      width = Math.max(containerWidth - 40, 400); // Mais margem
      height = width / idealRatio;
    }
    
    // Garantir dimensões mínimas e máximas
    width = Math.max(Math.min(width, 1600), 400);
    height = Math.max(Math.min(height, 1000), 300);
    
    return { width, height };
  };


  // Função fallback para desenhar campo manualmente
  const drawPitchFallback = (canvas: fabric.Canvas, offsetX: number, offsetY: number, fieldWidth: number, fieldHeight: number) => {
    console.log('Desenhando campo manualmente como fallback');
    
    // Verificar se o canvas ainda está válido
    if (!canvas || !canvas.getContext()) {
      console.warn('Canvas não está válido para fallback');
      return;
    }
    
    // Verificar se o canvas ainda é o mesmo
    if (canvas !== fabricCanvasRef.current) {
      console.warn('Canvas mudou durante fallback, ignorando');
      return;
    }
    
    // Calcular dimensões proporcionais baseadas no tamanho fixo do campo
    const centerX = fieldWidth / 2 + offsetX;
    const centerY = fieldHeight / 2 + offsetY;
    const goalAreaWidth = Math.max(fieldWidth * 0.05, 20);
    const goalAreaHeight = Math.max(fieldHeight * 0.15, 60);
    const smallAreaWidth = Math.max(fieldWidth * 0.02, 8);
    const smallAreaHeight = Math.max(fieldHeight * 0.05, 20);
    const centerCircleRadius = Math.max(Math.min(fieldWidth, fieldHeight) * 0.08, 30);
    const penaltySpotDistance = Math.max(fieldWidth * 0.04, 15);
    const penaltyArcRadius = Math.max(fieldWidth * 0.04, 15);
    const strokeWidth = Math.max(Math.min(fieldWidth, fieldHeight) * 0.002, 1);
    const goalWidth = Math.max(fieldHeight * 0.04, 8);
    const goalHeight = Math.max(fieldHeight * 0.04, 15);

    // Linhas do campo
    const lines = [
      // Linha central (vertical)
      new fabric.Line([centerX, offsetY, centerX, fieldHeight + offsetY], {
        stroke: "#FFFFFF",
        strokeWidth: strokeWidth,
        selectable: false,
        evented: false,
        name: "field-marking",
      }),
      // Círculo central
      new fabric.Circle({
        left: centerX - centerCircleRadius,
        top: centerY - centerCircleRadius,
        radius: centerCircleRadius,
        stroke: "#FFFFFF",
        strokeWidth: strokeWidth,
        fill: "",
        selectable: false,
        evented: false,
        name: "field-marking",
      }),
      // Ponto central
      new fabric.Circle({
        left: centerX - strokeWidth,
        top: centerY - strokeWidth,
        radius: strokeWidth,
        fill: "#FFFFFF",
        selectable: false,
        evented: false,
        name: "field-marking",
      }),
      // Área de grande penalidade esquerda
      new fabric.Rect({
        left: offsetX,
        top: centerY - goalAreaHeight / 2,
        width: goalAreaWidth,
        height: goalAreaHeight,
        stroke: "#FFFFFF",
        strokeWidth: strokeWidth,
        fill: "",
        selectable: false,
        evented: false,
        name: "field-marking",
      }),
      // Área de pequena penalidade esquerda
      new fabric.Rect({
        left: offsetX,
        top: centerY - smallAreaHeight / 2,
        width: smallAreaWidth,
        height: smallAreaHeight,
        stroke: "#FFFFFF",
        strokeWidth: strokeWidth,
        fill: "",
        selectable: false,
        evented: false,
        name: "field-marking",
      }),
      // Baliza esquerda
      new fabric.Rect({
        left: offsetX - strokeWidth,
        top: centerY - goalHeight / 2,
        width: strokeWidth * 2,
        height: goalHeight,
        fill: "#FFFFFF",
        selectable: false,
        evented: false,
        name: "field-marking",
      }),
      // Área de grande penalidade direita
      new fabric.Rect({
        left: offsetX + fieldWidth - goalAreaWidth,
        top: centerY - goalAreaHeight / 2,
        width: goalAreaWidth,
        height: goalAreaHeight,
        stroke: "#FFFFFF",
        strokeWidth: strokeWidth,
        fill: "",
        selectable: false,
        evented: false,
        name: "field-marking",
      }),
      // Área de pequena penalidade direita
      new fabric.Rect({
        left: offsetX + fieldWidth - smallAreaWidth,
        top: centerY - smallAreaHeight / 2,
        width: smallAreaWidth,
        height: smallAreaHeight,
        stroke: "#FFFFFF",
        strokeWidth: strokeWidth,
        fill: "",
        selectable: false,
        evented: false,
        name: "field-marking",
      }),
      // Baliza direita
      new fabric.Rect({
        left: offsetX + fieldWidth - strokeWidth,
        top: centerY - goalHeight / 2,
        width: strokeWidth * 2,
        height: goalHeight,
        fill: "#FFFFFF",
        selectable: false,
        evented: false,
        name: "field-marking",
      }),
      // Pontos de penálti
      new fabric.Circle({
        left: offsetX + penaltySpotDistance - strokeWidth,
        top: centerY - strokeWidth,
        radius: strokeWidth,
        fill: "#FFFFFF",
        selectable: false,
        evented: false,
        name: "field-marking",
      }),
      new fabric.Circle({
        left: offsetX + fieldWidth - penaltySpotDistance - strokeWidth,
        top: centerY - strokeWidth,
        radius: strokeWidth,
        fill: "#FFFFFF",
        selectable: false,
        evented: false,
        name: "field-marking",
      }),
      // Arcos de penálti
      new fabric.Circle({
        left: offsetX + penaltySpotDistance - penaltyArcRadius,
        top: centerY - penaltyArcRadius,
        radius: penaltyArcRadius,
        stroke: "#FFFFFF",
        strokeWidth: strokeWidth,
        fill: "",
        startAngle: -Math.PI / 2,
        endAngle: Math.PI / 2,
        selectable: false,
        evented: false,
        name: "field-marking",
      }),
      new fabric.Circle({
        left: offsetX + fieldWidth - penaltySpotDistance - penaltyArcRadius,
        top: centerY - penaltyArcRadius,
        radius: penaltyArcRadius,
        stroke: "#FFFFFF",
        strokeWidth: strokeWidth,
        fill: "",
        startAngle: Math.PI / 2,
        endAngle: 3 * Math.PI / 2,
        selectable: false,
        evented: false,
        name: "field-marking",
      }),
    ];

    // Adicionar fundo verde
    const background = new fabric.Rect({
      left: offsetX,
      top: offsetY,
      width: fieldWidth,
      height: fieldHeight,
      fill: "#2D8B3C",
      selectable: false,
      evented: false,
      name: "field-background",
    });

    canvas.add(background);
    lines.forEach((line) => canvas.add(line));
    canvas.sendToBack(background);
    
    try {
      canvas.renderAll();
      console.log('Campo fallback desenhado com sucesso');
    } catch (error) {
      console.error('Erro ao renderizar campo fallback:', error);
    }
  };

  // Função para carregar a imagem do campo de futebol
  const drawPitch = (canvas: fabric.Canvas) => {
    if (!canvas) {
      console.error('Canvas não está disponível');
      return;
    }

    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();

    // Verificar se é meio campo baseado no zoomMode
    const isHalfField = state?.zoomMode === 'half';
    
    // Dimensões do campo baseadas no modo
    const fieldWidth =   1000; // Meio campo: 600px, Campo inteiro: 1000px
    const fieldHeight =   600; // Meio campo: 400px, Campo inteiro: 600px
    
    // Calcular offset para centralizar o campo no canvas
    const offsetX = (canvasWidth - fieldWidth) / 2;
    const offsetY = (canvasHeight - fieldHeight) / 2;

    // Determinar qual imagem carregar
    const imagePath = isHalfField ? '/imagens/pitch-half.jpg' : '/imagens/pitch-full.jpg';
    console.log(`Carregando ${isHalfField ? 'meio campo' : 'campo inteiro'}: ${imagePath}`);

    // Se já temos a imagem carregada, apenas reposicionar
    if (fieldImageRef.current && canvas) {
      // Verificar se a imagem ainda existe no canvas
      const existingImage = canvas.getObjects().find(obj => obj.name === "field-image");
      
      if (existingImage) {
        // Atualizar posição da imagem existente
        existingImage.set({
          left: offsetX,
          top: offsetY,
          width: fieldWidth,
          height: fieldHeight,
        });
        try {
          canvas.renderAll();
          console.log('Imagem reposicionada com sucesso - dimensões:', fieldWidth, 'x', fieldHeight);
        } catch (error) {
          console.error('Erro ao renderizar canvas:', error);
        }
      } else {
        // Imagem foi removida, recarregar
        console.log('Imagem foi removida, recarregando...');
        fieldImageRef.current = null;
        // Continuar para recarregar a imagem
      }
      
      if (existingImage) {
        return;
      }
    }

    // Remover imagem existente do campo
    const existingField = canvas.getObjects().filter(obj => obj.name === "field-image");
    existingField.forEach(obj => canvas.remove(obj));

    // Carregar imagem do campo com delay para garantir que o canvas está pronto
    setIsImageLoading(true);
    console.log(`Tentando carregar imagem: ${imagePath}`);
    
    // Delay para garantir que o canvas está completamente inicializado
    setTimeout(() => {
      // Verificar novamente se o canvas ainda está válido
      if (!canvas || !canvas.getContext() || canvas !== fabricCanvasRef.current) {
        console.warn('Canvas não está válido para carregar imagem');
        setIsImageLoading(false);
        drawPitchFallback(canvas, offsetX, offsetY, fieldWidth, fieldHeight);
        return;
      }
      
      // Tentar carregar a imagem com timeout
      const imageTimeout = setTimeout(() => {
        setIsImageLoading(false);
        console.error('Timeout ao carregar imagem do campo');
        // Fallback: desenhar campo manualmente
        drawPitchFallback(canvas, offsetX, offsetY, fieldWidth, fieldHeight);
      }, 10000); // 10 segundos timeout

      fabric.Image.fromURL(imagePath, (img) => {
        clearTimeout(imageTimeout);
        setIsImageLoading(false);
        console.log('Callback da imagem executado, img:', img);
        
        // Verificar se o canvas ainda está disponível
        if (!canvas || !fabricCanvasRef.current) {
          console.warn('Canvas não está mais disponível, ignorando carregamento da imagem');
          return;
        }

        if (img) {
          // Guardar referência da imagem
          fieldImageRef.current = img;
          
          // Para meio campo, usar as dimensões originais da imagem para evitar corte
          let finalWidth = fieldWidth;
          let finalHeight = fieldHeight;
          
          if (isHalfField && img.width && img.height) {
            // Usar dimensões originais da imagem para meio campo
            finalWidth = img.width;
            finalHeight = img.height;
            
            // Recalcular offset para centralizar
            const finalOffsetX = (canvasWidth - finalWidth) / 2;
            const finalOffsetY = (canvasHeight - finalHeight) / 2;
            
            img.set({
              left: finalOffsetX,
              top: finalOffsetY,
              width: finalWidth,
              height: finalHeight,
              selectable: false,
              evented: false,
              name: "field-image",
              originX: 'left',
              originY: 'top',
            });
          } else {
            // Para campo inteiro, usar dimensões fixas
            img.set({
              left: offsetX,
              top: offsetY,
              width: fieldWidth,
              height: fieldHeight,
              selectable: false,
              evented: false,
              name: "field-image",
              originX: 'left',
              originY: 'top',
            });
          }

          try {
            // Verificar se o canvas ainda está válido
            if (!canvas || !canvas.getContext()) {
              console.warn('Canvas não está mais válido, ignorando adição da imagem');
              return;
            }

            // Verificar se o canvas ainda é o mesmo
            if (canvas !== fabricCanvasRef.current) {
              console.warn('Canvas mudou durante carregamento, ignorando');
              return;
            }

            // Adicionar ao canvas e enviar para trás
            canvas.add(img);
            canvas.sendToBack(img);
            canvas.renderAll();
            console.log('Imagem do campo carregada com sucesso - dimensões:', fieldWidth, 'x', fieldHeight);
          } catch (error) {
            console.error('Erro ao adicionar imagem ao canvas:', error);
            // Fallback: desenhar campo manualmente
            drawPitchFallback(canvas, offsetX, offsetY, fieldWidth, fieldHeight);
          }
        } else {
          console.error('Erro ao carregar imagem do campo - img é null');
          // Fallback: desenhar campo manualmente
          drawPitchFallback(canvas, offsetX, offsetY, fieldWidth, fieldHeight);
        }
      }, {
        crossOrigin: 'anonymous'
      });
    }, 100); // Delay de 100ms para garantir que o canvas está pronto
  };

  // Função para carregar formação - usando useCallback para evitar re-renderizações desnecessárias
  const loadFormation = useCallback((canvas: fabric.Canvas, formationId: string) => {
    const formation = FORMATIONS.find((f) => f.id === formationId);
    if (!formation) return;

    // Limpar jogadores existentes
    const existingPlayers = canvas.getObjects().filter(
      (obj) => obj.name === "player-group"
    );
    existingPlayers.forEach((player) => canvas.remove(player));

    // Dimensões fixas do campo para posicionamento dos jogadores
    const fieldWidth = 1000;
    const fieldHeight = 600;
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const offsetX = (canvasWidth - fieldWidth) / 2;
    const offsetY = (canvasHeight - fieldHeight) / 2;

    // Adicionar novos jogadores usando PlayerObject personalizado
    formation.players.forEach((playerData) => {
      // Usar nome preservado se existir, senão usar nome padrão
      const preservedName = playerNames?.[playerData.number];
      const playerName = preservedName || `Jogador ${playerData.number}`;
      
      const player = new PlayerObject({
        left: (playerData.position.x / 100) * fieldWidth + offsetX,
        top: (playerData.position.y / 100) * fieldHeight + offsetY,
        playerNumber: playerData.number,
        playerName: playerName,
        isGoalkeeper: playerData.isGoalkeeper,
        playerId: `player-${playerData.number}`,
        playerColor: playerData.color,
      });

      canvas.add(player);
    });

    canvas.renderAll();
  }, [playerNames]);

  // Hook para redimensionar o canvas quando o browser muda de tamanho
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    let resizeObserver: ResizeObserver | null = null;
    
    const handleResize = () => {
      // Debounce para evitar redimensionamentos excessivos
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
      const newDimensions = calculateCanvasDimensions();
        setCanvasDimensions(prevDimensions => {
          // Atualizar se as dimensões mudaram significativamente (threshold menor)
          const widthDiff = Math.abs(prevDimensions.width - newDimensions.width);
          const heightDiff = Math.abs(prevDimensions.height - newDimensions.height);
          
          if (widthDiff > 2 || heightDiff > 2) {
            // Manter a imagem do campo durante o redimensionamento
            if (fabricCanvasRef.current && fieldImageRef.current) {
              const canvas = fabricCanvasRef.current;
              const canvasWidth = canvas.getWidth();
              const canvasHeight = canvas.getHeight();
              const isHalfField = state?.zoomMode === 'half';
              const fieldWidth = isHalfField ? 500 : 1000;
              const fieldHeight = isHalfField ? 500 : 600;
              const offsetX = (canvasWidth - fieldWidth) / 2;
              const offsetY = (canvasHeight - fieldHeight) / 2;
              
              // Atualizar posição da imagem
              const fieldImage = canvas.getObjects().find(obj => obj.name === "field-image");
              if (fieldImage) {
                fieldImage.set({
                  left: offsetX,
                  top: offsetY,
                  width: fieldWidth,
                  height: fieldHeight,
                });
                canvas.renderAll();
              }
            }
            return newDimensions;
          }
          return prevDimensions;
        });
      }, 50); // Reduzir debounce para resposta mais rápida
    };

    // Configurar ResizeObserver quando o canvas estiver disponível
    const setupResizeObserver = () => {
      const container = canvasRef.current?.parentElement;
      if (container && !resizeObserver) {
        resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            handleResize();
          }
        });
        resizeObserver.observe(container);
      }
    };

    // Tentar configurar imediatamente
    setupResizeObserver();
    
    // Se não conseguir, tentar novamente após um pequeno delay
    if (!resizeObserver) {
      const retryTimeout = setTimeout(setupResizeObserver, 100);
      return () => {
        clearTimeout(retryTimeout);
        clearTimeout(resizeTimeout);
        window.removeEventListener('resize', handleResize);
        resizeObserver?.disconnect();
      };
    }

    // Escutar mudanças na janela
    window.addEventListener('resize', handleResize);
    
    // Calcular dimensões iniciais
    handleResize();

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
    };
  }, [isLoaded]); // Adicionar isLoaded como dependência


  // Hook para criar o canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    try {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasDimensions.width,
      height: canvasDimensions.height,
      backgroundColor: "transparent",
      selection: true,
      perPixelTargetFind: true,
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;

    // Criar AnimationManager
    const animationManager = new AnimationManager(canvas);
    animationManagerRef.current = animationManager;
    onAnimationManagerReady?.(animationManager);

    // Notificar que o canvas está pronto
    onCanvasReady?.(canvas);

    // Desenhar o campo de futebol
    drawPitch(canvas);

    // Carregar formação inicial
    loadFormation(canvas, state?.selectedFormation);


    // Adicionar eventos para edição de texto
    canvas.on('text:editing:entered', (e) => {
      console.log('Entrando no modo de edição de texto');
    });

    canvas.on('text:editing:exited', (e) => {
      console.log('Saindo do modo de edição de texto');
    });

    // Adicionar evento de clique simples para editar texto
    canvas.on('mouse:down', (e) => {
        const activeObject = canvas.getActiveObject();
      if (activeObject && activeObject.type === 'text' && e.e.detail === 2) {
        // Duplo clique detectado
        console.log('Duplo clique em texto detectado');
        const textObject = activeObject as fabric.Text;
        canvas.setActiveObject(textObject);
          canvas.renderAll();
        }
    });

    // Adicionar duplo clique para editar jogadores e texto
    canvas.on('mouse:dblclick', (e) => {
      const activeObject = canvas.getActiveObject();
      if (activeObject && activeObject.name === 'player-group') {
        setEditingPlayer(activeObject as PlayerObject);
      } else if (activeObject && activeObject.type === 'text') {
        // Entrar no modo de edição de texto usando abordagem mais simples
        console.log('Duplo clique em texto - tentando editar');
        const textObject = activeObject as fabric.Text;
        
        // Abordagem mais direta: usar o método nativo do Fabric.js
        canvas.setActiveObject(textObject);
        canvas.renderAll();
        
        // Tentar entrar no modo de edição usando o método correto
        setTimeout(() => {
          try {
            // Usar o método correto do Fabric.js para edição de texto
            if (textObject && (textObject as any).enterEditing) {
              (textObject as any).enterEditing();
            } else {
              // Se não funcionar, tentar uma abordagem alternativa
              console.log('Método enterEditing não disponível, tentando abordagem alternativa');
              
              // Criar um input temporário para edição
              const input = document.createElement('input');
              input.type = 'text';
              input.value = textObject.text || '';
              input.style.position = 'absolute';
              input.style.left = (textObject.left || 0) + 'px';
              input.style.top = (textObject.top || 0) + 'px';
              input.style.fontSize = (textObject.fontSize || 16) + 'px';
              input.style.fontFamily = textObject.fontFamily || 'Arial';
              input.style.color = (textObject.fill as string) || '#000000';
              input.style.background = 'transparent';
              input.style.border = '1px solid #007bff';
              input.style.padding = '2px';
              input.style.zIndex = '1000';
              
              // Adicionar o input ao canvas
              const canvasElement = canvas.getElement();
              const canvasRect = canvasElement.getBoundingClientRect();
              input.style.left = (canvasRect.left + (textObject.left || 0)) + 'px';
              input.style.top = (canvasRect.top + (textObject.top || 0)) + 'px';
              
              document.body.appendChild(input);
              input.focus();
              input.select();
              
              // Marcar que estamos editando texto
              setIsEditingText(true);
              console.log('Estado de edição: INICIADO (isEditingText = true)');
              
              // Função auxiliar para remover input de forma segura
              const safeRemoveInput = () => {
                try {
                  if (input && input.parentNode) {
                    document.body.removeChild(input);
                  }
                } catch (error) {
                  console.log('Input já foi removido ou não existe mais');
                }
                // Marcar que não estamos mais editando texto
                setIsEditingText(false);
                console.log('Estado de edição: TERMINADO (isEditingText = false)');
              };

              // Variável para controlar se já foi processado
              let isProcessing = false;

              // Quando o usuário terminar de editar
              const finishEditing = () => {
                if (isProcessing) return; // Evitar processamento múltiplo
                isProcessing = true;
                
                const newText = input.value.trim();
                console.log('Texto original:', input.value);
                console.log('Texto após trim:', newText);
                
                // Se o texto estiver vazio, usar um texto padrão em vez de remover o elemento
                const finalText = newText || 'Texto';
                console.log('Texto final:', finalText);
                
                textObject.set('text', finalText);
                canvas.renderAll();
                safeRemoveInput();
                
                // Reset após um delay
                setTimeout(() => {
                  isProcessing = false;
                }, 100);
              };
              
              input.addEventListener('blur', finishEditing);
              input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                  finishEditing();
                } else if (e.key === 'Escape') {
                  // Se pressionar Escape, manter o texto original
                  safeRemoveInput();
                }
              });
            }
          } catch (error) {
            console.error('Erro ao tentar editar texto:', error);
          }
        }, 100);
      }
    });

    setIsLoaded(true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
        try {
      canvas.dispose();
        } catch (error) {
          console.error('Erro ao dispor canvas:', error);
        }
    };
    } catch (error) {
      console.error('Erro ao criar canvas:', error);
      setIsLoaded(false);
    }
  }, [canvasDimensions]);

  // Hook para redimensionar o canvas Fabric.js quando as dimensões mudam
  useEffect(() => {
    if (!fabricCanvasRef.current || !isLoaded) return;

    const canvas = fabricCanvasRef.current;
    const oldWidth = canvas.getWidth();
    const oldHeight = canvas.getHeight();
    const newWidth = canvasDimensions.width;
    const newHeight = canvasDimensions.height;

    // Verificar se realmente precisa redimensionar
    if (Math.abs(oldWidth - newWidth) < 1 && Math.abs(oldHeight - newHeight) < 1) {
      return;
    }

    // Redimensionar o canvas
    canvas.setDimensions({
      width: newWidth,
      height: newHeight
    });

    // Escalar objetos existentes proporcionalmente
    const scaleX = newWidth / oldWidth;
    const scaleY = newHeight / oldHeight;
    
    
    try {
      canvas.getObjects().forEach(obj => {
        if (obj.name !== 'field-image') {
          // Escalar posição e tamanho
          obj.set({
            left: obj.left! * scaleX,
            top: obj.top! * scaleY,
            scaleX: obj.scaleX! * scaleX,
            scaleY: obj.scaleY! * scaleY
          });
          obj.setCoords();
        }
      });

      // Redesenhar o campo com as novas dimensões
      drawPitch(canvas);
    
    canvas.renderAll();
    } catch (error) {
      console.error('Erro ao redimensionar canvas:', error);
    }
  }, [canvasDimensions, isLoaded]);

  // Hook para aplicar zoom e viewport - REMOVIDO (zoom desativado)
  // useEffect(() => {
  //   if (!fabricCanvasRef.current || !isLoaded) return;
  //
  //   const canvas = fabricCanvasRef.current;
  //   
  //   // Aplicar modo de campo fixo (sem zoom)
  //   if (state.zoomMode === "full") {
  //     // Campo inteiro - zoom fixo 1x, centralizado
  //     canvas.setZoom(1);
  //     canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
  //   } else {
  //     // Meio campo - zoom fixo 2x, focado na metade direita com baliza completa
  //     canvas.setZoom(2);
  //     const canvasWidth = canvas.getWidth();
  //     const canvasHeight = canvas.getHeight();
  //     // Pan para mostrar a metade direita do campo (incluindo baliza direita completa)
  //     // Ajustar para mostrar desde o meio do campo até à baliza direita
  //     canvas.viewportTransform = [2, 0, 0, 2, -canvasWidth/2, -canvasHeight/2];
  //   }
  //   
  //   canvas.renderAll();
  // }, [state.zoomMode, isLoaded]);

  // Hook para carregar formação quando mudar
  useEffect(() => {
    if (!fabricCanvasRef.current || !isLoaded) return;
    loadFormation(fabricCanvasRef.current, state?.selectedFormation);
  }, [state?.selectedFormation, isLoaded, loadFormation]);

  // Hook para recarregar campo quando zoomMode mudar
  useEffect(() => {
    if (!fabricCanvasRef.current || !isLoaded) return;
    
    const canvas = fabricCanvasRef.current;
    console.log('ZoomMode mudou, recarregando campo...');
    
    // Limpar imagem existente
    const existingField = canvas.getObjects().filter(obj => obj.name === "field-image");
    existingField.forEach(obj => canvas.remove(obj));
    fieldImageRef.current = null;
    
    // Redesenhar campo com nova imagem
    drawPitch(canvas);
    
    // Recarregar formação
    loadFormation(canvas, state?.selectedFormation);
    
    canvas.renderAll();
    
    // Notificar jogadores atualizados
    if (onPlayersUpdate) {
      onPlayersUpdate(getCanvasPlayers());
    }
  }, [state?.zoomMode, isLoaded, loadFormation, state?.selectedFormation]);

  // Hook para notificar mudanças nos jogadores
  useEffect(() => {
    if (isLoaded && onPlayersUpdate) {
      onPlayersUpdate(getCanvasPlayers());
    }
  }, [isLoaded]); // Remover onPlayersUpdate das dependências

  // Hook para funcionalidade de clique para adicionar objetos
  useEffect(() => {
    if (!fabricCanvasRef.current || !isLoaded) return;

    const canvas = fabricCanvasRef.current;
    let isDrawing = false;
    let startPoint: { x: number; y: number } | null = null;

    const handleCanvasMouseDown = (e: fabric.IEvent) => {
      if (state.selectedTool === "player") {
        const pointer = canvas.getPointer(e.e);
        const playerNumber = Math.floor(Math.random() * 99) + 1;
        
        const player = new PlayerObject({
          left: pointer.x - 15, // Centralizar o jogador no clique
          top: pointer.y - 15,  // Centralizar o jogador no clique
          playerNumber,
          playerName: `Jogador ${playerNumber}`,
          isGoalkeeper: false,
          playerId: `player-${playerNumber}`,
          playerColor: "#1F2937",
        });

        canvas.add(player);
        canvas.renderAll();
      } else if (["arrow", "line"].includes(state.selectedTool)) {
        isDrawing = true;
        startPoint = canvas.getPointer(e.e);
      } else if (state.selectedTool === "circle") {
        const pointer = canvas.getPointer(e.e);
        const circle = new fabric.Circle({
          left: pointer.x - 25,
          top: pointer.y - 25,
          radius: 25,
          fill: "",
          stroke: "#FF0000",
          strokeWidth: 2,
        });
        canvas.add(circle);
        canvas.renderAll();
      } else if (state.selectedTool === "text") {
        const pointer = canvas.getPointer(e.e);
        const text = new fabric.Text("Texto", {
          left: pointer.x,
          top: pointer.y,
          fontSize: 16,
          fill: "#000000",
          fontFamily: "Arial",
          selectable: true,
          name: "text-object",
          textAlign: "left",
          originX: "left",
          originY: "top",
          scaleX: 1,
          scaleY: 1,
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();
        
        // Tentar entrar no modo de edição após um pequeno delay
        setTimeout(() => {
          try {
            if (text && (text as any).enterEditing) {
              (text as any).enterEditing();
            } else {
              // Usar a mesma abordagem alternativa da edição
              console.log('Criando input temporário para edição');
              
              const input = document.createElement('input');
              input.type = 'text';
              input.value = 'Texto';
              input.style.position = 'absolute';
              input.style.fontSize = '16px';
              input.style.fontFamily = 'Arial';
              input.style.color = '#000000';
              input.style.background = 'transparent';
              input.style.border = '1px solid #007bff';
              input.style.padding = '2px';
              input.style.zIndex = '1000';
              
              const canvasElement = canvas.getElement();
              const canvasRect = canvasElement.getBoundingClientRect();
              input.style.left = (canvasRect.left + pointer.x) + 'px';
              input.style.top = (canvasRect.top + pointer.y) + 'px';
              
              document.body.appendChild(input);
              input.focus();
              input.select();
              
              // Marcar que estamos editando texto
              setIsEditingText(true);
              console.log('Estado de edição: INICIADO (isEditingText = true)');
              
              // Função auxiliar para remover input de forma segura
              const safeRemoveInput = () => {
                try {
                  if (input && input.parentNode) {
                    document.body.removeChild(input);
                  }
                } catch (error) {
                  console.log('Input já foi removido ou não existe mais');
                }
                // Marcar que não estamos mais editando texto
                setIsEditingText(false);
                console.log('Estado de edição: TERMINADO (isEditingText = false)');
              };

              // Variável para controlar se já foi processado
              let isProcessing = false;

              const finishEditing = () => {
                if (isProcessing) return; // Evitar processamento múltiplo
                isProcessing = true;
                
                const newText = input.value.trim();
                // Se o texto estiver vazio, usar um texto padrão em vez de remover o elemento
                const finalText = newText || 'Texto';
                text.set('text', finalText);
                canvas.renderAll();
                safeRemoveInput();
                
                // Reset após um delay
                setTimeout(() => {
                  isProcessing = false;
                }, 100);
              };
              
              input.addEventListener('blur', finishEditing);
              input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                  finishEditing();
                } else if (e.key === 'Escape') {
                  canvas.remove(text);
                  canvas.renderAll();
                  safeRemoveInput();
                }
              });
            }
          } catch (error) {
            console.error('Erro ao tentar editar texto recém-criado:', error);
          }
        }, 200);
      }
    };

    const handleCanvasMouseMove = (e: fabric.IEvent) => {
      if (!isDrawing || !startPoint || !["arrow", "line"].includes(state.selectedTool)) return;

      const pointer = canvas.getPointer(e.e);
      
      // Remover linha temporária anterior se existir
      const tempLine = canvas.getObjects().find(obj => obj.name === "temp-line");
      if (tempLine) canvas.remove(tempLine);

      // Criar linha temporária
      const tempLineObj = new fabric.Line([startPoint.x, startPoint.y, pointer.x, pointer.y], {
        stroke: "#FF0000",
        strokeWidth: 2,
        name: "temp-line",
        selectable: false,
        evented: false,
      });
      
      canvas.add(tempLineObj);
      canvas.renderAll();
    };

    const handleCanvasMouseUp = (e: fabric.IEvent) => {
      if (!isDrawing || !startPoint || !["arrow", "line"].includes(state.selectedTool)) return;

      const pointer = canvas.getPointer(e.e);
      
      // Remover linha temporária
      const tempLine = canvas.getObjects().find(obj => obj.name === "temp-line");
      if (tempLine) canvas.remove(tempLine);

      // Criar objeto final
      if (state.selectedTool === "arrow") {
        const arrow = ArrowObject.createArrow(
          startPoint.x, 
          startPoint.y, 
          pointer.x, 
          pointer.y,
          `arrow-${Date.now()}`
        );
        canvas.add(arrow);
      } else if (state.selectedTool === "line") {
        const line = new fabric.Line([startPoint.x, startPoint.y, pointer.x, pointer.y], {
          stroke: "#FF0000",
          strokeWidth: 2,
        });
        canvas.add(line);
      }

      canvas.renderAll();
      isDrawing = false;
      startPoint = null;
    };

    canvas.on("mouse:down", handleCanvasMouseDown);
    canvas.on("mouse:move", handleCanvasMouseMove);
    canvas.on("mouse:up", handleCanvasMouseUp);

    return () => {
      canvas.off("mouse:down", handleCanvasMouseDown);
      canvas.off("mouse:move", handleCanvasMouseMove);
      canvas.off("mouse:up", handleCanvasMouseUp);
    };
  }, [state.selectedTool, isLoaded]);

  // Função para atualizar jogador
  const handleUpdatePlayer = (player: PlayerObject, updates: { name?: string; color?: string }) => {
    if (updates.name) {
      player.updatePlayerName(updates.name);
    }
    if (updates.color) {
      player.updatePlayerColor(updates.color);
    }
    fabricCanvasRef.current?.renderAll();
  };

  return (
    <div className={`relative w-full h-full min-h-[400px] flex items-center justify-center ${className}`}>
      <div className="relative">
      <canvas 
        ref={canvasRef} 
          className="border border-gray-300 rounded-lg shadow-lg" 
        style={{ 
          width: `${canvasDimensions.width}px`, 
            height: `${canvasDimensions.height}px`,
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
        }}
      />
        
        
        {(!isLoaded || isImageLoading) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="text-gray-500">
              {isImageLoading ? 'A carregar campo...' : 'A carregar campo...'}
            </div>
        </div>
      )}
        
        {/* Indicador de dimensões durante redimensionamento */}
      </div>
      
      {/* Editor de Jogador */}
      {editingPlayer && (
        <PlayerEditor
          player={editingPlayer}
          onUpdatePlayer={handleUpdatePlayer}
          onClose={() => setEditingPlayer(null)}
        />
      )}
    </div>
  );
}