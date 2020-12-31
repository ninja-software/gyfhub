import { makeStyles, TextField, Typography } from "@material-ui/core"
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
	card: {
		border: "1px solid black",
		width: "200px",
		height: "200px",
		margin: "10px",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		flexDirection: "column",
	},
	cardList: {
		display: "flex",
		flexWrap: "wrap",
		marginTop: "25px",
		justifyContent: "center",
	},
	searchBar: {
		display: "flex",
		flexWrap: "wrap",
		justifyContent: "center",
		marginTop: "20px",
	},
}))

export const HubsList = () => {
	const classes = useStyle()
	const history = useHistory()

	const [hubs, setHubs] = React.useState<Hub[]>([])
	const [searchKey, setSearchKey] = React.useState<string>("")
	const { payload: data, loading, error } = useQuery<Hub[]>(fetching.queries.allHubs())

	React.useEffect(() => {
		if (loading || error || !data) return
		setHubs(data)
	}, [data])

	React.useEffect(() => {
		if (!data) return

		if (searchKey == "" && data) {
			setHubs(data)
			return
		}
		setHubs(data.filter((d) => d.name.includes(searchKey)))
	}, [searchKey])

	if (!loading && error) return <div>An error occurred</div>
	return (
		<div>
			<div className={classes.searchBar}>
				<TextField
					label={<Typography variant="subtitle1">Search Hubs</Typography>}
					variant="filled"
					value={searchKey}
					style={{ width: "90%" }}
					InputProps={{ style: { fontSize: 40, padding: 10 } }}
					onChange={(e) => setSearchKey(e.target.value)}
				/>
			</div>
			<div className={classes.cardList}>
				{hubs.map((h) => {
					return (
						<div className={classes.card}>
							<div>{<Typography variant="h1">{h.name[0].toUpperCase()}</Typography>}</div>
							<div>{<Typography variant="h3">{trunc(h.name)}</Typography>}</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}

export const trunc = (str: string, num: number = 6) => {
	if (str.length > num) {
		return str.slice(0, num) + "..."
	} else {
		return str
	}
}
