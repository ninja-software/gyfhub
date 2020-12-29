import { createMuiTheme } from "@material-ui/core/styles"

import variants from "./variants"
import typography from "./typography"
import { VariantType } from "./variants"

const theme = (variant: VariantType) => {
	return createMuiTheme(
		{
			spacing: 4,
			typography: typography,
			palette: variant.palette,
		},
		{
			name: variant.name,
			body: variant.body,
			header: variant.header,
			sidebar: variant.sidebar,
		},
	)
}

const themes = variants.map((variant) => theme(variant))

export default themes
