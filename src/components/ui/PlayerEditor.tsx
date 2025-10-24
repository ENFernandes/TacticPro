"use client";

import { useState } from "react";
import { PlayerObject } from "@/lib/fabric/player-objects";

interface PlayerEditorProps {
  player: PlayerObject | null;
  onUpdatePlayer: (player: PlayerObject, updates: { name?: string; color?: string }) => void;
  onClose: () => void;
}

const PLAYER_COLORS = [
  "#1F2937", // Cinza escuro
  "#DC2626", // Vermelho
  "#2563EB", // Azul
  "#059669", // Verde
  "#7C3AED", // Roxo
  "#EA580C", // Laranja
  "#0891B2", // Ciano
  "#BE185D", // Rosa
  "#65A30D", // Verde lima
  "#CA8A04", // Amarelo
];

export default function PlayerEditor({ player, onUpdatePlayer, onClose }: PlayerEditorProps) {
  const [playerName, setPlayerName] = useState(player?.playerName || "");
  const [selectedColor, setSelectedColor] = useState(player?.playerColor || "#1F2937");

  if (!player) return null;

  const handleSave = () => {
    onUpdatePlayer(player, {
      name: playerName,
      color: selectedColor,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Editar Jogador #{player.playerNumber}
        </h3>

        <div className="space-y-4">
          {/* Nome do Jogador */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome do Jogador
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Digite o nome do jogador"
            />
          </div>

          {/* Cor do Jogador */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cor do Jogador
            </label>
            <div className="grid grid-cols-5 gap-2">
              {PLAYER_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color
                      ? "border-gray-900 dark:border-white"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
            <div className="relative">
              <div
                className="w-8 h-8 rounded-full border-2 border-black"
                style={{ backgroundColor: selectedColor }}
              />
              <div className="text-xs text-center mt-1 text-gray-600 dark:text-gray-400">
                {playerName || `Jogador ${player.playerNumber}`}
              </div>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}


