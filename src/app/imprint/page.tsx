export default function Home() {
  return (
    <div className="container mx-auto flex flex-col">
      <div className="flex flex-col w-full lg:w-1/2">
        <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium">
          Imprint
        </h1>
        <p className="mb-8 leading-relaxed">
          <strong>Company Name:</strong> KRAFT CARNE/JUNGHANS GbR <br />
          <strong>Legal Form:</strong> Gesellschaft bürgerlichen Rechts (GbR){' '}
          <br />
          <strong>Address:</strong> Albert-Einstein-Straße 19, Landau in der
          Pfalz, Germany <br />
          <strong>Contact Information:</strong>{' '}
          <a href="mailto:info@brandix.ai" className="text-indigo-500">
            info@brandix.ai
          </a>{' '}
          <br />
          <strong>Managing Partners:</strong> Pau Kraft and Frederik Junghans{' '}
          <br />
          <strong>Responsible for journalistic-editorial content:</strong>{' '}
          Frederik Junghans
        </p>
      </div>
    </div>
  )
}
