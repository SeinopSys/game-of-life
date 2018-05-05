import { Component, OnInit } from '@angular/core';
import { DrawingService } from '../drawing.service';
import { Point } from '../point';
import { Size } from '../size';

/**
 * Ez az elem végzi a játéktérre való rajzolást egy service segítségével
 */
@Component({
  selector: 'app-game-board',
  template: '<canvas id="board"></canvas>',
  styleUrls: ['./game-board.component.scss']
})
export class GameBoardComponent implements OnInit {

  // A vászon elem, amire rajzolunk
  $canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  constructor(private drawingService: DrawingService) {
  }

  ngOnInit() {
    this.$canvas = <HTMLCanvasElement> document.getElementById('board');
    this.ctx = this.$canvas.getContext('2d');

    this.drawingService.currentPoints.subscribe(points => {
      this.draw(points);
    });

    this.drawingService.currentSize.subscribe(size => {
      this.resizeCanvas(size);
      this.draw();
    });
  }

  private resizeCanvas(size: Size) {
    this.$canvas.width = size.width;
    this.$canvas.height = size.height;
    this.$canvas.style.maxWidth = (size.width * 2) + 'px';
  }

  private clear() {
    this.ctx.clearRect(0, 0, this.$canvas.width, this.$canvas.height);
  }

  private draw(points: Point[] = this.drawingService.getPoints()) {
    this.clear();
    points.forEach(point => {
      const drawAt = this.drawingService.getCenter().add(point);
      this.ctx.fillRect(drawAt.x, drawAt.y, 1, 1);
    });
  }

}
