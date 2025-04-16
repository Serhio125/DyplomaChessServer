import { Request, Response } from "express";
import jwt from "jsonwebtoken";
export const AuthCookieMiddleware = (
  req: Request,
  res: Response,
  next: () => void,
) => {
  console.log(
    `From middleware, get cookies: ${Object.keys(req.cookies).length !== 0 /*&& req.cookies*/ ? req.cookies : null}`,
  );
  const cookieToken = req.cookies?.authToken;
  if (cookieToken) {
    try {
      const token = jwt.verify(cookieToken, "secret") as jwt.JwtPayload;
      console.log(token);
      res.cookie("authToken", jwt.sign(token, "secret"), {
        domain: "localhost",
        maxAge: 1000 * 60 * 20,
      });
      res.json({
        userData: {
          ...token,
        },
        sessionToken: cookieToken,
      });
    } catch (e: any) {
      next();
    }
  } else {
    next();
  }
};
