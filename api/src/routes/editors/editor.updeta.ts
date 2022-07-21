import { Editor } from '@prisma/client';
import { Static, Type } from '@sinclair/typebox';
import { ObjectId } from 'bson';
import { FastifyInstance } from 'fastify';
import Fuse from 'fuse.js';
import _ from 'lodash';
import { addAuthorization } from '../../hooks/auth';
import { prismaClient } from '../../prisma';

const EditorWithoutId = Type.Object({
    title: Type.String(),
	creator: Type.String(),
	description: Type.String(),
	url: Type.String(),
})
type EditorWithoutId = Static<typeof EditorWithoutId>;
const PartialEditorWithoutId = Type.Partial(EditorWithoutId);
type PartialEditorWithoutId = Static<typeof PartialEditorWithoutId>;
const EditorParams = Type.Object({
	editor_id: Type.String(),
});
type EditorParams = Static<typeof EditorParams>;
export default async function (server: FastifyInstance) {
	server.route({
		method: 'PATCH',
		url: '//:editor_id',
		schema: {
			summary: 'Update a editor by id + you dont need to pass all properties',
			tags: ['Editors'],
			body: PartialEditorWithoutId,
			params: EditorParams,
		},
		handler: async (request, reply) => {
			const { editor_id } = request.params as EditorParams;
			if (!ObjectId.isValid(editor_id)) {
				reply.badRequest('editor_id should be an ObjectId!');
				return;
			}
			const editor = request.body as PartialEditorWithoutId;

			return prismaClient.editor.update({
				where: { editor_id },
				data: editor,
			});
		},
	});

	
}