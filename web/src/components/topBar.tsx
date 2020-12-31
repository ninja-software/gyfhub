import { Box, Button, ButtonGroup, Container, Popover } from "@material-ui/core"
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles"
import Typography from "@material-ui/core/Typography"
import React, { useState } from "react"
import { useParameterizedQuery } from "react-fetching-library"
import { useHistory } from "react-router-dom"
import { AuthContainer } from "../controllers/auth"
import { fetching } from "../fetching"
import { titleCapitalization } from "../helpers/helper"
import { AppPalette } from "../theme/colour"
import { Hub } from "../types/types"
import { UserAvatar } from "./common/avatar"
import { trunc } from "../pages/hubs/hubsList"

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			display: "flex",
			height: "140px",
			background: AppPalette.SecondaryPurple,
			marginBottom: "10px",
		},
		pageTitle: {
			width: "100%",
			fontWeight: "bold",
			fontSize: "40px",
			paddingTop: "45px",
			paddingBottom: "30px",
			color: "white",
		},
		accountContainer: {
			width: "100%",
			height: "100%",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
		},
		logoButton: {
			color: "white",
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

	const { query: getHub } = useParameterizedQuery<Hub>(fetching.queries.getHub)

	const displayHubName = async (id: string | null) => {
		if (!id) return
		const resp = await getHub(id)
		if (resp.error || !resp.payload) return
		setTitle(resp.payload.name)
	}

	React.useEffect(() => {
		const pathName = history.location.pathname
		const elements = pathName.substring(pathName.indexOf("/") + 1).split("/")

		setShowButton(true)

		// if only contain one element
		if (elements.length === 1) {
			if (elements[0] === "") setTitle("Dashboard")
			return
		}

		// if contain more than one element
		switch (elements[0]) {
			case "profile":
				setShowButton(false)
				break
			case "hubs":
				const searchArg = new URLSearchParams(history.location.search)
				displayHubName(searchArg.get("id"))
				break
		}
		setTitle(`${titleCapitalization(elements[1])} ${titleCapitalization(elements[0])}`)
	}, [history.location.pathname])

	return (
		<Container maxWidth={false} className={classes.root}>
			<Box width="100%" alignItems="center" display="flex" justifyContent="center">
				<Button className={classes.logoButton} onClick={() => history.push("/")}>
					<Typography variant="h1" align="center">
						GYFHUB
					</Typography>
				</Button>
			</Box>
			<Typography className={classes.pageTitle} variant="h1" align="center">
				{trunc(title, 10)}
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
