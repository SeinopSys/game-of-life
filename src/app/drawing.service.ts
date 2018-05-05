import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Point } from './point';
import { Size } from './size';

@Injectable()
export class DrawingService {

  private pointSource = new BehaviorSubject<Point[]>([]);
  currentPoints = this.pointSource.asObservable();

  private sizeSource = new BehaviorSubject<Size>(new Size(0, 0));
  currentSize = this.sizeSource.asObservable();

  private centerSource = new BehaviorSubject<Point>(new Point());
  currentCenter = this.centerSource.asObservable();

  constructor() {
  }

  drawPoints(points: Point[]) {
    this.pointSource.next(points);
  }

  getPoints(): Point[] {
    return this.pointSource.getValue();
  }

  setSize(size: Size) {
    this.sizeSource.next(size);
  }

  getSize(): Size {
    return this.sizeSource.getValue();
  }

  setCenter(point: Point) {
    this.centerSource.next(point);
  }

  getCenter(): Point {
    return this.centerSource.getValue();
  }

}
