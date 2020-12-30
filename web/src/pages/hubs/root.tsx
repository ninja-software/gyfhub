import * as React from "react"
import { Switch } from "react-router-dom"
import { PrivateRoute } from "../../components/security"
import { ChatHub } from "./chat"
import { HubCreatePage } from "./hubCreate"

export const HubRoot = () => {
	return (
		<Switch>
			<PrivateRoute exact path="/hubs/create" component={HubCreatePage} />
			<PrivateRoute exact path="/hubs/chat" component={ChatHub} />
		</Switch>
	)
}
