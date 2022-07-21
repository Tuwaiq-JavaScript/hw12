import { Exercise } from '@prisma/client';
import { Static, Type } from '@sinclair/typebox';
import { ObjectId } from 'bson';
import { FastifyInstance } from 'fastify';
import Fuse from 'fuse.js';
import _ from 'lodash';
import { addAuthorization } from '../../hooks/auth';
import { prismaClient } from '../../prisma';

const Exercise = Type.Object({
	exercise_id: Type.String(),
	title: Type.String(),
	description: Type.String(),
	level: Type.String(),
});
const ExerciseWithoutId = Type.Object({
    title: Type.String(),
	description: Type.String(),
	level: Type.String(),
})

const GetExercisesQuery = Type.Object({
	text: Type.Optional(Type.String()),
});
type GetExercisesQuery = Static<typeof GetExercisesQuery>;

export default async function (server: FastifyInstance) {
	
	server.route({
		method: 'GET',
		url: '/',
		schema: {
			summary: 'Gets all exercise',
			tags: ['Exercises'],
			querystring: GetExercisesQuery,
			response: {
				'2xx': Type.Array(Exercise),
			},
		},
		handler: async (request, reply) => {
			const query = request.query as GetExercisesQuery;

			const exercises = await prismaClient.exercise.findMany();
			if (!query.text) return exercises;

			const fuse = new Fuse(exercises, {
				includeScore: true,
				isCaseSensitive: false,
				includeMatches: true,
				findAllMatches: true,
				threshold: 1,
				keys: ['title', 'author'],
			});
	console.log(JSON.stringify(fuse.search(query.text)));

			const result: Exercise[] = fuse.search(query.text).map((r) => r.item);
			return result;
		},
	});
    
}
