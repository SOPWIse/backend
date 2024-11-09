export interface DatabaseHealthCheck {
  status: 'up' | 'down';
  connection?: string;
  error?: string;
}

export interface HealthCheckResponse {
  db: DatabaseHealthCheck;
}
