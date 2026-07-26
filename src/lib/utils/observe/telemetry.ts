import { resourceFromAttributes } from '@opentelemetry/resources';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { LoggerProvider, BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { logs, SeverityNumber } from "@opentelemetry/api-logs";

export function initializeTelemetry() {
    const exporter = new OTLPTraceExporter({
        url: import.meta.env.VITE_OTEL_EXPORT_URL + "/v1/traces",
    });

    const provider = new WebTracerProvider({
        resource: resourceFromAttributes({
            'service.name': 'euler-web-ui',
        }),
        spanProcessors: [
            new BatchSpanProcessor(exporter)
        ]
    });

    provider.register({
        contextManager: new ZoneContextManager()
    });

    registerInstrumentations({
        instrumentations: [
            new DocumentLoadInstrumentation(),
            new FetchInstrumentation({
                propagateTraceHeaderCorsUrls: [
                    new RegExp(`^${import.meta.env.VITE_APP_API_URL}`)
                ]
            }),
        ],
    });

    const logExporter = new OTLPLogExporter({
        url: import.meta.env.VITE_OTEL_EXPORT_URL + "/v1/logs",
    });

    const loggerProvider = new LoggerProvider({
        resource: resourceFromAttributes({
            'service.name': 'euler-web-ui',
        }),
        processors: [new BatchLogRecordProcessor(logExporter)]
    })

    logs.setGlobalLoggerProvider(loggerProvider);

    console.log("OpenTelemetry Web initialized");
}

export const logger = {
    trace: (body: string) => emitLog(body, SeverityNumber.TRACE),
    info: (body: string) => emitLog(body, SeverityNumber.INFO),
    warn: (body: string) => emitLog(body, SeverityNumber.WARN),
    error: (body: string) => emitLog(body, SeverityNumber.ERROR),
}

function emitLog(body: string, severity: SeverityNumber) {
    const logger = logs.getLogger("euler-web-ui");

    if (import.meta.env.DEV) {
        switch (severity) {
            case SeverityNumber.TRACE:
                console.log(body);
                break;
            case SeverityNumber.INFO:
                console.info(body);
                break;
            case SeverityNumber.WARN:
                console.warn(body);
                break;
            case SeverityNumber.ERROR:
                console.error(body);
                break;
        }
    }

    logger.emit({
        body: body,
        severityNumber: severity,
        timestamp: new Date()
    });
}