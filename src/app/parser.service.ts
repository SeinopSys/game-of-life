import { Injectable } from '@angular/core';
import { LifParser } from './lifParser';

@Injectable()
export class ParserService {

  constructor() { }

  parseFile(contents: string) {
    const parser = new LifParser();
    return parser.parse(contents);
  }

}
