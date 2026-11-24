import { defineConfig } from 'vitest/config'

// Config separada: los tests son de lógica pura y no necesitan los plugins de MDX/React.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
