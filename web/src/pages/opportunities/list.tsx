import { Box, Button, Container, makeStyles, MenuItem, OutlinedInput, Select, Typography, withStyles } from "@material-ui/core"
import { FilterList, Search } from "@material-ui/icons"
import * as React from "react"
import { useQuery } from "react-fetching-library"
import { CategoryOptions } from "../../components/opportunities/create/category"
import { fetching } from "../../fetching"
import { LightGray, PrimaryPink } from "../../theme/colour"
import { Opportunity } from "../../types/types"
import { OpportunityCard } from "../../components/opportunities/card"

const useStyles = makeStyles({
	container: {
		display: "flex",
		flexDirection: "column",
		height: "fit-content",
	},
	searchButton: {
		backgroundColor: LightGray,
		color: PrimaryPink,
		"&:focus": {
			background: LightGray,
		},
	},
	option: {
		fontFamily: "Montserrat",
		fontSize: 16,
		fontWeight: "bolder",
	},
})

const SearchInput = withStyles({
	root: {
		borderRadius: "5px",
		border: "2px solid " + LightGray,
		height: "35px",
	},
	input: {
		padding: "8px 0 8px 8px",
		fontFamily: "Montserrat",
		fontWeight: "bolder",
		fontSize: 16,
	},
	adornedEnd: {
		padding: 0,
	},
	notchedOutline: {
		border: "1px solid " + LightGray,
	},
})(OutlinedInput)

const FilterSelect = withStyles({
	select: {
		paddingTop: 0,
		paddingBottom: 0,
		height: "35px",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		fontSize: 16,
		fontWeight: "bolder",
		fontFamily: "Montserrat",
		"&:focus": {
			background: "white",
		},
	},
	outlined: {
		border: "1px solid " + LightGray,
	},
})(Select)

const FilterButton = withStyles({
	root: {
		border: "2px solid " + LightGray,
		fontSize: 16,
		fontWeight: "bolder",
		fontFamily: "Montserrat",
		paddingLeft: "15px",
		paddingRight: "15px",
		height: "35px",
	},
})(Button)

const SelectOptions = ["All", ...CategoryOptions]

export const OpportunitiesFind = () => {
	const classes = useStyles()
	const [filter, setFilter] = React.useState<string>("All")
	const [search, setSearch] = React.useState<string>("")
	const [limit] = React.useState<number>(10)
	const [offset] = React.useState<number>(0)
	const [rows, setRows] = React.useState<Opportunity[]>([])

	const { payload, loading } = useQuery<{ opportunities: Opportunity[]; total: number }>(
		fetching.queries.opportunitiesMany({
			search,
			limit,
			offset,
			filter,
		}),
	)
	React.useEffect(() => {
		if (loading || !payload || !payload.opportunities) return
		setRows(payload.opportunities)
	}, [payload, loading])
	return (
		<Container className={classes.container}>
			<Box display="flex" alignItems="center">
				<SearchInput
					fullWidth
					placeholder="Search Opportunities"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					endAdornment={
						<Button className={classes.searchButton}>
							<Search />
						</Button>
					}
				/>
				<Box m={2} />
				<Typography variant="h5">Category</Typography>
				<Box m={2} />
				<FilterSelect name="filter" variant="outlined" value={filter} onChange={(e) => setFilter(e.target.value as string)}>
					{SelectOptions.map((o, i) => (
						<MenuItem key={i} value={o} className={classes.option}>
							{o}
						</MenuItem>
					))}
				</FilterSelect>
				<Box m={2} />
				<FilterButton>
					<Box display="flex">
						Filter <FilterList />
					</Box>
				</FilterButton>
			</Box>
			{rows.map((o, i) => (
				<OpportunityCard key={i} {...o} showAll />
			))}
		</Container>
	)
}
