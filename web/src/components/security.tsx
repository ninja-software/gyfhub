import React from "react"
import { Route, Redirect, RouteProps } from "react-router-dom"
import { AuthContainer } from "../controllers/auth"

export const PublicRoute = (props: RouteProps) => {
	const { currentUser } = AuthContainer.useContainer()

	if (currentUser) {
		return (
			<Route {...props}>
				<Redirect to="/" />
			</Route>
		)
	}

	return <Route {...props} />
}

export const PrivateRoute = (props: RouteProps) => {
	const { currentUser, loading } = AuthContainer.useContainer()

	if (!currentUser) {
		return <Route {...props}>{!loading && <Redirect to="/login" />}</Route>
	}

	return (
		// Show the component only when the user is logged in
		<Route {...props} />
	)
}
