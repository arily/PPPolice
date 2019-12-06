import * as Nano from "nano";
import { AsyncResponse } from "../AsyncResponse";
export interface AttachmentAsync extends Nano.Attachment {
    insertAsync(docName: string, attName: string, att: any, contentType: string, params?: any): AsyncResponse<any>;
    getAsync(docName: string, attName: string, params?: any): AsyncResponse<any>;
    destroyAsync(docName: string, attName: string, params?: any): AsyncResponse<any>;
}
