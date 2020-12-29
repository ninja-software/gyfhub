import * as React from "react"
import { BaseTextFieldProps, TextField, Typography, withStyles } from "@material-ui/core"
import { Control, Controller, DeepMap, FieldError } from "react-hook-form"

const BasicTextField = withStyles({
	root: {
		backgroundColor: "#F8F4FF",
	},
})(TextField)

export interface UseFormProps {
	control: Control<Record<string, any>>
	errors: DeepMap<Record<string, any>, FieldError>
	rules?: any
}

interface ExpInputProps extends UseFormProps, BaseTextFieldProps {
	variant?: "filled" | "outlined" | "standard"
	options?: string[]
}

export const ExpInput = (props: ExpInputProps) => {
	const { control, errors, rules, name, value, variant, label, options, ...rest } = props
	return (
		<Controller
			name={name || ""}
			defaultValue={value || ""}
			control={control}
			rules={rules}
			render={({ value, onChange, name }) => (
				<BasicTextField
					{...rest}
					label={
						<Typography color="textPrimary" variant="subtitle1">
							{label}
						</Typography>
					}
					name={name}
					error={!!errors[name]}
					variant={variant || "filled"}
					fullWidth
					id={name}
					value={value}
					onChange={(e) => onChange(e)}
					helperText={
						errors[name] && (
							<Typography color="error" variant="caption">
								{errors[name].message}
							</Typography>
						)
					}
				/>
			)}
		/>
	)
}
