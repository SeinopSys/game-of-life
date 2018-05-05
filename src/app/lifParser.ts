import { RuleSpecification } from './ruleSpecification';
import { SimulationFile } from './simulationFile';
import { CellBlock } from './cellBlock';
import { Point } from './point';

const VERSION_MATCH = /^#Life ([.\d]+)$/;
const DESCRIPTION_MATCH = /^#[DC](?:\s(.+))?$/;
const RULESPEC_MATCH = /^#([RN])(?:\s+(\d+)\/(\d+))?$/;
const CELLBLOCK_START_MATCH = /^#P\s+(-?\d+)\s+(-?\d+)$/;

const SUPPORTED_FILE_VERSIONS = {
  '1.05': true,
  '1.06': true,
};

interface IBlock {
  offset: Point;
  lines: string[];
}

export class LifParser {
  lines?: string[];

  version: string;

  parse(file: string): SimulationFile {
    if (file.length < 1)
      throw new Error('A kiválaszott fájl üres');
    const firstChar = file[0];
    if (firstChar !== '#')
      throw new Error(`Nem támogatott fájlformátum`);

    this.lines = file.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    this.version = this.parseVersion();
    const description = this.parseDescription();
    const ruleSpec = this.parseRuleSpec();
    const cellBlocks = this.parseCellBlocks();

    return new SimulationFile(this.version, description, ruleSpec, cellBlocks);
  }

  private parseVersion(): string {
    const ver = this.lines.splice(0, 1)[0];
    if (ver.length === 0 || !VERSION_MATCH.test(ver))
      throw new Error('Hiányzik a verzió információ');
    const match = ver.match(VERSION_MATCH);
    if (!match)
      throw new Error(`A verzió információ formátuma nem megfelelő`);
    if (SUPPORTED_FILE_VERSIONS[match[1]] !== true)
      throw new Error(`A(z) ${match[1]} verziójú fájlok nem támogatottak`);

    return match[1];
  }

  private parseDescription(): string {
    switch (this.version) {
      case '1.05':
        const len = this.lines.length;
        let i = 0;
        for (; i < len; i++) {
          if (i > 22)
            throw new Error('Nem lehet 22-nél több leírás sor');
          if (!DESCRIPTION_MATCH.test(this.lines[i]))
            break;
          else {
            const match = this.lines[i].match(DESCRIPTION_MATCH);
            if (match[1] && match[1].length > 78) {
              throw new Error('A leírások soronként maximum 78 karaktert tartalmazhatnak');
            }
          }
        }

        // Ez a rész opcionális, ha hiányzik akkor átugorjuk
        if (i === 0)
          return '';

        return this.lines.splice(0, i).map(l => l.replace(DESCRIPTION_MATCH, '$1')).join('\n');
      case '1.06':
        // Ez a formátum nem tesz lehetővé leírás megadást
        return '';
      default:
        throw new Error(`A parseDescription metódus nincs implementálva a(z) ${this.version} verzióhoz`);
    }
  }

  private parseRuleSpec(): RuleSpecification {
    switch (this.version) {
      case '1.05':
        // Ez a mező opcionális, ha hiányzik akkor marad az alapbeállítás
        if (!RULESPEC_MATCH.test(this.lines[0]))
          return RuleSpecification.getDefault();

        const match = this.lines.splice(0, 1)[0].match(RULESPEC_MATCH);
        // #N = alapbeállítások
        if (match[1] === 'N')
          return RuleSpecification.getDefault();

        // #R %d/%d
        if (match[2] === '' || match[3] === '')
          throw new Error('Hiányos a szabály meghatározás kötelező paramétere');
        return new RuleSpecification(match[2], match[3]);
      case '1.06':
        // Ez a formátum nem teszi lehetővé a szabályrendszer módosítását
        return RuleSpecification.getDefault();
      default:
        throw new Error(`A parseRuleSpec metódus nincs implementálva a(z) ${this.version} verzióhoz`);
    }
  }

  private parseCellBlocks(): CellBlock[] {
    const blockList: IBlock[] = [];
    const output: CellBlock[] = [];
    switch (this.version) {
      case '1.05':
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

        blockList.forEach(block => {
          const blocks = [];
          const lineCount = block.lines.length;
          for (let y = 0; y < lineCount; y++) {
            // Jobb oldalon a felesleges üres karakterek elhagyhatók
            const truncatedLine = block.lines[y].replace(/\.+$/, '');
            Array.from(truncatedLine).forEach((char, x) => {
              if (char === '*')
                blocks.push(block.offset.addRaw(x, y));
              else if (char !== '.')
                throw new Error(`Érvénytelen karakter (${char}) a #P ${block.offset.x} ${block.offset.y} blokkban`);
            });
          }
          output.push(new CellBlock(block.offset, blocks));
        });
      break;
      case '1.06':
        // Ez a formátum nem teszi lehetővé a szabályrendszer módosítását
        const origin = new Point(0, 0);
        this.lines.forEach(line => {
          const [ x, y ] = line.split(/\s+/).map(n => parseInt(n, 10));
          output.push(new CellBlock(origin, [ new Point(x, y) ]));
        });
      break;
      default:
        throw new Error(`A parseCellBlocks metódus nincs implementálva a(z) ${this.version} verzióhoz`);
    }

    return output;
  }
}
