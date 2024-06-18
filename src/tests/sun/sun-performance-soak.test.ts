/**
 * Soak testing (or endurance testing) involves running the system at a normal load for an extended period to identify issues like memory leaks or resource depletion.
 *
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

/* application url */
const launch_url = 'https://www.thesun.co.uk/fabulous/28190615/cheatham-family-multiple-children-social-media/';

/* Define performance thresholds */
export let errorRate = new Rate('errors');

/* html reports */
export function handleSummary(data) {
  return {
    'reports/soak-summary.html': htmlReport(data, { debug: true }),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

/* Define the options for the soak test */
export let options = {
  stages: [
    { duration: '10m', target: 100 }, // Steady load of 100 users for 10 minutes
  ],
  thresholds: {
    http_req_duration: ['p(95)<600'], // 95% of requests should be below 600ms
    errors: ['rate<0.01'], // Error rate should be less than 1%
  },
};

/* Define the main function that will be executed for each virtual user */
export default function () {
  let res = http.get(launch_url);

  /* Check the response status */
  let checkRes = check(res, {
    'is status 200': (r) => r.status === 200,
    'response time is less than 600ms': (r) => r.timings.duration < 600,
  });

  /* Track errors */
  if (!checkRes) {
    errorRate.add(1);
  }

  /* Add sleep to simulate real user wait times between requests */
  sleep(1);
}
