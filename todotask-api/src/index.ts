
import { connectDb, prismaClient } from './prisma';

import { listen } from './server';

async function start() {
	await connectDb();
	listen();
	//test();
}
start();


// async function test() {
// 	await prismaClient.user.create({
// 		data:{
// 			name:'ccc',
// 			email:'innbvh',
//              phone:'0987654',
//              country:'lkjhglkj'
// 			}
// 		})}
  			// payment:       BookPayment.card,
			//   date:        new Date(),
  			// booking_status: Status.accepted,
			// tourguide: {
			// 	create: {
			// 		name: 'Khaled',
			// 		email:'khaled@test.com',
  			// 		phone:  '055634523' ,     
  			// 		languages:  Languages.english&&Languages.arabic,
			// 		experience:   '3 years',
			// 		city:'Riyadh',
			// 		price:'1000SR'
  					
			// 	},
