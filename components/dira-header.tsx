'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { ThemeSwitcher } from './ThemeSwitcher'

export default function DiraHeader() {
  const pathname = usePathname()

  return (
    <header className='fixed top-0 left-0 right-0 z-50 mb-20 bg-background'>
      <nav className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='relative flex h-16 items-center justify-between'>
          {/* Logo */}
          <div className='flex items-center'>
            <Link href='/' className='flex items-center space-x-2'>
              <Image
                src='/diravinelogo.png'
                alt='Dira logo'
                width={32}
                height={32}
                className='h-8 w-auto'
              />
              <div className='flex items-center'>
                <span className='font-display text-lg font-medium text-stone-50'>
                  Dira
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className='hidden md:flex md:space-x-8'>
            <Link
              href='/'
              className={cn(
                'text-sm font-medium text-stone-500 dark:text-stone-300 hover:text-primary transition-colors',
                (pathname === '/' ||
                  pathname.includes('/products') ||
                  pathname.includes('/product')) &&
                  'text-primary border-b-2 border-primary'
              )}>
              Products
            </Link>
            <Link
              href='/opportunities'
              className={cn(
                'text-sm font-medium text-stone-500 dark:text-stone-300 hover:text-primary transition-colors',
                (pathname === '/opportunities' ||
                  pathname.includes('/opportunities') ||
                  pathname.includes('/opportunity')) &&
                  'text-primary border-b-2 border-primary'
              )}>
              Opportunities
            </Link>
            <button
              disabled
              className='text-sm font-medium text-stone-500 cursor-not-allowed'>
              Communities (Coming Soon)
            </button>
          </div>

          {/* Auth Section - Right aligned */}
          <div className='flex items-center gap-4'>
            <ThemeSwitcher />
            <SignedOut>
              <SignInButton mode='modal'>
                <button className='text-sm font-medium text-primary hover:text-stone-50 transition-colors px-3 py-1.5 rounded-md border border-primary hover:border-stone-400'>
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode='modal'>
                <button className='text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-3 py-1.5 rounded-md'>
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8',
                    userButtonPopoverCard:
                      'bg-background border border-stone-600',
                    userButtonPopoverActionButton:
                      'text-stone-300 hover:text-stone-50 hover:bg-stone-800',
                  },
                }}
              />
            </SignedIn>
          </div>
        </div>
      </nav>
    </header>
  )
}
