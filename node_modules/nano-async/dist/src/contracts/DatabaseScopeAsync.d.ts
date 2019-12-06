/// <reference types="nano" />
import * as Nano from "nano";
import { AsyncResponse } from "../AsyncResponse";
import { DocumentScopeAsync } from "./DocumentScopeAsync";
export interface DatabaseScopeAsync extends Nano.DatabaseScope {
    createAsync(name: string): AsyncResponse<Nano.DatabaseCreateResponse>;
    getAsync(name: string): AsyncResponse<Nano.DatabaseGetResponse>;
    destroyAsync(name: string): AsyncResponse<Nano.OkResponse>;
    listAsync(): AsyncResponse<string[]>;
    use<D>(db: string): DocumentScopeAsync<D>;
    compactAsync(name: string, designName?: string): AsyncResponse<Nano.OkResponse>;
    replicateAsync<D>(source: string | Nano.DocumentScope<D>, target: string | Nano.DocumentScope<D>, options?: Nano.DatabaseReplicateOptions): AsyncResponse<Nano.DatabaseReplicateResponse>;
    changesAsync(name: string, params?: Nano.DatabaseChangesParams): AsyncResponse<Nano.DatabaseChangesResponse>;
    updatesAsync(params?: Nano.UpdatesParams): AsyncResponse<Nano.DatabaseUpdatesResponse>;
}
