import AppScreenshotDesktopDark from '@/assets/app-screenshot-desktop-dark-compressed.webp'
import AppScreenshotDesktopLight from '@/assets/app-screenshot-desktop-light-compressed.webp'
import AppScreenshotMobileDark from '@/assets/app-screenshot-mobile-dark-compressed.webp'
import AppScreenshotMobileLight from '@/assets/app-screenshot-mobile-light-compressed.webp'
import Image from 'next/image'

export const LandingScreenshot = () => {
  return (
    <div className="relative isolate -mb-80 sm:-mb-96 md:-mb-56 -z-10 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mt-10 flow-root sm:mt-12">
          <div className="-m-2 rounded-xl dark:bg-gray-100/5 bg-gray-900/5 p-2 ring-1 ring-inset dark:ring-gray-100/5 ring-gray-900/5 lg:-m-4 lg:rounded-2xl lg:p-3">
            <Image
              src={AppScreenshotDesktopDark}
              alt="Dark theme desktop version of our AI brand name generator"
              // width="4944"
              // height="2811"
              width="2966"
              height="1686"
              className="hidden md:dark:block rounded-md shadow-2xl ring-1 dark:ring-gray-100/10 ring-gray-900/10 max-md:hidden"
            />
            <Image
              src={AppScreenshotMobileDark}
              alt="Dark theme mobile version of our AI brand name generator"
              // width="1170"
              // height="2532"
              width="702"
              height="1519"
              className="hidden max-md:dark:block rounded-md shadow-2xl ring-1 dark:ring-gray-100/10 ring-gray-900/10 md:hidden"
            />
            <Image
              src={AppScreenshotDesktopLight}
              alt="Light theme desktop version of our AI brand name generator"
              // width="4944"
              // height="2811"
              width="2966"
              height="1686"
              className="dark:hidden rounded-md shadow-2xl ring-1 dark:ring-gray-100/10 ring-gray-900/10 max-md:hidden"
            />
            <Image
              src={AppScreenshotMobileLight}
              alt="Light theme mobile version of our AI brand name generator"
              // width="1170"
              // height="2532"
              width="702"
              height="1519"
              className="dark:hidden rounded-md shadow-2xl ring-1 dark:ring-gray-100/10 ring-gray-900/10 md:hidden"
            />
          </div>
        </div>
      </div>
      <div className="translate-y-12 h-full w-full absolute bottom-0 bg-gradient-to-b from-transparent to-white to-70% dark:to-slate-950" />
    </div>
  )
}
