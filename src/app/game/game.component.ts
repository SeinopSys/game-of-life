import { Component, OnInit } from '@angular/core';
import { ParserService } from '../parser.service';
import { SimulationFile } from '../simulationFile';
import { DrawingService } from '../drawing.service';
import { Point } from '../point';
import { IndexedPointMap } from '../indexedPointMap';
import { Size } from '../size';
import { PointAction } from '../pointAction';

// Ha ennyi képponttal lekerül egy pont a vászonról, törlődik
const OFFSCREEN_DELETE_THRESHOLD = 25;

/**
 * Ez az elem végzi a játék irányítását illetve adja át az aktuális pontok adatait a játéktérnek
 */
@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  paused = true;
  selectedFile: File;
  parsing = false;
  generating = false;
  generatedPercent = 0;
  generateTarget: number;
  generatedAlready: number;
  parsedFile?: SimulationFile;
  parseError?: Error;
  currentPopulation: number;
  currentGeneration: number;
  generationPointsCache: { [key: number]: Point[]} = {};

  // Az oldalhoz nem hozzáadott fájl beviteli mező beolvasáshoz
  $fileInput: HTMLInputElement;
  // Beviteli mező tetszőleges generáció megadásához
  $generationInput: HTMLInputElement;
  // Beviteli mezőt elküldő gomb
  $generationEdit: HTMLButtonElement;

  constructor(private parserService: ParserService, private drawingService: DrawingService) {
    this.$fileInput = document.createElement('input');
    this.$fileInput.type = 'file';
    this.$fileInput.addEventListener('change', (e) => {
      this.onFileSelected(e);
    });
    this.$fileInput.accept = '.lif,.life';
  }

  ngOnInit() {
    this.reset();
    this.resizeBoard(new Size(400, 300));

    this.$generationInput = <HTMLInputElement> document.getElementById('generation-input');
    this.$generationEdit = <HTMLButtonElement> document.getElementById('generation-edit');
  }

  clickFileInput() {
    this.$fileInput.click();
  }

  start() {
    this.paused = false;
    this.gameLoop();
  }

  pause() {
    this.paused = true;
  }

  stepBackward() {
    this.setGeneration(this.currentGeneration - 1);
  }

  stepForward() {
    this.setGeneration(this.currentGeneration + 1);
  }

  /**
   * Ez a funkció frissíti a nemzedék számot ha entert üt a felhasználó a beviteli mezőben
   * @param e
   */
  generationInputKeypress(e) {
    // 13 = Enter
    if (e.keyCode !== 13)
      return;

    this.updateGeneration();
  }

  /**
   * Ez a funkció frissíti a nemzedék számot ha a felhasználó a fekete gombra kattint
   */
  updateGeneration() {
    this.generateTarget = parseInt(this.$generationInput.value, 10);
    if (this.generateTarget === this.currentGeneration)
      return;

    this.generating = true;
    this.generatedAlready = 0;

    this.setGeneration(this.generateTarget, true).then(() => {
      this.generating = false;
    });
  }

  private setGeneration(generation: number, updateProgress: boolean = false) {
    return new Promise(res => {
      this.cacheGeneration(generation, updateProgress, true).then(() => {
        this.setCurrentGeneration(generation);
        this.drawCurrentGeneration();
        res();
      });
    });
  }

  private setCurrentGeneration(n: number) {
    this.currentGeneration = n;
    const currGen = this.generationPointsCache[this.currentGeneration];
    this.currentPopulation = currGen ? currGen.length : (this.parsedFile ? this.parsedFile.getPopulation() : 0);
  }

  private gameLoop() {
    if (this.paused)
      return;

    this.stepForward();

    setTimeout(() => {
        if (!this.paused)
          this.gameLoop();
    }, 80);
  }

  private cacheGeneration(generation: number, updateProgress: boolean, first: boolean = false) {
    return new Promise(res => {
      const prevGen = generation - 1;
      if (generation < 0)
        throw new Error('A generációnak legalább 0-nak kell lennie');

      const generate = typeof this.generationPointsCache[generation] === 'undefined';
      if (!generate && first) {
        res();
      }

      const cache = () => {
        if (generate)
          this.generationPointsCache[generation] = this.processPointChanges(this.generationPointsCache[prevGen]);
        if (updateProgress) {
          this.generatedAlready++;
          setTimeout(res, 1);
        } else {
          res();
        }
      };

      if (prevGen > 0)
        this.cacheGeneration(prevGen, updateProgress).then(cache);
      else cache();
    });
  }

  private resizeBoard(size: Size) {
    this.drawingService.setSize(size);
    this.drawingService.setCenter(new Point(Math.round(size.width / 2), Math.round(size.height / 2)));
  }

  private reset() {
    this.setCurrentGeneration(0);
  }

  private onFileSelected(e: Event) {
    const $el: HTMLInputElement = <HTMLInputElement> e.target;

    // Mégse (nincs kiválasztva fájl)
    if (!$el.files)
      return;

    if (!this.paused)
      this.pause();

    this.selectedFile = $el.files[0];
    // Érték kinullázása, hogy kétszer egymás után kijelölhető legyen ugyan az a fájl
    // pl. ha módosítottuk jegyzettömbbel és újra be akarjuk olvastatni
    // Enélkül nem csinálna semmit a program ez esetben
    $el.value = '';
    this.readFile();
  }

  private readFile() {
    const reader = new FileReader();
    reader.onload = () => {
      const contents = reader.result;
      try {
        this.parsedFile = undefined;
        this.parsedFile = this.parserService.parseFile(contents);
        this.parseError = undefined;
        this.generationPointsCache = { 0: this.parsedFile.getPoints() };
        this.reset();
        this.drawCurrentGeneration();
      } catch (e) {
        console.error(e);
        this.parseError = e;
      }

      this.parsing = false;
    };
    reader.readAsText(this.selectedFile);
  }

  private drawCurrentGeneration() {
    this.drawingService.drawPoints(this.generationPointsCache[this.currentGeneration]);
  }

  private processPointChanges(currentPoints: Point[]): Point[] {
    const actions: PointAction[] = [];
    const indexedPointMap = new IndexedPointMap(currentPoints);

    const size = this.drawingService.getSize();
    const center = this.drawingService.getCenter();
    const rules = this.parsedFile.getRuleSpec();
    const targetX = size.width + OFFSCREEN_DELETE_THRESHOLD;
    const targetY = size.height + OFFSCREEN_DELETE_THRESHOLD;
    for (let realX = -OFFSCREEN_DELETE_THRESHOLD; realX < targetX; realX++) {
      for (let realY = -OFFSCREEN_DELETE_THRESHOLD; realY < targetY; realY++) {
        const gamePoint = new Point(realX, realY).subtract(center);
        const neighborCount = indexedPointMap.neighborsOf(gamePoint).length;

        if (indexedPointMap.exists(gamePoint)) {
          if (!rules.willStayAlive(neighborCount))
            actions.push(new PointAction(gamePoint, false));
        } else {
          if (rules.willBeBorn(neighborCount))
            actions.push(new PointAction(gamePoint));
        }
      }
    }

    actions.forEach(action => {
      indexedPointMap.exec(action);
    });
    return indexedPointMap.toArray();
  }
}
