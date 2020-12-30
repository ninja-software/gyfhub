import { Action } from "react-fetching-library"
import { Follow, Hub, Opportunity, User, UserSearchFilterInput } from "../types/types"

// Authentication
const getMe = (): Action<User> => {
	return {
		method: "GET",
		endpoint: `/users/me`,
		credentials: "include",
		responseType: "json",
	}
}

const getManyUsers = (values: UserSearchFilterInput): Action<{ total: number }> => {
	return {
		method: "POST",
		endpoint: `/users/many`,
		credentials: "include",
		body: {
			...values,
		},
		responseType: "json",
	}
}

// Opportunities
const opportunitiesMany = (values: {}): Action<{ opportunities: Opportunity[]; total: number }> => {
	return {
		method: "POST",
		endpoint: `/opportunities/many`,
		credentials: "include",
		responseType: "json",
		body: {
			...values,
		},
	}
}

const opportunitiesSelf = (values: {}): Action<{ opportunities: Opportunity[]; total: number }> => {
	return {
		method: "POST",
		endpoint: `/opportunities/self`,
		credentials: "include",
		responseType: "json",
		body: {
			...values,
		},
	}
}

const getOpportunity = (id: string): Action<Opportunity> => {
	return {
		method: "GET",
		endpoint: `/opportunities/${id}`,
		credentials: "include",
		responseType: "json",
	}
}

// hubs
const allHubs = (): Action<Hub[]> => {
	return {
		method: "POST",
		endpoint: `/hubs/all`,
		credentials: "include",
		responseType: "json",
	}
}

const getHub = (id: string): Action<Hub[]> => ({
	method: "GET",
	endpoint: `/hubs/${id}`,
	credentials: "include",
	responseType: "json",
})

// follow system

const getFollowers = (): Action<Follow> => ({
	method: "GET",
	endpoint: `/followers/followers`,
	credentials: "include",
	responseType: "json",
})

const getFollowing = (): Action<Follow> => ({
	method: "GET",
	endpoint: `/followers/following`,
	credentials: "include",
	responseType: "json",
})
// gyf
const gifMany = (values: {}): Action<boolean> => ({
	method: "POST",
	endpoint: `/gifs/many`,
	credentials: "include",
	responseType: "json",
	body: {
		...values,
	},
})

const userStats = (): Action<any> => {
	return {
		method: "GET",
		endpoint: `/stats/userStats`,
		credentials: "include",
		responseType: "json",
	}
}

const globalStats = (): Action<any> => {
	return {
		method: "GET",
		endpoint: `/stats/globalStats`,
		credentials: "include",
		responseType: "json",
	}
}

export const queries = {
	getMe,
	opportunitiesMany,
	opportunitiesSelf,
	getOpportunity,
	allHubs,
	userStats,
	globalStats,
	getHub,
	getFollowers,
	getFollowing,
	gifMany,
	getManyUsers,
}
