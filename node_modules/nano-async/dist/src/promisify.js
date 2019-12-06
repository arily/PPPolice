"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function promisify(method) {
    var _this = this;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new Promise(function (resolve, reject) {
            args.push(function (err) {
                var result = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    result[_i - 1] = arguments[_i];
                }
                if (!err) {
                    resolve(result);
                }
                else {
                    reject(err);
                }
            });
            method.apply(_this, args);
        });
    };
}
exports.promisify = promisify;
//# sourceMappingURL=promisify.js.map