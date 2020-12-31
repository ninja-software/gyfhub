import * as React from "react"
import { Switch } from "react-router-dom"
import { PrivateRoute } from "../../components/security"
import { ChatHub } from "./chat"
import { HubCreatePage } from "./hubCreate"
import { HubsList } from "./hubsList"

export const HubRoot = () => {
	return (
		<Switch>
			<PrivateRoute exact path="/hubs/create" component={HubCreatePage} />
			<PrivateRoute exact path="/hubs/chat" component={ChatHub} />
			<PrivateRoute exact path="/hubs/" component={HubsList} />
		</Switch>
	)
}
