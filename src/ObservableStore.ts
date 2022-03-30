import { AppState } from "./AppState";
import { BaseObservableStore, State } from "./BaseObservableStore";

export abstract class ObservableStore<
  T extends State,
  S extends AppState
> extends BaseObservableStore<T> {
  protected appState: S;

  public constructor(appState: S) {
    super();
    this.appState = appState;
  }
}
