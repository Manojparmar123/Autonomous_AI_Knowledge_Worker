'use client'

export default function AnswerCard({title, children}: {title: string, children: any}) {
  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-2">
        {children}
      </div>
    </div>
  )
}
