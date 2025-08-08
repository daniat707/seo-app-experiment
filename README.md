S# SEO Keyword Generator & Copy Composer (FastAPI + React)

Generate **English SEO keywords** and a **template-driven SEO draft** from uploaded **PDF/DOCX** files.  
Designed for an inbound tourism site (Ecuador, Peru, Galápagos) targeting **Europe, US/Canada, and Asia** travelers.

- Extracts text from your document
- Produces **English seed & long-tail keywords** using OpenAI Responses API (`model="gpt-5"`)
- Ranks terms with **Google Trends** (last 3 months)
- Writes **original English copy** that follows your **Spanish template** (sections, bullets)
- Download the draft as **Markdown** or **.DOCX**

---

## Stack

- **Backend:** FastAPI, Uvicorn, OpenAI Python SDK (Responses API), `pdfplumber`, `python-docx`, `pytrends`
- **Frontend:** React (Vite)
- **Runtime:** Python 3.10+, Node 18 and up
