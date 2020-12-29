import * as React from "react"
import { Switch } from "react-router-dom"
import { UpdatePage } from "./updatePage"
import { TopBar } from "../components/topBar"
import { AuthContainer } from "../controllers/auth"
import { MainBackground } from "../components/common/background"
import { Dashboard } from "./dashboard"
import { Button, makeStyles } from "@material-ui/core"
import { OpportunitiesRoot } from "./opportunities/root"
import { PrivateRoute, PublicRoute } from "../components/security"
import FourZeroFour from "./404"
import { Chat } from "./chat/chat"

import { UserType } from "../types/enum"
import useWebSocket, { ReadyState } from "react-use-websocket"

const useStyle = makeStyles((theme) => ({
	outer: {
		height: "85%",
		width: "100%",
		display: "flex",
		maxHeight: "85%",
		overflowY: "auto",
		overflowX: "hidden",
		justifyContent: "center",
		paddingTop: "15px",
	},
	inner: {
		height: "100%",
		width: "80%",
	},
}))

// Display page
const PortalInner = () => {
	const classes = useStyle()
	return (
		<div className={classes.outer}>
			<div className={classes.inner}>
				<Switch>
					<PrivateRoute path="/profile/update" component={UpdatePage} />
					<PrivateRoute path="/opportunity" component={OpportunitiesRoot} />
					<PrivateRoute exact path="/test" component={TestComponent} />
					<PrivateRoute path="/chat" component={Chat} />

					<PrivateRoute exact path="/" component={Dashboard} />

					<PublicRoute path={"/"} component={FourZeroFour} />
				</Switch>
			</div>
		</div>
	)
}

// Portal component check user login
export const Portal = () => {
	const { currentUser } = AuthContainer.useContainer()
	return (
		<MainBackground isBusiness={currentUser?.type === UserType.Business}>
			<TopBar />
			<PortalInner />
		</MainBackground>
	)
}

// TODO: delete it
const TestComponent = () => {
	//Public API that will echo messages sent to it back to the client
	const [socketUrl] = React.useState("ws://localhost:8080/ws")
	const [messageList, setMessageList] = React.useState<string[]>([])
	const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl)

	React.useEffect(() => {
		console.log(lastMessage?.data)
		if (!lastMessage?.data) return
		setMessageList((msg) => msg.concat(lastMessage.data))
	}, [lastMessage])

	const handleClickSendMessage = React.useCallback(() => sendMessage("Hello"), [])

	const connectionStatus = {
		[ReadyState.CONNECTING]: "Connecting",
		[ReadyState.OPEN]: "Open",
		[ReadyState.CLOSING]: "Closing",
		[ReadyState.CLOSED]: "Closed",
		[ReadyState.UNINSTANTIATED]: "Uninstantiated",
	}[readyState]
	return (
		<div>
			<button onClick={handleClickSendMessage} disabled={readyState !== ReadyState.OPEN}>
				Click Me to send 'Hello'
			</button>
			<span>The WebSocket is currently {connectionStatus}</span>
			{lastMessage ? <span>Last message: {lastMessage.data}</span> : null}
			<ul>{messageList.length > 0 && messageList.map((message, idx) => <span key={idx}>{message}</span>)}</ul>
		</div>
	)
}
