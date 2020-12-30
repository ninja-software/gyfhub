import React from "react"
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import { LoginPage } from "./pages/auth/loginPage"
import { Portal } from "./pages/portal"
import { SignUpPage } from "./pages/auth/signUpPage"
import { ForgetPassword } from "./pages/auth/forgetPassword"
import Themes from "./controllers/theme"
import { MuiThemeProvider, ThemeProvider } from "@material-ui/core"
import { PrivateRoute, PublicRoute } from "./components/security"
import FourZeroFour from "./pages/404"

const Routes = () => {
	return (
		<Switch>
			<PublicRoute path="/login" component={LoginPage} />
			<PublicRoute path="/sign_up" exact component={SignUpPage} />
			<PublicRoute path="/forget_password" exact component={ForgetPassword} />
			<PrivateRoute path="/" component={Portal} />
			<Route path={"/"} component={FourZeroFour} />
		</Switch>
	)
}

export const App = () => {
	async function registerSW() {
		if ("serviceWorker" in navigator) {
			try {
				await navigator.serviceWorker.register("./sw.js")
			} catch (e) {}
		} else {
		}
	}

	window.addEventListener("load", (e) => {
		// new PWAConfApp()
		registerSW()
	})
	const { currentTheme } = Themes.useContainer()

	return (
		<MuiThemeProvider theme={currentTheme}>
			<ThemeProvider theme={currentTheme}>
				<Router>
					<Routes />
				</Router>
			</ThemeProvider>
		</MuiThemeProvider>
	)
}
