import { Box, CircularProgress, makeStyles, Typography } from "@material-ui/core"
import * as React from "react"
import { RoomOutlined, AccessTimeOutlined, InfoOutlined } from "@material-ui/icons"
import { Opportunity, User } from "../../types/types"
import { UserAvatar } from "../common/avatar"
import { ExpCard } from "../common/card"
import { ExpDivider } from "../common/divider"
import { CancelAndSaveButtonBar, ExpButton } from "../common/button"
import { useHistory } from "react-router-dom"
import { PrimaryPink, PrimaryBlue } from "../../theme/colour"
import { OpportunityTag } from "./create/Summary"
import { Alert } from "@material-ui/lab"
import { SaveButton } from "./saveButton"

const useStyles = makeStyles((theme) => ({
	container: {
		width: "100%",
		height: "fit-content",
		display: "flex",
	},
	loadingIcon: {
		position: "absolute",
		top: "40%",
		left: "40%",
	},
}))

interface OpportunityViewProps {
	user: User
	data: Opportunity
	onSubmit?: () => void
	loading?: boolean
	uncompletedList?: string[]
}

export const OpportunityView = (props: OpportunityViewProps) => {
	const { user, data, onSubmit, loading, uncompletedList } = props
	const history = useHistory()
	const classes = useStyles()
	const loadingEffect: React.CSSProperties = {
		opacity: 0.5,
	}
	return (
		<div className={classes.container} style={loading ? loadingEffect : undefined}>
			<Box width="100%" display="flex" justifyContent="flex-end" paddingRight="20px">
				<ExpCard width="100%" marginRight="20px" maxWidth="240px">
					<UserAvatar {...user} size={200} />
					<Typography variant="h6">
						<Box width="100%" display="flex" alignItems="center" marginTop="8px">
							<Box marginRight="8px">
								<RoomOutlined />
							</Box>
							{data.confirmYourCity}
						</Box>
					</Typography>
					<Typography variant="h6">
						<Box marginTop="8px" width="100%" display="flex" alignItems="center" color={PrimaryPink}>
							<Box marginRight="8px">
								<AccessTimeOutlined />
							</Box>
							7 days remaining
						</Box>
					</Typography>
					<Box width="100%" height="10px" />
					<ExpDivider />
					<Box width="100%" height="20px" />
					<SaveButton data={data} disabled={!!onSubmit} />
					<Box width="100%" height="20px" />
					<ExpButton fullWidth variant="contained">
						SUBMIT IDEA
					</ExpButton>
				</ExpCard>
			</Box>
			<Box width="100%" minWidth="485px" position={loading ? "relative" : "unset"}>
				{loading && <CircularProgress className={classes.loadingIcon} color="primary" size={120} />}
				<ExpCard width="100%">
					<Typography variant="h3">{data.category || "NA"}</Typography>
					<Box m={3} />
					<Typography variant="h4">{user?.business?.name}</Typography>
					<Box m={2} />
					<Box display="flex" alignItems="center">
						{data.openToRemoteTalent && <OpportunityTag label="Open To Remote" marginLeft="10px" />}
						{data.roleAfterChallenge && <OpportunityTag label={data.roleAfterChallenge} marginLeft="10px" />}
					</Box>
					<Box m={4} />
					<ExpDivider />
					<Box m={4} />
					<Typography variant="h4">The Challenge</Typography>
					<Box m={3} />
					<Typography variant="body1">{data.challenge || "NA"}</Typography>
					<Box m={5} />
					<Typography variant="h4">Watch Our Video</Typography>
					<Box m={3} />
					<video width="100%" height="100%" playsInline controls>
						<source src={data.videoURL} />
					</video>
				</ExpCard>
				<Box m={4} />
				{onSubmit && (
					<>
						<ExpCard width="100%">
							<Box display="flex" alignItems="center">
								<Box color={PrimaryBlue} marginRight="9px">
									<InfoOutlined fontSize="large" />
								</Box>
								<Typography variant="subtitle2">
									Your Opportunities last for 7 days. Countdown starts and displays on Opportunity posting when submitted.
								</Typography>
							</Box>
						</ExpCard>
						{uncompletedList && uncompletedList.length > 0 && (
							<Alert severity="error">{`Please complete the following forms: ${uncompletedList.map((u) => ` ${u}`)}`}</Alert>
						)}
						<Box width="100%" height="fit-content" marginTop="15px">
							<CancelAndSaveButtonBar
								loading={loading}
								cancelLabel="Back"
								cancelFunc={() => history.push("/opportunity/create?step=work-type")}
								saveLabel="Post Opportunity"
								saveFunc={onSubmit}
							/>
						</Box>
					</>
				)}
			</Box>
			{/* Box for spacing*/}
			<Box width="100%" />
		</div>
	)
}
