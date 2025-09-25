import { OpenPanelComponent } from '@openpanel/nextjs'

export const TrackiTrack = () => {
  const clientId = process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID as
    | string
    | undefined
  if (!clientId) return null
  return (
    <>
      <OpenPanelComponent
        apiUrl="/api/op"
        clientId={clientId}
        trackScreenViews={true}
        trackOutgoingLinks={true}
      />
    </>
  )
}
