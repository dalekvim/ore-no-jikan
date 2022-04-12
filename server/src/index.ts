import { ApolloServer } from "apollo-server-express";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv-safe/config";
import express from "express";
import { verify } from "jsonwebtoken";
import mongoose from "mongoose";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createAccessToken } from "./auth/accessToken";
import { createRefreshToken } from "./auth/refreshToken";
import { sendRefreshToken } from "./auth/sendRefreshToken";
import { UserModel } from "./models";
import { UserResolver } from "./resolvers/UserResolver";

(async () => {
  const app = express();
  app.use(
    cors({
      origin: ["https://studio.apollographql.com", "http://localhost:3000"],
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.get("/", (_req, res) => res.send("hello"));
  app.post("/refresh_token", async (req, res) => {
    const token = req.cookies.jid;
    if (!token) return res.send({ ok: false, accessToken: "" });

    let payload: any = null;
    try {
      payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
    } catch (err) {
      console.log(err);
      return res.send({ ok: false, accessToken: "" });
    }

    // token is valid and
    // we can send back and access token

    // const user: User = await findById(User, payload.userId);
    const user = await UserModel.findById(payload.userId).exec();

    if (!user) return res.send({ ok: false, accessToken: "" });

    if (user.tokenVersion !== payload.tokenVersion)
      return res.send({ ok: false, accessToken: "" });

    sendRefreshToken(res, createRefreshToken(user));

    return res.send({ ok: true, accessToken: createAccessToken(user) });
  });

  // await AppDataSource.initialize().catch((err) => console.log(err));
  await mongoose
    .connect(
      "mongodb+srv://Dalekvim:Vijay2008@cluster0.5ka3m.mongodb.net/oreNoJikanDatabase?retryWrites=true&w=majority"
    )
    .catch((err) => console.log(err));

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver],
    }),
    context: ({ req, res }) => ({ req, res }),
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(process.env.PORT || 4000, () => {
    console.log("express server started");
  });
})();
