/// <reference types="nano" />
import * as Nano from "nano";
export declare function isServerScope(nano: Nano.ServerScope | Nano.DocumentScope<any>): nano is Nano.ServerScope;
