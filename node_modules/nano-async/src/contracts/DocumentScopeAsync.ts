import * as Nano from "nano";
import {AsyncResponse} from "../AsyncResponse";
import {AttachmentAsync} from "./AttachmentAsync";
import {MultipartAsync} from "./MultipartAsync";
import {ServerScopeAsync} from "./ServerScopeAsync";

export interface DocumentScopeAsync<D> extends Nano.DocumentScope<D> {
    multipart: MultipartAsync<D>;
    attachment: AttachmentAsync;

    server: ServerScopeAsync;

    // http://docs.couchdb.org/en/latest/api/database/common.html#get--db
    infoAsync(): Promise<Nano.DatabaseGetResponse>;

    // http://docs.couchdb.org/en/latest/api/server/common.html#post--_replicate
    replicateAsync(target: string | Nano.DocumentScope<D>, options?: any): Promise<Nano.DatabaseReplicateResponse>;

    // http://docs.couchdb.org/en/latest/api/database/compact.html#post--db-_compact
    compactAsync(): Promise<Nano.OkResponse>;

    // http://docs.couchdb.org/en/latest/api/database/changes.html#get--db-_changes
    changesAsync(params?: Nano.DatabaseChangesParams): AsyncResponse<Nano.DatabaseChangesResponse>;

    // http://docs.couchdb.org/en/latest/api/server/authn.html#cookie-authentication
    authAsync(username: string, password: string): AsyncResponse<Nano.DatabaseAuthResponse>;

    // http://docs.couchdb.org/en/latest/api/server/authn.html#get--_session
    sessionAsync(): AsyncResponse<any>;

    // http://docs.couchdb.org/en/latest/api/database/common.html#post--db
    // http://docs.couchdb.org/en/latest/api/document/common.html#put--db-docid
    insertAsync(
        document: Nano.ViewDocument<D> | D & Nano.MaybeDocument,
        params?: Nano.DocumentInsertParams | string | null,
    ): AsyncResponse<Nano.DocumentInsertResponse>;

    // http://docs.couchdb.org/en/latest/api/document/common.html#get--db-docid
    getAsync(docName: string, params?: Nano.DocumentGetParams): AsyncResponse<Nano.DocumentGetResponse & D>;

    // http://docs.couchdb.org/en/latest/api/document/common.html#head--db-docid
    headAsync(docName: string): AsyncResponse<void>;

    // http://docs.couchdb.org/en/latest/api/document/common.html#copy--db-docid
    copyAsync(
        srcDocument: string,
        dstDocument: string,
        options?: Nano.DocumentCopyOptions,
    ): AsyncResponse<Nano.DocumentCopyResponse>;

    // http://docs.couchdb.org/en/latest/api/document/common.html#delete--db-docid
    destroyAsync(docName: string, rev: string): AsyncResponse<Nano.DocumentDestroyResponse>;

    bulkAsync(docs: Nano.BulkModifyDocsWrapper, params?: any): AsyncResponse<any>;

    // http://docs.couchdb.org/en/latest/api/database/bulk-api.html#get--db-_all_docs
    listAsync(params?: Nano.DocumentListParams): AsyncResponse<Nano.DocumentListResponse<D>>;

    // http://docs.couchdb.org/en/latest/api/database/bulk-api.html#post--db-_all_docs
    fetchAsync(
        docNames: Nano.BulkFetchDocsWrapper,
        params?: Nano.DocumentFetchParams,
    ): AsyncResponse<Nano.DocumentFetchResponse<D>>;

    // http://docs.couchdb.org/en/latest/api/database/bulk-api.html#post--db-_all_docs
    fetchRevsAsync(
        docNames: Nano.BulkFetchDocsWrapper,
        params?: Nano.DocumentFetchParams,
    ): AsyncResponse<Nano.DocumentFetchRevsResponse>;

    // http://docs.couchdb.org/en/latest/api/ddoc/render.html#get--db-_design-ddoc-_show-func
    showAsync(
        designName: string,
        showName: string,
        docId: string,
        params?: any,
    ): AsyncResponse<any>;

    // http://docs.couchdb.org/en/latest/api/ddoc/render.html#put--db-_design-ddoc-_update-func-docid
    atomicAsync(
        designName: string,
        updateName: string,
        docName: string,
        body?: any,
    ): AsyncResponse<Nano.OkResponse>;

    // http://docs.couchdb.org/en/latest/api/ddoc/render.html#put--db-_design-ddoc-_update-func-docid
    updateWithHandlerAsync(
        designName: string,
        updateName: string,
        docName: string,
        body?: any,
    ): AsyncResponse<Nano.OkResponse>;

    searchAsync(designName: string, searchName: string, params?: any): AsyncResponse<any>;

    spatialAsync(ddoc: string, viewName: string, params?: any): AsyncResponse<any>;

    // http://docs.couchdb.org/en/latest/api/ddoc/views.html#get--db-_design-ddoc-_view-view
    // http://docs.couchdb.org/en/latest/api/ddoc/views.html#post--db-_design-ddoc-_view-view
    viewAsync<V>(
        designName: string,
        viewName: string,
        params?: Nano.DocumentViewParams,
    ): AsyncResponse<Nano.DocumentViewResponse<V>>;

    // http://docs.couchdb.org/en/latest/api/ddoc/render.html#db-design-design-doc-list-list-name-view-name
    viewWithListAsync(
        designName: string,
        viewName: string,
        listName: string,
        params?: Nano.DocumentViewParams,
    ): AsyncResponse<any>;
}
