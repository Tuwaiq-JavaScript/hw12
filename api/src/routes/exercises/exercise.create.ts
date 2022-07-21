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



export default async function (server: FastifyInstance) {

		server.route({
		method: 'POST',
		url: '/',
		schema: {
			summary: 'Creates new exercise',
			tags: ['Exercises'],
			body: ExerciseWithoutId,
		},
		handler: async (request, reply) => {
			const exercise = request.body as ExerciseWithoutId;
			return await prismaClient.exercise.create({
				data: exercise,	});	},	});

			}