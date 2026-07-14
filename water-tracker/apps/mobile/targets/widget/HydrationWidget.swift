// iOS home-screen + lock-screen widget. Reads today's numbers from the App
// Group defaults that the RN app mirrors on every log (see widget-sync.tsx).

import WidgetKit
import SwiftUI

private let appGroup = "group.app.minitee.watertracker"

struct HydrationEntry: TimelineEntry {
    let date: Date
    let totalMl: Double
    let goalMl: Double
    var pct: Double { goalMl > 0 ? min(1, totalMl / goalMl) : 0 }
}

struct Provider: TimelineProvider {
    private func read() -> HydrationEntry {
        let defaults = UserDefaults(suiteName: appGroup)
        let total = Double(defaults?.string(forKey: "total_ml") ?? "") ?? 0
        let goal = Double(defaults?.string(forKey: "goal_ml") ?? "") ?? 0

        // If the stored day isn't today, show 0 rather than yesterday's total.
        let fmt = DateFormatter()
        fmt.dateFormat = "yyyy-MM-dd"
        let today = fmt.string(from: Date())
        let storedDay = defaults?.string(forKey: "day") ?? today
        return HydrationEntry(
            date: Date(),
            totalMl: storedDay == today ? total : 0,
            goalMl: goal
        )
    }

    func placeholder(in context: Context) -> HydrationEntry {
        HydrationEntry(date: Date(), totalMl: 1250, goalMl: 2500)
    }

    func getSnapshot(in context: Context, completion: @escaping (HydrationEntry) -> Void) {
        completion(context.isPreview ? placeholder(in: context) : read())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<HydrationEntry>) -> Void) {
        // The app force-reloads timelines after every log; this refresh is a
        // fallback (and rolls the total over to 0 shortly after midnight).
        completion(Timeline(entries: [read()], policy: .after(Date().addingTimeInterval(30 * 60))))
    }
}

struct HydrationWidgetView: View {
    var entry: HydrationEntry
    @Environment(\.widgetFamily) var family

    private var face: String {
        switch entry.pct {
        case 1...: return "🏆"
        case 0.75..<1: return "🤩"
        case 0.5..<0.75: return "😄"
        case 0.25..<0.5: return "🙂"
        default: return "💧"
        }
    }

    var body: some View {
        switch family {
        case .accessoryCircular:
            // Lock screen ring
            Gauge(value: entry.pct) {
                Text("💧")
            } currentValueLabel: {
                Text(String(format: "%.1f", entry.totalMl / 1000))
            }
            .gaugeStyle(.accessoryCircular)
        default:
            ZStack {
                VStack(spacing: 6) {
                    ZStack {
                        Circle()
                            .stroke(Color.white.opacity(0.15), lineWidth: 10)
                        Circle()
                            .trim(from: 0, to: entry.pct)
                            .stroke(
                                LinearGradient(
                                    colors: [Color(red: 0.18, green: 0.5, blue: 0.93),
                                             Color(red: 0.22, green: 0.84, blue: 1.0)],
                                    startPoint: .leading, endPoint: .trailing
                                ),
                                style: StrokeStyle(lineWidth: 10, lineCap: .round)
                            )
                            .rotationEffect(.degrees(-90))
                        Text(face).font(.system(size: 26))
                    }
                    .frame(width: 72, height: 72)

                    Text(String(format: "%.1fL", entry.totalMl / 1000))
                        .font(.system(size: 20, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    Text(entry.goalMl > 0
                         ? String(format: "of %.1fL goal", entry.goalMl / 1000)
                         : "tap to set a goal")
                        .font(.system(size: 11))
                        .foregroundColor(.white.opacity(0.65))
                }
            }
            .containerBackground(for: .widget) {
                LinearGradient(
                    colors: [Color(red: 0.04, green: 0.11, blue: 0.2),
                             Color(red: 0.02, green: 0.04, blue: 0.09)],
                    startPoint: .top, endPoint: .bottom
                )
            }
        }
    }
}

struct HydrationWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "HydrationWidget", provider: Provider()) { entry in
            HydrationWidgetView(entry: entry)
        }
        .configurationDisplayName("Water Tracker")
        .description("Today's water at a glance.")
        .supportedFamilies([.systemSmall, .accessoryCircular])
    }
}

@main
struct HydrationWidgetBundle: WidgetBundle {
    var body: some Widget {
        HydrationWidget()
    }
}
