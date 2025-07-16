// Import commands.js using ES2015 syntax:
import './commands'

// Import global styles or setup here
import '../../src/app/globals.css' // Adjust path to your global CSS

// Example: Mount command for React components
import { mount } from 'cypress/react18'

Cypress.Commands.add('mount', mount)
