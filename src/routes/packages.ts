import { user } from "./users";
import {} from "bson";
import { Package } from "@prisma/client";
import { Static, Type } from "@sinclair/typebox";
import { ObjectId } from "bson";
import { FastifyInstance, FastifyRequest } from "fastify";
import _ from "lodash";
import { prismaClient } from "../prisma";
import { JwtPayload } from "../hooks/auth.service";

//valedation
export const pack = Type.Object({
  package_id: Type.String(),
  name: Type.String(),
  package_description: Type.String(),
  user_id: Type.String(),
  recommended: Type.Boolean(),
  rating: Type.Integer(),
});
type pack = Static<typeof pack>;

const GetPackageQuery = Type.Object({
  name: Type.Optional(Type.String()),
  recommended: Type.Optional(Type.String()),
});
type GetPackageQuery = Static<typeof GetPackageQuery>;

const PackWithoutId = Type.Object({
  name: Type.String(),
  package_description: Type.String(),
  user_id: Type.String(),
  recommended: Type.Boolean(),
  rating: Type.Integer(),
});
type PackWithoutId = Static<typeof PackWithoutId>;

const packMinimal = Type.Object({
  name: Type.String(),
  package_description: Type.String(),
  recommended: Type.Boolean(),
  rating: Type.Integer(),
});
type PackMinimal = Static<typeof packMinimal>;

const partialPackMinimal = Type.Partial(packMinimal);
type PartialPackMinimal = Static<typeof partialPackMinimal>;

const packageParams = Type.Object({
  package_id: Type.String(),
});
type packageParams = Static<typeof packageParams>;

const PartialPackages = Type.Partial(PackWithoutId);
type PartialPackages = Static<typeof pack>;

const getPackageById = Type.Object({
  packageId: Type.String(),
});
type GetPackageById = Static<typeof getPackageById>;

const DeletePackageParams = Type.Object({
  package_id: Type.String(),
});
type DeletePackageParams = Static<typeof DeletePackageParams>;
const DeletePackageByUser = Type.Object({
  user_id: Type.String(),
});
type DeletePackageByUser = Static<typeof DeletePackageByUser>;

const GetPackageByUserId = Type.Object({
  name: Type.String(),
  package_description: Type.String(),
  user_id: Type.String(),
  package_id: Type.String(),
  recommended: Type.Boolean(),
  rating: Type.Integer(),
});
type GetPackageByUserId = Static<typeof GetPackageByUserId>;

export let packages: Package[] = [];

//CRUD
//______________________________________________________________________

