import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility function', () => {
    it('Harus menggabungkan dua string menjadi satu string', () => {
        expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('Harus menangani kelas kondisional dengan benar', () => {
        const isTrue = true;
        const isFalse = false;
        expect(cn('class1', isTrue && 'class2', isFalse && 'class3')).toBe('class1 class2');
    });

    it('Harus menangani input berupa objek dengan benar', () => {
        expect(cn('class1', { 'class2': true, 'class3': false })).toBe('class1 class2');
    });

    it('Harus menggabungkan kelas tailwind dengan benar sambil menimpa kelas yang tumpang tindih', () => {
        // p-4 overrides px-2 and py-2
        expect(cn('px-2 py-2', 'p-4')).toBe('p-4');
        
        // text-blue-500 overrides text-red-500
        expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });


});
