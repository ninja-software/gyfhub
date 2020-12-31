import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import Link from "@material-ui/core/Link"
import Grid from "@material-ui/core/Grid"
import { useForm } from "react-hook-form"
import { ExpInput } from "../../components/common/input"
import { ExpButton } from "../../components/common/button"
import { AuthBackground } from "../../components/common/background"
import { Redirect, useHistory } from "react-router-dom"
import { AuthContainer } from "../../controllers/auth"
import { Alert } from "@material-ui/lab"
import { Loading } from "../../components/common/loading"
import { PageAnimations } from "../../components/common/pageAnimations"

const useStyles = makeStyles((theme) => ({
	form: {
		width: "100%",
		marginTop: theme.spacing(1),
	},
	logoDiv: {
		display: "flex",
		justifyContent: "center",
	},
	pointer: {
		cursor: "pointer",
	},
	question: {
		display: "flex",
		justifyContent: "center",
		fontSize: "30px",
		fontFamily: "Montserrat",
		fontWeight: 600,
	},
	logoLabel: {
		display: "flex",
		fontSize: "27px",
		fontFamily: "Montserrat",
		fontWeight: "bold",
		justifyContent: "center",
	},
	businessLogo: {
		width: "377px",
		height: "350px",
	},
	inputStyle: {
		marginBottom: "10px",
		marginTop: "10px",
	},
}))

export const SignUpPage = () => {
	return (
		<AuthBackground label="Sign Up">
			<SignUpForm />
		</AuthBackground>
	)
}

export const SignUpForm = () => {
	const classes = useStyles()
	const { control, handleSubmit, errors } = useForm()
	const history = useHistory()
	const { currentUser, useRegister } = AuthContainer.useContainer()
	const { register, loading, errors: registerErrors } = useRegister()

	const onSubmit = (formData: any) => {
		register(formData.firstName, formData.email, formData.password, formData.businessName)
	}
	if (currentUser) {
		return <Redirect to="/profile/update" />
	}

	return (
		<div>
			{registerErrors && <Alert severity="error">Failed to register, please check your email and password</Alert>}
			<PageAnimations variant={"slideFromLeft"} transition={"easeIn"} duration={0.8}>
				<form className={classes.form} noValidate onSubmit={handleSubmit(onSubmit)}>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<ExpInput
								className={classes.inputStyle}
								label="First Name"
								name="firstName"
								control={control}
								errors={errors}
								rules={{ required: "First Name is required" }}
								variant="outlined"
							/>
						</Grid>
						<Grid item xs={12}>
							<ExpInput
								className={classes.inputStyle}
								label="Email"
								name="email"
								control={control}
								errors={errors}
								rules={{ required: "Email is required" }}
								variant="outlined"
							/>
						</Grid>
						<Grid item xs={12}>
							<ExpInput
								label="Password"
								name="password"
								control={control}
								errors={errors}
								rules={{ required: "Password name is required" }}
								variant="outlined"
								type="password"
								className={classes.inputStyle}
							/>
						</Grid>
					</Grid>
					<ExpButton type="submit" fullWidth variant="contained" color="primary">
						Sign Up
					</ExpButton>
<<<<<<< HEAD
					<Grid container justify="flex-end" style={{ marginTop: "15px" }}>
						<Grid item>
							<Link href="/" variant="h4">
								{"Already have an account? Sign in"}
=======
					<Grid container justify="flex-end" style={{ marginTop: "30px" }}>
						<Grid item>
							<Link
								style={{ paddingTop: "20px" }}
								variant="h3"
								onClick={() => {
									history.push("/")
								}}
							>
								Already have an account? Sign in
>>>>>>> 810ae5c67da1b85060f2f0a9740e22f915a95f35
							</Link>
						</Grid>
					</Grid>
				</form>
			</PageAnimations>
			{loading && <Loading />}
		</div>
	)
}
