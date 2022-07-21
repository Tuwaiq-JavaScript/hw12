import { EmployeeRole, OrderPayment } from '@prisma/client';
import { connectDb, prismaClient } from './prisma';
import { listen } from './server';

async function start() {
	await connectDb();
	listen();
	
}
start();
