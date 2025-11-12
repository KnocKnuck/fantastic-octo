import { cn } from './utils'

describe('cn utility', () => {
  it('should merge classes correctly', () => {
    const result = cn('px-4', 'py-2', 'bg-blue-500')
    expect(result).toBe('px-4 py-2 bg-blue-500')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const result = cn('base-class', isActive && 'active-class')
    expect(result).toBe('base-class active-class')
  })

  it('should handle false conditional classes', () => {
    const isActive = false
    const result = cn('base-class', isActive && 'active-class')
    expect(result).toBe('base-class')
  })

  it('should merge conflicting Tailwind classes correctly', () => {
    // twMerge should keep the last value for conflicting utilities
    const result = cn('px-2 py-1', 'px-4')
    expect(result).toBe('py-1 px-4')
  })

  it('should handle array of classes', () => {
    const result = cn(['px-4', 'py-2'], 'bg-blue-500')
    expect(result).toBe('px-4 py-2 bg-blue-500')
  })

  it('should handle object notation', () => {
    const result = cn({
      'px-4': true,
      'py-2': true,
      'bg-blue-500': false,
    })
    expect(result).toBe('px-4 py-2')
  })

  it('should handle empty inputs', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('should handle null and undefined values', () => {
    const result = cn('px-4', null, undefined, 'py-2')
    expect(result).toBe('px-4 py-2')
  })

  it('should handle mixed input types', () => {
    const isActive = true
    const result = cn(
      'base-class',
      ['array-class-1', 'array-class-2'],
      {
        'object-class': true,
        'hidden-class': false,
      },
      isActive && 'active-class',
      'final-class'
    )
    expect(result).toContain('base-class')
    expect(result).toContain('array-class-1')
    expect(result).toContain('array-class-2')
    expect(result).toContain('object-class')
    expect(result).toContain('active-class')
    expect(result).toContain('final-class')
    expect(result).not.toContain('hidden-class')
  })

  it('should deduplicate classes', () => {
    const result = cn('px-4', 'py-2', 'px-4')
    // twMerge handles deduplication
    expect(result).toBe('py-2 px-4')
  })

  describe('Real-world scenarios', () => {
    it('should handle button variants', () => {
      const variant = 'primary'
      const size = 'lg'

      const result = cn(
        'rounded font-medium transition-colors',
        variant === 'primary' && 'bg-blue-500 text-white hover:bg-blue-600',
        size === 'lg' && 'px-6 py-3 text-lg'
      )

      expect(result).toContain('rounded')
      expect(result).toContain('bg-blue-500')
      expect(result).toContain('px-6')
    })

    it('should handle card with conditional states', () => {
      const isHovered = true
      const isSelected = false

      const result = cn(
        'border rounded-lg p-4',
        isHovered && 'shadow-lg scale-105',
        isSelected && 'border-blue-500'
      )

      expect(result).toContain('border')
      expect(result).toContain('shadow-lg')
      expect(result).not.toContain('border-blue-500')
    })

    it('should handle form input states', () => {
      const hasError = true
      const isDisabled = false

      const result = cn(
        'border px-3 py-2 rounded',
        hasError && 'border-red-500 focus:ring-red-500',
        isDisabled && 'bg-gray-100 cursor-not-allowed'
      )

      expect(result).toContain('border-red-500')
      expect(result).not.toContain('cursor-not-allowed')
    })
  })

  describe('Edge cases', () => {
    it('should handle very long class strings', () => {
      const longClassString = Array(100).fill('class').join(' ')
      const result = cn(longClassString)
      expect(typeof result).toBe('string')
    })

    it('should handle special characters in class names', () => {
      const result = cn('hover:bg-blue-500', 'focus:ring-2', 'md:px-4')
      expect(result).toContain('hover:bg-blue-500')
      expect(result).toContain('focus:ring-2')
      expect(result).toContain('md:px-4')
    })

    it('should handle arbitrary values', () => {
      const result = cn('bg-[#1da1f2]', 'w-[500px]')
      expect(result).toContain('bg-[#1da1f2]')
      expect(result).toContain('w-[500px]')
    })
  })
})
