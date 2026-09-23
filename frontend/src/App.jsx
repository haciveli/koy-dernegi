import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AyarlarSaglayici } from "./AyarlarContext"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Banner from "./components/Banner"
import ReklamAlani from "./components/ReklamAlani"
import AnaSayfa from "./pages/AnaSayfa"
import Hakkimizda from "./pages/Hakkimizda"
import Etkinlikler from "./pages/Etkinlikler"
import Duyurular from "./pages/Duyurular"
import Rehber from "./pages/Rehber"
import IlanPanosu from "./pages/IlanPanosu"
import Toplantilar from "./pages/Toplantilar"
import Galeri from "./pages/Galeri"
import Videolar from "./pages/Videolar"
import Iletisim from "./pages/Iletisim"
import Uyelik from "./pages/Uyelik"
import Sohbet from "./pages/Sohbet"
import YonetimPaneli from "./pages/YonetimPaneli"

export default function App() {
  return (
    <AyarlarSaglayici>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Banner />
          <Navbar />
          <main className="flex-grow">
            <ReklamAlani konum="genel_ust" />
            <Routes>
              <Route path="/" element={<AnaSayfa />} />
              <Route path="/hakkimizda" element={<Hakkimizda />} />
              <Route path="/etkinlikler" element={<Etkinlikler />} />
              <Route path="/duyurular" element={<Duyurular />} />
              <Route path="/rehber" element={<Rehber />} />
              <Route path="/ilanlar" element={<IlanPanosu />} />
              <Route path="/toplantilar" element={<Toplantilar />} />
              <Route path="/galeri" element={<Galeri />} />
              <Route path="/videolar" element={<Videolar />} />
              <Route path="/iletisim" element={<Iletisim />} />
              <Route path="/uyelik" element={<Uyelik />} />
              <Route path="/sohbet" element={<Sohbet />} />
              <Route path="/yonetim" element={<YonetimPaneli />} />
            </Routes>
            <ReklamAlani konum="genel_alt" />
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AyarlarSaglayici>
  )
}