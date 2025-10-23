import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { fabric } from "fabric";
import { Tactic } from "@/types";

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
}

