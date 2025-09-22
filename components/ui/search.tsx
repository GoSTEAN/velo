import { SearchIcon } from 'lucide-react'
import React from 'react'

export default function Search() {
  return (
    <div className='w-full max-w-100 border-border p-[5px] rounded-[7px] bg-card border flex gap-[12px] items-center justify-center '>
        <SearchIcon className='text-muted-foreground'/>
        <input type='text' className='w-full outline-none text-muted-foreground  placeholder:text-[#C1C9D3]' placeholder='Search transaction ID...'/>
    </div>
  )
}
