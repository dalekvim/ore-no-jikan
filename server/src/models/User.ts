import { prop } from "@typegoose/typegoose";
import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export class User {
  @Field(() => ID)
  public _id!: string;

  @Field()
  @prop({ unique: true })
  public email!: string;

  @prop()
  public password!: string;

  @prop({ default: 0 })
  tokenVersion!: number;
}
