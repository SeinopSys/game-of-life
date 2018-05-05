import { Point } from './point';
import { PointAction } from './pointAction';

export class IndexedPointMap {
  pointsArray: Point[];

  map: { [key: number]: { [key: number]: boolean } } = {};

  constructor(points: Point[]) {
    this.pointsArray = points.map(el => el.clone());
    points.forEach(el => {
      this.add(el);
    });
  }

  exists(point: Point) {
    return this.map[point.x] && this.map[point.x][point.y] === true;
  }

  neighborsOf(point: Point): Point[] {
    const neighbors = [];
    for (let deltaX = -1; deltaX < 2; deltaX++) {
      for (let deltaY = -1; deltaY < 2; deltaY++) {
        if (deltaY === 0 && deltaX === 0)
          continue;
        const checkPoint = point.addRaw(deltaX, deltaY);
        if (this.exists(checkPoint))
          neighbors.push(checkPoint);
      }
    }
    return neighbors;
  }

  exec(action: PointAction) {
    if (action.add) {
      this.add(action.point);
    } else {
      this.remove(action.point);
    }
  }

  toArray(): Point[] {
    const els = [];
    Object.keys(this.map).forEach(x => {
      Object.keys(this.map[x]).forEach(y => {
        els.push(new Point(parseInt(x, 10), parseInt(y, 10)));
      });
    });
    return els;
  }

  private add(point: Point) {
      if (typeof this.map[point.x] === 'undefined')
        this.map[point.x] = {};

      this.map[point.x][point.y] = true;
  }

  private remove(point: Point) {
    delete this.map[point.x][point.y];
  }
}
