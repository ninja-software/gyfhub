import { makeStyles, TextField, Typography } from "@material-ui/core"
import * as React from "react"
import { ExpButton } from "../../components/common/button"
import { UserAvatar } from "../../components/common/avatar"
import { AuthContainer } from "../../controllers/auth"
import { GifObject, Message } from "../../types/types"
import { useHistory } from "react-router-dom"
import useWebSocket, { ReadyState } from "react-use-websocket"

const useStyle = makeStyles((theme) => ({
	container: {
		height: "95%",
		width: "100%",
	},
	messagesContainer: {
		height: "60%",
		overflowY: "auto",
		paddingTop: "20px",
		paddingLeft: "20px",
	},
	keyboardContainer: {
		marginTop: "15px",
		height: "40%",
		borderTop: "3px solid grey",
		width: "100%",
	},
	gifsGrid: {
		display: "flex",
		flexWrap: "wrap",
		justifyContent: "center",
		height: "70%",
		overflowY: "auto",
		marginTop: "20px",
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
		width: "30%",
	},
	avatarContainer: {
		margin: "20px",
	},
	searchBar: {
		display: "flex",
		flexWrap: "wrap",
		justifyContent: "center",
		marginTop: "20px",
	},
}))

export const ChatHub = () => {
	const apiKey = "iKnyHPF6aER2DrPWjQGdgHS9O1oksVFv&q" // todo move this
	const history = useHistory()
	const searchArg = new URLSearchParams(history.location.search)
	const { currentUser } = AuthContainer.useContainer()

	const id = searchArg.get("id")

	//Public API that will echo messages sent to it back to the client
	const [socketUrl] = React.useState(`ws://localhost:8080/api/hubs/${id}`)
	const [messageList, setMessageList] = React.useState<Message[]>([])
	const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(socketUrl)
	React.useEffect(() => {
		if (!lastMessage?.data) return

		setMessageList((msg) => msg.concat(JSON.parse(lastMessage.data)))
	}, [lastMessage])

	// TODO: delete this
	const connectionStatus = {
		[ReadyState.CONNECTING]: "Connecting",
		[ReadyState.OPEN]: "Open",
		[ReadyState.CLOSING]: "Closing",
		[ReadyState.CLOSED]: "Closed",
		[ReadyState.UNINSTANTIATED]: "Uninstantiated",
	}[readyState]

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
		sendMessage(msg)
		setMessages([...messages, msg])
	}

	const classes = useStyle()

	if (!currentUser) {
		return <div>an error occurred</div>
	}
	return (
		<div className={classes.container}>
			<div className={classes.messagesContainer}>
				{messageList.map((m, i) => (
					<div key={i} className={classes.messageContainer}>
						<div className={classes.avatarContainer}>
							<UserAvatar size={70} {...currentUser} />
						</div>
						<img className={classes.messageImage} src={m.content} alt="" />
					</div>
				))}
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
					{searchResults.map((s, idx) => {
						return (
							<div key={s.images.downsized.url + idx} className={classes.gifImageContainer} onClick={() => addMessage(s.images.downsized.url)}>
								<img className={classes.gifImage} src={s.images.downsized.url} alt="" />
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}
