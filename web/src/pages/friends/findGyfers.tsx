import * as React from "react"
import { Avatar, Box, makeStyles, Typography } from "@material-ui/core"
import { ExpButton } from "../../components/common/button"
import { useMutation, useQuery } from "react-fetching-library"
import { fetching } from "../../fetching"
import { User } from "../../types/types"
import { ExpCard } from "../../components/common/card"
import { UserAvatar } from "../../components/common/avatar"

interface FollowBtnProps {
	data: User
	// disabled?: boolean
}

const useStyles = makeStyles((theme) => ({
	container: {
		height: "90%",
	},
	briefProfile: {
		marginTop: "30px",
		display: "flex",
	},
	userDetail: {
		marginLeft: "38px",
		width: "100%",
		height: "fit-content",
	},
	infoBox: {
		marginBottom: "10px",
		fontWeight: "bolder",
	},
}))

export const FindGyfers = (props: FollowBtnProps) => {
	const { data } = props
	const classes = useStyles()
	const [search, setSearch] = React.useState<string>("")
	const limit: number = 5
	const [isFollow, setIsFollow] = React.useState(Boolean)

	const { error, payload, loading, query } = useQuery<User[]>(
		fetching.queries.getManyUsers({
			search: search || "",
			limit,
			// excludedID: data.id,
		}),
	)

	const { loading: followLoading, mutate: follow } = useMutation<string>(fetching.mutations.follow)
	const { loading: unfollowLoading, mutate: unfollow } = useMutation<string>(fetching.mutations.unfollow)

	{
		/* TODO: toggle follow */
	}

	// const tglFollow = async () => {
	// 	if (!isFollow) {
	// 		const resp = await follow()
	// 		if (resp.error || !resp.payload) return
	// 		setIsFollow(true)
	// 		return
	// 	}
	// 	const resp = await unfollow()
	// 	if (resp.error || !resp.payload) return
	// 	setIsFollow(false)
	// }

	// console.log(payload)

	if (followLoading && unfollowLoading) return null

	return (
		<div className={classes.container}>
			{/* <TextField></TextField> */}
			<div>
				{payload?.map((g, i) => (
					<ExpCard key={i}>
						<div className={classes.briefProfile}>
							<UserAvatar {...g} size={105} />
							<div className={classes.userDetail}>
								<Typography variant="h3">
									<Box className={classes.infoBox}>{`${g.firstName} ${g.lastName}`}</Box>
									<Box className={classes.infoBox}>{g.email}</Box>
									{g.business && <Box className={classes.infoBox}>{g.business.name}</Box>}
									<Box className={classes.infoBox}>{g.city}</Box>
								</Typography>
							</div>
						</div>

						{/* TODO: Conditionally render */}
						<ExpButton
							onClick={(e) => {
								e.preventDefault()
								// tglFollow()
								follow(g.id)
							}}
						>
							Follow
						</ExpButton>
						<ExpButton
							onClick={(e) => {
								e.preventDefault()
								// tglFollow()
								unfollow(g.id)
							}}
						>
							Unfollow
						</ExpButton>
					</ExpCard>
				))}
			</div>
		</div>
	)
}
