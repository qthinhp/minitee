/** @type {import('@bacons/apple-targets').Config} */
module.exports = {
  type: "widget",
  name: "HydrationWidget",
  deploymentTarget: "17.0",
  // Must match APP_GROUP in src/widgets/widget-data.ts and the main app's
  // entitlements in app.json.
  entitlements: {
    "com.apple.security.application-groups": ["group.app.minitee.watertracker"],
  },
};
