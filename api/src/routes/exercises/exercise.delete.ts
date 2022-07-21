import { Exercise } from '@prisma/client';
import { Static, Type } from '@sinclair/typebox';
import { ObjectId } from 'bson';
import { FastifyInstance } from 'fastify';
import Fuse from 'fuse.js';
import _ from 'lodash';
import { addAuthorization } from '../../hooks/auth';
import { prismaClient } from '../../prisma';

const ExerciseParams = Type.Object({
	exercise_id: Type.String(),
});
type ExerciseParams = Static<typeof ExerciseParams>;


export default async function (server: FastifyInstance) {

	/// Delete one by id
	server.route({
		method: 'DELETE',
		url: '//:exercise_id',
		schema: {
			summary: 'Deletes a exercise',
			tags: ['Exercises'],
			params: ExerciseParams,
		},
		handler: async (request, reply) => {
			const { exercise_id } = request.params as ExerciseParams;
			if (!ObjectId.isValid(exercise_id)) {
				reply.badRequest('exercise_id should be an ObjectId!');
				return;
			}

			;
		},
	});
    
}
