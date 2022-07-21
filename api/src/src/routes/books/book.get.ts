import { Book } from '@prisma/client';
import { Static, Type } from '@sinclair/typebox';
import { FastifyInstance } from 'fastify';
import Fuse from 'fuse.js';
import _ from 'lodash';
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
const GetBooksQuery = Type.Object({
	text: Type.Optional(Type.String()),
});
type GetBooksQuery = Static<typeof GetBooksQuery>;
export default async function (server: FastifyInstance) {
    /// Get all books or search by name
	

	server.route({
		method: 'GET',
		url: '/',
		schema: {
			summary: 'Gets all books',
			tags: ['Books'],
			querystring: GetBooksQuery,
			response: {
				'2xx': Type.Array(Book),
			},
		},
		handler: async (request, reply) => {
			const query = request.query as GetBooksQuery;

			const books = await prismaClient.book.findMany();
			if (!query.text) return books;

			const fuse = new Fuse(books, {
				includeScore: true,
				isCaseSensitive: false,
				includeMatches: true,
				findAllMatches: true,
				threshold: 1,
				keys: ['title','author', ],
			});
			console.log(JSON.stringify(fuse.search(query.text)));
			const result: Book[] = fuse.search(query.text).map((r) => r.item);
			return await result;	},})}