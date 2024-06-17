/**
 * Load testing simulates a typical load on the system to ensure it can handle expected traffic.
 * It helps identify performance bottlenecks and ensure the system's stability under normal conditions.
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

/* application url */
const launch_url = 'https://www.thesun.co.uk/fabulous/28190615/cheatham-family-multiple-children-social-media/';

/* Define performance thresholds */
export let errorRate = new Rate('errors');

/* Define the options for the load test */
export let options = {
  stages: [
    { duration: '1m', target: 50 }, // Ramp-up to 50 users over 1 minute
    { duration: '3m', target: 50 }, // Stay at 50 users for 3 minutes
    { duration: '1m', target: 100 }, // Ramp-up to 100 users over 1 minute
    { duration: '3m', target: 100 }, // Stay at 100 users for 3 minutes
    { duration: '1m', target: 0 }, // Ramp-down to 0 users over 1 minute
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    errors: ['rate<0.01'], // Error rate should be less than 1%
  },
};

/* Define the main function that will be executed for each virtual user */
export default function () {
  let res = http.get(launch_url);

  /* Check the response status */
  let checkRes = check(res, {
    'is status 200': (r) => r.status === 200,
    'response time is less than 500ms': (r) => r.timings.duration < 500,
  });

  /* Track errors */
  if (!checkRes) {
    errorRate.add(1);
  }

  /* Add sleep to simulate real user wait times between requests */
  sleep(1);
}
