import { Signup } from './index';

export type uuid = string;

export interface User {
	id?: uuid
	username: string
	password?: string
	email?: string
	uprn: string
}

export const toUser = (signup: Signup, uprn: string) : User => {
  return {
    username: signup.username,
    password: signup.password,
    email: signup.email,
    uprn: uprn,
  }
}