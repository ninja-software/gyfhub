import { Box, Divider, withStyles } from "@material-ui/core"
import * as React from "react"

const CustomDivider = withStyles({
	root: {
		width: "100%",
		height: "2px",
		opacity: 0.2,
	},
})(Divider)

interface ExpDividerProps {
	width?: string
	height?: string
}
export const ExpDivider = (props: ExpDividerProps) => {
	const { width, height } = props
	return (
		<Box width={width || "100%"} height={height || "fit-content"}>
			<CustomDivider />
		</Box>
	)
}
