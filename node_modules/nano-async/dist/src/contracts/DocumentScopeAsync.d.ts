/// <reference types="nano" />
import * as Nano from "nano";
import { AsyncResponse } from "../AsyncResponse";
import { AttachmentAsync } from "./AttachmentAsync";
import { MultipartAsync } from "./MultipartAsync";
import { ServerScopeAsync } from "./ServerScopeAsync";
export interface DocumentScopeAsync<D> extends Nano.DocumentScope<D> {
    multipart: MultipartAsync<D>;
    attachment: AttachmentAsync;
    server: ServerScopeAsync;
    infoAsync(): Promise<Nano.DatabaseGetResponse>;
    replicateAsync(target: string | Nano.DocumentScope<D>, options?: any): Promise<Nano.DatabaseReplicateResponse>;
    compactAsync(): Promise<Nano.OkResponse>;
    changesAsync(params?: Nano.DatabaseChangesParams): AsyncResponse<Nano.DatabaseChangesResponse>;
    authAsync(username: string, password: string): AsyncResponse<Nano.DatabaseAuthResponse>;
    sessionAsync(): AsyncResponse<any>;
    insertAsync(document: Nano.ViewDocument<D> | D & Nano.MaybeDocument, params?: Nano.DocumentInsertParams | string | null): AsyncResponse<Nano.DocumentInsertResponse>;
    getAsync(docName: string, params?: Nano.DocumentGetParams): AsyncResponse<Nano.DocumentGetResponse & D>;
    headAsync(docName: string): AsyncResponse<void>;
    copyAsync(srcDocument: string, dstDocument: string, options?: Nano.DocumentCopyOptions): AsyncResponse<Nano.DocumentCopyResponse>;
    destroyAsync(docName: string, rev: string): AsyncResponse<Nano.DocumentDestroyResponse>;
    bulkAsync(docs: Nano.BulkModifyDocsWrapper, params?: any): AsyncResponse<any>;
    listAsync(params?: Nano.DocumentListParams): AsyncResponse<Nano.DocumentListResponse<D>>;
    fetchAsync(docNames: Nano.BulkFetchDocsWrapper, params?: Nano.DocumentFetchParams): AsyncResponse<Nano.DocumentFetchResponse<D>>;
    fetchRevsAsync(docNames: Nano.BulkFetchDocsWrapper, params?: Nano.DocumentFetchParams): AsyncResponse<Nano.DocumentFetchRevsResponse>;
    showAsync(designName: string, showName: string, docId: string, params?: any): AsyncResponse<any>;
    atomicAsync(designName: string, updateName: string, docName: string, body?: any): AsyncResponse<Nano.OkResponse>;
    updateWithHandlerAsync(designName: string, updateName: string, docName: string, body?: any): AsyncResponse<Nano.OkResponse>;
    searchAsync(designName: string, searchName: string, params?: any): AsyncResponse<any>;
    spatialAsync(ddoc: string, viewName: string, params?: any): AsyncResponse<any>;
    viewAsync<V>(designName: string, viewName: string, params?: Nano.DocumentViewParams): AsyncResponse<Nano.DocumentViewResponse<V>>;
    viewWithListAsync(designName: string, viewName: string, listName: string, params?: Nano.DocumentViewParams): AsyncResponse<any>;
}
