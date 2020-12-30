import { Box, Container, ContainerProps, CssBaseline, makeStyles, Typography } from "@material-ui/core"
import * as React from "react"
import { PrimaryBlue, PrimaryPink, SecondaryBlue, SecondaryPink } from "../../theme/colour"

const useStyles = makeStyles((theme) => ({
	// auth background
	paper: {
		marginTop: theme.spacing(8),
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
	},
	form: {
		width: "100%",
		marginTop: theme.spacing(1),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
		background: "linear-gradient(45deg, #d769a7 30%, #FF8E53 90%)",
		borderRadius: 3,
		border: 0,
		boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
	},
	// main background
	root: {
		width: "100%",
		height: "100%",
		position: "relative",
		backgroundColor: "white",
	},
	topLeft: {
		position: "absolute",
		top: "-220px",
		left: "-250px",
		transform: "matrix(-0.72, 0.69, -0.69, -0.72, 0, 0)",
	},
	topRight: {
		position: "absolute",
		top: "-174px",
		right: "-122px",
	},
	bottomLeft: {
		position: "absolute",
		bottom: "-136px",
		left: "-107px",
	},
	bottomRight: {
		position: "absolute",
		bottom: "-139px",
		right: "-159px",
	},
	heading: {
		paddingBottom: "20px",
		fontSize: "120px",
	},
	containerStyles: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
		height: "80%",
	},
}))

interface AuthBackgroundProps extends ContainerProps {
	label: string
}

export const AuthBackground = (props: AuthBackgroundProps) => {
	const { label, children } = props
	const classes = useStyles()
	return (
		<Container component="main" maxWidth="sm" className={classes.containerStyles}>
			<CssBaseline />
			<div className={classes.paper}>
				<Typography component="h1" variant="h1" className={classes.heading}>
					Gyfhub
				</Typography>
				<Typography component="h1" variant="h1">
					{label}
				</Typography>
			</div>
			{children}
			<Box mt={8}>
				<Typography variant="h4" color="textSecondary" align="center">
					Ninja Software 2020
				</Typography>
			</Box>
		</Container>
	)
}

interface MainBackgroundProps extends ContainerProps {
	isBusiness: boolean
}
export const MainBackground = (props: MainBackgroundProps) => {
	const { isBusiness, children } = props
	const classes = useStyles()
	const [stroke] = React.useState<string>(isBusiness ? PrimaryBlue : PrimaryPink)
	const [fill] = React.useState<string>(isBusiness ? SecondaryBlue : SecondaryPink)
	return <div className={classes.root}>{children}</div>
}
