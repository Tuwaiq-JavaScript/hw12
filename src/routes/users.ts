import { User } from "@prisma/client";
import { Static, Type } from "@sinclair/typebox";
import { ObjectId } from "bson";
import { FastifyInstance, FastifyRequest } from "fastify";
import _ from "lodash";
import { JwtPayload } from "../hooks/auth.service";
import { prismaClient } from "../prisma";
// import { Comment } from '@prisma/client';
// import comments from './comments';

//validation

// const comment = Type.Object({
//     comment_id:Type.String()
// })

export const user = Type.Object({
  user_id: Type.Optional(Type.String()),
  name: Type.String(),
  password: Type.String(),
  email: Type.String(),
  //role:Type.Enum(Role),
  //tag_user:Type.Enum(TagUser),
  //rate:Type.Enum(Rating)
  //comment:Type.Array(comment),
  //package_id:Type.String(),
});

export const UserWithoutId = Type.Object({
  name: Type.String(),
  email: Type.String(),
  password: Type.String(),
});
export type UserWithoutId = Static<typeof UserWithoutId>;

const GetUserQuery = Type.Object({
  name: Type.Optional(Type.String()),
});
type GetUserQuery = Static<typeof GetUserQuery>;

const Partialuser = Type.Partial(user);
type Partialuser = Static<typeof user>;

const DeleteUserParams = Type.Object({
  userId: Type.String(),
});
type DeleteUserParams = Static<typeof DeleteUserParams>;

const GetUserById = Type.Object({
  userId: Type.String(),
});
type GetUserById = Static<typeof GetUserById>;

const UserWithoutPW = Type.Object({
  name: Type.Optional(Type.String()),
  email: Type.Optional(Type.String()),
  //tag_user:Type.Enum(TagUser),
});
type UserWithoutPW = Static<typeof UserWithoutPW>;

const updateTagBody = Type.Object({
  tagUser: Type.String(),
});
type UpdateTagBody = Static<typeof updateTagBody>;

export default async function (server: FastifyInstance) {
  server.route({
    method: "POST",
    url: "/createuser",
    schema: {
      summary: "Creates new user",
      tags: ["Users"],
      body: UserWithoutId,
    },
    handler: async (request, reply) => {
      const The_user = request.body as UserWithoutId;
      return await prismaClient.user.create({
        data: The_user,
      });
    },
  });

  server.route({
    method: "PUT",
    url: "/user",
    schema: {
      summary: "create or update new user required all properties",
      tags: ["Users"],
      body: user,
    },
    handler: async (request, reply) => {
      const newUser = request.body as User;
      if (!ObjectId.isValid(newUser.user_id)) {
        reply.badRequest("user_id should be an objectId!");
      } else {
        return await prismaClient.user.upsert({
          where: { user_id: newUser.user_id },
          create: newUser,
          update: _.omit(newUser, ["user_id"]),
        });
      }
    },
  });

  server.route({
    method: "PATCH",
    url: "/user/:userId/tagUser",
    preHandler: [server.authenticate],
    schema: {
      summary: "update user's tag",
      tags: ["Users"],
      body: updateTagBody,
      params: Type.Object({
        userId: Type.String(),
      }),
    },
    handler: async (
      request: FastifyRequest<{ Body: UpdateTagBody }>,
      reply
    ) => {
      const { userId } = request.params as any;
      const jwtPayload = request.user as JwtPayload;

      if (jwtPayload.role !== "ADMIN")
        return reply.unauthorized("insufficient permission");

      if (!ObjectId.isValid(userId)) {
        reply.badRequest("user_id should be an objectId!");
        return;
      }
      const { tagUser } = request.body;

      if (
        tagUser !== "entry" &&
        tagUser !== "expert" &&
        tagUser !== "mid" &&
        tagUser !== "student"
      )
        return reply.badRequest("invalid tagUser");

      return prismaClient.user.update({
        where: { user_id: userId },
        data: { tagUser },
      });
    },
  }),
    //token
    server.route({
      method: "PATCH",
      url: "/user/:userId",
      preHandler: [server.authenticate],
      schema: {
        summary: "update user information by id",
        tags: ["Users"],
        body: Type.Partial(user),
        params: Type.Object({
          userId: Type.String(),
        }),
      },
      handler: async (request, reply) => {
        const { userId } = request.params as any;
        const jwtPayload = request.user as JwtPayload;

        if (jwtPayload.uid !== userId || jwtPayload.role !== "ADMIN")
          return reply.unauthorized("insufficient permission");

        if (!ObjectId.isValid(userId)) {
          reply.badRequest("user_id should be an objectId!");
          return;
        }
        const newUser = request.body as Partialuser;
        return prismaClient.user.update({
          where: { user_id: userId },
          data: newUser,
        });
      },
    }),
    //with token***
    server.route({
      method: "DELETE",
      url: "/user/:userId",
      preHandler: [server.authenticate],
      schema: {
        summary: "Delete user by id",
        tags: ["Users"],
        params: Type.Object({
          userId: Type.String(),
        }),
      },
      handler: async (request, reply) => {
        const { userId } = request.params as DeleteUserParams;
        const jwtPayload = request.user as JwtPayload;

        if (jwtPayload.uid !== userId || jwtPayload.role !== "ADMIN")
          return reply.unauthorized("insufficient permission");

        if (!ObjectId.isValid(userId)) {
          reply.badRequest("user_id should be an ObjectId");
          return;
        }
        return prismaClient.user.delete({
          where: { user_id: userId },
        });
      },
    });

  server.route({
    method: "GET",
    url: "/user/:userId",
    schema: {
      summary: "Get one user by id or null ",
      tags: ["Users"],
      params: Type.Object({
        userId: Type.String(),
      }),

      // response:{
      //     '2xx':Type.Union([user ,Type.Null()]),
      // },
    },
    handler: async (request, reply) => {
      const { userId } = request.params as GetUserById;
      if (!ObjectId.isValid(userId)) {
        reply.badRequest("user_id should be an Object");
        return;
      }
      return prismaClient.user.findFirst({
        where: { user_id: userId },
      });
    },
  });

  server.route({
    method: "GET",
    url: "/user",
    schema: {
      summary: "Gets all users",
      tags: ["Users"],
      querystring: GetUserQuery,
      // response: {
      //     '2xx': Type.Array(user),
      // },
    },
    handler: async (request, reply) => {
      const query = request.query as typeof GetUserQuery;

      return prismaClient.user.findMany({
        where: {
          name: query.name,
        },
      });
    },
  });

  // server.route({
  //     method: 'GET',
  //     url: '/userwithoutPW',
  //     schema: {
  //         summary: 'Gets all users without password',
  //         tags: ['users'],
  //         querystring:UserWithoutPW ,
  //         // response: {
  //         //     '2xx': Type.Array(user),
  //         // },
  //     },
  //     handler: async (request, reply) => {
  //         const query = request.query as  UserWithoutPW;

  //         return prismaClient.user.findMany({
  //             where:query
  //                // {name:query.name,}

  //         })
  //     },
  // });
}
