import { connectDb, prismaClient } from './prisma';
import { listen, server } from './server';

async function start() {
	await connectDb();
	listen();
}
start();
