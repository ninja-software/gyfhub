import { CircularProgress, Link, makeStyles } from "@material-ui/core"
import * as React from "react"
import { useMutation } from "react-fetching-library"
import { useForm } from "react-hook-form"
import { AuthBackground } from "../../components/common/background"
import { ExpButton } from "../../components/common/button"
import { ExpInput } from "../../components/common/input"
import { fetching } from "../../fetching"
import { Alert } from "@material-ui/lab"

const useStyles = makeStyles((theme) => ({
	form: {
		width: "100%",
		marginTop: theme.spacing(1),
	},
}))

export const ForgetPassword = () => {
	const classes = useStyles()
	const { control, errors, handleSubmit } = useForm()
	const { error, loading, mutate } = useMutation<boolean>(fetching.mutations.forgetPassword)
	const onSubmit = (formData: any) => {
		mutate(formData)
	}
	return (
		<AuthBackground label="Forget Password">
			{error && <Alert severity="error">Failed to send email</Alert>}
			{loading && <CircularProgress />}
			<form className={classes.form} onSubmit={handleSubmit(onSubmit)}>
				<ExpInput label="Email" name="email" control={control} errors={errors} rules={{ required: "Email is required" }} variant="outlined" margin="normal" />
				<ExpButton type="submit" fullWidth variant="contained" color="primary">
					Submit
				</ExpButton>
				<Link href="/" variant="body2">
					Back to sign in
				</Link>
			</form>
		</AuthBackground>
	)
}
