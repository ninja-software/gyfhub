import { makeStyles, TextField, Typography } from "@material-ui/core"
import * as React from "react"
import { ExpButton } from "../../components/common/button"
import { UserAvatar } from "../../components/common/avatar"
import { AuthContainer } from "../../controllers/auth"
import { GifObject } from "../../types/types"

interface Props {}

const useStyle = makeStyles((theme) => ({
	container: {
		height: "90%",
	},
	messagesContainer: {
		height: "50%",
		border: "1px solid black",
		overflowY: "auto",
		paddingTop: "20px",
		paddingLeft: "20px",
	},
	keyboardContainer: {
		marginTop: "15px",
		height: "30%",
		border: "1px solid black",
		overflowY: "auto",
	},
	gifsGrid: {
		display: "flex",
		flexWrap: "wrap",
		justifyContent: "center",
	},
	gifImageContainer: {
		margin: "10px 20px",
	},

	gifImage: {
		width: "170px",
	},

	messageContainer: {
		display: "flex",
		alignItems: "flex-start",
		marginTop: "20px",
		marginBottom: "20px",
	},

	messageImage: {
		width: "60%",
	},

	avatarContainer: {
		margin: "20px",
	},

	searchBar: {
		display: "flex",
		flexWrap: "wrap",
		justifyContent: "center",
	},
}))

export const Chat = (props: Props) => {
	const {} = props

	const apiKey = "iKnyHPF6aER2DrPWjQGdgHS9O1oksVFv&q" // todo move this

	const { currentUser } = AuthContainer.useContainer()
	const [searchResults, setSearchResults] = React.useState<GifObject[]>([])
	const [searchQuery, setSearchQuery] = React.useState<string>("")

	const [messages, setMessages] = React.useState<string[]>([])

	const getSearchResults = async () => {
		setSearchResults([])
		return await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${apiKey}=${searchQuery}&limit=60&offset=0&rating=R&lang=en`)
			.then((res) => {
				return res.json()
			})
			.then((data) => {
				setSearchResults(data.data)
			})
	}

	// todo change later
	const addMessage = (msg: string) => {
		setMessages([...messages, msg])
	}

	const classes = useStyle()

	if (!currentUser) {
		return <div>an error occurred</div>
	}
	return (
		<div className={classes.container}>
			<div className={classes.messagesContainer}>
				{messages.map((m) => {
					return (
						<div className={classes.messageContainer}>
							<div className={classes.avatarContainer}>
								<UserAvatar size={70} {...currentUser} />
							</div>
							<img className={classes.messageImage} src={m} alt="" />
						</div>
					)
				})}
			</div>

			<div className={classes.keyboardContainer}>
				<div className={classes.searchBar}>
					<TextField
						label={<Typography variant="subtitle1">Search Gifs</Typography>}
						variant="filled"
						multiline
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
					<ExpButton
						onClick={(e) => {
							e.preventDefault()
							getSearchResults()
						}}
					>
						Search
					</ExpButton>
				</div>

				<div className={classes.gifsGrid}>
					{searchResults.map((s) => {
						return (
							<div className={classes.gifImageContainer} onClick={() => addMessage(s.images.downsized.url)}>
								<img className={classes.gifImage} src={s.images.downsized.url} alt="" />
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}
