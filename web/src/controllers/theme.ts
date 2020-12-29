import { useState } from "react"
import { Theme } from "@material-ui/core/styles"
import themes from "../theme"
import { createContainer } from "unstated-next"

function useTheme(initialState: number = 0) {
	let [currentTheme, setTheme] = useState<Theme>(themes[initialState])
	return {
		currentTheme,
		setTheme: (themeIndex: number) => {
			setTheme(themes[themeIndex])
		},
	}
}

const Themes = createContainer(useTheme)

export default Themes
