import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import Link from "@material-ui/core/Link"
import Grid from "@material-ui/core/Grid"
import { AuthContainer } from "../../controllers/auth"
import { useForm } from "react-hook-form"
import { Redirect } from "react-router-dom"
import { ExpInput } from "../../components/common/input"
import { Loading } from "../../components/common/loading"
import { ExpButton } from "../../components/common/button"
import { AuthBackground } from "../../components/common/background"
import { Alert } from "@material-ui/lab"

const useStyles = makeStyles((theme) => ({
	form: {
		width: "100%",
		marginTop: theme.spacing(1),
	},
	button: {
		paddingTop: "15px",
		paddingBottom: "15px",
	},
}))

export const LoginPage = () => {
	const classes = useStyles()
	const { handleSubmit, control, errors } = useForm()
	const { currentUser, useLogin } = AuthContainer.useContainer()
	const { login, loading, errors: loginErrors } = useLogin()
	const onSubmit = (formData: any) => {
		login(formData.email, formData.password)
	}

	if (loading) return <Loading />

	if (currentUser) {
		return <Redirect to="/" />
	}
	return (
		<AuthBackground label="Sign In">
			{loginErrors && <Alert severity="error">Failed to login, please check your email and password</Alert>}
			<form className={classes.form} noValidate onSubmit={handleSubmit(onSubmit)}>
				<ExpInput label="Email" name="email" control={control} errors={errors} rules={{ required: "Email is required" }} variant="outlined" margin="normal" />
				<ExpInput
					label="Password"
					name="password"
					control={control}
					errors={errors}
					rules={{ required: "Password is required" }}
					variant="outlined"
					type="password"
					margin="normal"
				/>
				<Grid container>
					<Grid item xs>
						<Link href="/forget_password" variant="h4">
							Forgot password?
						</Link>
					</Grid>
				</Grid>
				<div className={classes.button}>
					<ExpButton type="submit" fullWidth variant="contained" color="primary">
						Sign In
					</ExpButton>
				</div>
				<Grid container>
					<Grid item>
						<Link href="/sign_up" variant="h4">
							{"Don't have an account? Sign Up"}
						</Link>
					</Grid>
				</Grid>
			</form>
			{loading && <Loading />}
		</AuthBackground>
	)
}
