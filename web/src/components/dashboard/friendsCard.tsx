import * as React from "react"
import { ExpCard } from "../common/card"
import { Typography, Box, makeStyles } from "@material-ui/core"
import { useHistory } from "react-router-dom"
import { ExpButton } from "../common/button"
import { useQuery } from "react-fetching-library"
import { fetching } from "../../fetching"
import { Follow } from "../../types/types"

const useStyle = makeStyles((theme) => ({
	hubList: {
		display: "flex",
	},

	top: {
		display: "flex",
		justifyContent: "space-between",
	},
	cardBtn: {
		height: "100px",
		width: "100px",
		marginTop: "10px",
		marginRight: "10px",
		border: "1px solid black",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	viewAllBtn: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},
}))

export const FriendsCard = () => {
	const classes = useStyle()
	const history = useHistory()

	// todo query friends
	const { payload: followers, loading: followersLoading, error: followersError } = useQuery<Follow>(fetching.queries.getFollowers())
	const { payload: following, loading: followingLoading, error: followingError } = useQuery<Follow>(fetching.queries.getFollowing())

	if (!followersLoading && followingLoading) return <div>Loading</div>

	if (!followersError && followingError) return <div>An error occured</div>

	return (
		<ExpCard>
			<div className={classes.top}>
				<div>
					<Typography variant="h2">
						<Box fontWeight="bold">Friends</Box>
					</Typography>
				</div>
				<div>
					<Typography variant="h2">
						<Box>Followers: {followers}</Box>
					</Typography>
				</div>
				<div>
					<Typography variant="h2">
						<Box>Following: {following}</Box>
					</Typography>
				</div>
				<div>
					<ExpButton onClick={() => history.push("/follow/find")}>Find Gyfers</ExpButton>
				</div>
			</div>
		</ExpCard>
	)
}
