import { Comment } from "@prisma/client";
import { Static, Type } from "@sinclair/typebox";
import { ObjectId } from "bson";
import { FastifyInstance, FastifyRequest } from "fastify";
import { JwtPayload } from "../hooks/auth.service";
import { prismaClient } from "../prisma";
const comment = Type.Object({
  comment_id: Type.String(),
  content: Type.String(),
});
type comment = Static<typeof comment>;
const GetCommentQuery = Type.Object({
  content: Type.Optional(Type.String()),
});
type GetCommentQuery = Static<typeof GetCommentQuery>;

export const commentWithoutId = Type.Object({
  content: Type.String(),
  package_id: Type.String(),
});
type commentWithoutId = Static<typeof commentWithoutId>;

const DeleteCommentParams = Type.Object({
  commentId: Type.String(),
});
type DeleteCommentParams = Static<typeof DeleteCommentParams>;

const GetcommentQuery = Type.Object({
  content: Type.Optional(Type.String()),
});
type GetcommentQuery = Static<typeof GetcommentQuery>;

const GetCommentById = Type.Object({
  commentId: Type.String(),
});
type GetCommentById = Static<typeof GetCommentById>;

const getPackageCommentsParams = Type.Object({
  packageId: Type.String(),
});
type GetPackageCommentsParams = Static<typeof getPackageCommentsParams>;

export default async function (server: FastifyInstance) {
  server.route({
    method: "POST",
    url: "/createComment",
    preHandler: [server.authenticate],
    schema: {
      summary: "Creates new comment",
      tags: ["comment"],
      body: commentWithoutId,
    },
    handler: async (request, reply) => {
      const the_comment = request.body as commentWithoutId;
      const { uid: user_id } = request.user as JwtPayload;

      return await prismaClient.comment.create({
        data: { ...the_comment, user_id },
      });
    },
  });

  server.route({
    method: "DELETE",
    url: "/comment/:commentId",
    preHandler: [server.authenticate],
    schema: {
      summary: "Deletes a comment by id",
      tags: ["comment"],
      params: Type.Object({
        commentId: Type.String(),
      }),
    },
    handler: async (request, reply) => {
      const { commentId } = request.params as DeleteCommentParams;
      const { uid, role } = request.user as JwtPayload;

      if (!ObjectId.isValid(commentId)) {
        reply.badRequest("comment_id should be an ObjectId");
        return;
      }

      const where: any = { comment_id: commentId };
      if (role === "USER") where.user_id = uid;

      return prismaClient.comment.deleteMany({ where });
    },
  });

  server.route({
    method: "GET",
    url: "/package/:packageId/comments",
    schema: {
      summary: "Gets package comments",
      tags: ["comment"],
      params: getPackageCommentsParams,
      // response: {
      //     '2xx': Type.Array(pack),
      // },
    },
    handler: async (
      request: FastifyRequest<{ Params: GetPackageCommentsParams }>,
      reply
    ) => {
      const { packageId } = request.params;

      return prismaClient.comment.findMany({
        where: {
          package_id: packageId,
        },
      });
    },
  });

  server.route({
    method: "GET",
    url: "/comments",
    schema: {
      summary: "Gets all comment",
      tags: ["comment"],
      querystring: GetcommentQuery,
      // response: {
      //     '2xx': Type.Array(pack),
      // },
    },
    handler: async (request, reply) => {
      const query = request.query as typeof GetcommentQuery;

      return prismaClient.comment.findMany({
        where: {
          content: query.content,
        },
      });
    },
  });

  server.route({
    method: "GET",
    url: "/comment/:commentId",
    schema: {
      summary: "Get user own comment",
      tags: ["comment"],
      params: Type.Object({
        commentId: Type.String(),
      }),
    },
    handler: async (request, reply) => {
      const { commentId } = request.params as GetCommentById;
      if (!ObjectId.isValid(commentId)) {
        reply.badRequest("comment_id should be an Object");
        return;
      }
      return prismaClient.comment.findFirst({
        where: { comment_id: commentId },
      });
    },
  });
}
