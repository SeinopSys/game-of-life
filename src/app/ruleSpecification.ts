export class RuleSpecification {
  /**
   * A túléléshez szükséges szomszédos cellák számai
   */
  survival: number[];
  /**
   * A születéshez szükséges szomszédos cellák számai
   */
  birth: number[];

  static getDefault(): RuleSpecification {
    return new RuleSpecification('23', '3');
  }

  constructor(survival: string, birth: string) {
    this.survival = this.convertInput(survival);
    this.birth = this.convertInput(birth);
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
