import * as React from "react"
import { ExpCard } from "../common/card"
import { Typography, Box, makeStyles } from "@material-ui/core"
import { useHistory } from "react-router-dom"
import { ExpButton } from "../common/button"
import { useQuery } from "react-fetching-library"
import { fetching } from "../../fetching"
import { Hub } from "../../types/types"

const useStyle = makeStyles((theme) => ({
	hubList: {
		display: "flex",
	},

	top: {
		display: "flex",
		justifyContent: "space-between",
	},
	hubBtn: {
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

export const HubCard = () => {
	const classes = useStyle()
	const history = useHistory()

	const [hubs, setHubs] = React.useState<Hub[]>([])

	const { payload: data, loading, error } = useQuery<Hub[]>(fetching.queries.allHubs())
	React.useEffect(() => {
		if (loading || error || !data) return
		setHubs(data)
	}, [data])

	return (
		<ExpCard>
			<div className={classes.top}>
				<div>
					<Typography variant="h1">
						<Box fontWeight="bold">Hubs</Box>
					</Typography>
				</div>

				<div>
					<ExpButton onClick={() => history.push("/hubs/create")}>Create Hub</ExpButton>
				</div>
			</div>

			<div className={classes.hubList}>
				{hubs.map((d, idx) => {
					if (idx >= 3) {
						return <></>
					}
					return (
						<div onClick={() => history.push("/hubs/chat?id=" + d.id)} className={classes.hubBtn}>
							{/* todo change to render avatar instead of initials */}
							<Typography variant="h2">{d.name[0].toUpperCase()}</Typography>
						</div>
					)
				})}

				<div className={classes.viewAllBtn}>
					<ExpButton styleType={"tertiary"}>View all hubs</ExpButton>
				</div>
			</div>
		</ExpCard>
	)
}
