export declare const AuthControllers: {
    registerUser: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    loginUser: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    changePassword: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    refreshToken: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    logout: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    getMe: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
};
