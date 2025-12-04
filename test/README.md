# Testing Guide

This project uses **Vitest** with React Testing Library for comprehensive testing.

## Test Structure

```
test/
├── setup.ts                      # Test configuration and global mocks
├── Header.test.tsx               # Header component tests
├── ImageUploader.test.tsx        # Image uploader component tests
├── ColorPicker.test.tsx          # Color picker component tests
├── ResultDisplay.test.tsx        # Result display component tests
├── Icons.test.tsx                # Icon components tests
├── fileUtils.test.ts             # File utility function tests
├── useAuth.test.ts               # Authentication hook tests
└── integration/
    └── App.integration.test.tsx  # Full app integration tests
```

## Running Tests

### Run all tests (watch mode)
```bash
npm test
```

### Run tests with UI
```bash
npm run test:ui
```

### Run tests with coverage report
```bash
npm run test:coverage
```

### Run tests in CI mode (single run)
```bash
npm test -- --run
```

## Test Coverage

The test suite covers:

- ✅ **Component Rendering** - All major components render correctly
- ✅ **User Interactions** - File uploads, button clicks, form inputs
- ✅ **State Management** - Loading states, data flow
- ✅ **Authentication** - Login/logout flows, session handling
- ✅ **Utilities** - File conversions, helper functions
- ✅ **Integration** - Full app workflow

## Mocked Services

The following services are mocked in tests:

- **Supabase Auth** - User authentication and session management
- **Supabase Database** - Data persistence operations
- **Gemini AI API** - Image and video generation
- **Browser APIs** - File uploads, share API, URL creation

## Writing New Tests

### Component Test Template

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { YourComponent } from '../components/YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText(/expected text/i)).toBeInTheDocument();
  });

  it('should handle user interaction', () => {
    const mockFn = vi.fn();
    render(<YourComponent onClick={mockFn} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockFn).toHaveBeenCalled();
  });
});
```

### Hook Test Template

```typescript
import { renderHook, waitFor } from '@testing-library/react';

describe('useYourHook', () => {
  it('should return expected value', async () => {
    const { result } = renderHook(() => useYourHook());
    
    await waitFor(() => {
      expect(result.current.value).toBe('expected');
    });
  });
});
```

## Best Practices

1. **Arrange-Act-Assert** - Structure tests clearly
2. **Descriptive Names** - Use clear test descriptions
3. **Mock External Dependencies** - Avoid actual API calls
4. **Test User Behavior** - Focus on what users do, not implementation
5. **Accessibility** - Use screen readers (getByRole, getByLabelText)

## Debugging Tests

### View test output in browser UI
```bash
npm run test:ui
```

### Debug specific test file
```bash
npm test -- Header.test.tsx
```

### Enable verbose logging
```bash
npm test -- --reporter=verbose
```

## Continuous Integration

Tests run automatically on:
- Pre-commit (via git hooks)
- Pull requests
- Deployment pipelines

Coverage thresholds:
- Statements: 70%
- Branches: 65%
- Functions: 70%
- Lines: 70%
