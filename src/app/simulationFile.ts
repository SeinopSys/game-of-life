import { RuleSpecification } from './ruleSpecification';
import { CellBlock } from './cellBlock';

export class SimulationFile {
  constructor(private version: string,
              private description: string,
              private ruleSpec: RuleSpecification,
              private cellBlocks: CellBlock[]) {
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
}
