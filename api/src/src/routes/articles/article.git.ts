import { Article } from '@prisma/client';
import { Static, Type } from '@sinclair/typebox';
import { ObjectId } from 'bson';
import { FastifyInstance } from 'fastify';
import Fuse from 'fuse.js';
import _ from 'lodash';
import { addAuthorization } from '../../hooks/auth';
import { prismaClient } from '../../prisma';

const Article = Type.Object({
	article_id: Type.String(),
	title: Type.String(),
	content: Type.String(),
	author: Type.String(),
	url: Type.String(),
});

const GetArticlesQuery = Type.Object({
	text: Type.Optional(Type.String()),
});
type GetArticlesQuery = Static<typeof GetArticlesQuery>
export default async function (server: FastifyInstance) {
	
 // Get all articles or search by name
	server.route({
		method: 'GET',
		url: '/',
		schema: {
			summary: 'Gets all articles',
			tags: ['Articles'],
			querystring: GetArticlesQuery,
			response: {
				'2xx': Type.Array(Article),
			},
		},
		handler: async (request, reply) => {
			const query = request.query as GetArticlesQuery;
			const articles = await prismaClient.article.findMany();
			if (!query.text) return articles;
			const fuse = new Fuse(articles, {
				includeScore: true,
				isCaseSensitive: false,
				includeMatches: true,
				findAllMatches: true,
				threshold: 1,
				keys: ['title', 'creator','description', 'url'],
			});
			console.log(JSON.stringify(fuse.search(query.text)));
			const result: Article[] = fuse.search(query.text).map((r) => r.item);
			return result;},}); }