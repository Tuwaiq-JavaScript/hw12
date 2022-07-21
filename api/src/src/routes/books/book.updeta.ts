import { Book } from '@prisma/client';
import { Static, Type } from '@sinclair/typebox';
import { ObjectId } from 'bson';
import { FastifyInstance } from 'fastify';
import _ from 'lodash';
import { addAuthorization } from '../../hooks/auth';
import { prismaClient } from '../../prisma';

const BookWithoutId = Type.Object({
	title: Type.String(),
	description: Type.String(),
	isbn: Type.String(),
	language: Type.String(),
	pages: Type.String(),
	author: Type.String(),
});
type BookWithoutId = Static<typeof BookWithoutId>;

const PartialBookWithoutId = Type.Partial(BookWithoutId);
type PartialBookWithoutId = Static<typeof PartialBookWithoutId>;

const BookParams = Type.Object({
	book_id: Type.String(),
});
type BookParams = Static<typeof BookParams>;
export default async function (server: FastifyInstance) {
    addAuthorization(server);


/// Update one by id
server.route({
    method: 'PATCH',
    url: '/:book_id',
    schema: {
        summary: 'Update a book by id + you dont need to pass all properties',
        tags: ['Books'],
        body: PartialBookWithoutId,
        params: BookParams,
    },
    handler: async (request, reply) => {
        const { book_id } = request.params as BookParams;
        if (!ObjectId.isValid(book_id)) {
            reply.badRequest('book_id should be an ObjectId!');
            return;
        }
        const book = request.body as PartialBookWithoutId;
        return await prismaClient.book.update({
            where: { book_id },
            data: book,
        });
    },
});}