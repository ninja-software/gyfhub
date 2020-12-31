import * as React from "react"
import { Box, makeStyles, Typography, TextField } from "@material-ui/core"
import { ExpButton } from "../../components/common/button"
import { useMutation, useQuery } from "react-fetching-library"
import { fetching } from "../../fetching"
import { Follow, User } from "../../types/types"
import { ExpCard } from "../../components/common/card"
import { UserAvatar } from "../../components/common/avatar"
import { trunc } from "../hubs/hubsList"
import { PageAnimations } from "../../components/common/pageAnimations"

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

	searchBar: {
		display: "flex",
		flexWrap: "wrap",
		justifyContent: "center",
		marginTop: "20px",
		marginBottom: "40px",
	},
}))

export const FindGyfers = () => {
	const classes = useStyles()
	const [search, setSearch] = React.useState<string>("")
	const limit: number = 5

	const { error, payload, loading } = useQuery<User[]>(
		fetching.queries.getManyUsers({
			search: search || "",
			limit,
		}),
	)

	const { loading: followLoading, mutate: follow } = useMutation<string>(fetching.mutations.follow)
	const { loading: unfollowLoading, mutate: unfollow } = useMutation<string>(fetching.mutations.unfollow)

	const { payload: following, loading: followingLoading, error: followingError, query: refetch } = useQuery<Follow[]>(fetching.queries.getFollowing())

	const [followingIDs, setFollowingIDs] = React.useState<string[]>([])
	const [searchKey, setSearchKey] = React.useState<string>("")

	const [users, setUsers] = React.useState<User[]>([])

	React.useEffect(() => {
		if (followingLoading || !following) return
		setFollowingIDs(following.map((f) => f.id))
	}, [following])

	React.useEffect(() => {
		if (!payload || error || loading) return
		setUsers(payload)
	}, [payload])

	React.useEffect(() => {
		if (!payload) return

		if (searchKey == "" && payload) {
			setUsers(payload)
			return
		}
		setUsers(payload.filter((d) => (d.firstName + d.lastName).toLowerCase().includes(searchKey.toLowerCase())))
	}, [searchKey])

	if (followLoading && unfollowLoading) return null

	return (
		<div className={classes.container}>
			<div className={classes.searchBar}>
				<TextField
					label={<Typography variant="h3">Search</Typography>}
					variant="filled"
					value={searchKey}
					style={{ width: "100%" }}
					InputProps={{ style: { fontSize: 40, padding: 10 } }}
					onChange={(e) => setSearchKey(e.target.value)}
				/>
			</div>

			<div>
				{users.map((g, i) => (
					<PageAnimations key={i} variant={"slideUp"} transition={"easeOut"} duration={0.4}>
						<ExpCard>
							<div className={classes.briefProfile}>
								<UserAvatar {...g} size={105} />
								<div className={classes.userDetail}>
									<Typography variant="h3">
										<Box className={classes.infoBox}>{`${g.firstName} ${g.lastName}`}</Box>
										<Box className={classes.infoBox}>{trunc(g.email, 22)}</Box>
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
					</PageAnimations>
				))}
			</div>
		</div>
	)
}
