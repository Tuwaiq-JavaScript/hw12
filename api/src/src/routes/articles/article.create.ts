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
type ArticleWithoutId = Static<typeof ArticleWithoutId>;


export default async function (server: FastifyInstance) {

	

	/// Create article without the need for article_id
	server.route({
		method: 'POST',
		url: '/',
		schema: {
			summary: 'Creates new article',
			tags: ['Articles'],
			body: ArticleWithoutId,
		},
		handler: async (request, reply) => {
			const article = request.body as ArticleWithoutId;
			return await prismaClient.article.create({
				data: article,
			});
			
		},
	});
}