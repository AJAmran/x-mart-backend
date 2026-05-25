"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pick = (object, keys) => {
    return keys.reduce((result, key) => {
        if (object && Object.prototype.hasOwnProperty.call(object, key)) {
            result[key] = object[key];
        }
        return result;
    }, {});
};
exports.default = pick;
//# sourceMappingURL=pick.js.map