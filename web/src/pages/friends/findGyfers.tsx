import * as React from "react"
import { makeStyles, TextField, Typography } from "@material-ui/core"
import { ExpButton } from "../../components/common/button"

const useStyles = makeStyles((theme) => ({
	container: {
		height: "90%",
	},
}))

export const FindGyfers = () => {
	const classes = useStyles()

	return (
		<div className={classes.container}>
			<ExpButton fullWidth variant="contained" color="primary">
				Add friend
			</ExpButton>
		</div>
	)
}
