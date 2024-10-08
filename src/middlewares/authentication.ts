// middleware/authentication.ts
import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../app/config";
import { CustomJwtPayload, AuthenticatedRequest } from "../types/express";

const authentication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.token; 

    if (!token) {
      return res.status(401).json({
        message: "User not authenticated",
        success: false,
      });
    }

    // Verify and decode the JWT
    const decoded = jwt.verify(token, config.jwt_access_secret) as CustomJwtPayload;

    // Check if the token contains the required userId
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        message: "Invalid token",
        success: false,
      });
    }

    // Attach the user ID to req.user for later use
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    let responseMessage = "Internal Server Error";
    let statusCode = 500;

    if (error instanceof jwt.TokenExpiredError) {
      responseMessage = "Token has expired";
      statusCode = 401;
    } else if (error instanceof jwt.JsonWebTokenError) {
      responseMessage = "Invalid token";
      statusCode = 401;
    }

    return res.status(statusCode).json({
      message: responseMessage,
      success: false,
    });
  }
};

export default authentication;
