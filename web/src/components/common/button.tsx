import { Box, BoxProps, makeStyles, Typography, withStyles } from "@material-ui/core"
import Button, { ButtonProps } from "@material-ui/core/Button/Button"
import * as React from "react"
import { PrimaryBlack, SecondaryPurple } from "../../theme/colour"

const useStyles = makeStyles((theme) => ({
	default: {
		// background: "transparent linear-gradient(101deg, " + PrimaryBlack + " 0%, " + SecondaryPurple + " 100%) 0% 0%",
		background: SecondaryPurple,
		borderRadius: 3,
		border: 0,
		boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
		textTransform: "none",
		fontWeight: "bolder",
		fontSize: "16px",
		color: "white",
	},
	bordered: {
		border: "2px solid " + PrimaryBlack,
		borderRadius: "5px",
		padding: "5px 10px 5px 10px",
	},
	nextButton: {
		background: "#A8A8A8",
		color: "white",
		borderRadius: "5px",
		"&:focus": {
			background: "#A8A8A8",
		},
	},
	pinkBackground: {
		background: PrimaryBlack,
		borderRadius: "5px",
	},
	tertiary: {
		background: "transparent",
		borderRadius: "5px",
		textDecoration: "underline",
	},
	labelStyle: {
		padding: 10,
	},
}))

interface ExpButtonProps extends ButtonProps {
	styleType?: "bordered" | "nextButton" | "pinkBackground" | "tertiary"
}

export const ExpButton = (props: ExpButtonProps) => {
	const { children, type, styleType, ...rest } = props
	const classes = useStyles()
	let className = classes.default
	switch (styleType) {
		case "bordered":
			className = classes.bordered
			break
		case "nextButton":
			className = classes.nextButton
			break
		case "pinkBackground":
			className = classes.pinkBackground
			break
		case "tertiary":
			className = classes.tertiary
	}
	return (
		<Button {...rest} type={type} className={className}>
			<Typography className={classes.labelStyle} variant="h2">
				{children}
			</Typography>
		</Button>
	)
}

const ButtonBarContainer = withStyles({
	root: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		width: "100%",
		height: "100%",
	},
})(Box)
interface CancelAndSaveButtonBarProps extends BoxProps {
	cancelLabel?: string
	cancelFunc?: () => void
	saveLabel?: string
	saveFunc?: () => void
	saveStyle?: boolean
	loading?: boolean
}
export const CancelAndSaveButtonBar = (props: CancelAndSaveButtonBarProps) => {
	const { cancelLabel, saveLabel, cancelFunc, saveFunc, saveStyle, loading, ...rest } = props
	return (
		<ButtonBarContainer {...rest}>
			<ExpButton
				styleType="bordered"
				disabled={loading}
				onClick={() => {
					if (cancelFunc) cancelFunc()
				}}
			>
				{cancelLabel || "Cancel"}
			</ExpButton>
			<ExpButton
				styleType={saveStyle ? "nextButton" : undefined}
				type={saveFunc ? "button" : "submit"}
				disabled={loading}
				onClick={
					saveFunc
						? (e) => {
								e.preventDefault()
								saveFunc()
						  }
						: undefined
				}
			>
				{saveLabel || "Save"}
			</ExpButton>
		</ButtonBarContainer>
	)
}
