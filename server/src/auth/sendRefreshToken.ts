import { Response } from "express";

export const sendRefreshToken = (res: Response, token: string) => {
  res.cookie("jid", token, {
    path: "/refresh_token",
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });
};
