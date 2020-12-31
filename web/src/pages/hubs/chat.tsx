import { makeStyles, TextField, Typography } from "@material-ui/core"
import * as _ from "lodash"
import * as React from "react"
import { AuthContainer } from "../../controllers/auth"
import { GifObject, Message } from "../../types/types"
import { useHistory } from "react-router-dom"
import useWebSocket from "react-use-websocket"
import { MessageWindow } from "../../components/chat/MessageWindow"
import { AppPalette } from "../../theme/colour"
import { useParameterizedQuery } from "react-fetching-library"
import { fetching } from "../../fetching"

const useStyle = makeStyles((theme) => ({
	container: {
		height: "95%",
		width: "100%",
		display: "flex",
		flexDirection: "column",
	},
	keyboardContainer: {
		marginTop: "15px",
		height: "40%",
		borderTop: "6px solid " + AppPalette.SecondaryPurple,
		width: "100%",
		border: "1px solid #000",
		position: "absolute",
		left: 0,
		bottom: 0,
		background: AppPalette.LightGray,
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
		width: "250px",
	},
	searchBar: {
		display: "flex",
		flexWrap: "wrap",
		justifyContent: "center",
		marginTop: "20px",
	},
}))

export const ChatHub = () => {
	const history = useHistory()
	const searchArg = new URLSearchParams(history.location.search)
	const { currentUser } = AuthContainer.useContainer()

	const id = searchArg.get("id")

	//Public API that will echo messages sent to it back to the client
	const [chatSocketURl] = React.useState(`ws://localhost:8080/api/hubs/ws/${id}`)
	const [reactionSocketURl] = React.useState(`ws://localhost:8080/api/hubs/ws/${id}/reaction`)
	const { lastMessage: lastReaction } = useWebSocket(reactionSocketURl)
	const { sendMessage, lastMessage } = useWebSocket(chatSocketURl)
	const [upcomingMessage, setUpcomingMessage] = React.useState<Message[] | null>([])
	React.useEffect(() => {
		if (!lastMessage?.data) return
		setUpcomingMessage(JSON.parse(lastMessage.data))
	}, [lastMessage])

	const [searchResults, setSearchResults] = React.useState<GifObject[]>([])
	const [searchKey, setSearchKey] = React.useState<string>("")
	const [displayKey, setDisplayKey] = React.useState<string>("")

	const { payload: gifData, error: gifError, loading: gifLoading, query: queryGif } = useParameterizedQuery<GifObject[]>(fetching.queries.gifMany)
	React.useEffect(() => {
		if (searchKey === "" || gifLoading) return
		queryGif({ search: searchKey })
	}, [searchKey])

	React.useEffect(() => {
		if (gifLoading || !gifData) return
		setSearchResults(gifData)
	}, [gifData])

	const searchOnChange = (v: string) => {
		if (gifLoading) return
		setDisplayKey(v)
		delayedQuery(v)
	}

	const delayedQuery = React.useCallback(
		_.debounce((q: string) => {
			setSearchKey(q)
		}, 500),
		[],
	)

	const classes = useStyle()

	if (!currentUser) {
		return <div>an error occurred</div>
	}
	return (
		<div className={classes.container}>
			<MessageWindow newMessages={upcomingMessage} />

			<div className={classes.keyboardContainer}>
				<div className={classes.searchBar}>
					<TextField
						variant="filled"
						value={displayKey}
						style={{ width: "90%" }}
						InputProps={{ style: { fontSize: 40, padding: 10 } }}
						onChange={(e) => searchOnChange(e.target.value)}
					/>
				</div>

				<div className={classes.gifsGrid}>
					{searchResults.map((s, idx) => {
						return (
							<div key={s.images.downsized.url + idx} className={classes.gifImageContainer} onClick={() => sendMessage(s.images.downsized.url)}>
								<img className={classes.gifImage} src={s.images.downsized.url} alt="" />
							</div>
						)
					})}

					{searchKey == "" && (
						<Typography variant="h1" color={"textSecondary"}>
							Type Something!
						</Typography>
					)}

					{searchKey != "" && searchResults.length <= 0 && (
						<Typography variant="h1" color={"textSecondary"}>
							no results for "{searchKey}"
						</Typography>
					)}
				</div>
			</div>
		</div>
	)
}
