import ExampleLogo from '@/assets/brandix.ai-nothing-jaguar-style-logo.png'
import JaguarLogoDialog from '@/components/jaguar-logo-dialog'
import { Button } from '@/components/ui/button'
import { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Free Jaguar Style Logo Generator | Brandix.ai',
  description:
    'Create stunning Jaguar-inspired logos for your brand in seconds. Customize colors, download in high resolution, and get a professional look - all for free.',
  openGraph: {
    title: 'Free Jaguar Style Logo Generator | Brandix.ai',
    description:
      'Create stunning Jaguar-inspired logos for your brand in seconds. Customize colors and download in high resolution.',
  },
}

export default function JaguarLogoGenerator() {
  return (
    <div className="container mx-auto flex flex-col gap-8 px-4 py-8 md:py-16">
      {/* Hero Section - Improved mobile spacing */}
      <div className="flex flex-col items-center text-center gap-4 md:gap-6 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight">
          Create Your Jaguar-Inspired Logo
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl">
          Design a professional, elegant logo inspired by the iconic Jaguar
          brand style. Customize colors and download your logo in high
          resolution - completely free.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-2 md:mt-4">
          <JaguarLogoDialog text="YOUR BRAND">
            <Button size="lg" className="w-full sm:w-auto text-base md:text-lg">
              Create Your Logo
            </Button>
          </JaguarLogoDialog>

          <span className="text-sm sm:text-base text-muted-foreground">
            or check our example below
          </span>
        </div>
      </div>

      {/* Example Section - Improved mobile layout */}
      <div className="relative w-full max-w-4xl mx-auto mt-8 md:mt-20">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-transparent to-red-500/10 dark:from-red-500/5 dark:to-red-500/5 blur-3xl -z-10" />
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
          {/* Text content - Reordered for mobile */}
          <div className="flex flex-col gap-4 md:gap-6 order-2 md:order-1">
            <h2 className="text-2xl md:text-3xl font-bold">Example Design</h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Our Jaguar-style logo generator creates elegant, minimalist
              designs with perfect typography and spacing. Choose from various
              color themes or customize your own to match your brand identity.
            </p>
            <div className="flex flex-row md:flex-col gap-4 md:gap-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-red-600" />
                <span className="text-xs md:text-sm text-muted-foreground">
                  Classic Red Theme
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-red-800" />
                <span className="text-xs md:text-sm text-muted-foreground">
                  Elegant Stripe Pattern
                </span>
              </div>
            </div>
          </div>

          {/* Image - Reordered for mobile */}
          <div className="relative aspect-square w-full max-w-sm mx-auto order-1 md:order-2">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent rounded-2xl -z-10" />
            <Image
              src={ExampleLogo}
              alt="Example Jaguar-style logo showing the word 'nothing' in elegant typography"
              fill
              className="object-contain p-4 md:p-8"
              priority
              sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 500px"
            />
          </div>
        </div>
      </div>

      {/* Features Grid - Improved mobile layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-12 md:mt-20">
        {features.map((feature, index) => (
          <div
            key={index}
            className="p-4 md:p-6 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg md:text-xl font-semibold mb-2">
              {feature.title}
            </h3>
            <p className="text-sm md:text-base text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* How It Works Section - Improved mobile layout */}
      <div className="mt-12 md:mt-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8">
          How It Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg md:text-xl font-bold mb-3 md:mb-4">
                {index + 1}
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">
                {step.title}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const features = [
  {
    title: 'Professional Design',
    description:
      'Create elegant, Jaguar-inspired logos that give your brand a premium feel.',
  },
  {
    title: 'Custom Colors',
    description:
      'Choose from carefully selected color combinations or create your own palette.',
  },
  {
    title: 'High Resolution',
    description:
      'Download your logo in high-quality PNG format, perfect for both digital and print.',
  },
]

const steps = [
  {
    title: 'Enter Your Brand Name',
    description:
      'Type in your brand name to see it transformed into a Jaguar-style logo.',
  },
  {
    title: 'Customize Colors',
    description:
      'Select from our preset color themes or customize to match your brand.',
  },
  {
    title: 'Download & Use',
    description:
      'Get your logo in high resolution PNG format, ready to use anywhere.',
  },
]
