import { Box, FormControlLabel } from "@material-ui/core"
import Container from "@material-ui/core/Container"
import Grid from "@material-ui/core/Grid/Grid"
import { makeStyles } from "@material-ui/core/styles"
import TextField from "@material-ui/core/TextField/TextField"
import Typography from "@material-ui/core/Typography"
import React, { useState } from "react"
import { useMutation } from "react-fetching-library"
import { ExpButton } from "../../components/common/button"
import { ExpCard } from "../../components/common/card"
import { CustomizedCheckbox } from "../../components/opportunities/create/workType"
import { AuthContainer } from "../../controllers/auth"
import { fetching } from "../../fetching"
import { PrimaryBlue, PrimaryPink } from "../../theme/colour"
import { UserType } from "../../types/enum"
import { User } from "../../types/types"
import { useHistory } from "react-router-dom"

const useStyles = makeStyles((theme) => ({
	container: {
		width: "100%",
		height: "fit-content",
		display: "flex",
		justifyContent: "center",
	},
	form: {
		width: "100%",
	},
	containerStyle: {
		display: "flex",
		paddingTop: "20px",
	},
	large: {
		width: theme.spacing(20),
		height: theme.spacing(20),
	},
	avatarDiv: {
		width: "fix-content",
		marginRight: "36px",
	},
	textFieldBg: {
		background: "#F8F3FF",
	},
	avatarSize: {
		height: "150px",
		width: "150px",
	},
	hidden: {
		height: 0,
		width: 0,
		position: "absolute",
	},
}))

export const HubCreatePage = () => {
	const classes = useStyles()
	const history = useHistory()
	const [avatar, setAvatar] = React.useState<File>()

	// fetch current user detail
	const { currentUser, loading } = AuthContainer.useContainer()

	// update user mutation
	const { mutate: uploadPhoto, loading: uploadLoading } = useMutation<string>(fetching.mutations.uploadFile)
	const { mutate, loading: updateLoading } = useMutation<User>(fetching.mutations.createHub)
	const [check, setCheck] = useState(false)

	const [inputs, setInputs] = useState({
		hubName: "",
		isPrivate: false,
	})

	const onSubmit = async () => {
		if (!currentUser) return
		setCheck(true)

		// general validation
		if (!inputs.hubName) return

		let avatarID: string | undefined = undefined
		// upload avatar if provided
		if (avatar) {
			const resp = await uploadPhoto(avatar)
			if (resp.error || !resp.payload) return
			avatarID = resp.payload
		}

		const resp = await mutate({ name: inputs.hubName, isPrivate: inputs.isPrivate })

		if (resp.error || !resp.payload) return
		history.push("/")
	}

	if (!currentUser) return null
	return (
		<div className={classes.container}>
			<ExpCard width="100%" maxWidth="800px" loading={uploadLoading || updateLoading || loading}>
				<Typography variant="h1" color="textPrimary" gutterBottom>
					Create Hub
				</Typography>
				<Container className={classes.containerStyle} maxWidth={false}>
					<div>
						<div className={classes.form}>
							<Grid container spacing={6}>
								<Grid item xs={12}>
									<TextField
										InputProps={{ style: { fontSize: 20, padding: 10 } }}
										label={
											<Typography color="textPrimary" variant="h5">
												{"Hub name"}
											</Typography>
										}
										variant="filled"
										fullWidth
										type="text"
										name={"hubName"}
										onChange={(e) => setInputs({ ...inputs, hubName: e.target.value })}
										value={inputs.hubName}
										helperText={
											check &&
											!inputs.hubName && (
												<Typography color="error" variant="caption">
													Hub name is required
												</Typography>
											)
										}
									/>
								</Grid>

								<Typography variant="h6">
									<FormControlLabel
										control={
											<CustomizedCheckbox checked={inputs.isPrivate} onChange={() => setInputs({ ...inputs, isPrivate: inputs.isPrivate ? false : true })} />
										}
										label={
											<Typography variant="inherit">
												<Box fontWeight="bold">Private</Box>
											</Typography>
										}
									/>
								</Typography>

								<Grid item xs={12}>
									<ExpButton
										type="submit"
										fullWidth
										variant="contained"
										color="primary"
										onClick={onSubmit}
										disabled={uploadLoading || updateLoading || loading}
									>
										Create
									</ExpButton>
								</Grid>
							</Grid>
						</div>
					</div>
				</Container>
			</ExpCard>
		</div>
	)
}
