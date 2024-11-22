import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import * as canvg from 'canvg'
import { Download, Loader2 } from 'lucide-react'
import { PropsWithChildren, useMemo, useRef, useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

const COLOR_PRESETS = [
  { bg: '#E90101', stripe: '#D50100', text: '#FFFFFF', name: 'Red' },
  { bg: '#000000', stripe: '#1A1A1A', text: '#FFFFFF', name: 'Black' },
  { bg: '#0066FF', stripe: '#0052CC', text: '#FFFFFF', name: 'Blue' },
  { bg: '#4CAF50', stripe: '#388E3C', text: '#FFFFFF', name: 'Green' },
  { bg: '#9C27B0', stripe: '#7B1FA2', text: '#FFFFFF', name: 'Purple' },
  { bg: '#FF9800', stripe: '#F57C00', text: '#FFFFFF', name: 'Orange' },
  { bg: '#607D8B', stripe: '#455A64', text: '#FFFFFF', name: 'Gray' },
  { bg: '#795548', stripe: '#5D4037', text: '#FFFFFF', name: 'Brown' },
]

export default function JaguarLogoDialog({
  children,
  text: initialText,
}: PropsWithChildren<{
  text: string
}>) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedColors, setSelectedColors] = useState(COLOR_PRESETS[0])
  const [text, setText] = useState(initialText.trim())
  const [isDownloading, setIsDownloading] = useState(false)

  const fontSize = useMemo(() => {
    const SVG_WIDTH = 1080
    const PADDING = 80
    const LETTER_SPACING = 0.2
    const AVERAGE_CHAR_WIDTH = 0.6

    const availableWidth = SVG_WIDTH - PADDING * 2
    const totalChars = text.length
    const spacingGaps = totalChars - 1

    const fontSize =
      availableWidth /
      (totalChars * AVERAGE_CHAR_WIDTH + spacingGaps * LETTER_SPACING)

    return Math.min(260, Math.floor(fontSize))
  }, [text])

  const downloadPNG = async () => {
    if (!svgRef.current) return
    setIsDownloading(true)

    try {
      // Wait for font to be loaded
      await document.fonts.ready

      const canvas = document.createElement('canvas')
      canvas.width = 1080 * 2
      canvas.height = 1080 * 2

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const svgData = new XMLSerializer().serializeToString(svgRef.current)
      const v = await canvg.Canvg.fromString(ctx, svgData, {
        enableRedraw: true,
        ignoreMouse: true,
        ignoreAnimation: true,
        window: window,
      })

      await v.render()

      const pngUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = pngUrl
      link.download = `brandix.ai-${text}-jaguar-style-logo.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex flex-col gap-4 max-w-xl">
        <DialogHeader>
          <DialogTitle>Jaguar Logo Generator</DialogTitle>
          <DialogDescription>
            Generate a Jaguar style logo for your brand. Customize colors and
            download in high resolution.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="brand-name">Brand Name</Label>
          <Input
            id="brand-name"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your brand name"
          />
        </div>

        <div className="font-comfortaa">
          <svg
            ref={svgRef}
            viewBox="0 0 1080 1080"
            className="w-full aspect-square shadow-lg rounded-lg"
            style={{ fontFamily: 'var(--comfortaa)' }}
          >
            <defs>
              <style>
                @import
                url(&apos;https://fonts.googleapis.com/css2?family=Comfortaa:wght@400&display=swap&apos;);
              </style>
            </defs>
            <rect width="1080" height="1080" fill={selectedColors.bg} />
            <rect
              y="360"
              width="1080"
              height="360"
              fill={selectedColors.stripe}
            />
            <text
              x="540"
              y="540"
              dominantBaseline="middle"
              textAnchor="middle"
              fontSize={fontSize}
              fill={selectedColors.text}
              letterSpacing="0.2em"
              style={{ fontFamily: 'Comfortaa' }}
            >
              {text}
            </text>
          </svg>
        </div>

        <div className="space-y-2">
          <Label>Color Theme</Label>
          <div className="flex gap-2 flex-wrap justify-between">
            {COLOR_PRESETS.map((preset, i) => (
              <button
                key={i}
                className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                  selectedColors === preset
                    ? 'border-blue-500 scale-110'
                    : 'border-muted-foreground'
                }`}
                style={{ backgroundColor: preset.bg }}
                onClick={() => setSelectedColors(preset)}
                title={preset.name}
              />
            ))}
          </div>
        </div>

        <Button
          onClick={downloadPNG}
          disabled={isDownloading || !text.length}
          className="w-full"
        >
          {isDownloading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 w-4 h-4" />
          )}
          {isDownloading ? 'Generating PNG...' : 'Download PNG'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
