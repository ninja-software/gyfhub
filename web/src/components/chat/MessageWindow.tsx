import * as React from "react"
import { AuthContainer } from "../../controllers/auth"
import { Message } from "../../types/types"
import { makeStyles } from "@material-ui/core"
import { UserAvatar } from "../common/avatar"

const useStyle = makeStyles((theme) => ({
	container: {
		height: "60%",
		overflowY: "auto",
		paddingTop: "20px",
		paddingLeft: "20px",
	},
	selfMessage: {
		display: "flex",
		alignItems: "flex-start",
		flexDirection: "row-reverse",
		marginTop: "20px",
		marginBottom: "20px",
	},
	otherMessage: {
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
}))

interface MessageWindowProps {
	newMessages: Message[] | null
}

export const MessageWindow = (props: MessageWindowProps) => {
	const { newMessages } = props
	const { currentUser } = AuthContainer.useContainer()
	const [messageList, setMessageList] = React.useState<Message[]>([])
	const scrollDiv = React.useRef(document.createElement("div"))
	// add new message into list
	React.useEffect(() => {
		if (!newMessages) return
		setMessageList((msgs) => msgs.concat(...newMessages))
	}, [newMessages])

	// scroll to the bottom if the last gif is completed
	const handleOnloadComplete = () => (scrollDiv.current.scrollTop = scrollDiv.current.scrollHeight)

	const classes = useStyle()

	if (!currentUser) return <></>

	return (
		<div className={classes.container} ref={scrollDiv}>
			{messageList.map((m, i) => (
				<MessageContainer message={m} key={i} isSelf={currentUser.id === m.sender.id} onLoad={handleOnloadComplete} />
			))}
		</div>
	)
}

interface MessageContainerProps {
	message: Message
	isSelf: boolean
	onLoad: () => void
}
const MessageContainer = (props: MessageContainerProps) => {
	const { message, isSelf, onLoad } = props
	const classes = useStyle()
	return (
		<div className={isSelf ? classes.selfMessage : classes.otherMessage}>
			{!isSelf && (
				<div className={classes.avatarContainer}>
					<UserAvatar size={70} {...message.sender} />
				</div>
			)}
			<img className={classes.messageImage} src={message.content} alt="" onLoad={onLoad} />
		</div>
	)
}
