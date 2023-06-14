import { type PropsWithChildren } from 'react'

export const Hr = ({ children }: PropsWithChildren) => {
  return (
    <div className="relative flex py-5 items-center">
      <div className="flex-grow border-t border-input"></div>
      {children && (
        <span className="flex-shrink mx-2 text-gray-400 text-xs">
          {children}
        </span>
      )}
      <div className="flex-grow border-t border-input"></div>
    </div>
  )
}
