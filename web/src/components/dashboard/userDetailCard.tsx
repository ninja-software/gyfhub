import { Box, Button, CircularProgress, makeStyles, Typography } from "@material-ui/core"
import * as React from "react"
import { ExpCard } from "../common/card"
import EditIcon from "@material-ui/icons/Edit"
import { useHistory } from "react-router-dom"
import { UserAvatar } from "../common/avatar"
import { useQuery } from "react-fetching-library"
import { User } from "../../types/types"
import { fetching } from "../../fetching"
import { Alert } from "@material-ui/lab"

const useStyles = makeStyles((theme) => ({
	headerBar: {
		width: "100%",
		height: "fit-content",
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
	},
	briefProfile: {
		marginTop: "30px",
		display: "flex",
	},
	userDetail: {
		marginLeft: "38px",
		width: "100%",
		height: "fit-content",
	},
	infoBox: {
		marginBottom: "10px",
		fontWeight: "bolder",
	},
}))

export const UserDetailCard = () => {
	const { payload: currentUser, loading, error } = useQuery<User>(fetching.queries.getMe())
	const classes = useStyles()
	const history = useHistory()
	if (loading) return <CircularProgress />
	if (error) return <Alert color="error">Failed to query current user</Alert>
	if (!currentUser) return null
	return (
		<ExpCard>
			<div className={classes.headerBar}>
				<Typography variant="h1">
					<Box fontWeight="bold">My Details</Box>
				</Typography>
				<Button
					onClick={() => {
						history.push("/profile/update")
					}}
				>
					<EditIcon color={"primary"} fontSize="large" />
				</Button>
			</div>
			<div className={classes.briefProfile}>
				<UserAvatar {...currentUser} size={105} />
				<div className={classes.userDetail}>
					<Typography variant="h3">
						<Box className={classes.infoBox}>{`${currentUser.firstName} ${currentUser.lastName}`}</Box>
						<Box className={classes.infoBox}>{currentUser.email}</Box>
						{currentUser.business && <Box className={classes.infoBox}>{currentUser.business.name}</Box>}
						<Box className={classes.infoBox}>{currentUser.city}</Box>
						{currentUser.business?.australianBusinessNumber && <Box className={classes.infoBox}>{currentUser.business?.australianBusinessNumber}</Box>}
					</Typography>
				</div>
			</div>
		</ExpCard>
	)
}
