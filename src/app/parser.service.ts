import { Injectable } from '@angular/core';
import { LifParser } from './lifParser';

@Injectable()
export class ParserService {

  constructor() { }

  // noinspection JSMethodCanBeStatic
  parseFile(contents: string) {
    const parser = new LifParser();
    return parser.parse(contents);
  }

}
