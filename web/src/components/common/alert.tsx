import * as React from "react"
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert"

export const Alert = (props: AlertProps) => {
	return <MuiAlert variant="filled" {...props} />
}
