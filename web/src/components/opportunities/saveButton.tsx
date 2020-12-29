import * as React from "react"
import { useMutation } from "react-fetching-library"
import { fetching } from "../../fetching"
import { Opportunity } from "../../types/types"
import { ExpButton } from "../common/button"
import { Box } from "@material-ui/core"
import { FavoriteBorder } from "@material-ui/icons"
import FavoriteIcon from "@material-ui/icons/Favorite"
import { PrimaryPink } from "../../theme/colour"

interface SaveBtnProps {
	data: Opportunity
	disabled?: boolean
}

export const SaveButton = (props: SaveBtnProps) => {
	const { data, disabled } = props
	const { loading: faveLoading, mutate: fave } = useMutation<string>(fetching.mutations.favouriteOpportunities)
	const { loading: unfaveLoading, mutate: unfave } = useMutation<string>(fetching.mutations.unfavouriteOpportunities)
	const [isFave, setIsFave] = React.useState(data.isFave)

	const tglFave = async () => {
		if (!isFave) {
			const resp = await fave(data.id)
			if (resp.error || !resp.payload) return
			setIsFave(true)
			return
		}
		const resp = await unfave(data.id)
		if (resp.error || !resp.payload) return
		setIsFave(false)
	}

	if (faveLoading || unfaveLoading) return null

	return (
		<ExpButton
			disabled={disabled}
			fullWidth
			styleType="bordered"
			onClick={(e) => {
				e.preventDefault()
				tglFave()
			}}
		>
			<Box display="flex" color={PrimaryPink}>
				{isFave ? <FavoriteIcon fontSize="small" /> : <FavoriteBorder fontSize="small" />}
				<Box m={1} />
				{isFave ? "SAVED" : "SAVE"}
			</Box>
		</ExpButton>
	)
}
