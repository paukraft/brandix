export const getUrlFromName = ({
  name,
  extension,
}: {
  name: string
  extension: string
}) => {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-]+/g, '') + extension
  )
}
