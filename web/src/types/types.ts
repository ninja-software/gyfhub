import { UserType } from "./enum"

export interface User {
	id: string
	type: UserType
	firstName: string
	lastName: string
	avatarURL?: string
	email: string
	city: string
	australianBusinessNumber: string
	business?: Business
}

export interface Business {
	name: string
}

export interface Opportunity {
	id: string
	owner: User
	videoID: string
	category: string
	challenge: string
	roleAfterChallenge: string
	confirmYourCity: string
	openToRemoteTalent: boolean
	expiredAt: string
	deletedAt?: string
	updatedAt: string
	createdAt: string
	isFave: boolean
}

export interface Business {
	name: string
}

export interface Opportunity {
	id: string
	owner: User
	videoURL: string
	category: string
	challenge: string
	roleAfterChallenge: string
	confirmYourCity: string
	openToRemoteTalent: boolean
	expiredAt: string
	deletedAt?: string
	updatedAt: string
	createdAt: string
}

export interface Business {
	id: string
	city: string
	australianBusinessNumber: string
	name: string
}

// Types for giphy api
export interface GifImage {
	url: string
	height: string
	width: string
}

export enum Rating {
	Y = "y",
	G = "g",
	PG = "pg",
	PG13 = "pg-13",
	R = "r",
}

export interface GifObject {
	id: string
	slug: string
	url: string
	embed_url: string
	source: string
	rating: Rating
	title: string
	images: { [index: string]: GifImage }
}

export interface Hub {
	id: string
	name: string
}
