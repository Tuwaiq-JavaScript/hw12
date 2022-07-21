import { FastifyInstance } from "fastify";
// import * as bcrypt from 'bcrypt';
import { Static, Type } from "@sinclair/typebox";
import { user, UserWithoutId } from "./users";
import { prismaClient } from "../prisma";
import bcrypt from "bcrypt";
import { JwtPayload } from "../hooks/auth.service";
import { CookieSerializeOptions } from "@fastify/cookie";

const refreshTokenCookieOpts: CookieSerializeOptions = {
  maxAge: 100 * 24 * 60 * 60 * 1000, // 100 days
  signed: true,
  secure: true,
  sameSite: "none",
  path: "/",
  httpOnly: true,
};

//const jwt = require('jsonwebtoken');
const loginSchema = Type.Object({
  email: Type.String({ format: "email" }),
  password: Type.String(),
});
type LoginSchema = Static<typeof loginSchema>;
const loginResponseSchema = Type.Object({
  accessToken: Type.String(),
  refreshToken: Type.String(),
});
//register User
export default async function (server: FastifyInstance) {
  server.route({
    method: "POST",
    url: "/signup",
    schema: {
      summary: "Creates new user",
      tags: ["users"],
      body: UserWithoutId,
      response: {
        200: loginResponseSchema,
      },
    },
    handler: async (request, reply) => {
      const user = request.body as UserWithoutId;
      if (!user) {
        return reply.badRequest("Please enter all required fields");
      }
      const userExist = await prismaClient.user.findUnique({
        where: { email: user.email },
      });
      if (userExist) {
        return reply.badRequest("User already exists");
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      const myNewUser = await prismaClient.user.create({
        data: {
          email: user.email,
          name: user.name,
          password: hashedPassword,
        },
      });

      const jwtPayload: JwtPayload = {
        uid: myNewUser.user_id,
        role: myNewUser.role,
      };

      const accessToken = await reply.jwtSign(jwtPayload);

      const refreshToken = await reply.jwtSign(jwtPayload, {
        sign: { expiresIn: "100d" },
      });

      reply.setCookie("refreshToken", refreshToken, refreshTokenCookieOpts);

      return { accessToken, refreshToken };
    },
  }),
    server.route({
      method: "POST",
      url: "/login",
      schema: {
        summary: "Ask user to login and return token",
        tags: ["users"],
        body: loginSchema,
        response: {
          200: loginResponseSchema,
        },
      },
      handler: async (request, reply) => {
        const loginUser = request.body as LoginSchema;
        const user = await prismaClient.user.findUnique({
          where: { email: loginUser.email },
        });
        if (user) {
          const jwtPayload: JwtPayload = {
            uid: user.user_id,
            role: user.role,
          };

          const accessToken = await reply.jwtSign(jwtPayload);

          const refreshToken = await reply.jwtSign(jwtPayload, {
            sign: { expiresIn: "100d" },
          });

          reply.setCookie("refreshToken", refreshToken, refreshTokenCookieOpts);

          return { accessToken, refreshToken };
        } else {
          reply.unauthorized("WRONG Email or Password !!");
          return;
        }
      },
    });
}
