import { RuleSpecification } from './ruleSpecification';
import { CellBlock } from './cellBlock';
import { Point } from './point';

export class SimulationFile {
  private population = 0;
  private points: Point[] = [];

  constructor(private version: string,
              private description: string,
              private ruleSpec: RuleSpecification,
              private cellBlocks: CellBlock[]) {
    this.cellBlocks.forEach(el => {
      this.population += el.points.length;
      this.points.push(...el.points);
    });
  }

  getVersion(): string {
    return this.version;
  }

  getDescription(): string {
    return this.description;
  }

  getRuleSpec(): RuleSpecification {
    return this.ruleSpec;
  }

  getCellBlocks(): CellBlock[] {
    return this.cellBlocks;
  }

  getPoints() {
    return this.points;
  }

  getPopulation(): number {
    return this.population;
  }
}
