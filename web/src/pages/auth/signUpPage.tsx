import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import Link from "@material-ui/core/Link"
import Grid from "@material-ui/core/Grid"
import { useForm } from "react-hook-form"
import { ExpInput } from "../../components/common/input"
import { ExpButton } from "../../components/common/button"
import { AuthBackground } from "../../components/common/background"
import { Redirect, useHistory } from "react-router-dom"
import creativeLogo from "../../assets/imgs/creativeLogo.svg"
import businessLogo from "../../assets/imgs/businessLogo.svg"
import { AuthContainer } from "../../controllers/auth"
import { Alert } from "@material-ui/lab"
import { Loading } from "../../components/common/loading"

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
	creativeLogo: {
		width: "323px",
		height: "295px",
		paddingTop: "20px",
	},
	businessLogo: {
		width: "377px",
		height: "350px",
	},
}))

export const SignUpPage = () => {
	const classes = useStyles()
	const [openForm, setOpenForm] = React.useState<boolean>(false)
	const [isBusiness, setIsBusiness] = React.useState<boolean>(false)
	return (
		<AuthBackground label="Sign Up">
			{!openForm && (
				<div className={classes.question}>
					<p>Which are you?</p>
				</div>
			)}
			{!openForm && <SelectAccountType setOpenForm={setOpenForm} setIsBusiness={setIsBusiness} />}
			{openForm && <SignUpForm isBusiness={isBusiness} />}
		</AuthBackground>
	)
}

interface AccountTypeProps {
	setOpenForm: React.Dispatch<React.SetStateAction<boolean>>
	setIsBusiness: React.Dispatch<React.SetStateAction<boolean>>
}

export const SelectAccountType = (props: AccountTypeProps) => {
	const classes = useStyles()
	const { setOpenForm, setIsBusiness } = props
	return (
		<div className={classes.logoDiv}>
			<div
				className={classes.pointer}
				onClick={() => {
					setOpenForm(true)
					setIsBusiness(false)
				}}
			>
				<div className={classes.logoLabel}>
					<p style={{ margin: "0px", color: "#D82387" }}>I'm a Creative</p>
				</div>
				<img className={classes.creativeLogo} src={creativeLogo} alt="experlio" />
			</div>
			<div
				className={classes.pointer}
				onClick={() => {
					setOpenForm(true)
					setIsBusiness(true)
				}}
			>
				<div className={classes.logoLabel}>
					<p style={{ margin: "0px", color: "#785BA3" }}>I'm a Business</p>
				</div>
				<img className={classes.businessLogo} src={businessLogo} alt="experlio" />
			</div>
		</div>
	)
}

interface FormProps {
	isBusiness: boolean
}

export const SignUpForm = (props: FormProps) => {
	const classes = useStyles()
	const { isBusiness } = props
	const { control, handleSubmit, errors } = useForm()
	const history = useHistory()
	const { currentUser, useRegister } = AuthContainer.useContainer()
	const { register, loading, errors: registerErrors } = useRegister()

	const onSubmit = (formData: any) => {
		if (!isBusiness) {
			register(formData.firstName, formData.email, formData.password)
		} else register(formData.firstName, formData.email, formData.password, formData.businessName)
	}
	if (currentUser) {
		return <Redirect to="/profile/update" />
	}

	return (
		<div>
			{registerErrors && <Alert severity="error">Failed to register, please check your email and password</Alert>}
			<form className={classes.form} noValidate onSubmit={handleSubmit(onSubmit)}>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<ExpInput label="First Name" name="firstName" control={control} errors={errors} rules={{ required: "First Name is required" }} variant="outlined" />
					</Grid>
					{isBusiness && (
						<Grid item xs={12}>
							<ExpInput
								label="Business Name"
								name="businessName"
								control={control}
								errors={errors}
								rules={{ required: "Business name is required" }}
								variant="outlined"
							/>
						</Grid>
					)}
					<Grid item xs={12}>
						<ExpInput label="Email" name="email" control={control} errors={errors} rules={{ required: "Email is required" }} variant="outlined" />
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
						/>
					</Grid>
				</Grid>
				<ExpButton type="submit" fullWidth variant="contained" color="primary">
					Sign Up
				</ExpButton>
				<Grid container justify="flex-end">
					<Grid item>
						<Link
							variant="body2"
							onClick={() => {
								history.push("/")
							}}
						>
							Already have an account? Sign in
						</Link>
					</Grid>
				</Grid>
			</form>
			{loading && <Loading />}
		</div>
	)
}
