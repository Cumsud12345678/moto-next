'use client'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import ReportDialog from '@/components/ReportDialog'
import { ProductDescription } from '@/types/product'
import { ArrowUpRightFromSquare, Flag, Handset, Heart, HeartFill, TriangleExclamation } from '@gravity-ui/icons'
import { phoneLinks, useListingActions } from './useListingActions'
import OwnerActions, { useIsOwner } from './OwnerActions'

const DetailsRight = ({ data }: { data: ProductDescription }) => {

  const product = data
  const { liked, handleLike, handleShare, reportOpen, openReport, setReportOpen } = useListingActions(product)
  const isOwner = useIsOwner(product.seller?._id)

  const phone = phoneLinks(product.phone)
  const formattedTelPhone = phone.tel
  const formattedViewPhone = phone.view

  return (
    <div className="hidden lg:block lg:w-130 min-w-0">
      <div className="sticky top-27 z-10 mt-3 rounded-lg border bg-[#f5f5f5] shadow-sm w-full h-auto">

        <div className="flex items-center justify-between border-b px-4 py-3">
          <h5 className="text-2xl font-bold">Qiymət</h5>
          <h3 className="text-2xl font-semibold text-red-500">{product.price} ₼</h3>
        </div>

        <div className="p-4">
          <div className="flex">
            <Avatar size='lg'>
              <AvatarImage src="/profile.jpg" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            {/* <img
              src={profile ? `${BASE_URL}/uploads/${profile}` : '/profile.jpg'}
              alt="profile"
              className="h-[60px] w-[60px] rounded-full object-contain border-2"
            /> */}

            <div className="mx-2 flex flex-col">
              <span className="text-[18px] font-bold">{product.seller.name}</span>
              <span>{product.region.label}</span>
            </div>
          </div>

          <OwnerActions listingId={product._id} sellerId={product.seller?._id} viewCount={product.viewCount} className='mt-3' />

          <div
            onClick={handleLike}
            className={`my-3 flex flex-row items-center rounded-lg border p-2 cursor-pointer bg-white`}
          >
            {
            liked
            ? <HeartFill className='size-6 text-red-500' />
            : <Heart className='size-6' />
            }
            <span className="mx-2 text-xl font-medium">Bəyən</span>
          </div>

          <div onClick={handleShare} className="my-3 flex flex-row items-center rounded-lg border bg-white p-2 cursor-pointer">
            <ArrowUpRightFromSquare className='size-6' />
            <span className="mx-2 text-xl font-medium">Paylaş</span>
          </div>

          {!isOwner && (
            <div onClick={openReport} className="my-3 flex flex-row items-center rounded-lg border bg-white p-2 cursor-pointer">
              <Flag className='size-6' />
              <span className="mx-2 text-xl font-medium">Şikayət et</span>
            </div>
          )}

          <a
            href={`tel:${formattedTelPhone}`}
            target="_blank"
            className="my-3 flex items-center gap-2 rounded-lg bg-[#2da562] p-3 text-white cursor-pointer">
            <Handset />
            <h4 className="m-0 p-0 text-xl font-semibold">
              {formattedViewPhone}
            </h4>
          </a>

          <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
            <TriangleExclamation />
            <AlertTitle>Diqqət</AlertTitle>
            <AlertDescription className=''>
              Motosikletə baxış keçirmədən öncə beh göndərməyin.
            </AlertDescription>
          </Alert>
        </div>

      </div>

      <ReportDialog listingId={product._id} open={reportOpen} onOpenChange={setReportOpen} />
    </div>
  )
}

export default DetailsRight