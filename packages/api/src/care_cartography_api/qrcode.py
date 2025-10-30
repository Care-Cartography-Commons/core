import segno
from io import BytesIO

def generate_qr_code(url: str) -> str:
  qr = segno.make(url)
  buffer = BytesIO()
  qr.save(buffer, kind='svg')
  return buffer.getvalue().decode('utf-8')