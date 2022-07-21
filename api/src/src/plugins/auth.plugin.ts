import { FastifyRequest, HookHandlerDoneFunction } from "fastify"
import { FastifyReply } from "fastify"
import jwt from 'jsonwebtoken';

export default function authenticate(request: FastifyRequest, reply: FastifyReply, next: HookHandlerDoneFunction) {
    try {
        const secret = process.env.JWT_SECRET || "not_secret";
        const token = request.headers.authorization?.split(" ")[1];
        console.log(request.headers);
        const value = jwt.verify(token || "decoy", secret);
        next();
    } catch (err) {
        reply.send(err);
    }
};