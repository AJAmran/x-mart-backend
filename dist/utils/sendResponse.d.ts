import { Response } from "express";
type TResponse<T> = {
    statusCode: number;
    success: boolean;
    message?: string;
    meta?: {
        total?: number;
        page?: number;
        limit?: number;
    };
    data: T;
};
declare const sendResponse: <T>(res: Response, data: TResponse<T>) => void;
export default sendResponse;
