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
	url: Type.String(),
});

const ProjectParams = Type.Object({
	project_id: Type.String(),
});
type ProjectParams = Static<typeof ProjectParams>;


export default async function (server: FastifyInstance) {
		server.route({
		method: 'GET',
		url: '/:project_id',
		schema: {
			summary: 'Returns one project or null',
			tags: ['Projects'],
			params: ProjectParams,
			response: {
				'2xx': Type.Union([Project, Type.Null()]),
			},	},
		handler: async (request, reply) => {
			const { project_id } = request.params as ProjectParams;
			if (!ObjectId.isValid(project_id)) {
				reply.badRequest('project_id should be an ObjectId!');
				return;	}
			return prismaClient.project.findFirst({
				where: { project_id },	});	},	});}





