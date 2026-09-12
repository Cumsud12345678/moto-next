'use client'
import { useFilter } from '@/hooks/useFilter'
import React, { Fragment, useEffect } from 'react'
import InputAndListString from '../_components/InputAndListString'
import InputAndListNumber from '../_components/InputAndListNumber'
import ButtonGroup from '@/components/buttons/ButtonGroup'
import { Default, Metadata } from '@/types/metadata'

const Step1 = ({filterState, metadata, models}: {filterState: ReturnType<typeof useFilter>, metadata: Metadata, models: Array<Default>}) => {

  const {
    make,
    setMake,

    model,
    setModel,

    years,
    minYear,
    setMinYear,

    volumes,
    minVolume,
    setMinVolume,

    category,
    setCategory,

    color,
    setColor,

    transmission,
    setTransmission,

    fuelType,
    setFuelType,

  } = filterState


  useEffect(() => {
    if (!make) {
      setMinYear(0)
      setMinVolume(0)
      setCategory('')
      setColor('')
      setTransmission('')
      setFuelType('')
    }
    if (!model) {
      setMinYear(0)
      setMinVolume(0)
      setCategory('')
      setColor('')
      setTransmission('')
      setFuelType('')
    }
    if(!minYear) {
      setMinVolume(0)
      setCategory('')
      setColor('')
      setTransmission('')
      setFuelType('')
    }
    if(!minVolume) {
      setCategory('')
      setColor('')
      setTransmission('')
      setFuelType('')
    }
  }, [make, model, minYear, minVolume])

  return (
    <Fragment>
      <div className="lg:p-10 border rounded-3xl bg-white p-5 flex flex-col gap-2 lg:gap-0">
        <InputAndListString state={make} setState={setMake} label='Marka' length={20} data={metadata.makes} />

        {
          make
          && <InputAndListString state={model} setState={setModel} label='Model' length={20} data={models} />
        }

        {
          model &&
          <InputAndListNumber state={minYear} setState={setMinYear} label='il' length={20} data={years} />
        }

        {
          minYear !== 0 &&
          <InputAndListNumber state={minVolume} setState={setMinVolume} label='hecm' length={20} data={volumes} />
        }

        {
          minYear !== 0 &&
          <div>
            <h3>Ban novu</h3>
            <ButtonGroup data={metadata.categories} state={category} setState={setCategory} wrap={false} isNew />
          </div>
        }

        {
          category &&
          <div className='pt-2'>
            <h3 className='mb-2'>Reng</h3>
            <ButtonGroup data={metadata.colors} state={color} setState={setColor} wrap={false} isNew />
          </div>
        }

        {
          color &&
          <div className='pt-4'>
            <h3 className='mb-2'>Muherrik</h3>
            <ButtonGroup data={metadata.transmissions} state={transmission} setState={setTransmission} wrap={false} isNew />
          </div>
        }

        {
          transmission &&
          <div className='pt-4'>
            <h3 className='mb-2'>Suretler qutusu</h3>
            <ButtonGroup data={metadata.fuelTypes} state={fuelType} setState={setFuelType} wrap={false} isNew />
          </div>
        }

      </div>

    </Fragment>
  )
}

export default Step1