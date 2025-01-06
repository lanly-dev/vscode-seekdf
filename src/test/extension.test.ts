import * as assert from 'assert'

import * as vscode from 'vscode'
import { seek } from '../actions'
import { TargetType } from '../interfaces'

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.')

  test('Sample test', () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5))
    assert.strictEqual(-1, [1, 2, 3].indexOf(0))
  })

  test('seekDirs command', async () => {
    const targetName = 'targetName'
    const folders = await seek(targetName, TargetType.DIR)
    assert.ok(Array.isArray(folders), 'Expected folders to be an array')
    // Add more assertions based on expected behavior
  })
})
