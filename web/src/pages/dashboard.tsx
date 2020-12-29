import { Box, CircularProgress, makeStyles } from "@material-ui/core"
import { Alert } from "@material-ui/lab"
import * as React from "react"
import { useQuery } from "react-fetching-library"
import { useHistory } from "react-router-dom"
import { ExpButton } from "../components/common/button"
import { UserDetailCard } from "../components/dashboard/userDetailCard"
import { fetching } from "../fetching"
import { User } from "../types/types"

const useStyles = makeStyles((theme) => ({
	container: {
		width: "100%",
		height: "fit-content",
		display: "flex",
		flexDirection:"column",
		backgroundRepeat: "no-repeat",
	},
}))

export const Dashboard = () => {
	const history = useHistory()
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

			<Box width="100%" marginRight="40px">
				<ExpButton onClick={() => history.push("/chat")}>Start  Messaging</ExpButton>
			</Box>
		</div>
	)
}

