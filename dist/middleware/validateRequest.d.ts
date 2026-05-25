import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";
declare const validateRequest: (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const validateRequestCookies: (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export default validateRequest;
