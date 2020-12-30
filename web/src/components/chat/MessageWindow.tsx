import * as React from "react"
import { AuthContainer } from "../../controllers/auth"
import { Message } from "../../types/types"
import { makeStyles } from "@material-ui/core"
import { UserAvatar } from "../common/avatar"

const useStyle = makeStyles((theme) => ({
	messagesContainer: {
		height: "60%",
		overflowY: "auto",
		paddingTop: "20px",
		paddingLeft: "20px",
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
}))

interface MessageWindowProps {
	newMessages: Message[] | null
}

export const MessageWindow = (props: MessageWindowProps) => {
	const { newMessages } = props
	const { currentUser } = AuthContainer.useContainer()
	const [messageList, setMessageList] = React.useState<Message[]>([])

	// add new message into list
	React.useEffect(() => {
		if (!newMessages) return
		setMessageList((msgs) => msgs.concat(...newMessages))
	}, [newMessages])

	const classes = useStyle()

	if (!currentUser) return <></>

	return (
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
	)
}
