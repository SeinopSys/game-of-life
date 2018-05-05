import { Point } from './point';

export class CellBlock {
  /**
   * Bal felső sarok eltolása a tér közepétől számítva
   */
  public offset: Point;
  /**
   * Élő cellák helye az eltolt ponthoz relatívan
   */
  public points: Point[];

  constructor(offset: Point, blocks: Point[]) {
    this.offset = offset;
    this.points = blocks;
  }
}
