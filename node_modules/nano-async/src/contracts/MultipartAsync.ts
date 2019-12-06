import * as Nano from "nano";
import {AsyncResponse} from "../AsyncResponse";

export interface MultipartAsync<D> extends Nano.Multipart<D> {
    // http://docs.couchdb.org/en/latest/api/document/common.html#creating-multiple-attachments
    insertAsync(doc: D, attachments: any[], params?: any): AsyncResponse<Nano.DocumentInsertResponse>;

    getAsync(docname: string, params?: any): AsyncResponse<any>;
}
