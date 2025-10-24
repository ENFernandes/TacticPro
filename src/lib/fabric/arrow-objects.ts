import { fabric } from "fabric";

export class ArrowObject extends fabric.Polyline {
  public arrowId: string;

  constructor(
    points: fabric.Point[],
    options: fabric.IPolylineOptions & { arrowId: string }
  ) {
    super(points, {
      stroke: "#FF0000",
      strokeWidth: 3,
      fill: "transparent",
      selectable: true,
      evented: true,
      ...options,
    });

    this.arrowId = options.arrowId;
    (this as any).name = "arrow";
  }

  static createArrow(x1: number, y1: number, x2: number, y2: number, arrowId: string): ArrowObject {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLength = 20;
    
    // Pontos da seta
    const points = [
      new fabric.Point(x1, y1), // Início
      new fabric.Point(x2, y2), // Fim
      new fabric.Point(
        x2 - headLength * Math.cos(angle - Math.PI / 6), 
        y2 - headLength * Math.sin(angle - Math.PI / 6)
      ),
      new fabric.Point(x2, y2),
      new fabric.Point(
        x2 - headLength * Math.cos(angle + Math.PI / 6), 
        y2 - headLength * Math.sin(angle + Math.PI / 6)
      ),
    ];
    
    return new ArrowObject(points, { arrowId });
  }

  // Incluir arrowId na serialização para persistência
  toObject(propertiesToInclude?: string[]) {
    return fabric.util.object.extend(super.toObject(propertiesToInclude), {
      arrowId: this.arrowId,
      name: (this as any).name || "arrow",
    });
  }

  static fromObject(object: any): ArrowObject {
    const points = object.points.map((p: any) => new fabric.Point(p.x, p.y));
    return new ArrowObject(points, {
      arrowId: object.arrowId,
      left: object.left,
      top: object.top,
    });
  }
}