import * as React from "react"
import { useQuery } from "react-fetching-library"
import { createContainer } from "unstated-next"
import { fetching } from "../fetching"
import { User } from "../types/types"

export interface ErrorData {
	message: string
	field: string[]
}

export interface APIError {
	error: string
	message: string
}

export interface NotificationMessage {
	type: NotificationType
	message: string
	success: boolean
}

export enum NotificationType {
	userAdded,
	userUpdated,
	userArchive,
	warning,
	passwordChanged,
	updated,
}

export const AuthContainer = createContainer(() => {
	const [notification, setNotification] = React.useState<NotificationMessage | null>()
	const [modal, setModal] = React.useState<NotificationMessage | null>()

	// fetch current user detail
	const { payload: data, loading, error, query: refetch, reset } = useQuery<User>(fetching.queries.getMe())

	const useLogin = () => {
		const [errors, setErrors] = React.useState<boolean>(false)
		const [loading, setLoading] = React.useState<boolean>(false)

		const login = async (email: string, password: string) => {
			setLoading(true)

			const response = await fetch("/api/auth/login", {
				method: "POST",
				body: JSON.stringify({ email, password }),
			})

			setLoading(false)

			if (response.status !== 200) {
				setErrors(true)
				return
			}
			await refetch()
		}

		return {
			login,
			loading,
			errors,
		}
	}

	const useLogout = () => {
		const [loading, setLoading] = React.useState<boolean>(false)

		const logout = async () => {
			setLoading(true)

			const response = await fetch("/api/auth/logout", {
				method: "POST",
			})

			setLoading(false)

			if (response.status !== 200) {
				return
			}

			reset()
		}

		return {
			logout,
			loading,
		}
	}

	const useRegister = () => {
		const [errors, setErrors] = React.useState<boolean>(false)
		const [loading, setLoading] = React.useState<boolean>(false)

		const register = async (firstName: string, email: string, password: string, businessName?: string) => {
			setLoading(true)

			const response = await fetch("/api/auth/register", {
				method: "POST",
				body: JSON.stringify({ firstName, email, password, businessName }),
			})

			setLoading(false)

			if (response.status !== 200) {
				setErrors(true)
				return
			}
			await refetch()
		}

		return {
			register,
			loading,
			errors,
		}
	}

	return {
		currentUser: error ? undefined : data,
		reloadLoginState: refetch,
		loading,
		useLogin,
		useLogout,
		notification,
		setNotification,
		modal,
		setModal,
		useRegister,
	}
})
