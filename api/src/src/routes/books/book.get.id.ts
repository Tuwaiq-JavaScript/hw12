import { Book } from '@prisma/client';
import { Static, Type } from '@sinclair/typebox';
import { ObjectId } from 'bson';
import { FastifyInstance } from 'fastify';
import { addAuthorization } from '../../hooks/auth';
import { prismaClient } from '../../prisma';

const Book = Type.Object({
	book_id: Type.String(),
	title: Type.String(),
	description: Type.String(),
	isbn: Type.String(),
	language: Type.String(),
	pages: Type.String(),
	author: Type.String(),
});

const BookParams = Type.Object({
	book_id: Type.String(),
});
type BookParams = Static<typeof BookParams>;

export default async function (server: FastifyInstance) {


/// Get one by id    
    server.route({
		method: 'GET',
		url: '/:book_id',
		schema: {
			summary: 'Returns one book or null',
			tags: ['Books'],
			params: BookParams,
			response: {
				'2xx': Type.Union([Book, Type.Null()]),
			},
		},
		handler: async (request, reply) => {
			const { book_id } = request.params as BookParams;
			if (!ObjectId.isValid(book_id)) {
				reply.badRequest('book_id should be an ObjectId!');
				 return;
			}

			return await prismaClient.book.findFirst({
				where: { book_id },
			});
		},
	});
}