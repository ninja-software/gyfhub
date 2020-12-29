import * as React from "react"
import experlioLogo from "../assets/imgs/gyfhubSolo.png"

export const Logo = (props: { width?: string }) => {
	return <img src={experlioLogo} width={props.width} alt="experlio logo" />
}
