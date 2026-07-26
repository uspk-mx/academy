import { IconLanguageKatakana } from "@tabler/icons-react"
import { Button } from "../ui/button"
import { replaceLocaleInPath } from "../../lib/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { useLocation, useNavigate, useParams } from "react-router"

export const LanguageSwitcher = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { lang } = useParams()

  function changeLanguage(nextLang: string) {
    const newPath = replaceLocaleInPath(pathname, nextLang)
    document.cookie = `lang=${nextLang}; path=/; max-age=31536000`
    navigate(newPath)
  }

  const menuGroupLabel = {
    en: "Languages",
    es: "Idiomas",
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className="border-2 border-academy-ink lg:size-8"
          >
            <>
              <IconLanguageKatakana
                aria-hidden="true"
                className="block h-auto w-5 shrink-0"
              />
              <span className="lg:sr-only">Switch language</span>
            </>
          </Button>
        }
      />
      <DropdownMenuContent className="w-32">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            {menuGroupLabel[lang as "en" | "es"]}
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup value={lang} onValueChange={changeLanguage}>
            <DropdownMenuRadioItem value="en" closeOnClick>
              English
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="es" closeOnClick>
              Español
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
