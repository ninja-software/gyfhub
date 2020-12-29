import * as React from "react"
import { ExpCard } from "../common/card"
import { Typography, Box } from "@material-ui/core"
import { useHistory } from "react-router-dom"
import { ExpButton } from "../common/button"
import { useQuery } from "react-fetching-library"
import { fetching } from "../../fetching"
import { Hub } from "../../types/types"

interface Props {}
export const HubCard = (props: Props) => {
	const {} = props

	const history = useHistory()

	const { payload: data, loading, error } = useQuery<Hub[]>(fetching.queries.allHubs())

	if (!loading && error) return <div>An error occurred</div>
	if (!data) return <div>An error occurred</div>

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

			<div>
				{/* // todo make this look pretty */}
				<Box m={10} />

				<div>list here</div>
				{data?.map((d) => {
					return <div key={d.id}>{d.name}</div>
				})}
			</div>
		</ExpCard>
	)
}
