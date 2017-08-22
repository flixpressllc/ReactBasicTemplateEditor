export default class Deferred {
  public resolve: Function;
  public reject: Function;
  public then: Function;
  public catch: Function;

  constructor() {
    let _p: Promise<any> = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    })
    this.then = (f: any) => _p.then(f);
    this.catch = (f: any) => _p.catch(f);
  }
}
