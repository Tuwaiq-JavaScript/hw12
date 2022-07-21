import fastifyAutoload from "@fastify/autoload";
import fastifySensible from "@fastify/sensible";
import fastifySwagger from "@fastify/swagger";
import {
  ajvTypeBoxPlugin,
  TypeBoxTypeProvider,
} from "@fastify/type-provider-typebox";
import fastify, { FastifyRequest } from "fastify";
import { join } from "path";
import authService, { JwtPayload } from "./hooks/auth.service";
import fastifyCookie from "@fastify/cookie";
import { Static, Type } from "@sinclair/typebox";
import fastifyCors from "@fastify/cors";

export const server = fastify({
  logger: true,
  ajv: {
    customOptions: {
      removeAdditional: "all",
      ownProperties: true,
    },
    plugins: [ajvTypeBoxPlugin],
  },
}).withTypeProvider<TypeBoxTypeProvider>();

server.register(fastifyCookie, { secret: "secret" });

server.register(authService);

server.register(fastifySwagger, {
  routePrefix: "/docs",
  exposeRoute: true,
  mode: "dynamic",
  openapi: {
    info: {
      title: "Back-Packages API",
      version: "0.0.1",
    },
  },
});

server.register(fastifyCors);
server.register(fastifySensible);



server.register(fastifyAutoload, {
  dir: join(__dirname, "routes"),
});

const refreshAccessTokenQuery = Type.Object({
  refreshToken: Type.Optional(Type.String()),
});
type RefreshAccessTokenQuery = Static<typeof refreshAccessTokenQuery>;

// Send new access token
server.route({
  method: "GET",
  url: "/newAccessToken",
  schema: {
    summary: "Get new access token with refresh token",
    params: refreshAccessTokenQuery,
  },
  handler: async (
    request: FastifyRequest<{ Querystring: RefreshAccessTokenQuery }>,
    reply
  ) => {
    const refreshToken =
      request.query.refreshToken || request.cookies.refreshToken;

    console.log("QUERY: ", request.query.refreshToken);
    console.log("COOKIE: ", request.cookies.refreshToken);

    if (!refreshToken)
      return reply.badRequest("refreshToken cookie/param is not present");

    const refreshTokenPayload = server.jwt.decode<JwtPayload>(refreshToken);

    if (!refreshTokenPayload) return reply.badRequest("No payload!!");

    // Sign new access token
    const accessToken = await reply.jwtSign({
      uid: refreshTokenPayload.uid,
      role: refreshTokenPayload.role,
    });

    return { accessToken };
  },
});

export function listen() {
  const port: any = process.env.PORT || process.env.$PORT || 3001;

  server
    .listen({
      port: port,
     host: "0.0.0.0",
    })
    .catch((err) => {
      server.log.error(err);
      process.exit(1);
    });
}
