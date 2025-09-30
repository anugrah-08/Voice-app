"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Mic, Volume2, Trash2 } from "lucide-react"
import type { Activity } from "@/app/page"

interface TranscriptHistoryProps {
  activities: Activity[]
  onClearHistory: () => void
}

export function TranscriptHistory({ activities, onClearHistory }: TranscriptHistoryProps) {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date)
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-card-foreground">Recent Activity</CardTitle>
            <CardDescription>Your transcription and speech generation history</CardDescription>
          </div>
          {activities.length > 0 && (
            <Button variant="outline" size="sm" onClick={onClearHistory}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No activity yet. Start recording or generating speech to see your history here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="p-4 bg-secondary/50 rounded-lg border border-border hover:bg-secondary transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {activity.type === "transcription" ? (
                      <Mic className="h-5 w-5 text-primary" />
                    ) : (
                      <Volume2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {activity.type === "transcription" ? "Voice Recording" : "Speech Generated"}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatTime(activity.timestamp)}</span>
                    </div>
                    <p className="text-sm text-secondary-foreground leading-relaxed line-clamp-3">{activity.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
