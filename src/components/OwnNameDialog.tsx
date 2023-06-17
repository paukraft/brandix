import { cn } from '@/lib/utils'
import { TextCursorInput } from 'lucide-react'
import { useState } from 'react'
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
}

export const OwnNameDialog = ({ createNewDomain }: Props) => {
  const [name, setName] = useState('')
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')

  const submitIsDisabled = name.length === 0

  const handlAdd = () => {
    if (submitIsDisabled) {
      createNewDomain(name)
      setName('')
      setOpen(false)
      setError('')
    } else {
      setError('At least one character is required')
    }
  }

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
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <TextCursorInput size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a Custom Name</DialogTitle>
          <DialogDescription>
            Is there a name floating in your head? Add it here, and we will
            check its availability for you.
          </DialogDescription>
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
            Add to List
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
