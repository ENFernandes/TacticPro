import { Formation } from "@/types";

export const FORMATIONS: Formation[] = [
  {
    id: "4-4-2",
    name: "4-4-2",
    players: [
      // Guarda-redes - área da baliza (esquerda)
      { number: 1, position: { x: 5, y: 50 }, color: "#FFFFFF", isGoalkeeper: true },
      // Defesa - linha de defesa (esquerda)
      { number: 2, position: { x: 15, y: 20 }, color: "#1F2937", isGoalkeeper: false },
      { number: 3, position: { x: 15, y: 40 }, color: "#1F2937", isGoalkeeper: false },
      { number: 4, position: { x: 15, y: 60 }, color: "#1F2937", isGoalkeeper: false },
      { number: 5, position: { x: 15, y: 80 }, color: "#1F2937", isGoalkeeper: false },
      // Meio-campo - linha de meio-campo
      { number: 6, position: { x: 35, y: 25 }, color: "#1F2937", isGoalkeeper: false },
      { number: 7, position: { x: 35, y: 45 }, color: "#1F2937", isGoalkeeper: false },
      { number: 8, position: { x: 35, y: 55 }, color: "#1F2937", isGoalkeeper: false },
      { number: 9, position: { x: 35, y: 75 }, color: "#1F2937", isGoalkeeper: false },
      // Ataque - linha de ataque (direita)
      { number: 10, position: { x: 65, y: 40 }, color: "#1F2937", isGoalkeeper: false },
      { number: 11, position: { x: 65, y: 60 }, color: "#1F2937", isGoalkeeper: false },
    ],
  },
  {
    id: "4-3-3",
    name: "4-3-3",
    players: [
      // Guarda-redes - área da baliza (esquerda)
      { number: 1, position: { x: 5, y: 50 }, color: "#FFFFFF", isGoalkeeper: true },
      // Defesa - linha de defesa (esquerda)
      { number: 2, position: { x: 15, y: 20 }, color: "#1F2937", isGoalkeeper: false },
      { number: 3, position: { x: 15, y: 40 }, color: "#1F2937", isGoalkeeper: false },
      { number: 4, position: { x: 15, y: 60 }, color: "#1F2937", isGoalkeeper: false },
      { number: 5, position: { x: 15, y: 80 }, color: "#1F2937", isGoalkeeper: false },
      // Meio-campo - linha de meio-campo (3 jogadores)
      { number: 6, position: { x: 35, y: 30 }, color: "#1F2937", isGoalkeeper: false },
      { number: 7, position: { x: 35, y: 50 }, color: "#1F2937", isGoalkeeper: false },
      { number: 8, position: { x: 35, y: 70 }, color: "#1F2937", isGoalkeeper: false },
      // Ataque - linha de ataque (3 jogadores - direita)
      { number: 9, position: { x: 70, y: 25 }, color: "#1F2937", isGoalkeeper: false },
      { number: 10, position: { x: 70, y: 50 }, color: "#1F2937", isGoalkeeper: false },
      { number: 11, position: { x: 70, y: 75 }, color: "#1F2937", isGoalkeeper: false },
    ],
  },
  {
    id: "3-5-2",
    name: "3-5-2",
    players: [
      // Guarda-redes - área da baliza (esquerda)
      { number: 1, position: { x: 5, y: 50 }, color: "#FFFFFF", isGoalkeeper: true },
      // Defesa - linha de defesa (3 jogadores - esquerda)
      { number: 2, position: { x: 15, y: 30 }, color: "#1F2937", isGoalkeeper: false },
      { number: 3, position: { x: 15, y: 50 }, color: "#1F2937", isGoalkeeper: false },
      { number: 4, position: { x: 15, y: 70 }, color: "#1F2937", isGoalkeeper: false },
      // Meio-campo - linha de meio-campo (5 jogadores)
      { number: 5, position: { x: 30, y: 15 }, color: "#1F2937", isGoalkeeper: false },
      { number: 6, position: { x: 30, y: 35 }, color: "#1F2937", isGoalkeeper: false },
      { number: 7, position: { x: 30, y: 50 }, color: "#1F2937", isGoalkeeper: false },
      { number: 8, position: { x: 30, y: 65 }, color: "#1F2937", isGoalkeeper: false },
      { number: 9, position: { x: 30, y: 85 }, color: "#1F2937", isGoalkeeper: false },
      // Ataque - linha de ataque (2 jogadores - direita)
      { number: 10, position: { x: 65, y: 40 }, color: "#1F2937", isGoalkeeper: false },
      { number: 11, position: { x: 65, y: 60 }, color: "#1F2937", isGoalkeeper: false },
    ],
  },
  {
    id: "4-2-3-1",
    name: "4-2-3-1",
    players: [
      // Guarda-redes - área da baliza (esquerda)
      { number: 1, position: { x: 5, y: 50 }, color: "#FFFFFF", isGoalkeeper: true },
      // Defesa - linha de defesa (esquerda)
      { number: 2, position: { x: 15, y: 20 }, color: "#1F2937", isGoalkeeper: false },
      { number: 3, position: { x: 15, y: 40 }, color: "#1F2937", isGoalkeeper: false },
      { number: 4, position: { x: 15, y: 60 }, color: "#1F2937", isGoalkeeper: false },
      { number: 5, position: { x: 15, y: 80 }, color: "#1F2937", isGoalkeeper: false },
      // Meio-campo defensivo - linha de meio-campo (2 jogadores)
      { number: 6, position: { x: 30, y: 40 }, color: "#1F2937", isGoalkeeper: false },
      { number: 7, position: { x: 30, y: 60 }, color: "#1F2937", isGoalkeeper: false },
      // Meio-campo ofensivo - linha avançada (3 jogadores)
      { number: 8, position: { x: 50, y: 25 }, color: "#1F2937", isGoalkeeper: false },
      { number: 9, position: { x: 50, y: 50 }, color: "#1F2937", isGoalkeeper: false },
      { number: 10, position: { x: 50, y: 75 }, color: "#1F2937", isGoalkeeper: false },
      // Ataque - ponta de lança (direita)
      { number: 11, position: { x: 75, y: 50 }, color: "#1F2937", isGoalkeeper: false },
    ],
  },
];