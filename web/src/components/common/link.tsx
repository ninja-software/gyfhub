import { Link, LinkProps, withStyles } from "@material-ui/core"
import * as React from "react"
import { useHistory } from "react-router-dom"

const BasicLink = withStyles({
	root: {
		cursor: "pointer",
	},
})(Link)

interface ExpLinkProps extends LinkProps {
	to: string
}

export const ExpLink = (props: ExpLinkProps) => {
	const { to, children } = props
	const history = useHistory()
	return <BasicLink onClick={() => history.push(to)}>{children}</BasicLink>
}
