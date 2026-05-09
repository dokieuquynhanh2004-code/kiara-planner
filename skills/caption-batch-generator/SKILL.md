# Caption Batch Generator

## Mo ta
Skill doc file CSV chua thong tin san pham,
tao caption marketing bang AI (Groq API mien phi)
hoac Template Engine (offline, khong can key),
xuat ket qua ra file Excel voi 3 bien the caption
cho moi san pham.

## Ket noi nen tang ngoai
- API chinh: Groq API — MIEN PHI hoan toan
  Model: llama-3.3-70b-versatile
  Base URL: https://api.groq.com/openai/v1
  Dang ky key tai: https://console.groq.com
- Backup: Template Engine (khong can API, chay offline)
- Input: file CSV
- Output: file Excel (.xlsx)

## Cach dung

### Cach 1 — Groq API (khuyen dung, mien phi)
1. Dang ky tai groq.com, lay API key mien phi
2. Tao file .env tu .env.example
3. Dien GROQ_API_KEY=gsk_... vao file .env
4. Chay: py generate_captions.py
5. Lay ket qua trong output/captions_output.xlsx

### Cach 2 — Template Engine (offline, khong can key)
1. Chi can chay: py generate_captions.py
2. Script tu dong phat hien khong co API key
3. Dung template thong minh de tao caption
4. Lay ket qua trong output/captions_output.xlsx

## Cau truc CSV dau vao
Cac cot bat buoc:
- product_name: ten san pham
- category: danh muc (vi du: skincare, makeup)
- key_ingredients: thanh phan chinh (phan cach bang -)
- target_audience: doi tuong khach hang
- tone: giong van (luxury / friendly / energetic)
- platform: nen tang dang (instagram / facebook / tiktok)

## Cau truc Excel dau ra
- Sheet "Tong quan": bang tom tat tat ca san pham, nguon tao caption
- Moi san pham 1 sheet rieng, gom:
  - Thong tin san pham + phuong thuc tao
  - Caption bien the 1: ngan (duoi 50 tu)
  - Caption bien the 2: trung binh (50-100 tu)
  - Caption bien the 3: dai co hashtag (100+ tu)
  - Goi y emoji phu hop
  - Goi y thoi diem dang
- Dinh dang: header mau hong (#F472B6), font ro rang

## Yeu cau ky thuat
- Python 3.8+
- Thu vien: pandas, openpyxl, python-dotenv, httpx
- Cai dat: py -m pip install pandas openpyxl python-dotenv httpx
- Groq API fallback tu dong ve Template neu API loi
- Xu ly loi: neu 1 san pham loi thi bo qua, tiep tuc san pham tiep theo
