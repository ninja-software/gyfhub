import * as React from "react"
import { Switch } from "react-router-dom"
import { UpdatePage } from "./updatePage"
import { TopBar } from "../components/topBar"
import { AuthContainer } from "../controllers/auth"
import { MainBackground } from "../components/common/background"
import { Dashboard } from "./dashboard"
import { makeStyles } from "@material-ui/core"
import { OpportunitiesRoot } from "./opportunities/root"
import { PrivateRoute, PublicRoute } from "../components/security"
import FourZeroFour from "./404"
import { HubCreatePage } from "./hubs/hubCreate"

import { UserType } from "../types/enum"
import { HubRoot } from "./hubs/root"

const useStyle = makeStyles(() => ({
	outer: {
		height: "100%",
		width: "100%",
		display: "flex",
		overflowY: "auto",
		overflowX: "hidden",
		justifyContent: "center",
		paddingTop: "15px",
	},
	inner: {
		height: "100%",
		width: "80%",
	},
}))

// Display page
const PortalInner = () => {
	const classes = useStyle()
	return (
		<div className={classes.outer}>
			<div className={classes.inner}>
				<Switch>
					<PrivateRoute path="/profile/update" component={UpdatePage} />
					<PrivateRoute path="/opportunity" component={OpportunitiesRoot} />

					<PrivateRoute path="/hubs" component={HubRoot} />

					<PrivateRoute exact path="/" component={Dashboard} />

					<PublicRoute path={"/"} component={FourZeroFour} />
				</Switch>
			</div>
		</div>
	)
}

// Portal component check user login
export const Portal = () => {
	const { currentUser } = AuthContainer.useContainer()
	return (
		<MainBackground isBusiness={currentUser?.type === UserType.Business}>
			<TopBar />
			<PortalInner />
		</MainBackground>
	)
}
