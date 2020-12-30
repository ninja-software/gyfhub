import * as React from "react"
import { ExpCard } from "../common/card"
import { Typography, Box, makeStyles } from "@material-ui/core"
import { useHistory } from "react-router-dom"
import { ExpButton } from "../common/button"
import { useQuery } from "react-fetching-library"
import { fetching } from "../../fetching"
import { Hub } from "../../types/types"

const useStyle = makeStyles((theme) => ({
	statsList: {
		display: "flex",
		flexDirection: "column",
	},

	top: {
		display: "flex",
		justifyContent: "space-between",
		marginTop: "20px",
	},
	hubBtn: {
		height: "200px",
		width: "250px",
		marginTop: "10px",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},

	statRow: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		paddingBottom: "10px",
		marginBottom: "10px",
		borderBottom: "1px solid grey",
	},
	viewAllBtn: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},

	gifImage: {
		width: "100%",
		height: "100%",
	},
}))

export const StatsCard = () => {
	const classes = useStyle()
	const history = useHistory()

	// todo get data
	const { payload: data, loading, error } = useQuery<Hub[]>(fetching.queries.allHubs())

	if (!loading && error) return <div>An error occurred</div>

	return (
		<ExpCard>
			<div className={classes.top}>
				<div>
					<Typography variant="h1">
						<Box fontWeight="bold">My Stats</Box>
					</Typography>
				</div>
			</div>

			<div className={classes.statsList}>
				<div className={classes.statRow}>
					<div>
						<Typography variant="h3"> Most Used</Typography>
					</div>

					<div className={classes.hubBtn}>
						<img className={classes.gifImage} src="https://giffiles.alphacoders.com/130/13036.gif" alt="" />
					</div>
				</div>

				<div className={classes.statRow}>
					<div>
						<Typography variant="h3"> Gifs Sent</Typography>
					</div>

					<div className={classes.hubBtn}>
						<Typography variant="h1">
							<Box fontWeight="bold">50</Box>
						</Typography>
					</div>
				</div>
			</div>

			<div className={classes.top}>
				<div>
					<Typography variant="h1">
						<Box fontWeight="bold">Global Stats</Box>
					</Typography>
				</div>
			</div>

			<div className={classes.statsList}>
				<div className={classes.statRow}>
					<div>
						<Typography variant="h3"> Most popular</Typography>
					</div>

					<div className={classes.hubBtn}>
						<img className={classes.gifImage} src="https://giffiles.alphacoders.com/130/13036.gif" alt="" />
					</div>
				</div>

				<div className={classes.statRow}>
					<div>
						<Typography variant="h3">Trending</Typography>
					</div>

					<div className={classes.hubBtn}>
						<img className={classes.gifImage} src="https://media1.tenor.com/images/d3e70b1dab8d316aab7406f9e242190b/tenor.gif?itemid=15610659" alt="" />
					</div>
				</div>

				<div className={classes.viewAllBtn}>
					<ExpButton styleType={"tertiary"}>View all</ExpButton>
				</div>
			</div>
		</ExpCard>
	)
}
