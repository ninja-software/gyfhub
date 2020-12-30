import { Action } from "react-fetching-library"
import { User, Hub } from "../types/types"

// authentication
const forgetPassword = (values: { email: string }): Action<boolean> => {
	return {
		method: "POST",
		endpoint: `/auth/forgot_password`,
		credentials: "include",
		responseType: "json",
		body: {
			...values,
		},
	}
}

// files
const uploadFile = (file: File): Action<string> => {
	const formData = new FormData()
	formData.set("file", file)
	return {
		method: "POST",
		endpoint: `/files/upload`,
		credentials: "include",
		responseType: "json",
		body: formData,
	}
}

// Opportunities
const createOpportunities = (values: {}): Action<boolean> => {
	return {
		method: "POST",
		endpoint: `/opportunities/create`,
		credentials: "include",
		responseType: "json",
		body: {
			...values,
		},
	}
}

const favouriteOpportunities = (opportunityID: string): Action<boolean> => {
	return {
		method: "POST",
		endpoint: `/opportunities/favourite`,
		credentials: "include",
		responseType: "json",
		body: {
			opportunityID,
		},
	}
}

const unfavouriteOpportunities = (opportunityID: string): Action<boolean> => {
	return {
		method: "POST",
		endpoint: `/opportunities/unfavourite`,
		credentials: "include",
		responseType: "json",
		body: {
			opportunityID,
		},
	}
}

// User
const updateUser = (values: {}): Action<User> => {
	return {
		method: "POST",
		endpoint: `/users/updateUser`,
		credentials: "include",
		body: {
			...values,
		},
		responseType: "json",
	}
}

// Hub
const createHub = (values: {}): Action<Hub> => {
	return {
		method: "POST",
		endpoint: `/hubs/create`,
		credentials: "include",
		body: {
			...values,
		},
		responseType: "json",
	}
}

// follow system
const follow = (followedID: string): Action<boolean> => {
	return {
		method: "POST",
		endpoint: `/followers/follow`,
		credentials: "include",
		responseType: "json",
		body: {
			followedID,
		},
	}
}

export const mutations = {
	forgetPassword,
	uploadFile,
	updateUser,
	createOpportunities,
	favouriteOpportunities,
	unfavouriteOpportunities,
	createHub,
	follow,
}
