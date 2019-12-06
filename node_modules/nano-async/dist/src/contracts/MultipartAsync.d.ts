/// <reference types="nano" />
import * as Nano from "nano";
import { AsyncResponse } from "../AsyncResponse";
export interface MultipartAsync<D> extends Nano.Multipart<D> {
    insertAsync(doc: D, attachments: any[], params?: any): AsyncResponse<Nano.DocumentInsertResponse>;
    getAsync(docname: string, params?: any): AsyncResponse<any>;
}
