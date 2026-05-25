import { Request, Response } from "express";
export declare const CartController: {
    getCart: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    updateCart: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    deleteCart: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
};
