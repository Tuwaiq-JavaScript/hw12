import { Exercise } from '@prisma/client';
import { Static, Type } from '@sinclair/typebox';
import { ObjectId } from 'bson';
import { FastifyInstance } from 'fastify';
import Fuse from 'fuse.js';
import _ from 'lodash';
import { addAuthorization } from '../../hooks/auth';
import { prismaClient } from '../../prisma';


const ExerciseWithoutId = Type.Object({
    title: Type.String(),
	description: Type.String(),
	level: Type.String(),
})
type ExerciseWithoutId = Static<typeof ExerciseWithoutId>;

const PartialExerciseWithoutId = Type.Partial(ExerciseWithoutId);
type PartialExerciseWithoutId = Static<typeof PartialExerciseWithoutId>;

const ExerciseParams = Type.Object({
	exercise_id: Type.String(),
});
type ExerciseParams = Static<typeof ExerciseParams>;

export default async function (server: FastifyInstance) {

	server.route({
		method: 'PATCH',
		url: '/s/:exercise_id',
		schema: {
			summary: 'Update a exercise by id + you dont need to pass all properties',
			tags: ['Exercises'],
			body: PartialExerciseWithoutId,
			params: ExerciseParams,
		},
		handler: async (request, reply) => {
			const { exercise_id } = request.params as ExerciseParams;
			if (!ObjectId.isValid(exercise_id)) {
				reply.badRequest('exercise_id should be an ObjectId!');
				return;
			}
			const exercise = request.body as PartialExerciseWithoutId;
			return prismaClient.exercise.update({
				where: { exercise_id },
				data: exercise,
			});
		},
	});
}
