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
		flexDirection: "column",
	},
}))

interface Props {}
export const HubCard = (props: Props) => {
	const {} = props

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
			<div>
				<Typography variant="h2">
					<Box fontWeight="bold">Hubs</Box>
				</Typography>

				<div>
					<ExpButton onClick={() => history.push("/hubs/create")}>Create Hub</ExpButton>
				</div>
			</div>

			<div className={classes.hubList}>
				{/* // todo make this look pretty */}
				<Box m={5} />

				<div>list here</div>
				{hubs.map((d) => {
					return (
						<div style={{ marginTop: "10px" }} key={d.id}>
							<ExpButton onClick={() => history.push("/hubs/chat?id=" + d.id)}>hub name: {d.name}</ExpButton>
						</div>
					)
				})}
			</div>
		</ExpCard>
	)
}
