import { makeStyles } from "@material-ui/core"
import { Alert } from "@material-ui/lab"
import * as React from "react"
import { useHistory } from "react-router-dom"
import { OpportunitiesCreateChallenge } from "../../components/opportunities/create/challenge"
import { OpportunitiesCreateCategory } from "../../components/opportunities/create/category"
import { OpportunitiesCreateSummary } from "../../components/opportunities/create/Summary"
import { OpportunitiesCreateUploadVideo } from "../../components/opportunities/create/uploadVideo"
import { OpportunitiesCreateWorkType } from "../../components/opportunities/create/workType"
import { AuthContainer } from "../../controllers/auth"
import { ProgressBar } from "../../components/opportunities/create/common"

const useStyles = makeStyles(() => ({
	container: {
		height: "100%",
		width: "100%",
		display: "flex",
		flexDirection: "column",
	},
}))

export enum Steps {
	Category = "Category",
	Challenge = "Challenge",
	UploadVideo = "Upload-Video",
	WorkType = "Work-type",
	Summary = "Summary",
}

export enum OpportunityType {
	Gig = "Gig",
	PartTime = "Part Time",
	FullTime = "Full Time",
}

export interface BasicOpportunityFormProps {
	data: OpportunitiesInput
	setData: React.Dispatch<React.SetStateAction<OpportunitiesInput>>
	check: boolean
	setCheck: React.Dispatch<React.SetStateAction<boolean>>
	toNextStep: (nextStep: string) => void
}

export interface OpportunitiesInput {
	category?: string
	challenge?: string
	video?: File
	roleAfterChallenge: OpportunityType | ""
	confirmYourCity?: string
	openToRemoteTalent?: boolean
}

export const OpportunitiesCreate = () => {
	const classes = useStyles()
	const [data, setData] = React.useState<OpportunitiesInput>({
		category: "",
		challenge: "",
		confirmYourCity: "",
		roleAfterChallenge: "",
		openToRemoteTalent: false,
	})
	const [check, setCheck] = React.useState<boolean>(false)
	const [uncompletedSteps, setUncompletedSteps] = React.useState<Steps[]>([])
	const { currentUser } = AuthContainer.useContainer()
	React.useEffect(() => {
		if (currentUser)
			setData((d) => ({
				...d,
				confirmYourCity: currentUser.city,
			}))
	}, [currentUser])
	// first load page reset URL

	const history = useHistory()

	React.useEffect(() => {
		history.replace("/opportunity/create?step=category")
		// ISSUE : https://github.com/facebook/react/issues/15865
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// switching among pages
	const handleNext = (nextStep: string) => {
		if (!stepName) return
		setCheck(true)
		// check whether current step conditions are fulfilled
		switch (stepName) {
			case Steps.Category.toLowerCase():
				if (!data.category) return
				break
			case Steps.Challenge.toLowerCase():
				if (!data.challenge) return
				break
			case Steps.UploadVideo.toLowerCase():
				if (!data.video) return
				break
			case Steps.WorkType.toLowerCase():
				if (!data.roleAfterChallenge || !data.confirmYourCity) return
				break
		}

		// clean up uncompleted step
		setUncompletedSteps(uncompletedSteps.filter((u) => u.toLocaleLowerCase() !== stepName.toLocaleLowerCase()))

		// go to next page
		history.push(`/opportunity/create?step=${nextStep.toLowerCase()}`)
	}
	const searchArgs = new URLSearchParams(history.location.search)
	const stepName = searchArgs.get("step")

	const displayForm = () => {
		if (!currentUser) {
			// display error message
			return <Alert color="error">Unauthorized action</Alert>
		}
		switch (stepName) {
			case Steps.Category.toLowerCase():
				return <OpportunitiesCreateCategory data={data} setData={setData} check={check} setCheck={setCheck} toNextStep={handleNext} />
			case Steps.Challenge.toLowerCase():
				return <OpportunitiesCreateChallenge data={data} setData={setData} check={check} setCheck={setCheck} toNextStep={handleNext} />
			case Steps.UploadVideo.toLowerCase():
				return <OpportunitiesCreateUploadVideo data={data} setData={setData} check={check} setCheck={setCheck} toNextStep={handleNext} />
			case Steps.WorkType.toLowerCase():
				return <OpportunitiesCreateWorkType data={data} setData={setData} check={check} setCheck={setCheck} toNextStep={handleNext} />
			case Steps.Summary.toLowerCase():
				return (
					<OpportunitiesCreateSummary
						data={data}
						user={currentUser}
						setCheck={setCheck}
						setUncompletedSteps={setUncompletedSteps}
						uncompletedSteps={uncompletedSteps}
					/>
				)
		}
	}
	return (
		<div className={classes.container}>
			<ProgressBar
				options={Object.values(Steps)}
				currentStep={Object.values(Steps)
					.map((s) => s.toLowerCase())
					.indexOf(stepName || "")}
				nextStep={handleNext}
				uncompletedSteps={uncompletedSteps}
			/>
			{displayForm()}
		</div>
	)
}
