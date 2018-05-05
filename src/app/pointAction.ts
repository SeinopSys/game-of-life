import { Point } from './point';

export class PointAction {
  constructor(public point: Point,
              public add: boolean = true) {
  }
}
