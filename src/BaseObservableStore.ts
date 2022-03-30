import { BehaviorSubject, distinctUntilChanged, Observable, pluck } from "rxjs";

export type State = {
  [key: string]: any;
};

export type ObservableState<T extends State> = {
  [Property in keyof T]: Observable<T[Property]>;
};

export type StateSetters<T extends State> = {
  [Property in keyof T]: (value: T[Property]) => void;
};

export abstract class BaseObservableStore<T extends State> {
  private state = this.getInitialState();

  protected _state$: BehaviorSubject<T> = new BehaviorSubject<T>(
    this.getInitialState()
  );

  readonly state$: Observable<T> = this._state$.asObservable();
  readonly selectors: ObservableState<T> = this.initSelectors();
  readonly setters: StateSetters<T> = this.initSetters();

  protected abstract getInitialState(): T;

  private initSetters(): StateSetters<T> {
    const keys = Object.keys(this.getInitialState());

    return keys.reduce((map, key) => {
      // @ts-ignore
      map[key] = (value: any) => {
        this.updatePortionOfState(key, value);
      };

      return map;
    }, {} as StateSetters<T>);
  }

  private initSelectors(): ObservableState<T> {
    const keys = Object.keys(this.getInitialState());

    return keys.reduce((map, key) => {
      // @ts-ignore
      map[key] = this.state$.pipe(
        pluck(key),
        distinctUntilChanged((prev, curr) =>
          this.compareValueOfState(prev, curr)
        )
      );

      return map;
    }, {} as ObservableState<T>);
  }

  public updateState(newState: T): void {
    this.state = { ...newState };
    this._state$.next(newState);
  }

  public resetState(): void {
    this.updateState(this.getInitialState());
  }

  protected updatePortionOfState(key: keyof T, value: any): void {
    const newState = {
      ...this.state,
      [key]: value,
    };

    this.updateState(newState);
  }

  private compareValueOfState(prev: any, curr: any): boolean {
    if (this.isObject(prev)) {
      return this.deepEqual(prev, curr);
    }

    return prev === curr;
  }

  private deepEqual(object1: any, object2: any) {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      const val1 = object1[key];
      const val2 = object2[key];
      const areObjects = this.isObject(val1) && this.isObject(val2);

      if (
        (areObjects && !this.deepEqual(val1, val2)) ||
        (!areObjects && val1 !== val2)
      ) {
        return false;
      }
    }

    return true;
  }

  private isObject(object: any) {
    return object != null && typeof object === "object";
  }
}
