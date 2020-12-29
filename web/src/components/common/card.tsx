import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import { Box, BoxProps, CircularProgress } from "@material-ui/core"

const useStyles = makeStyles({
	root: {
		width: "100%",
		height: "fit-content",
		boxShadow: "0px 0px 16px #00000019",
		borderRadius: "11px",
		display: "flex",
		flexDirection: "column",
		marginBottom: "15px",
		zIndex: 3,
		padding: "20px",
	},
	loading: {
		position: "absolute",
		top: "50%",
		left: "50%",
	},
})

interface ExpCardProps extends BoxProps {
	loading?: boolean
}

export const ExpCard = (props: ExpCardProps) => {
	const { children, loading, ...rest } = props
	const classes = useStyles()

	return (
		<Box {...rest} className={classes.root} position={loading ? "relative" : "unset"} style={{ opacity: loading ? 0.5 : 1 }}>
			{loading && <CircularProgress className={classes.loading} />}
			{children}
		</Box>
	)
}
