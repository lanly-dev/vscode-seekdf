import * as assert from 'assert'

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode'
import { searchFolders } from '../actions'

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.')

  test('Sample test', () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5))
    assert.strictEqual(-1, [1, 2, 3].indexOf(0))
  })

  test('searchFolders command', async () => {
    const targetName = 'targetName'
    const folders = await searchFolders(null, targetName)
    assert.ok(Array.isArray(folders), 'Expected folders to be an array')
    // Add more assertions based on expected behavior
  })
})
