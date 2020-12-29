import React, { useEffect, useState } from "react"
import { makeStyles } from "@material-ui/core/styles"
import Typography from "@material-ui/core/Typography"
import Container from "@material-ui/core/Container"
import Grid from "@material-ui/core/Grid/Grid"
import { useMutation } from "react-fetching-library"
import MenuItem from "@material-ui/core/MenuItem/MenuItem"
import TextField from "@material-ui/core/TextField/TextField"
import { Box } from "@material-ui/core"
import { User } from "../types/types"
import { fetching } from "../fetching"
import { UserType } from "../types/enum"
import { ExpCard } from "../components/common/card"
import { PrimaryBlue, PrimaryPink, SecondaryBlue, SecondaryPink } from "../theme/colour"
import { ExpButton } from "../components/common/button"
import { AddBox, AddCircle } from "@material-ui/icons"
import { UserAvatar } from "../components/common/avatar"
import { AuthContainer } from "../controllers/auth"

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

export const CityOptions = ["Perth", "Sydney", "Melbourne", "Darwin", "Brisbane", "Adelaide", "Canberra", "Hobart"]

const ValidateABN = new RegExp("^[0-9]{11}$")

export const UpdatePage = () => {
	const classes = useStyles()
	const [avatar, setAvatar] = React.useState<File>()
	// fetch current user detail
	const { currentUser, reloadLoginState, loading } = AuthContainer.useContainer()
	// update user mutation
	const { mutate: uploadPhoto, loading: uploadLoading } = useMutation<string>(fetching.mutations.uploadFile)
	const { mutate, loading: updateLoading } = useMutation<User>(fetching.mutations.updateUser)
	const [check, setCheck] = useState(false)

	const [inputs, setInputs] = useState({
		firstName: "",
		lastName: "",
		businessName: "",
		email: "",
		city: "",
	})

	useEffect(() => {
		if (loading || !currentUser) return
		setInputs({
			firstName: currentUser.firstName,
			lastName: currentUser.lastName,
			businessName: currentUser.business?.name || "",
			email: currentUser.email,
			city: currentUser.city,
		})
	}, [currentUser, loading])

	const handleInputChange = (event: any) => {
		setInputs((inputs) => ({ ...inputs, [event.target.name]: event.target.value }))
	}

	const onSubmit = async () => {
		if (!currentUser) return
		setCheck(true)

		// general validation
		if (!inputs.firstName || !inputs.lastName || !inputs.email || !inputs.city) return

		let avatarID: string | undefined = undefined
		// upload avatar if provided
		if (avatar) {
			const resp = await uploadPhoto(avatar)
			if (resp.error || !resp.payload) return
			avatarID = resp.payload
		}

		const resp = await mutate({ ...inputs, avatarID })

		if (resp.error || !resp.payload) return
		reloadLoginState()
	}

	if (!currentUser) return null
	return (
		<div className={classes.container}>
			<ExpCard width="100%" maxWidth="600px" loading={uploadLoading || updateLoading || loading}>
				<Typography variant="h1" color="textPrimary" gutterBottom>
					My Details
				</Typography>
				<Typography variant="h4">
					<Box color={currentUser.type === UserType.Business ? PrimaryBlue : PrimaryPink}>To continue, please update the rest of your profile.</Box>
				</Typography>
				<Container className={classes.containerStyle} maxWidth={false}>
					<div className={classes.avatarDiv}>
						<AvatarUploader avatar={avatar} setAvatar={setAvatar} {...currentUser} />
						<Typography variant="subtitle2">
							<Box marginTop="15px" color={currentUser.type === UserType.Business ? PrimaryBlue : PrimaryPink}>
								Upload a profile photo
							</Box>
						</Typography>
					</div>
					<div>
						<div className={classes.form}>
							<Grid container spacing={6}>
								<Grid item xs={12} sm={6}>
									<TextField
										label="First name"
										variant="filled"
										fullWidth
										type="text"
										name={"firstName"}
										onChange={handleInputChange}
										value={inputs.firstName}
										helperText={
											check &&
											!inputs.firstName && (
												<Typography color="error" variant="caption">
													First name is required
												</Typography>
											)
										}
									/>
								</Grid>
								<Grid item xs={12} sm={6}>
									<TextField
										fullWidth
										label="Last name"
										type="text"
										variant="filled"
										name={"lastName"}
										onChange={handleInputChange}
										value={inputs.lastName}
										helperText={
											check &&
											!inputs.lastName && (
												<Typography color="error" variant="caption">
													Last name is required
												</Typography>
											)
										}
									/>
								</Grid>
								{currentUser.type === UserType.Business && (
									<Grid item xs={12}>
										<TextField
											fullWidth
											label="Business name"
											type="text"
											variant="filled"
											name={"businessName"}
											onChange={handleInputChange}
											value={inputs.businessName}
											helperText={
												check &&
												!inputs.businessName && (
													<Typography color="error" variant="caption">
														Business name is required
													</Typography>
												)
											}
										/>
									</Grid>
								)}

								<Grid item xs={12}>
									<TextField
										fullWidth
										label="Email"
										type="text"
										variant="filled"
										name={"email"}
										onChange={handleInputChange}
										value={inputs.email}
										helperText={
											check &&
											!inputs.email && (
												<Typography color="error" variant="caption">
													Email is required
												</Typography>
											)
										}
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										fullWidth
										select
										label="City"
										name="city"
										variant="filled"
										value={inputs.city}
										onChange={handleInputChange}
										helperText={
											check &&
											!inputs.city && (
												<Typography color="error" variant="caption">
													City is required
												</Typography>
											)
										}
									>
										{CityOptions.map((c, i) => (
											<MenuItem value={c} key={i}>
												{c}
											</MenuItem>
										))}
									</TextField>
								</Grid>
								<Grid item xs={12}>
									<ExpButton
										type="submit"
										fullWidth
										variant="contained"
										color="primary"
										onClick={onSubmit}
										disabled={uploadLoading || updateLoading || loading}
									>
										Update Profile
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

interface AvatarUploaderProps extends User {
	avatar?: File
	setAvatar: React.Dispatch<React.SetStateAction<File | undefined>>
}
export const AvatarUploader = (props: AvatarUploaderProps) => {
	const { avatar, setAvatar, ...user } = props
	const classes = useStyles()
	// input file
	const handleInputOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		event.preventDefault()
		const inputsFiles = event.currentTarget.files
		if (inputsFiles && inputsFiles.length > 0) {
			setAvatar(inputsFiles[0])
		}
	}

	const displayAvatar = () => {
		// parse url
		let imgURL = user.avatarURL
		if (avatar) imgURL = URL.createObjectURL(avatar)

		// display
		if (!imgURL) {
			switch (user.type) {
				case UserType.Business:
					return <AddBox className={classes.avatarSize} style={{ color: SecondaryBlue }} />
				case UserType.Creative:
					return <AddCircle className={classes.avatarSize} style={{ color: SecondaryPink }} />
			}
		}
		return <UserAvatar size={150} {...user} avatarURL={imgURL} />
	}

	return (
		<>
			<label htmlFor="avatarUploader">{displayAvatar()}</label>
			<input id="avatarUploader" type="file" accept={"image/*"} className={classes.hidden} onChange={handleInputOnChange} />
		</>
	)
}
