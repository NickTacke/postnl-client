import { type PostNLClientOptions, resolveConfig } from "./config";
import { Transport } from "./core/http";

// resources are attached in later slices
export class PostNLClient {
  protected readonly transport: Transport;
  constructor(options: PostNLClientOptions) {
    this.transport = new Transport(resolveConfig(options));
  }
}
