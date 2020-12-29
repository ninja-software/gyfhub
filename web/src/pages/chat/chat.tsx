import * as React from "react"
import { makeStyles, TextField, Typography } from "@material-ui/core"
import { ExpButton } from "../../components/common/button"
import { check } from "prettier"

interface Props {}

export interface IGifImage {
	url: string
	height: string
	width: string
}

export enum Rating {
	Y = "y",
	G = "g",
	PG = "pg",
	PG13 = "pg-13",
	R = "r",
}

export interface IGifObject {
	id: string
	slug: string
	url: string
	embed_url: string
	source: string
	rating: Rating
	title: string
	images: { [index: string]: IGifImage }
}

const useStyle = makeStyles((theme) => ({
	container: {
		height: "90%",
	},
	gifsContainer: {
		height: "50%",
		border: "1px solid black",
	},
	keyboardContainer: {
		marginTop: "15px",
		height: "30%",
		border: "1px solid black",
		overflowY: "auto",
	},
	gifsGrid: {
		display: "flex",
		flexWrap: "wrap",
		justifyContent: "center",
	},
	gifImageContainer: {
		margin: "10px 20px",
	},

	gifImage: {
		width: "160px",
	},

	searchBar: {
		display: "flex",
		flexWrap: "wrap",
		justifyContent: "center",
	},
}))

export const Chat = (props: Props) => {
	const {} = props

	const [searchResults, setSearchResults] = React.useState<IGifObject[]>([])
	const [searchQuery, setSearchQuery] = React.useState<string>("")

	const getSearchResults = async () => {
		setSearchResults([])
		return await fetch(`https://api.giphy.com/v1/gifs/search?api_key=iKnyHPF6aER2DrPWjQGdgHS9O1oksVFv&q=${searchQuery}&limit=60&offset=0&rating=R&lang=en`)
			.then((res) => {
				return res.json()
			})
			.then((data) => {
				setSearchResults(data.data)
			})
	}

	const classes = useStyle()

	console.log("gifs here ========================", searchResults)

	return (
		<div className={classes.container}>
			<div className={classes.gifsContainer}>gifs goes here</div>

			<div className={classes.keyboardContainer}>
				<div className={classes.searchBar}>
					<TextField
						label={<Typography variant="subtitle1">Search Gifs</Typography>}
						variant="filled"
						multiline
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
					<ExpButton
						onClick={(e) => {
							e.preventDefault()
							getSearchResults()
						}}
					>
						Search
					</ExpButton>
				</div>

				<div className={classes.gifsGrid}>
					{searchResults.map((s) => {
						return (
							<div className={classes.gifImageContainer}>
								<img className={classes.gifImage} src={s.images.downsized.url} alt="" />
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}
