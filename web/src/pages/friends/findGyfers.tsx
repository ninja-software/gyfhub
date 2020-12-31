import * as React from "react"
import { Avatar, Box, makeStyles, Typography } from "@material-ui/core"
import { ExpButton } from "../../components/common/button"
import { useMutation, useQuery } from "react-fetching-library"
import { fetching } from "../../fetching"
import { Follow, User } from "../../types/types"
import { ExpCard } from "../../components/common/card"
import { UserAvatar } from "../../components/common/avatar"

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

export const FindGyfers = () => {
	const classes = useStyles()
	const [search, setSearch] = React.useState<string>("")
	const limit: number = 5

	const { error, payload, loading, query } = useQuery<User[]>(
		fetching.queries.getManyUsers({
			search: search || "",
			limit,
		}),
	)

	const { loading: followLoading, mutate: follow } = useMutation<string>(fetching.mutations.follow)
	const { loading: unfollowLoading, mutate: unfollow } = useMutation<string>(fetching.mutations.unfollow)

	const { payload: following, loading: followingLoading, error: followingError, query: refetch } = useQuery<Follow[]>(fetching.queries.getFollowing())

	const [followingIDs, setFollowingIDs] = React.useState<string[]>([])

	React.useEffect(() => {
		if (followingLoading || !following) return
		setFollowingIDs(following.map((f) => f.id))
	}, [following])

	if (followLoading && unfollowLoading) return null

	return (
		<div className={classes.container}>
			<div>
				{payload?.map((g, i) => (
					<ExpCard key={i}>
						<div className={classes.briefProfile}>
							<UserAvatar {...g} size={105} />
							<div className={classes.userDetail}>
								<Typography variant="h3">
									<Box className={classes.infoBox}>{`${g.firstName} ${g.lastName}`}</Box>
									<Box className={classes.infoBox}>{g.email}</Box>
									<Box className={classes.infoBox}>{g.city}</Box>
								</Typography>
							</div>
						</div>

						{!followingIDs.includes(g.id) ? (
							<ExpButton
								onClick={async (e) => {
									e.preventDefault()
									const resp = await follow(g.id)
									if (resp.payload) {
										refetch()
									}
								}}
							>
								Follow
							</ExpButton>
						) : (
							<ExpButton
								onClick={async (e) => {
									e.preventDefault()
									const resp = await unfollow(g.id)
									if (resp.payload) {
										refetch()
									}
								}}
							>
								Unfollow
							</ExpButton>
						)}
					</ExpCard>
				))}
			</div>
		</div>
	)
}
