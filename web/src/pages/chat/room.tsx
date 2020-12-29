import * as React from "react"
import { RouteComponentProps } from "react-router-dom"
import useWebSocket, { ReadyState } from "react-use-websocket"

export const ChatRoom = (props: RouteComponentProps<{ id: string }>) => {
	const id = props.match.params.id
	//Public API that will echo messages sent to it back to the client
	const [socketUrl] = React.useState(`ws://localhost:8080/api/hubs/${id}`)
	const [messageList, setMessageList] = React.useState<string[]>([])
	const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(socketUrl)
	React.useEffect(() => {
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
