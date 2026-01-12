import { FrontendNotification } from "@/types";
import React from "react";
import { Clock, Globe, Monitor, Calendar, X, AlertCircle, CheckCircle, Info } from "lucide-react";

interface ViewNotificationDetailsProps extends FrontendNotification {
    show: (value: boolean) => void; // Add the show prop separately
    toggle : boolean
}

export default function ViewNotificationDetails({
  category,
  description,
  title,
  time,
  ip,
  loginTime,
  userAgent,
  show ,
  toggle
}: ViewNotificationDetailsProps) {

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'security':
      case 'login':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'security':
      case 'login':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={`w-full h-full fixed inset-0 z-50 ${toggle ? "flex" : "hidden"} items-center justify-center bg-black/50 backdrop-blur-sm`}>
      {/* Backdrop */}
      <div
        onClick={() => show(false)}
        className="absolute inset-0 cursor-pointer"
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg mx-4 bg-background border border-border rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            {getCategoryIcon(category)}
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {title}
              </h1>
              <p className="text-sm text-muted-foreground capitalize">
                {category.replace('-', ' ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => show(false)}
            className="p-2 hover:bg-muted rounded-full transition-colors"
            aria-label="Close notification details"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Description
            </h3>
            <p className="text-foreground leading-relaxed">
              {description}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid gap-4">
            {/* IP Address */}
            {ip && (
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Globe className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-muted-foreground">IP Address</p>
                  <p className="text-foreground font-mono text-sm">{ip}</p>
                </div>
              </div>
            )}

            {/* Login Time */}
            {loginTime && (
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Login Time</p>
                  <p className="text-foreground text-sm">{loginTime}</p>
                </div>
              </div>
            )}

            {/* Browser/User Agent */}
            {userAgent && (
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Monitor className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Browser</p>
                  <p className="text-foreground text-sm break-words">{userAgent}</p>
                </div>
              </div>
            )}

            {/* Time and Category */}
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-muted-foreground">Notification Time</p>
                <p className="text-foreground text-sm">{time}</p>
              </div>
            </div>
          </div>

          {/* Category Badge */}
          <div className="flex justify-center pt-2">
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(category)}`}>
              {getCategoryIcon(category)}
              {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-border/50 bg-muted/20">
          <button
            onClick={() => show(false)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
