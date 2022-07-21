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

const PartialArticleWithoutId = Type.Partial(ArticleWithoutId);
type PartialArticleWithoutId = Static<typeof PartialArticleWithoutId>;

const ArticleParams = Type.Object({
	article_id: Type.String(),
});
type ArticleParams = Static<typeof ArticleParams>;

export default async function (server: FastifyInstance) {
	
server.route({
    method: 'PATCH',
    url: '/:article_id',
    schema: {
        summary: 'Update a article by id + you dont need to pass all properties',
        tags: ['Articles'],
        body: PartialArticleWithoutId,
        params: ArticleParams,
    },
    handler: async (request, reply) => {
        const { article_id } = request.params as ArticleParams;
        if (!ObjectId.isValid(article_id)) {
            reply.badRequest('article_id should be an ObjectId!');
            return;
        }

        const article = request.body as PartialArticleWithoutId;
        return prismaClient.article.update({
            where: { article_id },
            data: article,
        });
    },
});}