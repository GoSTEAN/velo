"use client"

import React, { useEffect } from 'react'
import Purchase from '../service-flow'

export default function Electricity() {

  const fetchProvider = async () => {
    try{
      const res = await fetch("https://www.nellobytesystems.com/APIAirtimeDiscountV2.asp?UserID=CK101265322")
      const data = await res.json()
      console.log(data)
    }catch(err){
      console.log(err)
    }
  }

  useEffect(() => {
    fetchProvider()
  }, [])
  return (
    <Purchase type='electricity' />
  )
}
