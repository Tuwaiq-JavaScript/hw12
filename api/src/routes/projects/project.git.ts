import { Project } from '@prisma/client';
import { Static, Type } from '@sinclair/typebox';
import { ObjectId } from 'bson';
import { FastifyInstance } from 'fastify';
import Fuse from 'fuse.js';
import _ from 'lodash';
import { addAuthorization } from '../../hooks/auth';
import { prismaClient } from '../../prisma';
const Project = Type.Object({
	project_id: Type.String(),
	title: Type.String(),
	description: Type.String(),
	content: Type.String(),
	author: Type.String(),
	url: Type.String(),
});

const ProjectWithoutId = Type.Object({
		title: Type.String(),
	description: Type.String(),
	content: Type.String(),
	author: Type.String(),
	url: Type.String(),});
const GetProjectsQuery = Type.Object({
	text: Type.Optional(Type.String()),
});
type GetProjectsQuery = Static<typeof GetProjectsQuery>;
export default async function (server: FastifyInstance) {
		server.route({
		method: 'GET',
		url: '/',
		schema: {
			summary: 'Gets all projects',
			tags: ['Projects'],
			querystring: GetProjectsQuery,
			response: {
				'2xx': Type.Array(Project),
			},
		},
		handler: async (request, reply) => {
			const query = request.query as GetProjectsQuery;

			const projects = await prismaClient.project.findMany();
			if (!query.text) return projects;

			const fuse = new Fuse(projects, {
				includeScore: true,
				isCaseSensitive: false,
				includeMatches: true,
				findAllMatches: true,
				threshold: 1,
				keys: ['title', 'description','content', 'author' ,'url'],	});
console.log(JSON.stringify(fuse.search(query.text)));

			const result: Project[] = fuse.search(query.text).map((r) => r.item);
			return result;
		},
	});

}





