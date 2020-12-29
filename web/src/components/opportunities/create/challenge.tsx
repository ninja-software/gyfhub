import { Box, makeStyles, TextField, Typography } from "@material-ui/core"
import * as React from "react"
import { BasicOpportunityFormProps, Steps } from "../../../pages/opportunities/create"
import { CancelAndSaveButtonBar } from "../../common/button"
import { ExpCard } from "../../common/card"
import { FormBackground } from "./common"

const useStyles = makeStyles((theme) => ({
	form: {
		width: "100%",
		height: "100%",
		display: "flex",
		flexDirection: "column",
	},
}))

export const OpportunitiesCreateChallenge = (props: BasicOpportunityFormProps) => {
	const { data, setData, check, setCheck, toNextStep } = props
	const classes = useStyles()
	// reset check to false when leave current page
	React.useEffect(() => {
		return () => setCheck(false)
		// ISSUE : https://github.com/facebook/react/issues/15865
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<FormBackground>
			<ExpCard>
				<div className={classes.form}>
					<Typography variant="h6">
						<Box fontWeight="bold" marginBottom="10px">
							This is where you talk about the challenge you're business is currently facing and what sorts of ideas you might like to see to have someone help
							you solve it
						</Box>
					</Typography>
					<TextField
						label={<Typography variant="subtitle1">About The Challenge</Typography>}
						variant="filled"
						fullWidth
						multiline
						value={data.challenge}
						onChange={(e) => setData((d) => ({ ...d, challenge: e.target.value }))}
						helperText={
							check &&
							!data.challenge && (
								<Typography color="error" variant="caption">
									Challenge is required
								</Typography>
							)
						}
					/>
					<CancelAndSaveButtonBar
						marginTop="30px"
						cancelLabel={"Back"}
						cancelFunc={() => toNextStep(Steps.Category)}
						saveLabel="Next"
						saveStyle={!data.challenge}
						saveFunc={() => toNextStep(Steps.UploadVideo)}
					/>
				</div>
			</ExpCard>
		</FormBackground>
	)
}
