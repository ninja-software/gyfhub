import { Box, makeStyles, MenuItem, TextField, Typography } from "@material-ui/core"
import * as React from "react"
import { useHistory } from "react-router-dom"
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

export const CategoryOptions = ["Social Media", "Website", "Mobile"]

export const OpportunitiesCreateCategory = (props: BasicOpportunityFormProps) => {
	const { data, setData, check, setCheck, toNextStep } = props
	const classes = useStyles()
	const history = useHistory()

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
					<Typography variant="h5">
						<Box fontWeight="bold" marginBottom="10px">
							Select a category so creatives can easily find your opportunity
						</Box>
					</Typography>
					<TextField
						select
						fullWidth
						label={<Typography variant="subtitle1">Category</Typography>}
						value={data.category}
						variant="filled"
						onChange={(e) => setData((d) => ({ ...d, category: e.target.value }))}
						helperText={
							check &&
							!data.category && (
								<Typography color="error" variant="caption">
									Category is required
								</Typography>
							)
						}
					>
						{CategoryOptions.map((o) => (
							<MenuItem key={o} value={o}>
								{o}
							</MenuItem>
						))}
					</TextField>
					<CancelAndSaveButtonBar
						marginTop="30px"
						cancelLabel={"Back"}
						cancelFunc={() => history.goBack()}
						saveLabel="Next"
						saveFunc={() => toNextStep(Steps.Challenge)}
						saveStyle={!data.category}
					/>
				</div>
			</ExpCard>
		</FormBackground>
	)
}
