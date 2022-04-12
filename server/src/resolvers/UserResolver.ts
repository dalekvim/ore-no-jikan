import { compare, hash } from "bcryptjs";
import { IsEmail, MinLength } from "class-validator";
import {
  Arg,
  Ctx,
  Field,
  ID,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { createAccessToken } from "../auth/accessToken";
import { isAuth } from "../auth/isAuth";
import { createRefreshToken } from "../auth/refreshToken";
import { sendRefreshToken } from "../auth/sendRefreshToken";
import { UserModel } from "../models";
import { User } from "../models/User";
import { MyContext } from "../types/MyContext";

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;
}

@InputType()
class RegisterInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(8)
  password: string;
}

@InputType()
class LoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return "hi!";
  }

  @Query(() => String)
  @UseMiddleware(isAuth)
  bye() {
    return "bye!";
  }

  @Query(() => String)
  @UseMiddleware(isAuth)
  userId(@Ctx() { payload }: MyContext) {
    return `your user id is: ${payload!.userId}`;
  }

  @Query(() => [User])
  async users() {
    return await UserModel.find();
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { res }: MyContext) {
    sendRefreshToken(res, "");
    return true;
  }

  @Mutation(() => Boolean)
  async revokeRefreshTokensForUser(@Arg("userId", () => ID) userId: string) {
    // const user: User = await findById(User, userId);
    // const { email, tokenVersion } = user;
    // User.update({ email }, { tokenVersion: tokenVersion + 1 });

    const user = await UserModel.findById(userId).exec();

    if (!user) throw new Error("could not find user");

    await UserModel.findByIdAndUpdate(userId, {
      tokenVersion: user.tokenVersion + 1,
    }).exec();

    return true;
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg("loginInput") { email, password }: LoginInput,
    @Ctx() { res }: MyContext
  ): Promise<LoginResponse> {
    // const user = await User.findOne({ where: { email } });
    const user = await UserModel.findOne({ email }).exec();

    if (!user) throw new Error("could not find user");

    const valid = await compare(password, user.password);
    if (!valid) throw new Error("bad password");

    // login successful

    sendRefreshToken(res, createRefreshToken(user));

    return {
      accessToken: createAccessToken(user),
    };
  }

  @Mutation(() => Boolean)
  async register(
    @Arg("registerInput") { email, password }: RegisterInput
  ): Promise<Boolean> {
    const hashedPassword = await hash(password, 12);
    try {
      // await User.insert({
      //   email,
      //   password: hashedPassword,
      //   tokenVersion: 0,
      // });

      const newUser = await UserModel.create({
        email,
        password: hashedPassword,
      });
      await newUser.save();
    } catch (err) {
      console.log(err);
      return false;
    }
    return true;
  }
}
