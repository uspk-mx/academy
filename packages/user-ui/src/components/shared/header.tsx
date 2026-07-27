import { studentUrlFor } from "@academy/user-ui/lib/site-urls"
import { getInitials } from "@academy/user-ui/lib/string"
import { cn } from "@academy/user-ui/lib/utils"
import type { AuthState } from "@academy/user-ui/types/api"
import {
  IconFile,
  IconFolder,
  IconHomeBitcoin,
  IconInbox,
  IconMenu3,
  IconShoppingCart,
  IconX,
  IconZoom,
} from "@tabler/icons-react"
import { useState } from "react"
import { Link, useLocation, useParams, useSubmit } from "react-router"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "../ui/command"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from "../ui/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Separator } from "../ui/separator"
import { LanguageSwitcher } from "./language-switcher"

interface HeaderProps {
  navLinks: {
    id: string
    label: string
    href: string
    order: number
    external: boolean
  }[]
  promoBanner?: {
    backgroundColor: string
    textColor: string
    label: string
  }
  auth?: AuthState
  itemsInCart: number
}

export const Header = ({
  navLinks,
  promoBanner,
  auth,
  itemsInCart,
}: HeaderProps) => {
  const { pathname } = useLocation()
  const { lang } = useParams()
  const [openSearch, setOpenSearch] = useState(false)
  const submit = useSubmit()
  const [open, setOpen] = useState(false)

  const sortedNavLinks = navLinks?.sort(
    (linkA, linkB) => linkA.order - linkB.order
  )

  const setActiveLinkSate = (link: string) => {
    const base = `/${lang}${link}`
    return pathname === base || pathname.startsWith(base + "/")
  }

  return (
    <div className="sticky top-0 z-40 border-b-2 border-academy-ink bg-academy-yellow">
      <header className="relative bg-academy-yellow">
        {promoBanner && (
          <div
            className="flex h-10 items-center justify-center px-4 text-sm font-medium sm:px-6 lg:px-8"
            style={{
              backgroundColor: promoBanner.backgroundColor,
              color: promoBanner.textColor,
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: promoBanner.label }} />
          </div>
        )}

        <nav
          aria-label="Top"
          className="max-w-9xl mx-auto px-4 sm:px-6 lg:pr-8 lg:pl-6"
        >
          <div>
            <div className="flex h-16 items-center">
              <Drawer swipeDirection="left" open={open} onOpenChange={setOpen}>
                <DrawerTrigger
                  render={
                    <Button
                      variant="ghost"
                      className="flex lg:hidden"
                      size="icon"
                    >
                      <>
                        <span className="sr-only">Close menu</span>
                        <IconMenu3 aria-hidden="true" className="size-6" />
                      </>
                    </Button>
                  }
                />
                <DrawerContent>
                  <DrawerHeader>
                    <div className="absolute top-3.5 right-3.5">
                      <DrawerClose
                        render={
                          <Button
                            variant="ghost"
                            className="flex lg:hidden"
                            size="icon-sm"
                          >
                            <>
                              <span className="sr-only">Close menu</span>
                              <IconX aria-hidden="true" />
                            </>
                          </Button>
                        }
                      />
                    </div>
                  </DrawerHeader>
                  <div className="flex-1 overflow-y-auto p-4 pl-0">
                    <div className="space-y-6 px-4 pb-6">
                      {sortedNavLinks.map((page) => (
                        <div key={page.label} className="flow-root">
                          <Link
                            to={page.href}
                            className="-m-2 block p-2 text-base font-medium text-gray-900"
                            onClick={() => setOpen(false)}
                          >
                            {page.label}
                          </Link>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-6 border-t border-gray-200 px-4 py-6">
                      <div className="flow-root">
                        <Link
                          to={`/${lang}/login`}
                          className="-m-2 block p-2 text-base font-medium text-gray-900"
                        >
                          Sign in
                        </Link>
                      </div>
                      <div className="flow-root">
                        <Link
                          to={`/${lang}/signup`}
                          className="-m-2 block p-2 text-base font-medium text-gray-900"
                        >
                          Create account
                        </Link>
                      </div>
                    </div>
                  </div>
                  <DrawerFooter className="border-t border-gray-200 pt-4">
                    <LanguageSwitcher />
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>

              <div className="ml-3 flex lg:ml-0">
                <Link to={`/${lang}`}>
                  <span className="sr-only">Uspk Academy</span>
                  <img
                    alt=""
                    src="https://pub-b7daf0a886e34f2b8c2ab3497bc521f7.r2.dev/logos/uspk-a-logo-black.png"
                    className="hidden w-40 lg:block"
                  />
                  <img
                    alt=""
                    src="https://pub-b7daf0a886e34f2b8c2ab3497bc521f7.r2.dev/logos/uspk-academy-icon-black.png"
                    className="block h-8 w-auto lg:hidden"
                  />
                </Link>
              </div>

              <div className="hidden lg:ml-8 lg:block lg:self-stretch">
                <div className="flex h-full items-center space-x-8">
                  {sortedNavLinks.map((navLink) => (
                    <Link
                      key={navLink.label}
                      to={`/${lang}/${navLink.href}`}
                      className={cn(
                        "text-base font-medium text-gray-700 hover:text-academy-ink hover:no-underline",
                        {
                          "font-semibold text-academy-ink": setActiveLinkSate(
                            navLink.href
                          ),
                        }
                      )}
                    >
                      {navLink.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="mr-3 ml-auto flex items-center lg:mr-0">
                <div className="flex lg:ml-6">
                  <Button
                    onClick={() => setOpenSearch(true)}
                    variant="ghost"
                    size="icon"
                  >
                    <>
                      <span className="sr-only">Search</span>
                      <IconZoom aria-hidden="true" className="size-6" />
                    </>
                  </Button>
                  <CommandDialog open={openSearch} onOpenChange={setOpenSearch}>
                    <Command>
                      <CommandInput placeholder="Type a command or search..." />
                      <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup heading="Navigation">
                          <CommandItem>
                            <IconHomeBitcoin />
                            <span>Home</span>
                            <CommandShortcut>⌘H</CommandShortcut>
                          </CommandItem>
                          <CommandItem>
                            <IconInbox />
                            <span>Inbox</span>
                            <CommandShortcut>⌘I</CommandShortcut>
                          </CommandItem>
                          <CommandItem>
                            <IconFile />
                            <span>Documents</span>
                            <CommandShortcut>⌘D</CommandShortcut>
                          </CommandItem>
                          <CommandItem>
                            <IconFolder />
                            <span>Folders</span>
                            <CommandShortcut>⌘F</CommandShortcut>
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </CommandDialog>
                </div>

                <div className="relative ml-6 flow-root lg:ml-6">
                  <Button
                    variant="secondary"
                    className={cn(
                      "group -m-2 flex items-center border-2 border-academy-ink p-2",
                      {
                        "bg-academy-blue hover:bg-academy-blue/90 [&_svg]:text-accent hover:[&_svg]:text-accent":
                          pathname === `/${lang}/cart`,
                      }
                    )}
                    render={<Link to={`/${lang}/cart`} />}
                  >
                    <IconShoppingCart
                      aria-hidden="true"
                      className="size-6 shrink-0 text-academy-ink group-hover:text-academy-ink/50"
                    />
                  </Button>
                  <span className="sr-only">items in cart, view bag</span>
                  {itemsInCart > 0 && (
                    <Badge className="absolute -top-4 -right-3 size-4.5 rounded-full bg-academy-coral text-[10px]">
                      {itemsInCart}
                    </Badge>
                  )}
                </div>

                {auth?.status === "authenticated" ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full"
                        >
                          <Avatar>
                            <AvatarImage
                              src={auth?.user.avatarUrl ?? ""}
                              alt={auth?.user?.name}
                            />
                            <AvatarFallback>
                              {getInitials(auth?.user?.name || "US")}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      }
                      className="ml-6"
                    />
                    <DropdownMenuContent className="w-32">
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          render={
                            <a
                              href={studentUrlFor(
                                lang ?? "es",
                                "/dashboard/courses"
                              )}
                            />
                          }
                        >
                          Mi Aprendizaje
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          render={<Link to={`/${lang}/cart`} />}
                        >
                          Mi Carrito
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          render={
                            <a
                              href={studentUrlFor(
                                lang ?? "es",
                                "/dashboard/profile"
                              )}
                            />
                          }
                        >
                          Mi Perfil
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() =>
                            submit(null, {
                              method: "post",
                              action: `/${lang}/logout`,
                            })
                          }
                        >
                          Log out
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="hidden lg:ml-6 lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-4">
                    <Link
                      className="text-base font-medium text-gray-700 hover:text-academy-ink hover:no-underline"
                      to={`/${lang}/login`}
                    >
                      Sign in
                    </Link>
                    <Separator
                      orientation="vertical"
                      className="bg-academy-ink data-vertical:w-0.5"
                    />
                    <Link
                      className="text-base font-medium text-gray-700 hover:text-academy-ink hover:no-underline"
                      to={`/${lang}/signup`}
                    >
                      Create account
                    </Link>
                  </div>
                )}

                <div className="hidden lg:ml-6 lg:flex">
                  <LanguageSwitcher />
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </div>
  )
}
