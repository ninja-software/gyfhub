import * as React from "react"
import { RouteComponentProps, Switch } from "react-router-dom"
import { ViewOpportunity } from "../../components/opportunities/viewOpportunity"
import { PrivateRoute } from "../../components/security"
import { OpportunitiesCreate } from "./create"
import { OpportunitiesFind } from "./list"

export const OpportunitiesRoot = (props: RouteComponentProps<{ id: string }>) => {
	return (
		<Switch>
			<PrivateRoute exact path="/opportunity/create" component={OpportunitiesCreate} />
			<PrivateRoute exact path="/opportunity/find" component={OpportunitiesFind} />
			<PrivateRoute exact path="/opportunity" component={ViewOpportunity} />
		</Switch>
	)
}
