import trash from 'trash'

try {
  await trash('.test.txt')
} catch (error) {
  console.error(error)
}
