import { makeStyles } from "@material-ui/core"
import * as React from "react"
import { Switch } from "react-router-dom"
import { MainBackground } from "../components/common/background"
import { PrivateRoute, PublicRoute } from "../components/security"
import { TopBar } from "../components/topBar"
import { AuthContainer } from "../controllers/auth"
import { UserType } from "../types/enum"
import FourZeroFour from "./404"
import { Dashboard } from "./dashboard"
import { HubRoot } from "./hubs/root"
import { FollowRoot } from "./friends/followRoot"
import { UpdatePage } from "./updatePage"

const useStyle = makeStyles(() => ({
	outer: {
		height: "93%",
		width: "100%",
		display: "flex",
		overflowY: "auto",
		overflowX: "hidden",
		justifyContent: "center",
		paddingTop: "15px",
		paddingBottom: "300px",
	},
	inner: {
		height: "100%",
		width: "95%",
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
					<PrivateRoute path="/hubs" component={HubRoot} />

					<PrivateRoute path="/follow" component={FollowRoot} />

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
