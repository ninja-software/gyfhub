import { makeStyles, MenuItem, SelectProps, TextField, Typography } from "@material-ui/core"
import * as React from "react"
import { Controller } from "react-hook-form"
import { UseFormProps } from "./input"

const useStyles = makeStyles(theme => ({
	outer: {
		width: "100%",
		height: "100%",
		maxHeight: "100px",
		borderRadius: "4px 4px 0px 0px",
		fontFamily: "Montserrat",
	},
	inner: {
		padding: "10px",
	},
}))
interface ExpSelectProps extends SelectProps, UseFormProps {
	options: string[]
	clearable?: boolean
}
export const ExpSelect = (props: ExpSelectProps) => {
	const { control, errors, rules, label, name = "", value, options, variant, clearable } = props
	const classes = useStyles()
	return (
		<Controller
			name={name}
			control={control}
			errors={errors}
			defaultValue={value || ""}
			rules={rules}
			render={({ name, value, onChange }) => (
				<TextField
					id={name}
					select
					fullWidth
					label={<Typography variant="subtitle1">{label}</Typography>}
					value={value || ""}
					variant={variant || "filled"}
					onChange={e => onChange(e)}
					helperText={
						errors[name] && (
							<Typography color="error" variant="caption">
								{errors[name].message}
							</Typography>
						)
					}
				>
					{clearable && <MenuItem value="">None</MenuItem>}
					{options.map(o => (
						<MenuItem key={o} value={o}>
							{o}
						</MenuItem>
					))}
				</TextField>
			)}
		/>
	)
}
