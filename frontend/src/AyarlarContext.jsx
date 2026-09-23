import { createContext, useContext, useEffect, useState } from "react"
import { temaUygula } from "./tema"

const AyarlarContext = createContext({ ayarlar: {}, yenile: () => {}, yukleniyor: true })

export function AyarlarSaglayici({ children }) {
  const [ayarlar, setAyarlar] = useState({})
  const [yukleniyor, setYukleniyor] = useState(true)

  const yenile = async () => {
    try {
      const r = await fetch("/api/ayarlar")
      if (r.ok) {
        const veri = await r.json()
        setAyarlar(veri)
        temaUygula(veri)
      }
    } catch {
      // sunucu erisilemezse varsayilanlar kullanilir
    } finally {
      setYukleniyor(false)
    }
  }

  useEffect(() => {
    yenile()
  }, [])

  return (
    <AyarlarContext.Provider value={{ ayarlar, yenile, yukleniyor }}>
      {children}
    </AyarlarContext.Provider>
  )
}

export function useAyarlar() {
  return useContext(AyarlarContext)
}
