// Headless task Android runs when the widget is added, resized, or on its
// periodic refresh. Renders from the cached payload — no network, so it's
// instant and works offline.

import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { HydrationWidget } from "./HydrationWidget";
import { loadWidgetData } from "./widget-data";

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  switch (props.widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED": {
      const data = await loadWidgetData();
      props.renderWidget(<HydrationWidget totalMl={data.totalMl} goalMl={data.goalMl} />);
      break;
    }
    default:
      break;
  }
}
