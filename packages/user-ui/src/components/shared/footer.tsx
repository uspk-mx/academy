import { Link } from "react-router"
import { Separator } from "../ui/separator"

export interface FooterProps {
  footerTagline: string
  footerCopyright: string
  footerColumns: {
    id: string
    title: string
    linkLabels: string[]
    linkHrefs: string[]
    order: number
  }[]
}

export const Footer = ({ data }: { data: FooterProps }) => {
  const sortedColumns = [...(data.footerColumns ?? [])].sort(
    (a, b) => a.order - b.order
  )
  const columnGroups = [sortedColumns.slice(0, 2), sortedColumns.slice(2, 4)]

  return (
    <footer className="border-t-2 border-academy-ink bg-academy-cream">
      <div className="px-6 py-8 lg:px-8">
        <div className="grid items-center lg:grid-cols-3 lg:gap-8">
          <div className="flex flex-col items-start gap-6">
            <img
              alt=""
              src="https://pub-b7daf0a886e34f2b8c2ab3497bc521f7.r2.dev/logos/uspk-a-logo-black.png"
              className="w-40"
            />
            <p className="text-academy-ink">{data.footerTagline}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 lg:col-span-2 xl:mt-0">
            {columnGroups.map((group, groupIndex) => (
              <div className="md:grid md:grid-cols-2 md:gap-8" key={groupIndex}>
                {group.map((item) => (
                  <div key={item.id} className="mt-8 xl:mt-0">
                    <h3 className="text-sm font-semibold text-academy-ink uppercase">
                      {item.title}
                    </h3>
                    <ul className="mt-4 list-none">
                      {item.linkLabels.map((label, i) => (
                        <li className="my-1 last:my-0" key={`${label}-${i}`}>
                          <Link to={item.linkHrefs[i]}>{label}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 flex w-fit flex-col gap-2">
          <Separator className="data-horizontal:bg-academy-ink" />
          <span className="text-academy-ink">{data.footerCopyright}</span>
        </div>
      </div>
    </footer>
  )
}
