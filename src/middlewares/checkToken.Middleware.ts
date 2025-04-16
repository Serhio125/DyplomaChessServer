import { Request, Response } from "express";
import jwt from "jsonwebtoken";
export const CheckTokenMiddleware = (
  req: Request,
  res: Response,
  next: () => void,
) => {
  console.log(`From checking middleware, get request token: ${req.body.token}`);
  const token = req.body.token;
  if (token) {
    try {
      const verifyToken = jwt.verify(token, "secret") as jwt.JwtPayload;
      //console.log(token);
      res.cookie("authToken", token, {
        domain: "localhost",
        maxAge: 1000 * 60 * 20,
      });
      console.log("Token access");
      next();
    } catch (e: any) {
      console.log("Invalid token");
      res.status(401);
      res.send("Unauthorized request");
    }
  } else {
    console.log("No token found");
    res.status(401);
    res.send("Unauthorized request");
  }
};
