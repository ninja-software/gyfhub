// titleCapitalization capitalize the first letter of the word
export const titleCapitalization = (str: string) => {
	if (!str) return null
	let splitStr = str.toLowerCase().split("")
	splitStr[0] = splitStr[0].toUpperCase()
	return splitStr.join("")
}
