import * as React from "react"
import { motion } from "framer-motion"
import { BoxProps } from "@material-ui/core"

interface PageAnimationsProps extends BoxProps {
	variant: "slideFromLeft" | "slideUp" | "slideFromRight"
	transition: "easeIn" | "easeOut"
	duration: number
}

export const PageAnimations = (props: PageAnimationsProps) => {
	const { variant, transition, children, duration } = props

	const animation = {
		slideFromLeft: {
			initial: {
				opacity: 0,
				x: "10vw",
			},
			in: {
				opacity: 1,
				x: 0,
			},
		},
		slideFromRight: {
			initial: {
				opacity: 0,
				x: "-10vw",
			},
			in: {
				opacity: 1,
				x: 0,
			},
		},
		slideUp: {
			initial: {
				opacity: 0,
				y: "10vh",
			},
			in: {
				opacity: 1,
				y: 0,
			},
		},
	}
	const pageTransition = {
		easeOut: {
			type: "tween",
			ease: "easeOut",
			duration, // 0.8
		},
		easeIn: {
			type: "tween",
			ease: "easeIn",
			duration, // 0.6
		},
	}

	return (
		<motion.div initial="initial" animate="in" exit="out" variants={animation[variant]} transition={pageTransition[transition]}>
			{children}
		</motion.div>
	)
}
