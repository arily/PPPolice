import * as Nano from "nano";
import {AsyncResponse} from "../AsyncResponse";
import {DocumentScopeAsync} from "./DocumentScopeAsync";

export interface DatabaseScopeAsync extends Nano.DatabaseScope {
    // http://docs.couchdb.org/en/latest/api/database/common.html#put--db
    createAsync(name: string): AsyncResponse<Nano.DatabaseCreateResponse>;

    // http://docs.couchdb.org/en/latest/api/database/common.html#get--db
    getAsync(name: string): AsyncResponse<Nano.DatabaseGetResponse>;

    // http://docs.couchdb.org/en/latest/api/database/common.html#delete--db
    destroyAsync(name: string): AsyncResponse<Nano.OkResponse>;

    // http://docs.couchdb.org/en/latest/api/server/common.html#get--_all_dbs
    listAsync(): AsyncResponse<string[]>;

    use<D>(db: string): DocumentScopeAsync<D>;

    // http://docs.couchdb.org/en/latest/api/database/compact.html#post--db-_compact
    compactAsync(name: string, designName?: string): AsyncResponse<Nano.OkResponse>;

    // http://docs.couchdb.org/en/latest/api/server/common.html#post--_replicate
    replicateAsync<D>(
        source: string | Nano.DocumentScope<D>,
        target: string | Nano.DocumentScope<D>,
        options?: Nano.DatabaseReplicateOptions,
    ): AsyncResponse<Nano.DatabaseReplicateResponse>;

    // http://docs.couchdb.org/en/latest/api/database/compact.html#post--db-_compact
    changesAsync(name: string, params?: Nano.DatabaseChangesParams): AsyncResponse<Nano.DatabaseChangesResponse>;

    // http://docs.couchdb.org/en/latest/api/server/common.html#get--_db_updates
    updatesAsync(params?: Nano.UpdatesParams): AsyncResponse<Nano.DatabaseUpdatesResponse>;
}
