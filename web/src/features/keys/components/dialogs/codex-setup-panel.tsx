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
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  CodeBlock,
  CodeBlockCopyButton,
} from '@/components/ai-elements/code-block'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  buildCodexAuthJson,
  buildCodexConfig,
  buildCodexPowerShellSetup,
  buildCodexWindowsInstaller,
} from '@/features/keys/lib/codex-config'
import { copyToClipboard } from '@/lib/copy-to-clipboard'

import { codexSetupLayoutClasses } from './codex-setup-layout'

type Props = {
  apiKey: string
  endpoint: string
  model: string
  providerName: string
}

export function CodexSetupPanel(props: Props) {
  const { t } = useTranslation()
  const [activeFile, setActiveFile] = useState('config')
  const options = useMemo(
    () => ({
      apiKey: props.apiKey,
      endpoint: props.endpoint,
      model: props.model,
      providerName: props.providerName,
    }),
    [props.apiKey, props.endpoint, props.model, props.providerName]
  )
  const config = useMemo(() => buildCodexConfig(options), [options])
  const auth = useMemo(() => buildCodexAuthJson(props.apiKey), [props.apiKey])
  const setup = useMemo(() => buildCodexPowerShellSetup(options), [options])

  const copyConfig = async () => {
    const copied = await copyToClipboard(config)
    if (copied) toast.success(t('Complete Codex configuration copied'))
  }

  const downloadInstaller = () => {
    const installer = buildCodexWindowsInstaller(options)
    const blob = new Blob([installer], {
      type: 'application/x-msdos-program;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'configure-newapi-codex.cmd'
    anchor.click()
    URL.revokeObjectURL(url)
    toast.success(t('Codex setup program downloaded'))
  }

  return (
    <div className='space-y-4'>
      <div className='border-border bg-muted/35 space-y-1.5 border px-3 py-2.5 text-sm'>
        <p className='font-medium'>{t('Complete Codex setup')}</p>
        <p className='text-muted-foreground text-xs leading-5'>
          {t(
            'The installer backs up and merges your existing files, configures command-backed authentication, enables Goals, and installs the Browser, Chrome, Computer Use, and Visualize plugins.'
          )}
        </p>
        <p className='text-muted-foreground text-xs leading-5'>
          {t(
            'Codex Desktop generates machine-specific marketplace paths, browser pipes, notifications, and MCP runtimes on each computer, so those paths are intentionally not copied.'
          )}
        </p>
      </div>

      <div className={codexSetupLayoutClasses.actionGroup}>
        <Button
          onClick={downloadInstaller}
          className={codexSetupLayoutClasses.actionButton}
        >
          {t('Download one-click Codex setup')}
        </Button>
        <Button
          variant='outline'
          onClick={copyConfig}
          className={codexSetupLayoutClasses.actionButton}
        >
          {t('Copy complete config.toml')}
        </Button>
      </div>

      <p className='text-muted-foreground text-xs leading-5'>
        {t(
          'Run the downloaded program once, then restart Codex Desktop and Codex CLI. The API key is written to auth.json and is not embedded in config.toml.'
        )}
      </p>
      <p className='text-warning text-xs leading-5'>
        {t(
          'The downloaded setup file contains the selected API key. Keep it private and delete it after use.'
        )}
      </p>

      <Tabs value={activeFile} onValueChange={setActiveFile}>
        <TabsList className={codexSetupLayoutClasses.tabs}>
          <TabsTrigger value='config'>config.toml</TabsTrigger>
          <TabsTrigger value='auth'>auth.json</TabsTrigger>
          <TabsTrigger value='setup'>PowerShell</TabsTrigger>
        </TabsList>
        <TabsContent value='config'>
          <CodeBlock
            code={config}
            filename='config.toml'
            language='toml'
            maxExpandedLines={18}
            showLineNumbers
          >
            <CodeBlockCopyButton />
          </CodeBlock>
        </TabsContent>
        <TabsContent value='auth'>
          <div className='space-y-2'>
            <p className='text-warning text-xs leading-5'>
              {t(
                'This file contains the selected API key. Only copy it to your own Codex configuration directory.'
              )}
            </p>
            <CodeBlock
              code={auth}
              filename='auth.json'
              language='json'
              maxExpandedLines={12}
              showLineNumbers
            >
              <CodeBlockCopyButton />
            </CodeBlock>
          </div>
        </TabsContent>
        <TabsContent value='setup'>
          <CodeBlock
            code={setup}
            filename='configure-newapi-codex.ps1'
            language='powershell'
            maxExpandedLines={18}
            showLineNumbers
          >
            <CodeBlockCopyButton />
          </CodeBlock>
        </TabsContent>
      </Tabs>
    </div>
  )
}
