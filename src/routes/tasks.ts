import { Task } from '@prisma/client';
import { Type } from '@sinclair/typebox';
import { ObjectId } from 'bson';
import { FastifyInstance } from 'fastify';
import _ from 'lodash';
import { prismaClient } from '../prisma';

const Task = Type.Object({
	task_id: Type.String(),
	input: Type.String(),
	is_checked: Type.Boolean(),
});

export default async function (server: FastifyInstance) {
	server.route({
		method: 'PUT',
		url: '/tasks',
		schema: {
			summary: 'Upsert task',
			tags: ['Tasks'],
			body: Task,
		},
		handler: async (request, reply) => {
			const task = request.body as Task;
			return await prismaClient.task.upsert({
				where: { task_id: task.task_id },
				create: task,
				update: _.omit(task, ['task_id']),
			});
		},
	});

	/// Delete one by id
	server.route({
		method: 'DELETE',
		url: '/tasks/:task_id',
		schema: {
			summary: 'Deletes a task',
			tags: ['Tasks'],
			params: Type.Object({
				task_id: Type.String(),
			}),
		},
		handler: async (request, reply) => {
			const { task_id } = request.params as any;
			if (!ObjectId.isValid(task_id)) {
				reply.badRequest('task_id should be an ObjectId!');
				return;
			}

			return prismaClient.task.delete({
				where: { task_id },
			});
		},
	});

	/// Get all contacts or search by name
	server.route({
		method: 'GET',
		url: '/tasks',
		schema: {
			summary: 'Gets all tasks',
			tags: ['Tasks'],

			response: {
				'2xx': Type.Array(Task),
			},
		},
		handler: async (request, reply) => {
			return await prismaClient.task.findMany();
		},
	});
}
