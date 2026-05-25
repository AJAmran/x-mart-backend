import { Request, Response } from "express";
export declare const ProductControllers: {
    createProduct: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getAllProducts: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getProductById: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    updateProduct: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    deleteProduct: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    updateStock: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    applyDiscount: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    removeDiscount: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
};
