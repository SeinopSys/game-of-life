import { TestBed, inject } from '@angular/core/testing';

import { ParserService } from './parser.service';
import { SimulationFile } from './simulationFile';
import { Point } from './point';

const TEST_LIF_FILE = `#Life 1.05
#D Acorn
#D The most vigorously growing 7-cell
#D "methuselah" pattern.  See also RABBITS.
#N
#P -3 -1
.*.....
...*...
**..***`;

describe('ParserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ParserService]
    });
  });

  it('should be created', inject([ParserService], (service: ParserService) => {
    expect(service).toBeTruthy();
  }));

  it('should parse valid lif files', inject([ParserService], (service: ParserService) => {
    const file = service.parseFile(TEST_LIF_FILE);

    expect(file).toEqual(jasmine.any(SimulationFile));

    const version = file.getVersion();
    expect(version).toEqual('1.05');

    const description = file.getDescription();
    expect(description).toEqual('Acorn\n' +
                                'The most vigorously growing 7-cell\n' +
                                '"methuselah" pattern.  See also RABBITS.');

    const ruleSpec = file.getRuleSpec();
    expect(ruleSpec.survival).toEqual([2, 3]);
    expect(ruleSpec.birth).toEqual([3]);

    const cellBlocks = file.getCellBlocks();
    expect(cellBlocks.length).toEqual(1);
    expect(cellBlocks[0].offset).toEqual(jasmine.any(Point));
    expect(cellBlocks[0].offset.x).toEqual(-3);
    expect(cellBlocks[0].offset.y).toEqual(-1);

    expect(cellBlocks[0].blocks.length).toEqual(7);
    expect(cellBlocks[0].blocks[0].x).toEqual(1);
    expect(cellBlocks[0].blocks[0].y).toEqual(0);

    expect(cellBlocks[0].blocks[1].x).toEqual(3);
    expect(cellBlocks[0].blocks[1].y).toEqual(1);

    expect(cellBlocks[0].blocks[2].x).toEqual(0);
    expect(cellBlocks[0].blocks[2].y).toEqual(2);

    expect(cellBlocks[0].blocks[3].x).toEqual(1);
    expect(cellBlocks[0].blocks[3].y).toEqual(2);

    expect(cellBlocks[0].blocks[4].x).toEqual(4);
    expect(cellBlocks[0].blocks[4].y).toEqual(2);

    expect(cellBlocks[0].blocks[5].x).toEqual(5);
    expect(cellBlocks[0].blocks[5].y).toEqual(2);

    expect(cellBlocks[0].blocks[6].x).toEqual(6);
    expect(cellBlocks[0].blocks[6].y).toEqual(2);
  }));

  it('should throw on unsupported file version', inject([ParserService], (service: ParserService) => {
    expect(() => { service.parseFile(TEST_LIF_FILE.replace('1.05', '89')); }).toThrow();
  }));

  it('should not throw on maximum lines of description', inject([ParserService], (service: ParserService) => {
    // A 3 sor leírásból 22-t csinál (1 + 2 => (21 - 1) + 2)
    expect(() => { service.parseFile(TEST_LIF_FILE.replace(/(#D .*\n)/, new Array(21).join('$1'))); }).not.toThrow();
  }));

  it('should throw on too many lines of description', inject([ParserService], (service: ParserService) => {
    // A 3 sor leírásból 23-at csinál (1 + 2 => (22 - 1) + 2)
    expect(() => { service.parseFile(TEST_LIF_FILE.replace(/(#D .*\n)/, new Array(22).join('$1'))); }).toThrow();
  }));

  it('should throw on invalid character in block definition', inject([ParserService], (service: ParserService) => {
    expect(() => { service.parseFile(TEST_LIF_FILE.replace(/\*/, '#')); }).toThrow();
  }));
});
