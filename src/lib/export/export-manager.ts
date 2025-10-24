import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { fabric } from "fabric";
import { Tactic } from "@/types";
import { AnimationManager } from "@/lib/fabric/animation-manager";

export class ExportManager {
  static async exportToPNG(canvas: fabric.Canvas, filename?: string): Promise<void> {
    try {
      const dataURL = canvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 2, // Maior resolução
      });

      const link = document.createElement("a");
      link.download = filename || `tatica-${Date.now()}.png`;
      link.href = dataURL;
      link.click();
    } catch (error) {
      console.error("Erro ao exportar PNG:", error);
      throw error;
    }
  }

  static async exportToJPG(canvas: fabric.Canvas, filename?: string): Promise<void> {
    try {
      const dataURL = canvas.toDataURL({
        format: "jpeg",
        quality: 0.9,
        multiplier: 2,
      });

      const link = document.createElement("a");
      link.download = filename || `tatica-${Date.now()}.jpg`;
      link.href = dataURL;
      link.click();
    } catch (error) {
      console.error("Erro ao exportar JPG:", error);
      throw error;
    }
  }

  static async exportToPDF(tactic: Tactic, canvas: fabric.Canvas): Promise<void> {
    try {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Configurações da página
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);

      // Título
      pdf.setFontSize(20);
      pdf.text(tactic.name, margin, margin + 10);

      // Informações da tática
      pdf.setFontSize(12);
      pdf.text(`Formação: ${tactic.formation}`, margin, margin + 20);
      pdf.text(`Criado em: ${tactic.createdAt.toLocaleDateString("pt-PT")}`, margin, margin + 30);

      // Canvas principal
      const canvasDataURL = canvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 2,
      });

      // Calcular dimensões para manter proporção
      const canvasAspectRatio = canvas.getWidth() / canvas.getHeight();
      let imgWidth = contentWidth;
      let imgHeight = contentWidth / canvasAspectRatio;

      if (imgHeight > contentHeight - 50) {
        imgHeight = contentHeight - 50;
        imgWidth = imgHeight * canvasAspectRatio;
      }

      const imgX = margin + (contentWidth - imgWidth) / 2;
      const imgY = margin + 50;

      pdf.addImage(canvasDataURL, "PNG", imgX, imgY, imgWidth, imgHeight);

      // Se há animações, adicionar páginas adicionais
      if (tactic.animations && tactic.animations.length > 0) {
        for (let i = 0; i < tactic.animations.length; i++) {
          pdf.addPage();
          
          const phase = tactic.animations[i];
          pdf.setFontSize(16);
          pdf.text(`Fase ${i + 1}: ${phase.name}`, margin, margin + 10);
          
          pdf.setFontSize(12);
          pdf.text(`Duração: ${(phase.duration / 1000).toFixed(1)}s`, margin, margin + 20);
          pdf.text(`Keyframes: ${phase.keyframes.length}`, margin, margin + 30);

          // Aqui poderia adicionar uma imagem da fase específica
          // Por agora, adicionamos a mesma imagem do canvas
          pdf.addImage(canvasDataURL, "PNG", imgX, imgY, imgWidth, imgHeight);
        }
      }

      // Download
      pdf.save(`${tactic.name.replace(/[^a-z0-9]/gi, "_")}.pdf`);
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      throw error;
    }
  }

  static exportToJSON(tactic: Tactic): void {
    try {
      const jsonString = JSON.stringify(tactic, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `${tactic.name.replace(/[^a-z0-9]/gi, "_")}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao exportar JSON:", error);
      throw error;
    }
  }

  static async exportMultiplePhases(
    tactic: Tactic, 
    canvas: fabric.Canvas, 
    animationManager: any
  ): Promise<void> {
    try {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);

      // Página inicial com informações
      pdf.setFontSize(20);
      pdf.text(tactic.name, margin, margin + 10);
      
      pdf.setFontSize(12);
      pdf.text(`Formação: ${tactic.formation}`, margin, margin + 20);
      pdf.text(`Criado em: ${tactic.createdAt.toLocaleDateString("pt-PT")}`, margin, margin + 30);
      pdf.text(`Fases de animação: ${tactic.animations.length}`, margin, margin + 40);

      // Para cada fase, criar uma página
      for (let i = 0; i < tactic.animations.length; i++) {
        if (i > 0) pdf.addPage();
        
        const phase = tactic.animations[i];
        
        // Título da fase
        pdf.setFontSize(16);
        pdf.text(`Fase ${i + 1}: ${phase.name}`, margin, margin + 10);
        
        pdf.setFontSize(12);
        pdf.text(`Duração: ${(phase.duration / 1000).toFixed(1)}s`, margin, margin + 20);
        pdf.text(`Keyframes: ${phase.keyframes.length}`, margin, margin + 30);

        // Capturar estado da fase (simulado)
        const canvasDataURL = canvas.toDataURL({
          format: "png",
          quality: 1,
          multiplier: 2,
        });

        const canvasAspectRatio = canvas.getWidth() / canvas.getHeight();
        let imgWidth = contentWidth;
        let imgHeight = contentWidth / canvasAspectRatio;

        if (imgHeight > contentHeight - 50) {
          imgHeight = contentHeight - 50;
          imgWidth = imgHeight * canvasAspectRatio;
        }

        const imgX = margin + (contentWidth - imgWidth) / 2;
        const imgY = margin + 50;

        pdf.addImage(canvasDataURL, "PNG", imgX, imgY, imgWidth, imgHeight);
      }

      pdf.save(`${tactic.name.replace(/[^a-z0-9]/gi, "_")}_fases.pdf`);
    } catch (error) {
      console.error("Erro ao exportar múltiplas fases:", error);
      throw error;
    }
  }

  static async exportPhaseToVideo(
    canvas: fabric.Canvas,
    animationManager: AnimationManager,
    phaseIndex: number,
    options?: { fps?: number; filename?: string; bitrate?: number; mimeType?: string }
  ): Promise<void> {
    const htmlCanvas = canvas.getElement() as HTMLCanvasElement;
    const fps = Math.max(1, Math.min(120, options?.fps ?? 60));

    const isMediaRecorderAvailable = typeof window !== "undefined" && typeof (window as any).MediaRecorder !== "undefined";
    const canCapture = typeof htmlCanvas.captureStream === "function";
    if (!isMediaRecorderAvailable || !canCapture) {
      throw new Error("Exportação de vídeo não suportada neste navegador.");
    }

    const preferredTypes = [
      options?.mimeType || "",
      "video/mp4;codecs=h264",
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm"
    ].filter(Boolean);

    const pickMime = (types: string[]) => {
      const MR: any = (window as any).MediaRecorder;
      for (const t of types) {
        if (MR.isTypeSupported?.(t)) return t;
      }
      return "";
    };

    const mimeType = pickMime(preferredTypes);
    if (!mimeType) {
      throw new Error("Nenhum formato de vídeo suportado encontrado.");
    }

    const stream = htmlCanvas.captureStream(fps);
    const Recorder: any = (window as any).MediaRecorder;
    const recorder = new Recorder(stream, {
      mimeType,
      videoBitsPerSecond: options?.bitrate ?? 6_000_000,
    });

    const chunks: BlobPart[] = [];
    await new Promise<void>((resolve, reject) => {
      let raf = 0;
      const onData = (e: any) => { if (e.data && e.data.size > 0) chunks.push(e.data); };
      const onStop = () => { cancelAnimationFrame(raf); resolve(); };
      const onError = (e: any) => { cancelAnimationFrame(raf); reject(e?.error || e); };

      recorder.addEventListener("dataavailable", onData);
      recorder.addEventListener("stop", onStop);
      recorder.addEventListener("error", onError);

      try {
        const phases = animationManager.getPhases();
        const phase = phases[phaseIndex];
        if (!phase || phase.keyframes.length === 0 || phase.duration <= 0) {
          recorder.removeEventListener("dataavailable", onData);
          recorder.removeEventListener("stop", onStop);
          recorder.removeEventListener("error", onError);
          reject(new Error("Fase inválida para exportação."));
          return;
        }

        animationManager.seek(phaseIndex, 0);
        canvas.renderAll();
        recorder.start();
        animationManager.play(phaseIndex);

        const startMs = Date.now();
        const endMs = startMs + phase.duration + 120;
        const tick = () => {
          if (Date.now() >= endMs) {
            try { recorder.stop(); } catch {}
            stream.getTracks().forEach(t => t.stop());
            return;
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch (err) {
        try { recorder.stop(); } catch {}
        stream.getTracks().forEach(t => t.stop());
        reject(err);
      }
    });

    const blob = new Blob(chunks, { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const extension = mimeType.includes("mp4") ? "mp4" : "webm";
    link.download = options?.filename || `fase-${Date.now()}.${extension}`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }
}


