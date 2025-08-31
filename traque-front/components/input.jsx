import React from 'react'

export function TextInput({...props}) {
  return (
    <input {...props} type="text" className="block w-full h-full p-4 rounded text-center ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600" />
  )
}

export function TextArea({...props}) {
  return (
    <textarea {...props} className="block w-full h-full p-4 rounded text-center ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600" />
  )
}
