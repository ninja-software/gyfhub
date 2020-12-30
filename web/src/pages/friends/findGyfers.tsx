import * as React from "react"
import { makeStyles, TextField, Typography } from "@material-ui/core"
import { ExpButton } from "../../components/common/button"
import { useMutation, useQuery } from "react-fetching-library"
import { fetching } from "../../fetching"
import { ExpInput } from "../../components/common/input"
import { User } from "../../types/types"
import { ExpCard } from "../../components/common/card"

const useStyles = makeStyles((theme) => ({
	container: {
		height: "90%",
	},
}))

export const FindGyfers = () => {
	const classes = useStyles()
	const [search, setSearch] = React.useState<string>("")
	const limit: number = 5
	const [isFollow, setIsFollow] = React.useState(Boolean)

	const { error, payload, loading, query } = useQuery<User[]>(
		fetching.queries.getManyUsers({
			search: search || "",
			limit,
		}),
	)

	const { loading: followLoading, mutate: follow } = useMutation<string>(fetching.mutations.follow)

	// const tglFollow = async () => {
	// 	if (!isFollow) {
	// 		const resp = await follow()
	// 		if (resp.error || !resp.payload) return
	// 		setIsFollow(true)
	// 		return
	// 	}
	// 	// const resp = await unfave(data.id)
	// 	// if (resp.error || !resp.payload) return
	// 	// setIsFave(false)
	// }

	// console.log(payload)

	if (followLoading) return null

	return (
		<div className={classes.container}>
			{/* <TextField></TextField> */}
			<div>
				{payload?.map((g, i) => (
					<ExpCard key={i}>
						<div>{g.firstName}</div>
						<ExpButton
							onClick={(e) => {
								e.preventDefault()
								// tglFollow()
								follow(g.id)
							}}
						>
							Follow
						</ExpButton>
					</ExpCard>
				))}
			</div>
		</div>
	)
}
