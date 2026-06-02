export type CrudAction =
  | 'CREATE'
  | 'READ'
  | 'LIST'
  | 'UPDATE'
  | 'DELETE'
  | 'AUTH'
  | 'ACTION';

const AUTH_PATTERNS = ['login', 'logout', 'register', 'changepassword'];

const LIST_PATTERNS = ['findall', 'getall', 'getcustomers', 'getinventory', 'getreports', 'getdashboard', 'getstats'];

const ACTION_PATTERNS = [
  'initiate',
  'callback',
  'refund',
  'webhook',
  'merge',
  'sync',
  'reorder',
  'subscribe',
  'download',
  'export',
  'unban',
  'ban',
];

function normalizeHandler(handlerName: string): string {
  return handlerName.replace(/[^a-zA-Z]/g, '').toLowerCase();
}

function matchesAny(value: string, patterns: string[]): boolean {
  return patterns.some((pattern) => value.includes(pattern));
}

export function resolveCrudAction(httpMethod: string, handlerName: string): CrudAction {
  const handler = normalizeHandler(handlerName);

  if (matchesAny(handler, AUTH_PATTERNS)) return 'AUTH';
  if (matchesAny(handler, ACTION_PATTERNS)) return 'ACTION';
  if (matchesAny(handler, LIST_PATTERNS)) return 'LIST';

  switch (httpMethod.toUpperCase()) {
    case 'GET':
    case 'HEAD':
    case 'OPTIONS':
      return 'READ';
    case 'POST':
      return 'CREATE';
    case 'PUT':
    case 'PATCH':
      return 'UPDATE';
    case 'DELETE':
      return 'DELETE';
    default:
      return 'READ';
  }
}
