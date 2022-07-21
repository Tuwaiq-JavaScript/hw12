import { prisma } from "@prisma/client";
import { Static, Type } from "@sinclair/typebox";
import { Profile } from "@prisma/client";
import { FastifyInstance, FastifyRequest } from "fastify";
import { JwtPayload } from "../hooks/auth.service";
import { prismaClient } from "../prisma";
const profile = Type.Object({
  profile_id: Type.String(),
  user_id: Type.String(),
  first_name: Type.String(),
  last_name: Type.String(),
});

type profile = Static<typeof profile>;

const createProfileBody = Type.Object({
  first_name: Type.String(),
  last_name: Type.String(),
});
type CreateProfileBody = Static<typeof createProfileBody>;

const userIdParam = Type.Object({
  userId: Type.String(),
});
type UserIdParam = Static<typeof userIdParam>;

export default async function (server: FastifyInstance) {
  server.route({
    method: "POST",
    url: "/user/profile",
    preHandler: [server.authenticate],
    schema: {
      body: createProfileBody,
    },
    handler: async (
      request: FastifyRequest<{ Body: CreateProfileBody }>,
      reply
    ) => {
      const { uid } = request.user as JwtPayload;
      const body = request.body;

      return await prismaClient.profile.create({
        data: {
          first_name: body.first_name,
          last_name: body.last_name,
          user_id: uid,
        },
      });
    },
  });

  server.route({
    method: "GET",
    url: "/user/:userId/profile",
    schema: {
      params: userIdParam,
    },
    handler: async (
      request: FastifyRequest<{ Params: UserIdParam }>,
      reply
    ) => {
      const { userId } = request.params;

      const profile = await prismaClient.profile.findUnique({
        where: { user_id: userId },
      });

      console.log(profile);

      if (!profile) return reply.notFound("profile not found");

      return profile;
    },
  });

  server.route({
    method: "PATCH",
    url: "/user/profile",
    preHandler: [server.authenticate],
    schema: {
      body: createProfileBody,
    },
    handler: async (
      request: FastifyRequest<{ Body: CreateProfileBody }>,
      reply
    ) => {
      const { uid } = request.user as JwtPayload;
      const body = request.body;

      return await prismaClient.profile.update({
        where: { user_id: uid },
        data: {
          first_name: body.first_name,
          last_name: body.last_name,
          user_id: uid,
        },
      });
    },
  });
}
