export default function DynamicJSONViewer({ data }) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return <p className="text-[#9ca3af]">Nenhum dado disponível.</p>
  }

  const renderValue = (value) => {
    if (!value) return <span className="text-white italic">N/A</span>

    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return (
          <ul className="list-disc pl-5 text-sm text-white">
            {value.map((v, i) => (
              <li key={i}>{renderValue(v)}</li>
            ))}
          </ul>
        )
      } else {
        return (
          <div className="pl-4 border-l border-neutral-700 mt-2">
            {Object.entries(value).map(([key, val]) => (
              <div key={key} className="mb-2">
                <span className="text-[#9ca3af] text-sm">{key}:</span>{' '}
                <span className="text-white">{renderValue(val)}</span>
              </div>
            ))}
          </div>
        )
      }
    }

    return <span className="text-white">{String(value)}</span>
  }

  return (
    <div className="text-sm flex flex-col gap-2">
      {Object.entries(data).map(([key, value]) => (
        <div key={key}>
          <span className="text-[#9ca3af]">{key}:</span> {renderValue(value)}
        </div>
      ))}
    </div>
  )
}
