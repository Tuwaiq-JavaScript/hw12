import { Exercise } from '@prisma/client';
import { Static, Type } from '@sinclair/typebox';
import { ObjectId } from 'bson';
import { FastifyInstance } from 'fastify';
import _ from 'lodash';
import { addAuthorization } from '../../hooks/auth';
import { prismaClient } from '../../prisma';


const Exercise = Type.Object({
	exercise_id: Type.String(),
	title: Type.String(),
	description: Type.String(),
	level: Type.String(),
});

const ExerciseParams = Type.Object({
	exercise_id: Type.String(),
});
type ExerciseParams = Static<typeof ExerciseParams>;


export default async function (server: FastifyInstance) {

	/// Get one by id
	server.route({
		method: 'GET',
		url: '//:exercise_id',
		schema: {
			summary: 'Returns one exercise or null',
			tags: ['Exercises'],
			params: ExerciseParams,
			response: {
				'2xx': Type.Union([Exercise, Type.Null()]),
			},
		},
		handler: async (request, reply) => {
			const { exercise_id } = request.params as ExerciseParams;
			if (!ObjectId.isValid(exercise_id)) {
				reply.badRequest('exercise_id should be an ObjectId!');
				return;
			}

			return prismaClient.exercise.findFirst({
				where: { exercise_id },
			});
		},
	});

}