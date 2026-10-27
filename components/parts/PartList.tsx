/* eslint-disable @next/next/no-img-element -- statik boş vəziyyət şəkli */
import PartCard from './PartCard'
import { PartCard as CardType } from '@/types/part'

const PartList = ({ data, emptyText = 'Təəssüf ki, axtarışınız əsasında heç nə tapılmadı.' }: { data: CardType[], emptyText?: string }) => {
  if (!data.length) {
    return (
      <div className='flex flex-col w-full items-center justify-center'>
        <p className='w-full text-xl text-gray-500'>{emptyText}</p>
        <img src='/empty.png' alt='' className='size-50' />
      </div>
    )
  }

  return (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 items-center'>
      {data.map((part) => <PartCard key={part._id} part={part} />)}
    </div>
  )
}

export default PartList
