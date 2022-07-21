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

const ArticleParams = Type.Object({
	article_id: Type.String(),
});
type ArticleParams = Static<typeof ArticleParams>;


export default async function (server: FastifyInstance) {
	

// Get one by id
server.route({
    method: 'GET',
    url: '/:article_id',
    schema: {
        summary: 'Returns one article or null',
        tags: ['Articles'],
        params: ArticleParams,
        response: {
            '2xx': Type.Union([Article, Type.Null()]),
        },
    },
    handler: async (request, reply) => {
        const { article_id } = request.params as ArticleParams;
        if (!ObjectId.isValid(article_id)) {
            reply.badRequest('article_id should be an ObjectId!');
            return;
        }
        return prismaClient.article.findFirst({
            where: { article_id },
        });
    },
});}