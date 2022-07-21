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




export default async function (server: FastifyInstance) {



	

	/// Create editor without the need for editor_id
	server.route({
		method: 'POST',
		url: '/',
		schema: {
			summary: 'Creates new editor',
			tags: ['Editors'],
			body: EditorWithoutId,
		},
		handler: async (request, reply) => {
			const editor = request.body as EditorWithoutId;
			return await prismaClient.editor.create({
				data: editor,
			});
		},
	});


}