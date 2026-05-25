import { NextFunction, Request, Response } from "express";
declare const notFound: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export default notFound;
