import React, {useState}from 'react';
import {Link, Outlet} from 'react-router-dom';

import { Dialog, DialogBackdrop, DialogPanel, TransitionChild } from '@headlessui/react'
import {
    BookmarkSquareIcon,
    XMarkIcon,
    UserIcon,
    Cog8ToothIcon
} from '@heroicons/react/24/outline'

const navigation = [
    { name: 'AiAssistant', to: '/', icon: UserIcon, current: true },
    { name: 'Documentation', to: '/documentation', icon: BookmarkSquareIcon, current: false },
    { name: 'Settings', to: '/settings', icon: Cog8ToothIcon, current: false },
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const Home: React.FC = () => {
    return (
        <>
            <div className="h-full w-full bg-gray-800">
                {/* Static sidebar for desktop */}
                <div className="fixed inset-y-0 left-0 z-50 block w-20 overflow-y-auto bg-gray-900 pb-4">
                    <div className="flex h-16 shrink-0 items-center justify-center">
                        <img
                            alt="Your Company"
                            src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=500"
                            className="h-8 w-auto"
                        />
                    </div>
                    <nav className="mt-8">
                        <ul role="list" className="flex flex-col items-center space-y-1">
                            {navigation.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        to={item.to}
                                        className={classNames(
                                            item.current ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                                            'group flex gap-x-3 rounded-md p-3 text-sm/6 font-semibold',
                                        )}
                                    >
                                        <item.icon aria-hidden="true" className="h-6 w-6 shrink-0" />
                                        <span className="sr-only">{item.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>



                <main className="pl-20">
                    <div className="bg-gray-800 text-gray-400 h-full w-full">
                        <Outlet />
                    </div>
                </main>

                {/*<aside className="fixed inset-y-0 left-20 hidden w-96 overflow-y-auto border-r border-gray-200 px-4 py-6 sm:px-6 lg:px-8 xl:block">*/}
                {/*    /!* Secondary column (hidden on smaller screens) *!/*/}
                {/*    sdasd*/}
                {/*</aside>*/}
            </div>
        </>
    )
};

export default Home;
