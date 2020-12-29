import { Action } from "react-fetching-library"
import { Hub, Opportunity, User } from "../types/types"

// Authentication
const getMe = (): Action<User> => {
	return {
		method: "GET",
		endpoint: `/users/me`,
		credentials: "include",
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

// hub
const getHubs = (): Action<Hub[]> => {
	return {
		method: "GET",
		endpoint: `/hubs`,
		credentials: "include",
		responseType: "json",
	}
}

export const queries = {
	getMe,
	opportunitiesMany,
	opportunitiesSelf,
	getOpportunity,
	getHubs,
}
