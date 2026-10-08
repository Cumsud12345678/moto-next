import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import {House} from '@gravity-ui/icons';
import {Persons} from '@gravity-ui/icons';
import {HardDrive} from '@gravity-ui/icons';
import {Box} from '@gravity-ui/icons';
import Link from "next/link";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <div className="">
          <div>
            <h3 className="text-2xl font-bold pl-3">Admin panel</h3>
          </div>

          <div className="mt-5 p-2 text-[16px]">
            <span className="pl-2">Platform</span>

            <div>

              <Accordion defaultValue={["item-1"]}>
                <AccordionItem value="item-1" className={''}>
                  <AccordionTrigger className={'hover:bg-gray-200 px-2 flex items-center gap-2'}>
                    <House className='size-5' />
                    Home
                  </AccordionTrigger>
                  <AccordionContent className={'ml-5 border-l flex flex-col gap-2 p-0 pl-3'}>
                    <Link href={'/admin/charts'} className="button">
                      Charts
                    </Link>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion defaultValue={["item-1"]}>
                <AccordionItem value="item-1" className={''}>
                  <AccordionTrigger className={'hover:bg-gray-200 px-2 flex items-center gap-2'}>
                    <Persons className='size-5' />
                    Users
                  </AccordionTrigger>
                  <AccordionContent className={'ml-5 border-l flex flex-col p-0 pl-3'}>
                    <Link href={'/admin/users'} className="button">
                      All Users
                    </Link>
                    <Link href={'/admin/deleted/users'} className="button">
                      Deleted Users
                    </Link>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion defaultValue={["item-1"]}>
                <AccordionItem value="item-1" className={''}>
                  <AccordionTrigger className={'hover:bg-gray-200 px-2 flex items-center gap-2'}>
                    <HardDrive className='size-5' />
                    Listings
                  </AccordionTrigger>
                  <AccordionContent className={'ml-5 border-l flex flex-col p-0 pl-3'}>
                    <Link href={'/admin/listings'} className="button">
                      All Listings
                    </Link>
                    <Link href={'/admin/deleted/listings'} className="button">
                      Deleted Listings
                    </Link>
                    <Link href={'/admin/premium/listings'} className="button">
                      Premium Listings
                    </Link>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion defaultValue={["item-1"]}>
                <AccordionItem value="item-1" className={''}>
                  <AccordionTrigger className={'hover:bg-gray-200 px-2 flex items-center gap-2'}>
                    <Box className='size-5' />
                    Metadata
                  </AccordionTrigger>
                  <AccordionContent className={'ml-5 border-l flex flex-col p-0 pl-3'}>
                    <Link href={'/admin/groups'} className="button">
                      Groups
                    </Link>
                    <Link href={'/admin/adsense'} className="button">
                      Adsense
                    </Link>
                    <Link href={'/admin/metadata'} className="button">
                      Make, Model
                    </Link>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>


            </div>
          </div>
        </div>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}