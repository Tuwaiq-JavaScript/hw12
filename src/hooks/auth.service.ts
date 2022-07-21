import { FastifyJWTOptions } from "@fastify/jwt";
import { FastifyReply } from "fastify";
import { FastifyRequest } from "fastify";
import fp from "fastify-plugin";

declare module "fastify" {
  export interface FastifyInstance {
    authenticate: any;
  }
}

export interface JwtPayload {
  uid: string;
  role: "USER" | "ADMIN";
}

export default fp(async function (fastify, opts) {
  fastify.register<FastifyJWTOptions>(require("@fastify/jwt"), {
    secret: process.env.ACCESS_TOKEN_SECRET || "secret",
    sign: {
      expiresIn: "30m",
    },
  });

  fastify.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.send(err);
      }
    }
  );
});
