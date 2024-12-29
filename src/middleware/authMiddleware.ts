import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { environment } from "../config";


export const authMiddleware = (roles: string[] = []) => (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, environment.jwtSecret) as any;
    req.user = decoded;
    if (roles.length && !roles.includes(decoded.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
