import { RuleSpecification } from './ruleSpecification';
import { SimulationFile } from './simulationFile';
import { CellBlock } from './cellBlock';
import { Point } from './point';

const VERSION_MATCH = /^#Life ([.\d]+)$/;
const DESCRIPTION_MATCH = /^#[DC]\s+(.{1,78})\s*$/;
const RULESPEC_MATCH = /^#([RN])(?:\s+(\d+)\/(\d+)\s*)?$/;
const CELLBLOCK_START_MATCH = /^#P\s+(-?\d+)\s+(-?\d+)\s*$/;

interface IBlock {
  offset: Point;
  lines: string[];
}

export class LifParser {
  lines: string[];

  // noinspection JSMethodCanBeStatic
  parse(file: string): SimulationFile {
    this.lines = file.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const version = this.parseVersion();
    const description = this.parseDescription();
    const ruleSpec = this.parseRuleSpec();
    const cellBlocks = this.parseCellBlocks();

    return new SimulationFile(version, description, ruleSpec, cellBlocks);
  }

  private parseVersion(): string {
    const version = this.lines.splice(0, 1)[0];
    if (version.length === 0 || !VERSION_MATCH.test(version))
      throw new Error('Version information missing');
    const match = version.match(VERSION_MATCH);
    if (!match)
      throw new Error(`File version information is malformed`);
    if (match[1] !== '1.05')
      throw new Error(`File version ${match[1]} is not supported`);

    return match[1];
  }

  private parseDescription(): string {
    const len = this.lines.length;
    let i = 0;
    for (; i < len; i++) {
      if (i > 22)
        throw new Error('There can\'t be more than 22 description lines');
      if (!DESCRIPTION_MATCH.test(this.lines[i]))
        break;
    }

    // Ez a rész opcionális, ha hiányzik akkor átugorjuk
    if (i === 0)
      return '';

    return this.lines.splice(0, i).map(l => l.replace(DESCRIPTION_MATCH, '$1')).join('\n');
  }

  private parseRuleSpec(): RuleSpecification {
    // Ez a mező opcionális, ha hiányzik akkor marad az alapbeállítás
    if (!RULESPEC_MATCH.test(this.lines[0]))
      return RuleSpecification.getDefault();

    const match = this.lines.splice(0, 1)[0].match(RULESPEC_MATCH);
    // #N = alapbeállítások
    if (match[1] === 'N')
      return RuleSpecification.getDefault();

    // #R %d/%d
    if (match[2] === '' || match[3] === '')
      throw new Error('Rule specification');
    return new RuleSpecification(match[2], match[3]);
  }

  private parseCellBlocks(): CellBlock[] {
    const blockList: IBlock[] = [];
    let currentBlock: IBlock;

    this.lines.forEach(line => {
      // Új blokk kezdődik
      if (!CELLBLOCK_START_MATCH.test(line)) {
        // Előző blokkhoz adunk hozzá
        currentBlock.lines.push(line);
        return;
      }

      if (currentBlock)
        blockList.push(currentBlock);

      const match = line.match(CELLBLOCK_START_MATCH);
      currentBlock = {
        offset: new Point(parseInt(match[1], 10), parseInt(match[2], 10)),
        lines: [],
      };
    });

    if (currentBlock)
        blockList.push(currentBlock);

    const output: CellBlock[] = [];
    blockList.forEach(block => {
      const blocks = [];
      const lineCount = block.lines.length;
      for (let y = 0; y < lineCount; y++) {
        // Jobb oldalon a felesleges üres karakterek elhagyhatók
        const truncatedLine = block.lines[y].replace(/\.+$/, '');
        Array.from(truncatedLine).forEach((char, x) => {
          if (char === '*')
            blocks.push(new Point(x, y));
          else if (char !== '.')
            throw new Error(`Invalid character ${char} in block #P ${block.offset.x} ${block.offset.y}`);
        });
      }
      output.push(new CellBlock(block.offset, blocks));
    });
    return output;
  }
}
