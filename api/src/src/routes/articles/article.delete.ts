import { Article } from '@prisma/client';
import { Static, Type } from '@sinclair/typebox';
import { ObjectId } from 'bson';
import { FastifyInstance } from 'fastify';
import Fuse from 'fuse.js';
import _ from 'lodash';
import { addAuthorization } from '../../hooks/auth';
import { prismaClient } from '../../prisma';
const ArticleWithoutId = Type.Object({
    title: Type.String(),
	content: Type.String(),
	author: Type.String(),
	url: Type.String(),
})

const ArticleParams = Type.Object({
	article_id: Type.String(),
});
type ArticleParams = Static<typeof ArticleParams>;


export default async function (server: FastifyInstance) {

    server.route({
		method: 'DELETE',
		url: '/:article_id',
		schema: {
			summary: 'Deletes a article',
			tags: ['Articles'],
			params: ArticleParams,
		},
		handler: async (request, reply) => {
			const { article_id } = request.params as ArticleParams;
			if (!ObjectId.isValid(article_id)) {
				reply.badRequest('article_id should be an ObjectId!');
				return;
			}

			return prismaClient.article.delete({
				where: { article_id },
			});
		},
	});}