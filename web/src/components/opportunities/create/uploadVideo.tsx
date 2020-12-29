import { Box, Divider, makeStyles, Typography } from "@material-ui/core"
import * as React from "react"
import { CancelAndSaveButtonBar } from "../../common/button"
import { ExpCard } from "../../common/card"
import { FormBackground } from "./common"
import { DescriptionOutlined } from "@material-ui/icons"
import { FileUpload } from "../../common/fileUpload"
import { Alert } from "@material-ui/lab"
import { BasicOpportunityFormProps, Steps } from "../../../pages/opportunities/create"
import { PrimaryBlue } from "../../../theme/colour"

const useStyles = makeStyles({
	form: {
		width: "100%",
		height: "100%",
		display: "flex",
		flexDirection: "column",
	},
	divider: {
		height: "2px",
		backgroundColor: PrimaryBlue,
		borderRadius: "2px",
	},
	folderIcon: {
		fontSize: 90,
	},
})

export const OpportunitiesCreateUploadVideo = (props: BasicOpportunityFormProps) => {
	const { data, setData, check, setCheck, toNextStep } = props
	const classes = useStyles()

	const [video, setVideo] = React.useState<File[]>(data.video ? [data.video] : [])
	const setFile = (fs: File[]) => {
		// set preview video
		setVideo(fs)

		if (fs.length === 0) return
		// set input data
		setData((d) => ({
			...d,
			video: fs[0],
		}))
	}

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
							Upload a video explaining what makes your company great and a description of the brief (max 3 minutes)
						</Box>
					</Typography>
					<Typography variant="h6">
						{/* TODO: build the modal for the questions*/}
						<Box display="flex" alignItems="flex-end" color={PrimaryBlue}>
							<DescriptionOutlined fontSize="large" />
							<Box marginBottom="5px" marginLeft="5px">
								Answer these questions in your video
								<Divider className={classes.divider} />
							</Box>
						</Box>
					</Typography>
					{check && !video.length && <Alert severity="error">Please update your video</Alert>}
					<FileUpload marginTop="15px" videoType files={video} setFiles={setFile} />
					<CancelAndSaveButtonBar
						marginTop="30px"
						cancelLabel={"Back"}
						cancelFunc={() => toNextStep(Steps.Challenge)}
						saveLabel="Next"
						saveStyle={!video.length}
						saveFunc={() => toNextStep(Steps.WorkType)}
					/>
				</div>
			</ExpCard>
		</FormBackground>
	)
}
