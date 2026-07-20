/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { codexSetupLayoutClasses } from '../codex-setup-layout'

describe('Codex setup dialog layout', () => {
  test('stacks primary actions on mobile and aligns them on wider screens', () => {
    const groupClasses = codexSetupLayoutClasses.actionGroup.split(' ')
    const buttonClasses = codexSetupLayoutClasses.actionButton.split(' ')

    assert.ok(groupClasses.includes('flex-col'))
    assert.ok(groupClasses.includes('sm:flex-row'))
    assert.ok(buttonClasses.includes('sm:flex-1'))
  })

  test('allows configuration tabs to wrap without horizontal overflow', () => {
    const tabClasses = codexSetupLayoutClasses.tabs.split(' ')

    assert.ok(tabClasses.includes('max-w-full'))
    assert.ok(tabClasses.includes('flex-wrap'))
    assert.ok(tabClasses.includes('group-data-horizontal/tabs:h-auto'))
  })
})
