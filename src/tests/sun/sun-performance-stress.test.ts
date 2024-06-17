/**
 * Stress testing involves pushing the system to its limits
 * to see how it handles high traffic or data processing loads.
 * The goal is to identify the breaking point and understand how the system fails.
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

/* application url */
const launch_url = 'https://www.thesun.co.uk/fabulous/28190615/cheatham-family-multiple-children-social-media/';

/* Define performance thresholds */
export let errorRate = new Rate('errors');

/* Define the options for the stress test */
export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 200 }, // Stress the system with 200 users
    { duration: '2m', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests should be below 1000ms
    errors: ['rate<0.05'], // Error rate should be less than 5%
  },
};

/* Define the main function that will be executed for each virtual user */
export default function () {
  let res = http.get(launch_url);

  /* Check the response status */
  let checkRes = check(res, {
    'is status 200': (r) => r.status === 200,
    'response time is less than 1000ms': (r) => r.timings.duration < 1000,
  });

  /* Track errors */
  if (!checkRes) {
    errorRate.add(1);
  }

  /* Add sleep to simulate real user wait times between requests */
  sleep(1);
}
