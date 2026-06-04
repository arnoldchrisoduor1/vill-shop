import { SetMetadata } from '@nestjs/common';

export const RAW_RESPONSE_KEY = 'rawResponse';

/**
 * Marks a route handler so the global ResponseInterceptor skips its
 * {success,message,data,code} envelope and returns the handler value verbatim.
 * Required for third-party callbacks (e.g. Pesapal IPN) that expect an exact
 * top-level JSON shape.
 */
export const RawResponse = () => SetMetadata(RAW_RESPONSE_KEY, true);
