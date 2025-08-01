/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
// scripts/test-runner.js
const { spawn } = require('child_process')
const path = require('path')

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
}

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

const runCommand = (command, args = []) => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd(),
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve(code)
      } else {
        reject(new Error(`Command failed with code ${code}`))
      }
    })

    child.on('error', reject)
  })
}

const testSuites = {
  lint: {
    name: 'ESLint',
    command: 'npm run lint',
    description: 'Running linting checks...',
  },
  typecheck: {
    name: 'TypeScript',
    command: 'npx tsc --noEmit',
    description: 'Running type checks...',
  },
  unit: {
    name: 'Unit Tests',
    command: 'npm run test:components',
    description: 'Running component tests...',
  },
  api: {
    name: 'API Tests',
    command: 'npm run test:api',
    description: 'Running API tests...',
  },
  integration: {
    name: 'Integration Tests',
    command: 'npm test -- --testPathPattern=integration',
    description: 'Running integration tests...',
  },
  coverage: {
    name: 'Coverage Report',
    command: 'npm run test:coverage',
    description: 'Generating coverage report...',
  },
}

async function runTestSuite(suiteKey) {
  const suite = testSuites[suiteKey]

  log(`\n${suite.description}`, 'cyan')
  log(`Command: ${suite.command}`, 'blue')

  const startTime = Date.now()

  try {
    await runCommand(suite.command)
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    log(`✅ ${suite.name} passed (${duration}s)`, 'green')
    return true
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    log(`❌ ${suite.name} failed (${duration}s)`, 'red')
    log(`Error: ${error.message}`, 'red')
    return false
  }
}

async function runAllTests() {
  const startTime = Date.now()
  const results = {}

  log('🧪 Starting Test Suite', 'bold')
  log('=' * 50, 'blue')

  // Run tests in order
  const testOrder = ['lint', 'typecheck', 'unit', 'api', 'integration']

  for (const suiteKey of testOrder) {
    results[suiteKey] = await runTestSuite(suiteKey)

    // Stop on first failure unless --continue flag is passed
    if (!results[suiteKey] && !process.argv.includes('--continue')) {
      log('\n🛑 Stopping on first failure. Use --continue to run all tests.', 'yellow')
      break
    }
  }

  // Generate summary
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2)
  const passed = Object.values(results).filter(Boolean).length
  const total = Object.keys(results).length

  log('\n📊 Test Summary', 'bold')
  log('=' * 50, 'blue')

  Object.entries(results).forEach(([suite, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL'
    const color = passed ? 'green' : 'red'
    log(`${status} ${testSuites[suite].name}`, color)
  })

  log(`\nTotal: ${passed}/${total} suites passed`, passed === total ? 'green' : 'red')
  log(`Time: ${totalTime}s`, 'blue')

  if (passed === total) {
    log('\n🎉 All tests passed!', 'green')
    process.exit(0)
  } else {
    log('\n💥 Some tests failed!', 'red')
    process.exit(1)
  }
}

async function runSpecificTest(testPattern) {
  log(`🔍 Running tests matching: ${testPattern}`, 'cyan')

  try {
    await runCommand(`npm test -- --testNamePattern="${testPattern}"`)
    log('✅ Tests completed successfully', 'green')
  } catch (error) {
    log('❌ Tests failed', 'red')
    process.exit(1)
  }
}

async function runWatchMode() {
  log('👀 Starting test watch mode...', 'cyan')
  log('Press q to quit, a to run all tests, f to run only failed tests', 'yellow')

  try {
    await runCommand('npm run test:watch')
  } catch (error) {
    log('❌ Watch mode failed', 'red')
    process.exit(1)
  }
}

// CLI handling
const args = process.argv.slice(2)
const command = args[0]

switch (command) {
  case 'all':
    runAllTests()
    break

  case 'watch':
    runWatchMode()
    break

  case 'coverage':
    runTestSuite('coverage')
    break

  case 'lint':
    runTestSuite('lint')
    break

  case 'type':
    runTestSuite('typecheck')
    break

  case 'unit':
    runTestSuite('unit')
    break

  case 'api':
    runTestSuite('api')
    break

  case 'integration':
    runTestSuite('integration')
    break

  case 'search':
    if (args[1]) {
      runSpecificTest(args[1])
    } else {
      log('❌ Please provide a test pattern: npm run test:search "pattern"', 'red')
      process.exit(1)
    }
    break

  case 'help':
  case '--help':
  case '-h':
    log('🧪 Test Runner Commands:', 'bold')
    log('')
    log('npm run test:runner all        Run all test suites', 'blue')
    log('npm run test:runner watch      Start watch mode', 'blue')
    log('npm run test:runner coverage   Generate coverage report', 'blue')
    log('npm run test:runner lint       Run linting only', 'blue')
    log('npm run test:runner type       Run type checking only', 'blue')
    log('npm run test:runner unit       Run unit tests only', 'blue')
    log('npm run test:runner api        Run API tests only', 'blue')
    log('npm run test:runner integration Run integration tests only', 'blue')
    log('npm run test:runner search <pattern> Run tests matching pattern', 'blue')
    log('')
    log('Flags:', 'yellow')
    log('--continue    Continue running tests after failures', 'yellow')
    log('')
    break

  default:
    if (command) {
      log(`❌ Unknown command: ${command}`, 'red')
      log('Run "npm run test:runner help" for available commands', 'yellow')
      process.exit(1)
    } else {
      // Default to running all tests
      runAllTests()
    }
}
