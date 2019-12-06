import * as Nano from "nano";

export function isServerScope(nano: Nano.ServerScope | Nano.DocumentScope<any>): nano is Nano.ServerScope {
    // TODO: This should be enough???
    return nano.hasOwnProperty("db");
}
