import { fabric } from "fabric";

export class PlayerObject extends fabric.Group {
  public playerNumber: number;
  public playerName: string;
  public isGoalkeeper: boolean;
  public playerId: string;
  public playerColor: string;

  constructor(
    options: fabric.IGroupOptions & {
      playerNumber: number;
      playerName?: string;
      isGoalkeeper: boolean;
      playerId: string;
      playerColor?: string;
    }
  ) {
    const playerColor = options.playerColor || (options.isGoalkeeper ? "#FFFFFF" : "#1F2937");
    const playerName = options.playerName || `Jogador ${options.playerNumber}`;

    // Criar círculo do jogador
    const circle = new fabric.Circle({
      radius: 15,
      fill: playerColor,
      stroke: "#000000",
      strokeWidth: 2,
      originX: "center",
      originY: "center",
      selectable: false,
      evented: false,
    });

    // Criar texto com número do jogador
    const numberText = new fabric.Text(options.playerNumber.toString(), {
      fontSize: 12,
      fontFamily: "Arial",
      fontWeight: "bold",
      fill: options.isGoalkeeper ? "#000000" : "#FFFFFF",
      originX: "center",
      originY: "center",
      selectable: false,
      evented: false,
    });

    // Criar texto com nome do jogador (abaixo do círculo)
    const nameText = new fabric.Text(playerName, {
      fontSize: 10,
      fontFamily: "Arial",
      fontWeight: "normal",
      fill: "#000000",
      originX: "center",
      originY: "top",
      top: 20,
      selectable: false,
      evented: false,
    });

    super([circle, numberText, nameText], {
      ...options,
      subTargetCheck: true,
      name: "player-group",
    });

    this.playerNumber = options.playerNumber;
    this.playerName = playerName;
    this.isGoalkeeper = options.isGoalkeeper;
    this.playerId = options.playerId;
    this.playerColor = playerColor;
  }

  // Método para atualizar o nome do jogador
  updatePlayerName(newName: string) {
    this.playerName = newName;
    const nameText = this._objects[2] as fabric.Text;
    nameText.set('text', newName);
    this.setCoords();
  }

  // Método para atualizar a cor do jogador
  updatePlayerColor(newColor: string) {
    this.playerColor = newColor;
    const circle = this._objects[0] as fabric.Circle;
    circle.set('fill', newColor);
    
    // Atualizar cor do texto do número baseado na cor de fundo
    const numberText = this._objects[1] as fabric.Text;
    const textColor = this.isGoalkeeper ? "#000000" : "#FFFFFF";
    numberText.set('fill', textColor);
    
    this.setCoords();
  }

  // Sobrescrever toObject para incluir propriedades personalizadas
  toObject(propertiesToInclude?: string[]) {
    return fabric.util.object.extend(super.toObject(propertiesToInclude), {
      playerNumber: this.playerNumber,
      playerName: this.playerName,
      isGoalkeeper: this.isGoalkeeper,
      playerId: this.playerId,
      playerColor: this.playerColor,
    });
  }

  // Sobrescrever fromObject para recriar o objeto corretamente
  static fromObject(object: any, callback: (player: PlayerObject) => void) {
    const player = new PlayerObject({
      left: object.left,
      top: object.top,
      playerNumber: object.playerNumber,
      playerName: object.playerName,
      isGoalkeeper: object.isGoalkeeper,
      playerId: object.playerId,
      playerColor: object.playerColor,
    });
    callback(player);
  }
}

// Registrar a classe para que Fabric.js possa deserializá-la
fabric.Object.prototype.type = 'object'; // Reset default type
(fabric as any).PlayerObject = PlayerObject;