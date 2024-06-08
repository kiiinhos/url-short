import { NodeSDK } from '@opentelemetry/sdk-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

const jaegerExporter = new JaegerExporter({
  endpoint: process.env.JAEGER_URL,
});

const sdk = new NodeSDK({
  spanProcessor: new SimpleSpanProcessor(jaegerExporter),
  instrumentations: [],
});

sdk.start();


export default sdk;
