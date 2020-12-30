import * as React from "react"
import { ExpCard } from "../common/card"
import { Typography, Box, makeStyles } from "@material-ui/core"
import { useHistory } from "react-router-dom"
import { ExpButton } from "../common/button"
import { useQuery } from "react-fetching-library"
import { fetching } from "../../fetching"
import { AppPalette } from "../../theme/colour"

const useStyle = makeStyles((theme) => ({
	statsList: {
		display: "flex",
		flexDirection: "column",
		marginTop: "30px",
	},

	top: {
		display: "flex",
		justifyContent: "space-between",
		marginTop: "20px",
	},
	hubBtn: {
		height: "160px",
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
		marginBottom: "20px",
		border: "3px solid " + AppPalette.SecondaryPurple,
		padding: "20px",
		borderRadius: "10px",
	},
	viewAllBtn: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},

	gifImage: {
		width: "100%",
		height: "100%",
		borderRadius: "10px",
	},
}))

interface MyStats {
	mostUsed: string
	gifsSent: number
}

interface GlobalStats {
	mostUsed: string
	gifsSent: number
	usersCount: number
}

export const StatsCard = () => {
	const classes = useStyle()
	const history = useHistory()

	const { payload: data, loading, error } = useQuery<MyStats>(fetching.queries.userStats())
	const { payload: globalData, loading: globalLoading, error: globalError } = useQuery<GlobalStats>(fetching.queries.globalStats())

	const [myStats, setMyStats] = React.useState<MyStats>()
	const [globalStats, setGlobalStats] = React.useState<GlobalStats>()

	React.useEffect(() => {
		if (!data || loading || error) return
		setMyStats(data)
	}, [data])

	React.useEffect(() => {
		if (!globalData || globalError || globalLoading) return
		setGlobalStats(globalData)
	}, [globalData])

	if (!loading && error) return <div>An error occurred</div>
	if (!myStats) return <div>Your Stats are empty</div>
	if (!globalStats) return <div>Global Stats are empty</div>

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
						<img className={classes.gifImage} src={myStats.mostUsed} alt="" />
					</div>
				</div>

				<div className={classes.statRow}>
					<div>
						<Typography variant="h3"> Gifs Sent</Typography>
					</div>

					<div className={classes.hubBtn}>
						<Typography variant="h1">
							<Box fontWeight="bold">{myStats.gifsSent}</Box>
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
						<Typography variant="h3"> Users on Gyfhub</Typography>
					</div>

					<div className={classes.hubBtn}>
						<Typography variant="h1">
							<Box fontWeight="bold">{globalStats.usersCount}</Box>
						</Typography>
					</div>
				</div>

				<div className={classes.statRow}>
					<div>
						<Typography variant="h3">Gifs Sent</Typography>
					</div>

					<div className={classes.hubBtn}>
						<Typography variant="h1">
							<Box fontWeight="bold">{globalStats.gifsSent}</Box>
						</Typography>
					</div>
				</div>

				<div className={classes.statRow}>
					<div>
						<Typography variant="h3"> Most Used</Typography>
					</div>

					<div className={classes.hubBtn}>
						<img className={classes.gifImage} src={globalStats.mostUsed} alt="" />
					</div>
				</div>

				<div className={classes.viewAllBtn}>
					<ExpButton styleType={"tertiary"}>View all</ExpButton>
				</div>
			</div>
		</ExpCard>
	)
}
