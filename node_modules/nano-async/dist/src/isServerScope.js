"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isServerScope(nano) {
    // TODO: This should be enough???
    return nano.hasOwnProperty("db");
}
exports.isServerScope = isServerScope;
//# sourceMappingURL=isServerScope.js.map