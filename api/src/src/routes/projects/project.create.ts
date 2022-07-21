import { Project } from '@prisma/client';
import { Static, Type } from '@sinclair/typebox';
import { ObjectId } from 'bson';
import { FastifyInstance } from 'fastify';
import Fuse from 'fuse.js';
import _ from 'lodash';
import { addAuthorization } from '../../hooks/auth';
import { prismaClient } from '../../prisma';



const ProjectWithoutId = Type.Object({
		title: Type.String(),
	description: Type.String(),
	content: Type.String(),
	author: Type.String(),
	url: Type.String(),
});
type ProjectWithoutId = Static<typeof ProjectWithoutId>;

export default async function (server: FastifyInstance) {
	

	/// Create project without the need for project_id
	server.route({
		method: 'POST',
		url: '/',
		schema: {
			summary: 'Creates new project',
			tags: ['Projects'],
			body: ProjectWithoutId,
		},
		handler: async (request, reply) => {
			const project = request.body as ProjectWithoutId;
			return await prismaClient.project.create({
				data: project,
			});
		},
	});
}


