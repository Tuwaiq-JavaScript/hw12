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




const GetEditorsQuery = Type.Object({
	text: Type.Optional(Type.String()),
});
type GetEditorsQuery = Static<typeof GetEditorsQuery>;



export default async function (server: FastifyInstance) {

	

	/// Get all editors or search by name
	server.route({
		method: 'GET',
		url: '/',
		schema: {
			summary: 'Gets all editors',
			tags: ['Editors'],
			querystring: GetEditorsQuery,
			response: {
				'2xx': Type.Array(Editor),
			},
		},
		handler: async (request, reply) => {
			const query = request.query as GetEditorsQuery;

			const editors = await prismaClient.editor.findMany();
			if (!query.text) return editors;

			const fuse = new Fuse(editors, {
				includeScore: true,
				isCaseSensitive: false,
				includeMatches: true,
				findAllMatches: true,
				threshold: 1,
				keys: ['title', 'creator','description', 'url'],
			});

			console.log(JSON.stringify(fuse.search(query.text)));

			const result: Editor[] = fuse.search(query.text).map((r) => r.item);
			return result;
		},
	});

}