import { Box, Typography, withStyles } from "@material-ui/core"
import { AccessTime } from "@material-ui/icons"
import * as React from "react"
import Moment from "moment"
import { ExpButton } from "../common/button"
import { OpportunityTag } from "./create/Summary"
import { LightGray, PrimaryPink } from "../../theme/colour"
import { Opportunity } from "../../types/types"
import { UserAvatar } from "../common/avatar"
import { useHistory } from "react-router-dom"
import { SaveButton } from "./saveButton"

const OpportunityCardContainer = withStyles({
	root: {
		border: "2px solid " + LightGray,
		borderRadius: "11px",
		display: "flex",
		padding: "20px",
		marginTop: "16px",
	},
})(Box)

const OpportunityCardContent = withStyles({
	root: {
		marginLeft: "20px",
		display: "flex",
		flexDirection: "column",
		width: "100%",
	},
})(Box)

interface OpportunityCardProps extends Opportunity {
	showAll?: boolean
}

export const OpportunityCard = (props: OpportunityCardProps) => {
	const { id, category, challenge, roleAfterChallenge, owner, showAll, expiredAt } = props

	const history = useHistory()

	return (
		<OpportunityCardContainer
			onClick={
				!showAll
					? (e) => {
							e.preventDefault()
					  }
					: undefined
			}
		>
			<UserAvatar {...props.owner} size={105} shadowed />
			<OpportunityCardContent>
				<Box display="flex" justifyContent="space-between">
					<Typography variant="h4">{category}</Typography>
					{showAll ? (
						<Box display="flex" alignItems="center">
							<SaveButton data={props as Opportunity} />
							<Box m={2} />
							<ExpButton
								variant="contained"
								color="primary"
								onClick={(e) => {
									e.preventDefault()
									history.push(`/opportunity?id=${id}`)
								}}
							>
								APPLY
							</ExpButton>
						</Box>
					) : (
						<RemainTime expiredAt={expiredAt} />
					)}
				</Box>
				{!showAll && <Box m={4} />}
				<Typography variant="h6">{`${owner.business?.name} - ${owner.city}`}</Typography>
				{showAll && (
					<>
						<Box m={2} />
						<Typography variant="h6">
							<Box width="80%">{challenge}</Box>
						</Typography>
						<Box m={2} />
						<Box display="flex" justifyContent="space-between">
							<OpportunityTag label={roleAfterChallenge} />
							<RemainTime expiredAt={expiredAt} />
						</Box>
					</>
				)}
			</OpportunityCardContent>
		</OpportunityCardContainer>
	)
}

const RemainTime = (props: { expiredAt: string }) => {
	const calcRemainDays = (): string => {
		const days = Moment.duration(Moment(props.expiredAt).diff(Moment())).days()
		switch (days) {
			case 0:
				return "today"
			case 1:
				return "tomorrow"
			default:
				return `in ${days} days`
		}
	}
	return (
		<Typography variant="h6">
			<Box display="flex" fontSize={16} fontWeight="100" alignItems="center" color={PrimaryPink}>
				<AccessTime />
				<Box m={0.5} />
				{`Ends ${calcRemainDays()}`}
			</Box>
		</Typography>
	)
}
