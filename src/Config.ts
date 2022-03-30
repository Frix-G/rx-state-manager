export abstract class Config {
  abstract get apiUrl(): string;
}

export class EnvConfig extends Config {
  get apiUrl(): string {
    return process.env.apiUrl || "";
  }
}
