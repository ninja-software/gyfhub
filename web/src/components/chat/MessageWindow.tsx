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
		handleOnloadComplete()
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
	const { currentUser } = AuthContainer.useContainer()
	const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>()
	const [open, setOpen] = React.useState<boolean>(false)
	const { mutate } = useMutation(fetching.mutations.sendReaction)
	const [canReact, setCanReact] = React.useState<boolean>(!isSelf)

	const [likerEl, setLikerEl] = React.useState<HTMLButtonElement | null>()
	const [openLiker, setOpenLiker] = React.useState<boolean>(false)
	const [likers, setLikers] = React.useState<string[]>([])

	const [haterEl, setHaterEl] = React.useState<HTMLButtonElement | null>()
	const [openHater, setOpenHater] = React.useState<boolean>(false)
	const [haters, setHaters] = React.useState<string[]>([])

	React.useEffect(() => {
		let likes: string[] = []
		let hates: string[] = []
		// set Liker and Haters
		message.reactions.forEach((r) => {
			if (r.reaction === "Like") {
				likes.push(`${r.poster.firstName} ${r.poster.lastName}`)
				return
			}
			hates.push(`${r.poster.firstName} ${r.poster.lastName}`)
		})
		setLikers(likes)
		setHaters(hates)

		// check message can react function
		if (isSelf || !currentUser) return
		setCanReact(!message.reactions.some((r) => r.poster.id === currentUser.id))
	}, [message])

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		if (!canReact) return
		setAnchorEl(event.currentTarget)
		setOpen(true)
	}
	const handleClose = () => {
		if (!canReact) return
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
				<div className={classes.reactionContainer}>
					<div style={{ display: "flex", flexDirection: "column" }}>
						<Button onClick={handleClick} aria-describedby={`gif-popover-${message.id}`}>
							<img width="100%" src={message.content} alt="" onLoad={onLoad} />
						</Button>
						<Box display="flex" marginTop="10px">
							{message.reactions.filter((r) => r.reaction === "Like").length > 0 && (
								<>
									<Button
										aria-describedby={`liker-popover-${message.id}`}
										onClick={(e) => {
											e.preventDefault()
											setLikerEl(e.currentTarget)
											setOpenLiker(true)
										}}
									>
										<Box display="flex">
											<Box marginRight="3px" marginLeft="8px">
												<ThumbUp fontSize="large" />
											</Box>
											<Typography variant="h2">{`${message.reactions.filter((r) => r.reaction === "Like").length}`}</Typography>
										</Box>
									</Button>
									<Popover
										id={`liker-popover-${message.id}`}
										open={openLiker}
										anchorEl={likerEl}
										onClose={() => {
											setLikerEl(null)
											setOpenLiker(false)
										}}
										anchorOrigin={{
											vertical: "bottom",
											horizontal: "right",
										}}
										transformOrigin={{
											vertical: "top",
											horizontal: "left",
										}}
									>
										<Box width="220px" height="fit-content" padding="3px">
											{likers.map((l, i) => (
												<Typography variant="h2" key={i}>
													{l}
												</Typography>
											))}
											<Typography variant="h2"> like your post</Typography>
										</Box>
									</Popover>
								</>
							)}
							{message.reactions.filter((r) => r.reaction === "Hate").length > 0 && (
								<>
									<Button
										aria-describedby={`hater-popover-${message.id}`}
										onClick={(e) => {
											e.preventDefault()
											setHaterEl(e.currentTarget)
											setOpenHater(true)
										}}
									>
										<Box display="flex">
											<Box marginRight="3px" marginLeft="8px">
												<ThumbDown fontSize="large" />
											</Box>
											<Typography variant="h2">{`${message.reactions.filter((r) => r.reaction === "Hate").length}`}</Typography>
										</Box>
									</Button>
									<Popover
										id={`hater-popover-${message.id}`}
										open={openHater}
										anchorEl={haterEl}
										onClose={() => {
											setHaterEl(null)
											setOpenHater(false)
										}}
										anchorOrigin={{
											vertical: "bottom",
											horizontal: "right",
										}}
										transformOrigin={{
											vertical: "top",
											horizontal: "left",
										}}
									>
										<Box width="220px" height="fit-content" padding="3px">
											{haters.map((l, i) => (
												<Typography variant="h2" key={i}>
													{l}
												</Typography>
											))}
											<Typography variant="h2"> hate your post</Typography>
										</Box>
									</Popover>
								</>
							)}
						</Box>
					</div>
				</div>
				{canReact && (
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
