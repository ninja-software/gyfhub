import { makeStyles } from "@material-ui/core"
import React from "react"
import { useQuery } from "react-fetching-library"
import { useHistory } from "react-router-dom"
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

export const HubsList = () => {
	const [hubs, setHubs] = React.useState<Hub[]>([])

	const { payload: data, loading, error } = useQuery<Hub[]>(fetching.queries.allHubs())

	React.useEffect(() => {
		if (loading || error || !data) return
		setHubs(data)
	}, [data])

	if (!loading && error) return <div>An error occurred</div>
	return (
		<div>
			{hubs.map((h, i) => {
				return <div key={i}>{h.name}</div>
			})}
		</div>
	)
}
