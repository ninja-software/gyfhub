import * as React from "react"
import { Box, Button, CircularProgress, makeStyles } from "@material-ui/core"
import { UserDetailCard } from "../components/dashboard/userDetailCard"
import { useQuery } from "react-fetching-library"
import { fetching } from "../fetching"
import { User } from "../types/types"
import { Alert } from "@material-ui/lab"
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
	const history = useHistory()
	if (loading) return <CircularProgress />
	if (error || !currentUser) return <Alert color="error"> Failed to load user detail</Alert>
	return (
		<div className={classes.container}>
			<Box width="100%" marginRight="40px">
				<UserDetailCard />
				<Box m={10} />
				<Button onClick={() => history.push("/chat")}>Go to chat</Button>
			</Box>
		</div>
	)
}
