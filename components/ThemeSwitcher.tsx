'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const ThemeSwitcher = React.memo(function ThemeSwitcher() {
  const { setTheme } = useTheme()

  const dropdownMenu = React.useMemo(
    () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 text-stone-800 hover:text-stone-800 rounder-md border-stone-800 dark:text-stone-200 dark:hover:text-stone-100 rounder-md border-stone-200'>
            <Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
            <Moon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
            <span className='sr-only'>Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='bg-popover border-border'>
          <DropdownMenuItem
            onClick={() => setTheme('light')}
            className='cursor-pointer'>
            Light
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme('dark')}
            className='cursor-pointer'>
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme('system')}
            className='cursor-pointer'>
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    [setTheme]
  )

  return dropdownMenu
})
