import * as React from "react"
import Moment from "moment"
import { AuthContainer } from "../../controllers/auth"
import { Message, MessageReaction } from "../../types/types"
import { Box, Button, makeStyles, Popover, Typography } from "@material-ui/core"
import { UserAvatar } from "../common/avatar"
import { useMutation } from "react-fetching-library"
import { fetching } from "../../fetching"
import { ThumbUp, ThumbDown, Favorite } from "@material-ui/icons"

const useStyle = makeStyles((theme) => ({
	container: {
		height: "70%",
		overflowY: "auto",
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
		width: "50%",
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
		marginBottom: "16px",
	},
	reactionContainer: {
		display: "flex",
		flexDirection: "column",
	},
	reactionButtonBar: {
		display: "flex",
		width: "200px",
		height: "70px",
	},
}))

interface MessageWindowProps {
	newMessages: Message[] | null
	hubID: string
	newReaction: MessageReaction | null
}

export const MessageWindow = (props: MessageWindowProps) => {
	const { newMessages, hubID, newReaction } = props
	const { currentUser } = AuthContainer.useContainer()
	const [messageList, setMessageList] = React.useState<Message[]>([])
	const scrollDiv = React.useRef(document.createElement("div"))
	// add new message into list
	React.useEffect(() => {
		if (!newMessages) return
		setMessageList((msgs) => msgs.concat(...newMessages))
	}, [newMessages])

	React.useEffect(() => {
		if (!newReaction) return
		setMessageList((msg) => {
			return msg.map((m) => {
				if (m.id !== newReaction.messageID) return m

				let newM = { ...m }
				newM.reactions = [...newM.reactions, newReaction]
				return newM
			})
		})
	}, [newReaction])

	// scroll to the bottom if the last gif is completed
	const handleOnloadComplete = () => (scrollDiv.current.scrollTop = scrollDiv.current.scrollHeight)

	const classes = useStyle()

	if (!currentUser) return <></>

	return (
		<div className={classes.container} ref={scrollDiv}>
			{messageList.map((m, i) => (
				<MessageContainer hubID={hubID} message={m} key={i} isSelf={currentUser.id === m.sender.id} onLoad={handleOnloadComplete} />
			))}
		</div>
	)
}

interface MessageContainerProps {
	message: Message
	isSelf: boolean
	onLoad: () => void
	hubID: string
}
const MessageContainer = (props: MessageContainerProps) => {
	const { message, isSelf, onLoad, hubID } = props
	const classes = useStyle()
	const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>()
	const [open, setOpen] = React.useState<boolean>(false)
	const { mutate } = useMutation(fetching.mutations.sendReaction)

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

	const onLike = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault()
		mutate({ messageID: message.id, hubID, reaction: "Like" })
		setAnchorEl(null)
		setOpen(false)
	}
	const onDislike = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault()
		mutate({ messageID: message.id, hubID, reaction: "Hate" })
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
					<div className={classes.reactionContainer}>
						<img width="100%" src={message.content} alt="" onLoad={onLoad} />
						<Box display="flex">
							{message.reactions.filter((r) => r.reaction === "Like").length > 0 && (
								<>
									<Box marginRight="3px" marginLeft="8px">
										<ThumbUp fontSize="large" />
									</Box>
									<Typography variant="h2">{`${message.reactions.filter((r) => r.reaction === "Like").length}`}</Typography>
								</>
							)}
							{message.reactions.filter((r) => r.reaction === "Hate").length > 0 && (
								<>
									<Box marginRight="3px" marginLeft="8px">
										<ThumbDown fontSize="large" />
									</Box>
									<Typography variant="h2">{`${message.reactions.filter((r) => r.reaction === "Hate").length}`}</Typography>
								</>
							)}
						</Box>
					</div>
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
						<Box className={classes.reactionButtonBar}>
							<Box width="100%" display="flex" justifyContent="center" alignItems="center">
								<Button onClick={onLike}>
									<ThumbUp fontSize="large" />
								</Button>
							</Box>
							<Box width="100%" display="flex" justifyContent="center" alignItems="center">
								<Button onClick={onDislike}>
									<ThumbDown fontSize="large" />
								</Button>
							</Box>
						</Box>
					</Popover>
				)}
			</div>
			<div className={classes.timestamp}>
				<Typography variant="h4">{Moment(message.createdAt).format("HH:mm a")}</Typography>
			</div>
		</div>
	)
}
