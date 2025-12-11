# Load Testing Guide for Shelterly

This directory contains load testing configurations using Artillery to test how many concurrent users your website can handle.

## Available Tests

### 1. Quick Test (1 minute)
```bash
npm run load-test:quick
```
- **Duration**: 1 minute
- **Load**: 20 users/second
- **Purpose**: Quick sanity check of website performance

### 2. Basic Load Test (6.5 minutes)
```bash
npm run load-test:basic
```
- **Phases**:
  - Warm-up: 10 users/sec for 30 seconds
  - Ramp-up: 10→50 users/sec over 2 minutes
  - Sustained: 50 users/sec for 3 minutes
  - Spike: 100 users/sec for 1 minute
- **Purpose**: Comprehensive test simulating realistic traffic patterns

### 3. Stress Test (4.5 minutes)
```bash
npm run load-test:stress
```
- **Phases**: Gradually increases from 10→300 users/second
- **Purpose**: Find the breaking point of your website

### 4. Generate HTML Report
```bash
npm run load-test:report
```
- Runs basic load test and generates a detailed HTML report

## Understanding Results

### Key Metrics to Watch:

1. **Response Time (p95, p99)**
   - p95: 95% of requests complete within this time
   - p99: 99% of requests complete within this time
   - Target: p95 < 2000ms, p99 < 5000ms

2. **Error Rate**
   - Percentage of failed requests
   - Target: < 1% for normal load, < 5% for stress tests

3. **Requests Per Second (RPS)**
   - How many requests your site handles per second
   - Higher is better

4. **HTTP Status Codes**
   - 2xx: Success ✅
   - 4xx: Client errors (check your routes)
   - 5xx: Server errors (performance issues)

## Interpreting Results

### Good Performance:
- ✅ p95 < 2 seconds
- ✅ Error rate < 1%
- ✅ Consistent response times during sustained load

### Warning Signs:
- ⚠️ p95 > 3 seconds
- ⚠️ Error rate 1-5%
- ⚠️ Response times increasing during sustained load

### Critical Issues:
- ❌ p95 > 5 seconds
- ❌ Error rate > 5%
- ❌ Frequent 5xx errors
- ❌ Timeouts

## Customizing Tests

Edit the `.yml` files to:
- Change target URL (currently: https://shelterly.vercel.app)
- Adjust load phases (duration, arrivalRate)
- Modify scenarios to test specific user flows
- Add authentication if needed

## Tips

1. **Start Small**: Run `quick-test` first to ensure everything works
2. **Monitor Vercel Dashboard**: Watch your Vercel analytics during tests
3. **Check Firebase**: Monitor Firebase usage and quotas
4. **Test During Off-Peak**: Avoid testing during high-traffic periods
5. **Gradual Increase**: Use stress test to find your limits safely

## Example Output

```
Summary report @ 19:30:00(+0530)
  Scenarios launched:  3000
  Scenarios completed: 2950
  Requests completed:  8850
  Mean response/sec: 147.5
  Response time (msec):
    min: 45
    max: 3421
    median: 234
    p95: 1567
    p99: 2341
  Scenario counts:
    Homepage Visit: 1200 (40%)
    Browse Listings: 900 (30%)
    View Single Listing: 600 (20%)
    Static Assets: 300 (10%)
  Codes:
    200: 8750
    404: 100
```

## Troubleshooting

- **High error rates**: Check Vercel function logs
- **Slow response times**: Consider upgrading Vercel plan or optimizing code
- **Connection timeouts**: May indicate rate limiting or server overload
