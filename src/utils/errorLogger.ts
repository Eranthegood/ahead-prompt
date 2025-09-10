// Error logger to track and debug external script failures

interface ErrorEvent {
  message?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  error?: Error;
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private errors: ErrorEvent[] = [];

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupGlobalErrorHandlers();
    }
  }

  private setupGlobalErrorHandlers() {
    // Catch JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: `Unhandled promise rejection: ${event.reason}`,
        error: event.reason
      });
    });
  }

  private logError(errorEvent: ErrorEvent) {
    // Filter out known external script errors that we can't control
    const isExternalError = this.isExternalScriptError(errorEvent);
    
    if (isExternalError) {
      console.debug('External script error (filtered):', errorEvent.message);
      return;
    }

    // Log application errors normally
    console.error('Application error:', errorEvent);
    this.errors.push(errorEvent);
  }

  private isExternalScriptError(errorEvent: ErrorEvent): boolean {
    const message = errorEvent.message || '';
    const filename = errorEvent.filename || '';

    // Filter out known external scripts and browser extension errors
    const externalPatterns = [
      'web-client-content-script.js',
      'ERR_BLOCKED_BY_CLIENT',
      'Facebook-Pixel',
      'RudderStack',
      'RS SDK',
      'DeviceModeDestinationsPlugin',
      'MutationObserver',
      'chrome-extension://',
      'moz-extension://',
      'safari-extension://',
      'redditstatic.com',
      'mixpanel.com',
      'supademo.com'
    ];

    return externalPatterns.some(pattern => 
      message.includes(pattern) || filename.includes(pattern)
    );
  }

  getErrors(): ErrorEvent[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }
}

// Initialize error logger
export const errorLogger = ErrorLogger.getInstance();
export default errorLogger;