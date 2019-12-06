import * as Nano from "nano";
import {DocumentScopeAsync} from "./src/contracts/DocumentScopeAsync";
import {ServerScopeAsync} from "./src/contracts/ServerScopeAsync";
import {Wrapper} from "./src/Wrapper";
import nanoFactory = require("nano");

export {AttachmentAsync} from "./src/contracts/AttachmentAsync";
export {DatabaseScopeAsync} from "./src/contracts/DatabaseScopeAsync";
export {DocumentScopeAsync} from "./src/contracts/DocumentScopeAsync";
export {MultipartAsync} from "./src/contracts/MultipartAsync";
export {ServerScopeAsync} from "./src/contracts/ServerScopeAsync";

export {
    DocumentScope,
    ServerScope,
    DatabaseScope,
    Attachment,
    Multipart,
    OkResponse,
    Configuration,
    MaybeDocument,
    Document,
    IdentifiedDocument,
    RevisionedDocument,
    MaybeRevisionedDocument,
    MaybeIdentifiedDocument,
    BulkFetchDocsWrapper,
    BulkModifyDocsWrapper,
    Callback,
    DatabaseAuthResponse,
    DatabaseChangesParams,
    DatabaseChangesResponse,
    DatabaseChangesResultItem,
    DatabaseCreateResponse,
    DatabaseGetResponse,
    DatabaseReplicateOptions,
    DatabaseReplicateResponse,
    DatabaseReplicationHistoryItem,
    DatabaseScopeFollowUpdatesParams,
    DatabaseSessionResponse,
    DatabaseUpdatesResponse,
    DatabaseUpdatesResultItem,
    DocumentCopyOptions,
    DocumentCopyResponse,
    DocumentDestroyResponse,
    DocumentFetchParams,
    DocumentFetchResponse,
    DocumentFetchRevsResponse,
    DocumentGetParams,
    DocumentGetResponse,
    DocumentInsertParams,
    DocumentInsertResponse,
    DocumentListParams,
    DocumentListResponse,
    DocumentResponseRow,
    DocumentResponseRowMeta,
    DocumentScopeFollowUpdatesParams,
    DocumentViewParams,
    DocumentViewResponse,
    FollowUpdatesParamsFilterFunction,
    RequestFunction,
    RequestOptions,
    ServerConfig,
    UpdatesParams,
    View,
    ViewDocument,
} from "nano";

export default <D>(config: Nano.Configuration | string): ServerScopeAsync | DocumentScopeAsync<D> => {
    return Wrapper.wrap(nanoFactory(config));
};
