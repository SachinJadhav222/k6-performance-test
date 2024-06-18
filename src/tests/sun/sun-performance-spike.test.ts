/**
 * Spike testing involves simulating sudden and extreme increases in load to see how the system handles unexpected spikes in traffic.
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
    'reports/spike-summary.html': htmlReport(data, { debug: true }),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

/* Define the options for the spike test */
export let options = {
  stages: [
    { duration: '2s', target: 1 }, // Ramp up to 50 users
    { duration: '5s', target: 2 }, // Spike to 200 users
    { duration: '2s', target: 1 }, // Ramp down to 50 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'], // 95% of requests should be below 800ms
    errors: ['rate<0.02'], // Error rate should be less than 2%
  },
};

/* Define the main function that will be executed for each virtual user */
export default function () {
  let res = http.get(launch_url);

  /* Check the response status */
  let checkRes = check(res, {
    'is status 200': (r) => r.status === 200,
    'response time is less than 800ms': (r) => r.timings.duration < 800,
  });

  /* Track errors */
  if (!checkRes) {
    errorRate.add(1);
  }

  /* Add sleep to simulate real user wait times between requests */
  sleep(1);
}
