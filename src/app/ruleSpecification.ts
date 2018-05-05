export class RuleSpecification {
  /**
   * A túléléshez szükséges szomszédos cellák számai, indexelve
   */
  survival: { [key: number]: true } = {};
  /**
   * A születéshez szükséges szomszédos cellák számai, indexelve
   */
  birth: { [key: number]: true } = {};

  static getDefault(): RuleSpecification {
    return new RuleSpecification('23', '3');
  }

  constructor(survival: string, birth: string) {
    this.convertInput(survival).forEach(el => {
      this.survival[el] = true;
    });
    this.convertInput(birth).forEach(el => {
      this.birth[el] = true;
    });
  }

  willStayAlive(neighborCount: number) {
    return this.survival[neighborCount] === true;
  }

  willBeBorn(neighborCount: number) {
    return this.birth[neighborCount] === true;
  }

  /**
   * A bemenetből egy szám tömböt generál duplikált elemek nélkül
   * @param {string} str
   * @returns {number[]}
   */
  private convertInput(str: string): number[] {
    return Array.from(str).map(n => parseInt(n, 10)).filter((val, ix, arr) => {
      return arr.indexOf(val) === ix;
    });
  }
}
