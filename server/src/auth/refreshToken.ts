import { sign } from "jsonwebtoken";
import { User } from "../models/User";

export const createRefreshToken = (user: User) =>
  sign(
    { userId: user._id, tokenVersion: user.tokenVersion },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: "7d",
    }
  );
