import { Editor } from '@prisma/client';
import { Static, Type } from '@sinclair/typebox';
import { ObjectId } from 'bson';
import { FastifyInstance } from 'fastify';
import Fuse from 'fuse.js';
import _ from 'lodash';
import { addAuthorization } from '../../hooks/auth';
import { prismaClient } from '../../prisma';

const Editor = Type.Object({
	editor_id: Type.String(),
	title: Type.String(),
	creator: Type.String(),
	description: Type.String(),
	url: Type.String(),
});


const EditorParams = Type.Object({
	editor_id: Type.String(),
});
type EditorParams = Static<typeof EditorParams>;


export default async function (server: FastifyInstance) {


	/// Get one by id
	server.route({
		method: 'GET',
		url: '//:editor_id',
		schema: {
			summary: 'Returns one editor or null',
			tags: ['Editors'],
			params: EditorParams,
			response: {
				'2xx': Type.Union([Editor, Type.Null()]),
			},
		},
		handler: async (request, reply) => {
			const { editor_id } = request.params as EditorParams;
			if (!ObjectId.isValid(editor_id)) {
				reply.badRequest('editor_id should be an ObjectId!');
				return;
			}

			return prismaClient.editor.findFirst({
				where: { editor_id },
			});
		},
	});


}