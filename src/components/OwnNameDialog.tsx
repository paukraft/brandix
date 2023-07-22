import { cn } from '@/lib/utils'
import { PropsWithChildren, useCallback, useMemo, useState } from 'react'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Input } from './ui/input'

type Props = {
  createNewDomain: (name: string) => void
  title?: string
  description?: string
  applyButtonLabel?: string
}

export const OwnNameDialog = ({
  createNewDomain,
  children,
  title = 'Add a Custom Name',
  description = 'Is there a name floating in your head? Add it here, and we will check its availability for you.',
  applyButtonLabel = 'Add to List',
}: PropsWithChildren<Props>) => {
  const [name, setName] = useState('')
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')

  const submitIsDisabled = useMemo(() => name.length === 0, [name])

  const handlAdd = useCallback(() => {
    if (name.length === 0) {
      setError('Name cannot be empty')
      return
    }
    createNewDomain(name)
    setName('')
    setError('')
    setOpen(false)
  }, [name, createNewDomain])

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (isOpen) {
          setName('')
          setError('')
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form
          className="grid w-full max-w-sm items-center gap-1 py-1"
          onSubmit={(e) => {
            e.preventDefault()
            handlAdd()
          }}
        >
          <label htmlFor="name" className="text-sm">
            Name
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={cn(error !== '' && 'border-red-700')}
          />
          <p className="text-sm text-red-700">{error}</p>
        </form>
        <DialogFooter>
          <Button onClick={handlAdd} disabled={submitIsDisabled}>
            {applyButtonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
