import React from 'react'

const AboutPage = () => {
  return (
    <div className="flex flex-col">
      <div className="bg-[#f5f5f5]">

        <div className="mt-20 lg:mt-25 px-4 flex flex-col mb-25 max-w-250 mx-auto">
          <h3 className='text-xl font-bold'>Haqqımızda</h3>
          <div className='mt-3 text-[15px] text-gray-600'>
            <p>
              Motosiklet alqı-satqısını daha rahat, sürətli və əlçatan etmək üçün yaradılmış platformaya xoş gəlmisiniz.
              Platformamız motosiklet, moped, trisikl kimi nəqliyyat vasitələrinin elanlarını bir araya gətirərək alıcılarla satıcıları daha asan şəkildə əlaqələndirməyi hədəfləyir.
              Burada istifadəçilər öz nəqliyyat vasitələrini ətraflı məlumat və şəkillərlə elan yerləşdirə, müxtəlif elanlar arasında axtarış və filtr imkanlarından istifadə edərək ehtiyaclarına uyğun motosikleti daha asan tapa bilərlər.
              Məqsədimiz Azərbaycanda motosiklet alqı-satqısı üçün <span className='font-semibold'>sadə, rahat və etibarlı</span> elan platforması yaratmaqdır. Platformanı daim inkişaf etdirərək istifadəçilər üçün daha yaxşı axtarış, elan yerləşdirmə və ünsiyyət imkanları təqdim etməyə çalışırıq.
              İstər motosikletinizi satmaq, istər yeni motosiklet axtarmaq, istərsə də bazardakı elanlarla tanış olmaq istəyirsinizsə, doğru ünvandasınız.
              <br /> <br /> <span className="font-bold">Motosikletinizi tapın. Elanınızı yerləşdirin. Yola davam edin.</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default AboutPage