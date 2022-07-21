import { Editor } from '@prisma/client';
import { Static, Type } from '@sinclair/typebox';
import { ObjectId } from 'bson';
import { FastifyInstance } from 'fastify';
import Fuse from 'fuse.js';
import _ from 'lodash';
import { addAuthorization } from '../../hooks/auth';
import { prismaClient } from '../../prisma';





const EditorParams = Type.Object({
	editor_id: Type.String(),
});
type EditorParams = Static<typeof EditorParams>;

export default async function (server: FastifyInstance) {


	/// Delete one by id
	server.route({
		method: 'DELETE',
		url: '//:editor_id',
		schema: {
			summary: 'Deletes a editor',
			tags: ['Editors'],
			params: EditorParams,
		},
		handler: async (request, reply) => {
			const { editor_id } = request.params as EditorParams;
			if (!ObjectId.isValid(editor_id)) {
				reply.badRequest('editor_id should be an ObjectId!');
				return;
			}

			return prismaClient.editor.delete({
				where: { editor_id },
			});
		},
	});

	
}