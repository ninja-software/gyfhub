import * as React from "react"
import { ExpCard } from "../common/card"
import { Typography, Box, makeStyles } from "@material-ui/core"
import { useHistory } from "react-router-dom"
import { ExpButton } from "../common/button"
import { useQuery } from "react-fetching-library"
import { fetching } from "../../fetching"
import { Friend, Hub } from "../../types/types"

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

	const [friends, setFriends] = React.useState<Friend[]>([])

	// todo query friends
	const { payload: data, loading, error } = useQuery<Friend[]>(fetching.queries.allHubs())

	React.useEffect(() => {
		if (loading || error || !data) return
		setFriends([]) // todo finish
	}, [data])

	if (!loading && error) return <div>An error occurred</div>

	return (
		<ExpCard>
			<div className={classes.top}>
				<div>
					<Typography variant="h2">
						<Box fontWeight="bold">Friends</Box>
					</Typography>
				</div>

				<div>
					{/* // todo implement add friend(s) */}
					<ExpButton onClick={() => history.push("/hubs/create")}>Add Friend</ExpButton>
				</div>
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
					<Typography variant="h4">you have no friends lol</Typography>
				)}

				{friends.length > 2 && (
					<div className={classes.viewAllBtn}>
						<ExpButton styleType={"tertiary"}>View all friends</ExpButton>
					</div>
				)}
			</div>
		</ExpCard>
	)
}
