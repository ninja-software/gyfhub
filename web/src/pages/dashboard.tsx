import * as React from "react"
import { Box, CircularProgress, makeStyles, Typography } from "@material-ui/core"
import { UserDetailCard } from "../components/dashboard/userDetailCard"
import { useQuery } from "react-fetching-library"
import { fetching } from "../fetching"
import { Opportunity, User } from "../types/types"
import { Alert } from "@material-ui/lab"
import { ExpCard } from "../components/common/card"
import { ExpButton } from "../components/common/button"
import { PrimaryPink, PrimaryBlue } from "../theme/colour"
import { OpportunityCard } from "../components/opportunities/card"
import { UserType } from "../types/enum"
import { useHistory } from "react-router-dom"

const useStyles = makeStyles((theme) => ({
	container: {
		width: "100%",
		height: "fit-content",
		display: "flex",
		backgroundRepeat: "no-repeat",
	},
}))

export const Dashboard = () => {
	const { payload: currentUser, loading, error } = useQuery<User>(fetching.queries.getMe())
	const classes = useStyles()
	if (loading) return <CircularProgress />
	if (error || !currentUser) return <Alert color="error"> Failed to load user detail</Alert>
	return (
		<div className={classes.container}>
			<Box width="100%" marginRight="40px">
				<UserDetailCard />
				<Box m={10} />
			</Box>
		</div>
	)
}
