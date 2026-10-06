import { Request, Response } from "express";
export declare const PaymentController: {
    initPayment: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    handleSuccess: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    handleFail: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    handleCancel: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    handleIpn: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getPaymentStatus: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getUserPayments: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getPaymentDetails: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
};
