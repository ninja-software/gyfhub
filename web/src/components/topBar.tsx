import { Box, Button, ButtonGroup, Container, Popover } from "@material-ui/core"
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles"
import Typography from "@material-ui/core/Typography"
import React, { useState } from "react"
import { useHistory } from "react-router-dom"
import { AuthContainer } from "../controllers/auth"
import { titleCapitalization } from "../helpers/helper"
import { UserAvatar } from "./common/avatar"

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			marginTop: "5px",
			display: "flex",
			height: "120px",
		},
		pageTitle: {
			width: "100%",
			color: "black",
			fontWeight: "bold",
			fontSize: "40px",
			paddingTop: "30px",
			paddingBottom: "30px",
		},
		accountContainer: {
			width: "100%",
			height: "100%",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
		},
		logoButton: {
			"&:hover": {
				background: "transparent",
			},
		},
		menuButton: {
			marginTop: "20px",
			marginBottom: "20px",
		},
	}),
)

export const TopBar = () => {
	const classes = useStyles()
	const history = useHistory()
	const [title, setTitle] = React.useState<string>("")
	const [showButton, setShowButton] = useState(true)
	React.useEffect(() => {
		const pathName = history.location.pathname
		const elements = pathName.substring(pathName.indexOf("/") + 1).split("/")

		setShowButton(true)

		// if only contain one element
		if (elements.length === 1) {
			if (elements[0] === "") setTitle("My Dashboard")
			return
		}

		// if contain more than one element
		switch (elements[0]) {
			case "profile":
				setShowButton(false)
				break
		}
		setTitle(`${titleCapitalization(elements[1])} ${titleCapitalization(elements[0])}`)
	}, [history.location.pathname])

	return (
		<Container maxWidth={false} className={classes.root}>
			<Box width="100%" alignItems="center" display="flex" justifyContent="center">
				<Button className={classes.logoButton} onClick={() => history.push("/")}>
					<Typography variant="h2" align="center">
						GYFHUB
					</Typography>
				</Button>
			</Box>
			<Typography className={classes.pageTitle} variant="h4" align="center">
				{title}
			</Typography>
			<Account showButton={showButton} />
		</Container>
	)
}

const Account = (props: { showButton: boolean }) => {
	const classes = useStyles()
	const { currentUser } = AuthContainer.useContainer()
	const { useLogout } = AuthContainer.useContainer()
	const history = useHistory()
	const { logout } = useLogout()
	const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>()
	const [open, setOpen] = React.useState<boolean>(false)

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget)
		setOpen(true)
	}

	const handleClose = () => {
		setAnchorEl(null)
		setOpen(false)
	}

	if (!currentUser) return null
	return (
		<div className={classes.accountContainer}>
			<Box marginLeft="20px">
				<Button onClick={handleClick} aria-describedby={"user-popover"}>
					<UserAvatar size={62} {...currentUser} />
				</Button>
				<Popover
					id="user-popover"
					open={open}
					anchorEl={anchorEl}
					onClose={handleClose}
					anchorOrigin={{
						vertical: "bottom",
						horizontal: "center",
					}}
					transformOrigin={{
						vertical: "top",
						horizontal: "right",
					}}
				>
					<ButtonGroup orientation="vertical" aria-label="vertical outlined primary button group">
						<Button
							onClick={() => {
								history.push("/")
								setOpen(false)
							}}
						>
							<Typography className={classes.menuButton} variant="h2">
								Dashboard
							</Typography>
						</Button>
						<Button
							onClick={() => {
								logout()
								setOpen(false)
							}}
						>
							<Typography className={classes.menuButton} variant="h2">
								Logout
							</Typography>
						</Button>
					</ButtonGroup>
				</Popover>
			</Box>
		</div>
	)
}
