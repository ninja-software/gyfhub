import { Box, Checkbox, Divider, FormControlLabel, makeStyles, MenuItem, TextField, Typography, withStyles } from "@material-ui/core"
import * as React from "react"
import { BasicOpportunityFormProps, OpportunityType, Steps } from "../../../pages/opportunities/create"
import { CityOptions } from "../../../pages/updatePage"
import { PrimaryBlue } from "../../../theme/colour"
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
	divider: {
		height: "2px",
		marginTop: "15px",
		marginBottom: "15px",
		opacity: 0.2,
	},
}))

export const CustomizedCheckbox = withStyles({
	root: {
		color: PrimaryBlue,
		marginLeft: "13px",
	},
})(Checkbox)

export const OpportunitiesCreateWorkType = (props: BasicOpportunityFormProps) => {
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
					<Typography variant="h6" color={check && !data.roleAfterChallenge ? "error" : "initial"}>
						<Box fontWeight="bold" marginBottom="10px">
							Select whether it’s a Gig, Part Time ongoing, or Full Time roleAfterChallenge after this challenge (select one)
						</Box>
					</Typography>
					{Object.values(OpportunityType).map((r, i) => (
						<FormControlLabel
							key={i}
							control={
								<CustomizedCheckbox
									checked={data.roleAfterChallenge === r}
									onChange={() => setData((d) => ({ ...d, roleAfterChallenge: r }))}
									value="antoine"
								/>
							}
							label={
								<Typography variant="inherit">
									<Box fontWeight="bold">{r}</Box>
								</Typography>
							}
						/>
					))}
					<Divider className={classes.divider} />
					<TextField
						select
						fullWidth
						label={<Typography variant="subtitle1">Confirm Your City</Typography>}
						value={data.confirmYourCity}
						variant="filled"
						onChange={(e) => setData((d) => ({ ...d, confirmYourCity: e.target.value }))}
						helperText={
							check &&
							!data.confirmYourCity && (
								<Typography color="error" variant="caption">
									City is required
								</Typography>
							)
						}
					>
						{CityOptions.map((o) => (
							<MenuItem key={o} value={o}>
								{o}
							</MenuItem>
						))}
					</TextField>
					<Typography variant="h6">
						<FormControlLabel
							control={
								<CustomizedCheckbox checked={data.openToRemoteTalent} onChange={() => setData((d) => ({ ...d, openToRemoteTalent: !d.openToRemoteTalent }))} />
							}
							label={
								<Typography variant="inherit">
									<Box fontWeight="bold">Open to Remote Talent</Box>
								</Typography>
							}
						/>
					</Typography>
					<CancelAndSaveButtonBar
						marginTop="30px"
						cancelLabel={"Back"}
						cancelFunc={() => toNextStep(Steps.UploadVideo)}
						saveLabel="Next"
						saveFunc={() => toNextStep(Steps.Summary)}
						saveStyle={!data.confirmYourCity || !data.roleAfterChallenge}
					/>
				</div>
			</ExpCard>
		</FormBackground>
	)
}
