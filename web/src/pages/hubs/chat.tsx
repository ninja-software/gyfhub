import { makeStyles, TextField, Typography } from "@material-ui/core"
import * as _ from "lodash"
import * as React from "react"
import { ExpButton } from "../../components/common/button"
import { AuthContainer } from "../../controllers/auth"
import { GifObject, Message } from "../../types/types"
import { useHistory } from "react-router-dom"
import useWebSocket from "react-use-websocket"
import { MessageWindow } from "../../components/chat/MessageWindow"
import { useParameterizedQuery, useQuery } from "react-fetching-library"
import { fetching } from "../../fetching"

const useStyle = makeStyles((theme) => ({
	container: {
		height: "95%",
		width: "100%",
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
	const [socketUrl] = React.useState(`ws://localhost:8080/api/hubs/ws/${id}`)
	const { sendMessage, lastMessage } = useWebSocket(socketUrl)
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
		console.log(searchKey)
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
						label={<Typography variant="subtitle1">Search Gifs</Typography>}
						variant="filled"
						value={displayKey}
						fullWidth
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
				</div>
			</div>
		</div>
	)
}
