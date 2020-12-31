import * as React from "react"
import { Switch } from "react-router-dom"
import { PrivateRoute } from "../../components/security"
import { FindGyfers } from "./findGyfers"
// import { HubCreatePage } from "./hubCreate"

export const FollowRoot = () => {
	return (
		<Switch>
			<PrivateRoute exact path="/gyfers/find" component={FindGyfers} />
		</Switch>
	)
}
