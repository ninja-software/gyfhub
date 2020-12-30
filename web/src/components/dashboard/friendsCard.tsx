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
					<Typography variant="h1">
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
<<<<<<< HEAD
=======
			</div>

			<div className={classes.hubList}>
				{/* // todo make this look pretty */}
				{friends.length > 0 ? (
					friends.map((d, idx) => {
						// render the first 3
						if (idx >= 3) {
							return <></>
						}
						return (
							<div
								className={classes.cardBtn}
								onClick={() => {
									// todo refactor this
								}}
							>
								{/* todo change to render avatar instead of initials */}
								<Typography variant="h2">{d.name[0].toUpperCase()}</Typography>
							</div>
						)
					})
				) : (
					<Typography variant="h3">you have no friends lol</Typography>
				)}

				{friends.length > 2 && (
					<div className={classes.viewAllBtn}>
						<ExpButton styleType={"tertiary"}>View all friends</ExpButton>
					</div>
				)}
>>>>>>> master
			</div>
		</ExpCard>
	)
}
