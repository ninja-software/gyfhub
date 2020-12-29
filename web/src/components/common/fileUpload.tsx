import { Box, BoxProps, makeStyles, Typography, withStyles } from "@material-ui/core"
import * as React from "react"
import folderUpload from "../../assets/imgs/fileupload.svg"
import { PrimaryBlue, SecondaryBlue } from "../../theme/colour"

const useStyles = makeStyles((theme) => ({
	divider: {
		height: "2px",
		backgroundColor: PrimaryBlue,
		borderRadius: "2px",
	},
	folderIcon: {
		fontSize: 90,
	},
	hidden: {
		height: 0,
		width: 0,
		position: "absolute",
	},
}))

const UploadBox = withStyles({
	root: {
		border: "2px dashed " + SecondaryBlue,
		borderRadius: "11px",
		padding: "50px",
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
		color: PrimaryBlue,
	},
})(Box)

interface FileUploadProps extends BoxProps {
	videoType?: boolean
	multi?: boolean
	files: File[]
	setFiles: (fs: File[]) => void
}
export const FileUpload = (props: FileUploadProps) => {
	const { videoType, multi, files, setFiles, ...rest } = props
	const classes = useStyles()
	const [checkList] = React.useState<string[]>([])

	// input file
	const handleInputOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		event.preventDefault()
		const inputsFiles = event.currentTarget.files
		if (inputsFiles) {
			handleAddFiles(Object.values(inputsFiles))
		}
	}

	// drop a file
	const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
		event.preventDefault()
		if (event.dataTransfer.items) {
			// Use DataTransferItemList interface to access the file(s)
			let fileList: File[] = []
			for (let i = 0; i < event.dataTransfer.items.length; i++) {
				// If dropped items aren't files, reject them
				if (event.dataTransfer.items[i].kind === "file") {
					let file = event.dataTransfer.items[i].getAsFile()
					if (file) fileList.push(file)
				}
				if (fileList.length > 0) handleAddFiles(fileList)
			}
		} else {
			handleAddFiles(Object.values(event.dataTransfer.files))
		}
	}

	// add to file list
	const handleAddFiles = (fileList: File[]) => {
		// filter out the files which are already attached for preventing duplication
		let fs = fileList.filter((f) => !files.find((fs) => fs.name === f.name))

		// if checkList exists, filter out duplicate files
		if (checkList && checkList.length > 0) {
			fs = fs.filter((f) => !checkList.includes(f.name))
		}

		if (videoType) fs = fs.filter((f) => f.name.match(/\.(mp4|mov|wmv|flv|avi|webm|mkv)$/i))

		if (fs.length > 0) {
			if (multi) {
				setFiles(files.concat(...fs))
				return
			}
			setFiles([fs[0]])
		}
	}

	const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
		event.preventDefault()
	}

	const displayFile = () => {
		if (files.length === 0) return null
		const file = URL.createObjectURL(files[0])
		if (videoType)
			return (
				<video width="100%" height="100%" playsInline controls>
					<source src={file} type={files[0].type} />
				</video>
			)
		return <img width="100%" height="100%" alt="file" src={file} />
	}

	return (
		<Box {...rest}>
			{files.length > 0 ? (
				displayFile()
			) : (
				<>
					<label htmlFor="fileUpload" onDrop={handleDrop} onDragOver={handleDragOver}>
						<UploadBox>
							<img alt="folder" src={folderUpload} />
							<Typography variant="h6" color="textPrimary">
								<Box marginTop="20px" width="210px" textAlign="center">
									Drag your video file here or click to upload
								</Box>
							</Typography>
						</UploadBox>
					</label>
					<input
						id="fileUpload"
						type="file"
						multiple={multi}
						accept={videoType ? "video/*" : undefined}
						className={classes.hidden}
						onChange={handleInputOnChange}
					/>
				</>
			)}
		</Box>
	)
}
