import { Book } from '@prisma/client';
import { Static, Type } from '@sinclair/typebox';
import { ObjectId } from 'bson';
import { FastifyInstance } from 'fastify';
import Fuse from 'fuse.js';
import _ from 'lodash';
import { addAuthorization } from '../../hooks/auth';
import { prismaClient } from '../../prisma';

const BookParams = Type.Object({
	book_id: Type.String(),
});
type BookParams = Static<typeof BookParams>;



export default async function (server: FastifyInstance) {
	

/// Delete one by id


server.route({
    method: 'DELETE',
    url: '/:book_id',
    schema: {
        summary: 'Deletes a book',
        tags: ['Books'],
        params: BookParams,
    },
    handler: async (request, reply) => {
        const { book_id } = request.params as BookParams;
        if (!ObjectId.isValid(book_id)) {
            reply.badRequest('book_id should be an ObjectId!');
            return;
        }

        return await prismaClient.book.delete({
            where: { book_id },
        });
    },});}