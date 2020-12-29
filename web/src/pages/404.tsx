import * as React from "react"
import WarningIcon from "@material-ui/icons/Warning"
import Typography from "@material-ui/core/Typography/Typography"

function FourZeroFour() {
	return (
		<div style={{ display: "flex", justifyContent: "center", flexDirection: "column", textAlign: "center" }}>
			<div>
				<WarningIcon style={{ height: "200px", width: "200px", fill: "#F57A77" }} />
				<Typography variant="h2" component="h2">
					four oh four
				</Typography>
			</div>
		</div>
	)
}

export default FourZeroFour
