import {z} from 'zod';

export const verifySchema = z.object({
    // email: z.string().email({message: 'Invalid email address'}),
    code: z.string().length(6, {message: 'Code must be exactly 6 characters long'}),
});