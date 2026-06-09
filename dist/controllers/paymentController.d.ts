import { Request, Response } from "express";
export declare const PaymentController: {
    initPayment: (req: Request, res: Response) => Promise<void>;
    handleSuccess: (req: Request, res: Response) => Promise<void>;
    handleFail: (req: Request, res: Response) => Promise<void>;
    handleCancel: (req: Request, res: Response) => Promise<void>;
    handleIpn: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getPaymentStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
