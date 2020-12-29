import * as React from "react"
import { Box, BoxProps, makeStyles, Typography, withStyles } from "@material-ui/core"
import { OpportunitiesInput, Steps } from "../../../pages/opportunities/create"
import { Opportunity, User } from "../../../types/types"
import { PrimaryPink, SecondaryPink } from "../../../theme/colour"
import { OpportunityView } from "../summaryTemplate"
import { useMutation } from "react-fetching-library"
import { fetching } from "../../../fetching"
import { useHistory } from "react-router-dom"

const useStyles = makeStyles((theme) => ({
	outer: {
		width: "100%",
		height: "fit-content",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
	},
	container: {
		width: "100%",
		height: "fit-content",
		display: "flex",
	},
}))

interface OpportunitiesCreateSummaryProps {
	user: User
	data: OpportunitiesInput
	setCheck: React.Dispatch<React.SetStateAction<boolean>>
	uncompletedSteps: Steps[]
	setUncompletedSteps: React.Dispatch<React.SetStateAction<Steps[]>>
}

export const OpportunitiesCreateSummary = (props: OpportunitiesCreateSummaryProps) => {
	const { data, user, setCheck, setUncompletedSteps, uncompletedSteps } = props
	const classes = useStyles()
	const history = useHistory()
	const { loading: uploadLoading, mutate: uploadFile } = useMutation<string>(fetching.mutations.uploadFile)
	const { loading: createLoading, mutate: createOpportunity } = useMutation<boolean>(fetching.mutations.createOpportunities)
	const [canSubmit, setCanSubmit] = React.useState<boolean>(false)

	// check eligibility
	React.useEffect(() => {
		let list: Steps[] = []
		if (!data.category) list.push(Steps.Category)
		if (!data.challenge) list.push(Steps.Challenge)
		if (!data.video) list.push(Steps.UploadVideo)
		if (!data.roleAfterChallenge || !data.confirmYourCity) list.push(Steps.WorkType)
		setCanSubmit(list.length === 0)
		setUncompletedSteps(list)

		// reset check to false when leave current page
		return () => setCheck(false)
		// ISSUE : https://github.com/facebook/react/issues/15865
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// submit data
	const onSubmit = async () => {
		if (!canSubmit) return

		const upload = await uploadFile(data.video)
		if (upload.error || !upload.payload) return

		const result = await createOpportunity({
			category: data.category,
			challenge: data.challenge,
			roleAfterChallenge: data.roleAfterChallenge,
			confirmYourCity: data.confirmYourCity,
			openToRemote: data.openToRemoteTalent,
			videoID: upload.payload,
		})

		if (result.error || !result.payload) return

		history.push("/")
	}

	return (
		<div className={classes.outer}>
			<Typography variant="h6">
				<Box fontWeight="bolder" marginTop="20px" marginBottom="20px">
					Here is what creatives will see when the view your opportunity
				</Box>
			</Typography>
			<OpportunityView
				user={user}
				data={{ ...data, videoURL: data.video ? URL.createObjectURL(data.video) : undefined } as Opportunity}
				onSubmit={onSubmit}
				loading={uploadLoading || createLoading}
				uncompletedList={uncompletedSteps}
			/>
		</div>
	)
}

const CustomizedTag = withStyles({
	root: {
		background: SecondaryPink + " 0% 0% no-repeat padding-box",
		border: "1px solid #FFB5D6",
		borderRadius: "4px",
		color: PrimaryPink,
		paddingTop: "3px",
		paddingBottom: "3px",
		paddingRight: "13px",
		paddingLeft: "13px",
	},
})(Box)

interface OpportunityTagProps extends BoxProps {
	label: string
}
export const OpportunityTag = (props: OpportunityTagProps) => {
	const { label, ...rest } = props
	return (
		<CustomizedTag {...rest}>
			<Typography variant="subtitle2">{label}</Typography>
		</CustomizedTag>
	)
}
