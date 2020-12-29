import * as React from "react"
import { makeStyles } from "@material-ui/core/styles"
import experlioLogo from "../../assets/imgs/gyfhubSolo.png"

const useStyles = makeStyles((theme) => ({
	root: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		backgroundRepeat: "no-repeat",
		width: "100%",
		height: "100%",
	},
	logo: {
		WebkitAnimation: `$breathing 5000ms ${theme.transitions.easing.easeInOut}`,
		animation: `$breathing 5000ms ${theme.transitions.easing.easeInOut}`,
	},
	"@keyframes breathing": {
		"0%": {
			WebkitTransform: "scale(0.9)",
			transform: "scale(0.9)",
		},
		"25%": {
			WebkitTransform: "scale(1)",
			transform: "scale(1)",
		},
		"60%": {
			WebkitTransform: "scale(0.9)",
			transform: "scale(0.9)",
		},
		"100%": {
			WebkitTransform: "scale(0.9)",
			transform: "scale(0.9)",
		},
	},
}))
export const Loading = () => {
	const classes = useStyles()
	return (
		<div className={classes.root}>
			<img src={experlioLogo} className={classes.logo} alt="experlio logo" />
		</div>
	)
}
