/// <reference types="nano" />
import * as Nano from "nano";
import { DatabaseScopeAsync } from "./contracts/DatabaseScopeAsync";
import { DocumentScopeAsync } from "./contracts/DocumentScopeAsync";
import { ServerScopeAsync } from "./contracts/ServerScopeAsync";
export declare class Wrapper {
    static wrapServerScope(serverScope: Nano.ServerScope): ServerScopeAsync;
    static wrapDatabaseScope(databaseScope: Nano.DatabaseScope): DatabaseScopeAsync;
    static wrapDocumentScope<D>(documentScope: Nano.DocumentScope<D>): DocumentScopeAsync<D>;
    static wrap<D>(nano: Nano.ServerScope | Nano.DocumentScope<D>): ServerScopeAsync | DocumentScopeAsync<D>;
}
