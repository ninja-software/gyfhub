import * as React from "react"
import Moment from "moment"
import { AuthContainer } from "../../controllers/auth"
import { Message } from "../../types/types"
import { Button, makeStyles, Popover, Typography } from "@material-ui/core"
import { UserAvatar } from "../common/avatar"

const useStyle = makeStyles((theme) => ({
	container: {
		height: "70%",
		overflowY: "auto",
		paddingTop: "20px",
		paddingLeft: "20px",
	},
	selfMessage: {
		display: "flex",
		alignItems: "flex-end",
		flexDirection: "row-reverse",
		marginTop: "20px",
		marginBottom: "20px",
		height: "fit-content",
	},
	otherMessage: {
		display: "flex",
		alignItems: "flex-end",
		height: "fit-content",
		marginTop: "20px",
		marginBottom: "20px",
	},
	messageImage: {
		width: "30%",
		cursor: "pointer",
	},
	avatarContainer: {
		margin: "20px",
	},
	timestamp: {
		display: "flex",
		height: "100%",
		alignItems: "flex-end",
		marginLeft: "10px",
		marginRight: "10px",
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
	const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>()
	const [open, setOpen] = React.useState<boolean>(false)

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		if (isSelf) return
		setAnchorEl(event.currentTarget)
		setOpen(true)
	}
	const handleClose = () => {
		if (isSelf) return
		setAnchorEl(null)
		setOpen(false)
	}
	return (
		<div className={isSelf ? classes.selfMessage : classes.otherMessage}>
			{!isSelf && (
				<div className={classes.avatarContainer}>
					<UserAvatar size={70} {...message.sender} />
				</div>
			)}
			<div className={classes.messageImage}>
				<Button onClick={handleClick} aria-describedby={`gif-popover-${message.id}`}>
					<img width="100%" src={message.content} alt="" onLoad={onLoad} />
				</Button>
				{!isSelf && (
					<Popover
						id={`gif-popover-${message.id}`}
						open={open}
						anchorEl={anchorEl}
						onClose={handleClose}
						anchorOrigin={{
							vertical: "bottom",
							horizontal: "right",
						}}
						transformOrigin={{
							vertical: "top",
							horizontal: "left",
						}}
					>
						Pop over testing
					</Popover>
				)}
			</div>
			<div className={classes.timestamp}>
				<Typography variant="h4">{Moment(message.createdAt).format("HH:mm a")}</Typography>
			</div>
		</div>
	)
}
