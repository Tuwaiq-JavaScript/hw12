import { Book } from '@prisma/client';
import { Static, Type } from '@sinclair/typebox';
import { ObjectId } from 'bson';
import { FastifyInstance } from 'fastify';
import Fuse from 'fuse.js';
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

export default async function (server: FastifyInstance) {


	/// Create book without the need for book_id
	server.route({
		method: 'POST',
		url: '/',
		schema: {
			summary: 'Creates new book',
			tags: ['Books'],
			body: BookWithoutId,
		},
		handler: async (request, reply) => {
			const book = request.body as BookWithoutId;
			return await prismaClient.book.create({
				data: book,
			});
		},
	});}