import { Link, useParams } from "react-router"
import { Button } from "../ui/button"
import { LanguageSwitcher } from "./language-switcher"

export const CheckoutHeader = () => {
  const { lang } = useParams()

  return (
    <div className="sticky top-0 z-40 border-b-2 border-academy-ink bg-academy-yellow">
      <header className="relative bg-academy-yellow">
        <nav
          aria-label="Top"
          className="max-w-9xl mx-auto px-4 sm:px-6 lg:pr-8 lg:pl-6"
        >
          <div>
            <div className="flex h-16 items-center justify-between">
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

              <div className="mr-3 ml-auto flex items-center lg:mr-0">
                <div className="flex lg:ml-6">
                  <Button
                    variant="link"
                    render={<Link to={`/${lang}/cart`}>Cancelar</Link>}
                  />
                </div>

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
