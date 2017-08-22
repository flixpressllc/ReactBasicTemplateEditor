class Deferred<T> {
  public resolve: (value: T) => any;
  public reject: Function;
  public then: Function;
  public catch: Function;
  private _p: Promise<T>;

  public getPromise(): Promise<any> {
    return this.then((d:any) => d);
  }

  constructor() {
    this._p = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    })
    this.then = (f: any) => this._p.then(f);
    this.catch = (f: any) => this._p.catch(f);
  }
}

export default Deferred;
