export class Point {
  constructor(public x?: number,
              public y?: number) {
  }

  /**
   * Új másolatot készít a pontról
   * @returns {Point}
   */
  clone() {
    return new Point(this.x, this.y);
  }

  /**
   * Hozáadja ehhez a ponthoz a megadott pontot és egy új pontként visszaadja
   * @returns {Point}
   */
  add(point: Point) {
    return this.addRaw(point.x, point.y);
  }

  /**
   * Hozáadja ehhez a ponthoz a megadott koordinátákat és egy új pontként visszaadja
   * @returns {Point}
   */
  addRaw(x: number, y: number) {
    return new Point(this.x + x, this.y + y);
  }

  /**
   * Kivonja ebből a pontból a megadott pontot és egy új pontként visszaadja
   * @returns {Point}
   */
  subtract(point: Point) {
    return this.subtractRaw(point.x, point.y);
  }

  /**
   * Kivonja ebből a pontból a megadott koordinátákat és egy új pontként visszaadja
   * @returns {Point}
   */
  subtractRaw(x: number, y: number) {
    return this.addRaw(-x, -y);
  }
}
