export function kisaAd(ad, soyad) {
  const a = (ad || "").trim().charAt(0);
  const s = (soyad || "").trim().charAt(0);
  return `${a}${s}`.toUpperCase() || "?";
}

export function mesajSaati(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}