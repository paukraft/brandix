import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

const extensions = [
  '.com',
  '.org',
  '.net',
  '.info',
  '.biz',
  '.edu',
  '.gov',
  '.co',
  '.io',
  '.ai',
  '.me',
  '.us',
  '.uk',
  '.ca',
  '.de',
  '.fr',
  '.au',
  '.ru',
  '.cn',
  '.in',
  '.br',
  '.es',
  '.it',
  '.nl',
  '.se',
  '.ch',
  '.jp',
  '.kr',
  '.za',
  '.mx',
]

type Props = {
  extension: string
  setExtension: (extension: string) => void
}

export const DomainExtensionSelect = (props: Props) => {
  // return (
  //   <Input
  //     type="text"
  //     placeholder="Select an extension"
  //     value={props.extension}
  //     onChange={(e) => props.setExtension(e.target.value)}
  //     className="w-32 h-9"
  //   />
  // )

  return (
    <Select value={props.extension} onValueChange={props.setExtension}>
      <SelectTrigger className="w-[80px] h-9">
        <SelectValue placeholder="Select an extension" />
      </SelectTrigger>
      <SelectContent className="min-w-0">
        <SelectGroup>
          {extensions.map((extension) => (
            <SelectItem key={extension} value={extension}>
              {extension}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
