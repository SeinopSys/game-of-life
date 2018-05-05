import { TestBed, inject } from '@angular/core/testing';

import { ParserService } from './parser.service';
import { SimulationFile } from './simulationFile';
import { Point } from './point';

describe('ParserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ParserService]
    });
  });

  const TEST_LIF_1_05_FILE =
`#Life 1.05
#D Test file
#D 
#D Multiple lines of description
#D With a gap between the title and body
#N
#P -3 -1
.*....
...*........
**..***
#P 5 9
........
*.*.*.*.
.*.*.*.*
********`;

  const TEST_LIF_1_06_FILE =
`#Life 1.06
0 0
0 1
1 0
1 2
2 0`;

  it('should be created', inject([ParserService], (service: ParserService) => {
    expect(service).toBeTruthy();
  }));

  it('should parse valid .lif v1.05 files', inject([ParserService], (service: ParserService) => {
    const file = service.parseFile(TEST_LIF_1_05_FILE);

    expect(file).toEqual(jasmine.any(SimulationFile));

    const version = file.getVersion();
    expect(version).toEqual('1.05');

    const description = file.getDescription();
    expect(description).toEqual('Test file\n\n' +
                                'Multiple lines of description\n' +
                                'With a gap between the title and body');

    const ruleSpec = file.getRuleSpec();
    expect(ruleSpec.survival).toEqual({ 2: true, 3: true });
    expect(ruleSpec.birth).toEqual({ 3: true });

    const cellBlocks = file.getCellBlocks();
    expect(cellBlocks.length).toEqual(2);
    expect(cellBlocks[0].offset).toEqual(jasmine.any(Point));
    expect(cellBlocks[0].offset.x).toEqual(-3);
    expect(cellBlocks[0].offset.y).toEqual(-1);

    // A pontok már a beolvasás során aboszolút koordinátákat kapnak (a középponthoz képest)
    expect(cellBlocks[0].points.length).toEqual(7);
    [
      [-2, -1],
      [ 0,  0],
      [-3,  1],
      [-2,  1],
      [ 1,  1],
      [ 2,  1],
      [ 3,  1],
    ].forEach((coord, i) => {
      expect(cellBlocks[0].points[i].x).toEqual(coord[0]);
      expect(cellBlocks[0].points[i].y).toEqual(coord[1]);
    });
  }));

  it('should parse valid .lif v1.06 files', inject([ParserService], (service: ParserService) => {
    const file = service.parseFile(TEST_LIF_1_06_FILE);

    expect(file).toEqual(jasmine.any(SimulationFile));

    const version = file.getVersion();
    expect(version).toEqual('1.06');

    const description = file.getDescription();
    expect(description).toEqual('');

    const ruleSpec = file.getRuleSpec();
    expect(ruleSpec.survival).toEqual({ 2: true, 3: true });
    expect(ruleSpec.birth).toEqual({ 3: true });

    const cellBlocks = file.getCellBlocks();
    expect(cellBlocks.length).toEqual(5);
    expect(cellBlocks[0].offset).toEqual(jasmine.any(Point));

    [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 2],
      [2, 0],
    ].forEach((coord, i) => {
      expect(cellBlocks[i].points[0].x).toEqual(coord[0]);
      expect(cellBlocks[i].points[0].y).toEqual(coord[1]);
    });
  }));

  it('should recognize different rules for v1.05 files', inject([ParserService], (service: ParserService) => {
    const file = service.parseFile(TEST_LIF_1_05_FILE.replace(/^#N\s*$/m, '#R 456/78'));

    const ruleSpec = file.getRuleSpec();
    expect(ruleSpec.survival).toEqual({ 4: true, 5: true, 6: true });
    expect(ruleSpec.birth).toEqual({ 7: true, 8: true });
  }));

  it('should throw on empty input', inject([ParserService], (service: ParserService) => {
    expect(() => { service.parseFile(''); }).toThrow();
  }));

  it('should throw on missing file version', inject([ParserService], (service: ParserService) => {
    expect(() => { service.parseFile(TEST_LIF_1_05_FILE.replace(/^#Life.*$/m, '')); }).toThrow();
  }));

  it('should throw on unsupported file version', inject([ParserService], (service: ParserService) => {
    expect(() => { service.parseFile(TEST_LIF_1_05_FILE.replace('1.05', '89')); }).toThrow();
  }));

  it('should not throw on maximum lines of description', inject([ParserService], (service: ParserService) => {
    // A 3 sor leírásból 22-t csinál (1 + 3 => (20 - 1) + 3)
    expect(() => { service.parseFile(TEST_LIF_1_05_FILE.replace(/(#D .*\n)/, new Array(10).join('$1'))); }).not.toThrow();
  }));

  it('should throw on too many lines of description', inject([ParserService], (service: ParserService) => {
    // A 3 sor leírásból 23-at csinál (1 + 3 => (21 - 1) + 3)
    expect(() => { service.parseFile(TEST_LIF_1_05_FILE.replace(/(#D .*\n)/, new Array(21).join('$1'))); }).toThrow();
  }));

  it('should not throw on too long description line', inject([ParserService], (service: ParserService) => {
    expect(() => { service.parseFile(TEST_LIF_1_05_FILE.replace(/#D .*\n/, '#D ' + (new Array(79).join('.')) + '\n')); }).not.toThrow();
  }));

  it('should throw on too long description line', inject([ParserService], (service: ParserService) => {
    expect(() => { service.parseFile(TEST_LIF_1_05_FILE.replace(/#D .*\n/, '#D ' + (new Array(80).join('.')) + '\n')); }).toThrow();
  }));

  it('should throw on invalid character in block definition', inject([ParserService], (service: ParserService) => {
    expect(() => { service.parseFile(TEST_LIF_1_05_FILE.replace(/\*/, '#')); }).toThrow();
  }));

  it('should not throw if there\'s no description', inject([ParserService], (service: ParserService) => {
    expect(() => { service.parseFile(TEST_LIF_1_05_FILE.replace(/^#D.*$/m, '')); }).not.toThrow();
  }));

  it('should not throw if there\'s no rule specification', inject([ParserService], (service: ParserService) => {
    expect(() => { service.parseFile(TEST_LIF_1_05_FILE.replace(/^#[RN].*$/m, '')); }).not.toThrow();
  }));
});
