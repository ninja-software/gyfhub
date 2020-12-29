import { Box, Container, ContainerProps, Typography, withStyles, LinearProgress, makeStyles } from "@material-ui/core"
import * as React from "react"
import { AuthContainer } from "../../../controllers/auth"
import { UserAvatar } from "../../common/avatar"
import { PrimaryPink } from "../../../theme/colour"
import { Steps } from "../../../pages/opportunities/create"

const FormContainer = withStyles({
	root: {
		width: "100%",
		height: "100%",
		marginTop: "30px",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
	},
})(Container)

export const FormBackground = (props: ContainerProps) => {
	const { currentUser } = AuthContainer.useContainer()
	if (!currentUser) return null
	return (
		<FormContainer maxWidth="sm">
			<UserAvatar size={105} {...currentUser} />
			<Typography variant="h5">
				<Box fontWeight="bold" marginTop="10px" marginBottom="15px">
					{currentUser.business?.name}
				</Box>
			</Typography>
			{props.children}
		</FormContainer>
	)
}

// progress bar
const useStyles = makeStyles({
	container: {
		height: "fit-content",
		width: "100%",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	step: {
		height: "fit-content",
		width: "fit-content",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
	},
	bar: {
		width: "153px",
		height: "8px",
		borderRadius: "40px",
	},
})

interface ProgressBarProps {
	options: string[]
	currentStep: number
	nextStep: (v: string) => void
	uncompletedSteps: Steps[]
}
export const ProgressBar = (props: ProgressBarProps) => {
	const { options, currentStep, nextStep, uncompletedSteps } = props
	const classes = useStyles()
	return (
		<div className={classes.container}>
			{options.map((o, i) => (
				<Step
					key={i}
					label={o}
					index={i}
					currentStep={currentStep}
					nextStep={nextStep}
					highlighted={uncompletedSteps.some((u) => u.toLowerCase() === o.toLowerCase())}
				/>
			))}
		</div>
	)
}

const CustomizedLinearProgress = withStyles({
	root: {
		background: "#E3E3E3 0% 0% no-repeat padding-box",
	},
	bar: {
		background: "transparent linear-gradient(90deg, " + PrimaryPink + " 0%, #C42E8C 100%) 0% 0% no-repeat padding-box",
	},
})(LinearProgress)

interface StepProps {
	label: string
	index: number
	currentStep: number
	nextStep: (v: string) => void
	highlighted: boolean
}
const Step = (props: StepProps) => {
	const { label, index, currentStep, nextStep, highlighted } = props
	const classes = useStyles()
	const [colour, setColour] = React.useState("black")
	React.useEffect(() => {
		if (highlighted) {
			setColour("red")
			return
		}
		if (index === currentStep) {
			setColour("#944B9B")
			return
		}
		setColour("black")
	}, [setColour, currentStep, highlighted, index])
	const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		event.preventDefault()
		nextStep(label)
	}
	return (
		<div className={classes.step} onClick={handleClick}>
			<Box color={colour} fontWeight="bolder" marginBottom="8px" fontFamily="Montserrat">
				{label}
			</Box>
			<CustomizedLinearProgress variant="determinate" value={currentStep >= index ? 100 : 0} className={classes.bar} />
		</div>
	)
}
