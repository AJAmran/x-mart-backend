import { Request, Response } from "express";
export declare const BranchControllers: {
    createBranch: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getAllBranches: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getBranchById: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    updateBranch: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    deleteBranch: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getNearbyBranches: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getBranchProducts: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getBranchStaff: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getBranchTypes: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getBranchStatuses: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
};
