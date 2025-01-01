import { Response } from "express";

/**
 * Send a success response
 * @param res Express Response object
 * @param data Data to send in the response
 * @param message Optional message for the response
 * @param statusCode HTTP status code (default: 200)
 */
export const successResponse = (
  res: Response,
  data: any = null,
  message: string = "Success",
  statusCode: number = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send an error response
 * @param res Express Response object
 * @param error Error message or object
 * @param statusCode HTTP status code (default: 500)
 */
export const errorResponse = (
  res: Response,
  error: any = "Internal Server Error",
  statusCode: number = 500
): Response => {
  const errorMessage = typeof error === "string" ? error : error.message || "Error";
  return res.status(statusCode).json({
    success: false,
    message: errorMessage,
  });
};

/**
 * Send a paginated response
 * @param res Express Response object
 * @param data Data to send in the response
 * @param total Total number of items in the database
 * @param page Current page number
 * @param limit Number of items per page
 * @param message Optional message for the response
 * @param statusCode HTTP status code (default: 200)
 */
export const paginatedResponse = (
  res: Response,
  data: any[],
  total: number,
  page: number,
  limit: number,
  message: string = "Success",
  statusCode: number = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
};
