import { describe, it, expect } from 'vitest';
import { hello } from './hello'; // Adjust the import based on your actual function location

describe('hello function', () => {
    it('should return "Hello, World!"', () => {
        expect(hello()).toBe('Hello, World!');
    });
});