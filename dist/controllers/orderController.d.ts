import { Request, Response } from "express";
export declare const OrderControllers: {
    createOrder: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getAllOrders: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getOrderById: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getUserOrders: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    updateOrderStatus: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    cancelOrder: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
};
