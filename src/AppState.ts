import { Config, EnvConfig } from './Config';

export class AppState {
  readonly config: Config;

  constructor() {
    this.config = this.getConfig();
  }

  protected getConfig(): Config {
    return new EnvConfig();
  }
}
