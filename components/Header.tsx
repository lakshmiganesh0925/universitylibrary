"use client";

import { Avatar,AvatarFallback} from './ui/avatar';
import React from 'react'
import Link from 'next/link'
import { cn, getInitails } from '@/lib/utils';
import { usePathname } from 'next/navigation'
import Image from 'next/image';
import { Session } from 'next-auth';

const Header = ({session}:{session:Session}) => {
  const pathname=usePathname();
  return (
    <header className='my-10 flex justify-between gap-5'>
        <Link href="/">
         <Image src="/icons/logo.svg" alt="logo" width={40} height={40}/>
        </Link>
          
           <ul className='flex flex-row items-center gap-8'>
            <li>
                <Link 
                href="/library" 
                className={cn(
                  'text-base cursor-pointer capitalize',
                  pathname==='/library'? 'text-light-200':'text-light-100',
                  )}>
                Library
                </Link>
            </li>

            <li>
              <Link href="/my-profile">
                <Avatar>
                  <AvatarFallback className='bg-amber-50'>
                    {getInitails(session?.user?.name || "")}</AvatarFallback>
                </Avatar>
              </Link>
            </li>
           </ul>
    </header>
  )
}

export default Header