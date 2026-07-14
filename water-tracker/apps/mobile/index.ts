import { registerRootComponent } from "expo";
import { Platform } from "react-native";
import App from "./App";

// Android home-screen widget: register the headless renderer before the app.
if (Platform.OS === "android") {
  // Required even when the app UI never opens (widget-only launches).
  const { registerWidgetTaskHandler } = require("react-native-android-widget");
  const { widgetTaskHandler } = require("./src/widgets/widgetTaskHandler");
  registerWidgetTaskHandler(widgetTaskHandler);
}

registerRootComponent(App);
