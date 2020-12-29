import { Avatar, makeStyles } from "@material-ui/core"
import * as React from "react"
import { PrimaryBlue, PrimaryPink } from "../../theme/colour"
import { UserType } from "../../types/enum"
import { User } from "../../types/types"

const useStyles = makeStyles({
	shadowed: {
		boxShadow: "0px 0px 10px #0000001A",
	},
	rounded: {
		borderRadius: "11px",
		backgroundColor: PrimaryBlue,
	},
	circle: {
		backgroundColor: PrimaryPink,
	},
})

interface UserAvatarProps extends User {
	size?: number
	shadowed?: boolean
}

export const UserAvatar = (props: UserAvatarProps) => {
	const { firstName, size = 60, type, avatarURL, shadowed } = props
	const classes = useStyles()
	return (
		<Avatar
			src={avatarURL}
			variant={type === UserType.Business ? "rounded" : "circle"}
			classes={{
				rounded: classes.rounded,
				circle: classes.circle,
			}}
			className={shadowed ? classes.shadowed : undefined}
			style={{ width: `${size}px`, height: `${size}px` }}
		>
			{firstName[0].toUpperCase()}
		</Avatar>
	)
}
