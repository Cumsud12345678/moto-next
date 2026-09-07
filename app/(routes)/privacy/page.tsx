import React from 'react'

const PrivacyPage = () => {
  return (
    <div className="flex flex-col py-4">
      <div className="bg-[#f5f5f5]">

        <div className="mt-20 lg:mt-25 px-4 flex flex-col mb-25 max-w-250 mx-auto">
          <h3 className='text-xl font-bold'>Məxfilik siyasəti</h3>
          <div className='mt-3 text-[15px] text-gray-600'>
            <p>
              <span className='font-semibold'>Motosat.az — Elan Platforması</span>
              <br /> <span className='font-semibold'>Məxfilik Siyasəti</span>
              <br /> Bu Məxfilik Siyasəti Motosat.az” elan platformasından istifadə zamanı toplanan məlumatların növlərini, istifadə məqsədlərini, saxlanma prinsiplərini və üçüncü tərəflərlə paylaşım şərtlərini tənzimləyir. Motosat.az xidmətlərindən istifadə etməklə Siz bu siyasətin şərtləri ilə razılaşırsınız.

              <br /><br /> <span className='font-semibold'>1. Toplanan məlumatların növləri</span>
              <br />1.1. Şəxsi məlumatlar
              <br />Open.az aşağıdakı şəxsi məlumatları toplaya bilər:
              <ul className='list-inside list-disc'>
                <li>Ad, soyad</li>
                <li>Mobil nömrə</li>
                <li>E-poçt ünvanı</li>
                <li>Platformada yerləşdirilən elan məlumatları</li>
              </ul>

              1.2. Texniki və analitik məlumatlar
              <ul className='list-inside list-disc'>
                <li>IP ünvanı</li>
                <li>Cihaz məlumatları</li>
                <li>Sayt daxili fəaliyyət analitikası</li>
              </ul>

              <br /> <span className='font-semibold'>2. Məlumatların istifadə məqsədi</span>
              <br />Məlumatlar aşağıdakı məqsədlərlə istifadə olunur:
              <ul className='list-inside list-disc'>
                <li>Hesabın yaradılması və idarə edilməsi</li>
                <li>Elan yerləşdirilməsi və xidmətlərin göstərilməsi</li>
                <li>Dələduzluğun qarşısının alınması</li>
                <li>Müştəri dəstəyi</li>
                <li>Analitik və statistik təhlillər</li>
                <li>Hüquqi öhdəliklərin yerinə yetirilməsi</li>
              </ul>

              <br /> <span className='font-semibold'>3. Məlumatların saxlanması və təhlükəsizliyi</span>
              <br />Motosat.az aşağıdakı təhlükəsizlik tədbirlərini tətbiq edir:
              <ul className='list-inside list-disc'>
                <li>SSL/HTTPS şifrələmə</li>
                <li>Giriş nəzarəti və iki mərhələli doğrulama</li>
                <li>Təhlükəsizlik divarları və DDoS qoruması</li>
              </ul>

              <br /> <span className='font-semibold'>4. Üçüncü tərəflərlə paylaşım</span>
              <br />Məlumatlar yalnız aşağıdakı hallarda paylaşılır:
              <ul className='list-inside list-disc'>
                <li>Hüquq-mühafizə orqanlarının tələbi</li>
                <li>Texniki xidmət tərəfdaşları</li>
                <li>Analitik alətlər (Google Analytics və s.)</li>
              </ul>
              <span className='text-red-500 font-semibold'>Şəxsi məlumatlar satılmır və kommersiya məqsədilə paylaşılmır.</span>

              <br /><br /> <span className='font-semibold'>5. İstifadəçi hüquqları</span>
              <br />İstifadəçi aşağıdakı hüquqlara malikdir:
              <ul className='list-inside list-disc'>
                <li>Məlumatların silinməsini tələb etmək</li>
                <li>Hesab məlumatlarını yeniləmək</li>
                <li>Şikayət və müraciət etmək</li>
              </ul>

            </p>
          </div>
        </div>

      </div>
    </div>

  )
}

export default PrivacyPage