export default async function (server: FastifyInstance) {
  server.route({
    method: "POST",
    url: "/createpackByUser",
    preHandler: [server.authenticate],
    schema: {
      summary: "Creates new package",
      tags: ["Packages"],
      body: packMinimal,
    },
    handler: async (request: FastifyRequest<{ Body: PackMinimal }>, reply) => {
      const { uid: user_id } = request.user as JwtPayload;

      const { name, package_description, recommended } = request.body;

      return await prismaClient.package.create({
        data: { name, package_description, user_id, recommended },
      });
    },
  });

  server.route({
    method: "PUT",
    url: "/package",
    schema: {
      summary: "create a new package + all properties required",
      tags: ["Packages"],
      body: pack,
    },

    handler: async (request, reply) => {
      const Pack = request.body as Package;
      if (!ObjectId.isValid(Pack.package_id)) {
        reply.badRequest("package_id should be an objectId!");
      } else {
        return await prismaClient.package.upsert({
          where: { package_id: Pack.package_id },
          create: Pack,
          update: _.omit(Pack, ["package_id"]),
        });
      }
    },
  });

  server.route({
    method: "PATCH",
    url: "/package/:package_id",
    preHandler: [server.authenticate],
    schema: {
      summary: "Update a package by id no need to pass all properties",
      tags: ["Packages"],
      body: partialPackMinimal,
      params: packageParams,
    },
    handler: async (
      request: FastifyRequest<{
        Params: packageParams;
        Body: PartialPackMinimal;
      }>,
      reply
    ) => {
      const jwtPayload = request.user as JwtPayload;
      const { package_id } = request.params;
      const packageData = request.body;

      if (!ObjectId.isValid(package_id)) {
        reply.badRequest("package_id should be an objectId!");
        return;
      }

      let query: any = { package_id, user_id: jwtPayload.uid };

      // Allow admins to delete any package
      if (jwtPayload.role === "ADMIN") query = { package_id };

      return prismaClient.package.updateMany({
        where: query,
        data: packageData,
      });
    },
  });

  server.route({
    method: "DELETE",
    url: "/package/:package_id",
    preHandler: [server.authenticate],
    schema: {
      summary: "Deletes a package by id",
      tags: ["Packages"],
      params: Type.Object({
        package_id: Type.String(),
      }),
    },
    handler: async (request, reply) => {
      const { package_id } = request.params as DeletePackageParams;
      const jwtPayload = request.user as JwtPayload;

      if (!ObjectId.isValid(package_id)) {
        reply.badRequest("package_id should be an ObjectId");
        return;
      }

      let query: any = { package_id, user_id: jwtPayload.uid };

      // Allow admins to delete any package
      if (jwtPayload.role === "ADMIN") query = { package_id };

      return prismaClient.package.deleteMany({
        where: query,
      });
    },
  });
  //Get one package by id
  server.route({
    method: "GET",
    url: "/package/:packageId",
    schema: {
      summary: "Gets one package or null",
      tags: ["Packages"],
      params: Type.Object({
        packageId: Type.String(),
      }),
      // response:{
      // 		'2xx':Type.Union([pack , Type.Null()]),
      // },
    },
    handler: async (request, reply) => {
      const { packageId } = request.params as GetPackageById;
      if (!ObjectId.isValid(packageId)) {
        reply.badRequest("package_id should be an Object");
        return;
      }
      return prismaClient.package.findFirst({
        where: { package_id: packageId },
      });
    },
  });
  //get all packages or search by name
  server.route({
    method: "GET",
    url: "/Package",
    schema: {
      summary: "Get all packages",
      tags: ["Packages"],
      querystring: GetPackageQuery,
      response: {
        "2xx": Type.Array(pack),
      },
    },
    handler: async (request, reply) => {
      const { name, recommended } = request.query as GetPackageQuery;

      const findQuery: any = {};

      if (name) findQuery.where = { name: { contains: name } };
      if (recommended === "true") {
        if (findQuery.where) findQuery.where.recommended = true;
        else findQuery.where = { recommended: true };
      }

      return prismaClient.package.findMany(findQuery);
    },
  });

  //user's own packages info_____________//_________//_____________//
  server.route({
    method: "GET",
    url: "/package/details/:user_id",
    schema: {
      summary: "Gets users packages or null",
      tags: ["Packages"],
      params: Type.Object({
        user_id: Type.String(),
      }),
      // response:{
      // 		'2xx':Type.Union([pack , Type.Null()]),
      // },
    },
    handler: async (request, reply) => {
      const { user_id } = request.params as GetPackageByUserId;
      if (!ObjectId.isValid(user_id)) {
        reply.badRequest("user_id should be an ObjectId");
        return;
      }
      return prismaClient.package.findMany({
        where: { user_id },
      });
    },
  });
  server.route({
    method: "POST",
    url: "/package/:packageId/rating",
    preHandler: [server.authenticate],
    schema: {
      params: getPackageById,
      body: Type.Object({
        rate: Type.String(),
      }),
    },
    handler: async (
      request: FastifyRequest<{
        Params: GetPackageById;
        Body: { rate: string };
      }>,
      reply
    ) => {
      const { uid } = request.user as JwtPayload;
      const rate = request.body.rate;
      const { packageId } = request.params;

      if (rate !== "upvote" && rate !== "downvote") {
        return reply.badRequest("only 'upvote' or 'downvote' rate is accepted");
      }

      const existingRate = await prismaClient.rating.findFirst({
        where: { user_id: uid, package_id: packageId },
      });

      if (rate === "upvote") {
        if (existingRate?.rate === "upvote")
          return reply.conflict("already upvoted");
        else if (existingRate?.rate === "downvote") {
          await prismaClient.package.update({
            where: { package_id: packageId },
            data: { rating: { increment: 2 } },
          });
          return await prismaClient.rating.updateMany({
            where: { user_id: uid, package_id: packageId },
            data: { rate: "upvote" },
          });
        } else {
          await prismaClient.package.update({
            where: { package_id: packageId },
            data: { rating: { increment: 1 } },
          });
          return await prismaClient.rating.create({
            data: { rate: "upvote", package_id: packageId, user_id: uid },
          });
        }
      } else {
        if (existingRate?.rate === "downvote")
          return reply.conflict("already downvoted");
        else if (existingRate?.rate === "upvote") {
          await prismaClient.package.update({
            where: { package_id: packageId },
            data: { rating: { decrement: 2 } },
          });
          return await prismaClient.rating.updateMany({
            where: { user_id: uid, package_id: packageId },
            data: { rate: "downvote" },
          });
        } else {
          await prismaClient.package.update({
            where: { package_id: packageId },
            data: { rating: { decrement: 1 } },
          });
          return await prismaClient.rating.create({
            data: { rate: "upvote", package_id: packageId, user_id: uid },
          });
        }
      }
    },
  });

  server.route({
    method: "DELETE",
    url: "/package/:packageId/rating",
    preHandler: [server.authenticate],
    schema: {
      params: getPackageById,
    },
    handler: async (
      request: FastifyRequest<{ Params: GetPackageById }>,
      reply
    ) => {
      const { uid } = request.user as JwtPayload;
      const { packageId } = request.params;

      const rate = await prismaClient.rating.findFirst({
        where: { package_id: packageId, user_id: uid },
      });
      if (!rate) return reply.notFound("rating not found");

      if (rate.rate === "upvote") {
        await prismaClient.package.update({
          where: { package_id: packageId },
          data: { rating: { decrement: 1 } },
        });
      } else {
        await prismaClient.package.update({
          where: { package_id: packageId },
          data: { rating: { increment: 1 } },
        });
      }

      return await prismaClient.rating.delete({
        where: { rating_id: rate.rating_id },
      });
    },
  });

  server.route({
    method: "GET",
    url: "/package/:packageId/rating",
    preHandler: [server.authenticate],
    schema: {
      params: getPackageById,
    },
    handler: async (
      request: FastifyRequest<{ Params: GetPackageById }>,
      reply
    ) => {
      const { packageId } = request.params;
      const { uid } = request.user as JwtPayload;

      return await prismaClient.rating.findFirst({
        where: { package_id: packageId, user_id: uid },
      });
    },
  });

  // server.route({
  // 	method: 'DELETE',
  // 		url: '/package/delete/:user_id',
  // 		schema: {
  // 			summary: 'Deletes a package by user',
  // 			tags: ['Packages'],
  // 			params:Type.Object({
  // 			user_id: Type.String(),
  // 			})
  // 		},
  // 	handler: async (request, reply) => {
  // 		const {user_id} = request.params as DeletePackageParams ;
  // 		if(!ObjectId.isValid(user_id)){
  // 			reply.badRequest('package_id should be an ObjectId')
  // 			return;
  // 		}
  // 		return prismaClient.package.delete({
  // 			where:{user_id},
  // 		});
  // 	},
  // });
}
