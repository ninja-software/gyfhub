import * as React from "react"
import { ExpCard } from "../common/card"
import { Typography, Box } from "@material-ui/core"
import { useHistory } from "react-router-dom"
import { ExpButton } from "../common/button"

interface Props {}
export const HubCard = (props: Props) => {
	const {} = props

	const history = useHistory()

	return (
		<ExpCard>
			<div>
				<Typography variant="h2">
					<Box fontWeight="bold">Hubs</Box>
				</Typography>

				<div>
					<ExpButton onClick={() => history.push("/chat")}>Create Hub</ExpButton>
				</div>
			</div>

			<Box m={10} />
		</ExpCard>
	)
}
