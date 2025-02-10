import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
}
if (user) {
  throw new AppError(httpStatus.NOT_FOUND, 'This user is already exist!');
}