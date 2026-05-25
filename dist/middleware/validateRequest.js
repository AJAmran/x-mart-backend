"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequestCookies = void 0;
const catchAsync_1 = require("../utils/catchAsync");
const validateRequest = (schema) => {
    return (0, catchAsync_1.catchAsync)(async (req, res, next) => {
        const parsedBody = await schema.parseAsync({
            body: req.body,
        });
        req.body = parsedBody.body;
        next();
    });
};
const validateRequestCookies = (schema) => {
    return (0, catchAsync_1.catchAsync)(async (req, res, next) => {
        const parsedCookies = await schema.parseAsync({
            cookies: req.cookies,
        });
        req.cookies = parsedCookies.cookies;
        next();
    });
};
exports.validateRequestCookies = validateRequestCookies;
exports.default = validateRequest;
//# sourceMappingURL=validateRequest.js.map