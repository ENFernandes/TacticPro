"use client";

import { useState, useEffect } from "react";
import { useEditorStore } from "@/store/editor-store";

interface Player {
  id: string;
  number: number;
  name: string;
  position: string;
  fabricObject?: any;
}

interface PlayersSidebarProps {
  className?: string;
  players: Player[];
  onPlayerNameChange: (playerIndex: number, newName: string) => void;
}

export default function PlayersSidebar({ className, players, onPlayerNameChange }: PlayersSidebarProps) {
  const { state } = useEditorStore();

  return (
    <div className={`bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-6 overflow-y-auto ${className}`}>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Plantel</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Edite os nomes dos jogadores no campo</p>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
          Formação: {state.selectedFormation}
        </div>
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
          Jogadores: {players.length}/11
        </div>
      </div>

      <div className="space-y-2">
        {Array.from({ length: 11 }, (_, index) => {
          const player = players[index];
          const playerNumber = index + 1;
          
          return (
            <div key={playerNumber} className="flex items-center space-x-3">
              {/* Círculo azul com número */}
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm">
                {playerNumber}
              </div>
              
              {/* Campo de texto para o nome */}
              <input
                type="text"
                value={player?.name || ''}
                onChange={(e) => onPlayerNameChange(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
                placeholder={player ? `Jogador ${playerNumber}` : "Adicione um jogador ao campo primeiro"}
                disabled={!player}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          💡 Dica: Adicione jogadores ao campo usando a ferramenta "Jogador" no sidebar esquerdo
        </div>
      </div>
    </div>
  );
}
