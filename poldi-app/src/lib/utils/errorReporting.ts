/**
 * Error reporting utility for Poldi App
 * Handles logging and reporting of errors for debugging and monitoring
 */

export interface ErrorReport {
  message: string;
  stack?: string;
  status?: number;
  url: string;
  timestamp: string;
  userAgent: string;
  appVersion: string;
  moduleId?: string;
  exerciseType?: string;
  sessionId?: string;
  userId?: string;
}

class ErrorReporter {
  private reports: ErrorReport[] = [];
  private maxReports = 50; // Keep only recent reports

  /**
   * Report an error with context
   */
  report(error: Error | string, context?: Partial<ErrorReport>): void {
    const errorMessage = error instanceof Error ? error.message : error;
    const stack = error instanceof Error ? error.stack : undefined;

    const report: ErrorReport = {
      message: errorMessage,
      stack,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      appVersion: this.getAppVersion(),
      ...context
    };

    // Add to internal storage
    this.reports.unshift(report);
    if (this.reports.length > this.maxReports) {
      this.reports.pop();
    }

    // Log to console
    console.error('Poldi App Error:', report);

    // In production, you would send to external service
    this.sendToExternalService(report);
  }

  /**
   * Report a network/server error
   */
  reportNetworkError(status: number, message: string, url?: string): void {
    this.report(`Network Error ${status}: ${message}`, {
      status,
      url: url || window.location.href
    });
  }

  /**
   * Report an exercise-related error
   */
  reportExerciseError(error: Error | string, moduleId?: string, exerciseType?: string): void {
    this.report(error, {
      moduleId,
      exerciseType
    });
  }

  /**
   * Get recent error reports
   */
  getRecentReports(limit = 10): ErrorReport[] {
    return this.reports.slice(0, limit);
  }

  /**
   * Export all reports as JSON
   */
  exportReports(): string {
    return JSON.stringify(this.reports, null, 2);
  }

  /**
   * Clear all stored reports
   */
  clearReports(): void {
    this.reports = [];
  }

  /**
   * Get app version (from package.json or hardcoded)
   */
  private getAppVersion(): string {
    // In a real app, you might fetch this from package.json
    return '1.0.0';
  }

  /**
   * Send report to external service (placeholder)
   * In production, replace with actual error reporting service
   */
  private sendToExternalService(report: ErrorReport): void {
    // Example services you could integrate:
    // - Sentry: Sentry.captureException(error)
    // - LogRocket: LogRocket.captureException(error)
    // - Bugsnag: Bugsnag.notify(error)
    // - Custom API endpoint

    // For now, just store locally
    // You could also send to a custom endpoint:
    /*
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    }).catch(err => console.error('Failed to send error report:', err));
    */

    // Store in localStorage for persistence
    try {
      const existingReports = JSON.parse(localStorage.getItem('poldi_error_reports') || '[]');
      existingReports.unshift(report);
      if (existingReports.length > 20) {
        existingReports.splice(20);
      }
      localStorage.setItem('poldi_error_reports', JSON.stringify(existingReports));
    } catch (e) {
      // localStorage might not be available
      console.warn('Could not store error report in localStorage');
    }
  }

  /**
   * Get stored reports from localStorage
   */
  getStoredReports(): ErrorReport[] {
    try {
      return JSON.parse(localStorage.getItem('poldi_error_reports') || '[]');
    } catch (e) {
      return [];
    }
  }
}

// Create singleton instance
export const errorReporter = new ErrorReporter();

// Global error handler for uncaught errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorReporter.report(event.error || event.message, {
      url: event.filename || window.location.href
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorReporter.report(`Unhandled Promise Rejection: ${event.reason}`, {
      url: window.location.href
    });
  });
}

// Export convenience functions
export const reportError = errorReporter.report.bind(errorReporter);
export const reportNetworkError = errorReporter.reportNetworkError.bind(errorReporter);
export const reportExerciseError = errorReporter.reportExerciseError.bind(errorReporter);
