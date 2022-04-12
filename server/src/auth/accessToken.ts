import { sign } from "jsonwebtoken";
import { User } from "../models/User";

export const createAccessToken = (user: User) =>
  sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "15m",
  });
