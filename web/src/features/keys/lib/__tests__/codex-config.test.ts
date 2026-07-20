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

import {
  buildCodexAuthJson,
  buildCodexConfig,
  buildCodexPowerShellSetup,
  buildCodexWindowsInstaller,
  normalizeCodexEndpoint,
} from '../codex-config'

describe('Codex client configuration', () => {
  test('normalizes the New API Responses endpoint once', () => {
    assert.equal(
      normalizeCodexEndpoint('https://api.example.com/'),
      'https://api.example.com/v1'
    )
    assert.equal(
      normalizeCodexEndpoint('https://api.example.com/v1/'),
      'https://api.example.com/v1'
    )
  })

  test('builds a complete portable config with command-backed auth', () => {
    const config = buildCodexConfig({
      endpoint: 'https://api.example.com',
      model: 'grok-4.5',
      providerName: 'Example',
    })

    assert.match(config, /model = "grok-4\.5"/)
    assert.match(config, /base_url = "https:\/\/api\.example\.com\/v1"/)
    assert.match(config, /wire_api = "responses"/)
    assert.match(config, /\[model_providers\.newapi\.auth\]/)
    assert.match(config, /ConvertFrom-Json\)\.OPENAI_API_KEY/)
    assert.match(config, /goals = true/)
    assert.match(config, /computer_use = true/)
    assert.match(config, /\[plugins\."browser@openai-bundled"\]/)
    assert.doesNotMatch(config, /requires_openai_auth\s*=\s*true/)
  })

  test('keeps the API key in auth.json and the installer merge only', () => {
    const apiKey = 'sk-example-secret'
    const config = buildCodexConfig({
      endpoint: 'https://api.example.com',
      model: 'grok-4.5',
      providerName: 'Example',
    })
    const auth = buildCodexAuthJson(apiKey)
    const setup = buildCodexPowerShellSetup({
      apiKey,
      endpoint: 'https://api.example.com',
      model: 'grok-4.5',
      providerName: 'Example',
    })

    assert.equal(JSON.parse(auth).OPENAI_API_KEY, apiKey)
    assert.doesNotMatch(config, new RegExp(apiKey))
    assert.match(setup, /Copy-Item.*\.bak/)
    assert.match(setup, /codex plugin add/)
    assert.match(setup, /codex doctor --summary/)
    assert.match(setup, /\$existing -split '\\r\?\\n'/)
    assert.match(setup, /\$line -match '\^\\s\*\\\[/)
    assert.doesNotMatch(setup, /requires_openai_auth\s*=\s*true/)

    const installer = buildCodexWindowsInstaller({
      apiKey,
      endpoint: 'https://api.example.com',
      model: 'grok-4.5',
      providerName: 'Example',
    })
    const encoded = installer.match(/-EncodedCommand ([A-Za-z0-9+/=]+)/)?.[1]
    assert.ok(encoded)
    assert.equal(Buffer.from(encoded, 'base64').toString('utf16le'), setup)
  })
})
