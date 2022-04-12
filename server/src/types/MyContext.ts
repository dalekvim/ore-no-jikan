import { Request, Response } from "express";
import { ObjectID } from "typeorm";

export interface MyContext {
  req: Request;
  res: Response;
  payload?: { userId: ObjectID };
}
