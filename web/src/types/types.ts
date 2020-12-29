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
