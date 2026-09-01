# Lab C2 — RAG 基礎

> 目標：自建一條 RAG 鏈（切塊→embedding→向量庫→檢索→組 prompt→answer），對 ≥10 段資料量召回。
> 前置：C1 已會結構化輸出；已裝 `chromadb`＋至少 1 段可切塊的私域文件。
> 交付（C2 證據）：檢索 top-3 截圖＋answer 截圖＋資料集片段清單。

## 1. 準備資料集
```bash
# corpus/ 放 ≥10 段私域文件（markdown 皆可）
# 本例：一篇『A4 紙訂購政策』拆成若干段
cat > corpus/policy.md <<'EOF'
# A4 紙訂購政策
## 下單
客戶可下單 1–10 箱，超過 10 箱需客服核准。
## 送貨
標準 3 日送達；改期請在送達前 5 日申請。
## 價格
每箱 NT$280，月結滿 NT$10,000 九折。
## 退貨
未拆封可 7 日內全額退。
EOF
```

## 2. 切塊＋embedding＋存 Chroma
```python
# build_index.py
import chromadb
from openai import OpenAI
import os, dotenv
dotenv.load_dotenv()
client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

def chunk(text, size=400, overlap=50):
    i, out = 0, []
    while i < len(text):
        out.append(text[i:i+size])
        i += size - overlap
    return out

text = open("corpus/policy.md", encoding="utf-8").read()
chunks = chunk(text)
# 一次把整批 chunk 送進 embedding（省 API call）
emb = client.embeddings.create(model="text-embedding-3-small", input=chunks)
vectors = [d["embedding"] for d in emb.data]

chroma = chromadb.Client()
col = chroma.get_or_create_collection("policy")
col.add(ids=[str(i) for i in range(len(chunks))], embeddings=vectors, documents=chunks)
print("索引完成，共", col.count(), "塊")
```

## 3. 檢索 top-3
```python
# search.py
q = "改送日期要提前多久申請？"
qvec = client.embeddings.create(model="text-embedding-3-small", input=q)["data"][0]["embedding"]
res = col.query(query_embeddings=[qvec], n_results=3)
for doc, dist in zip(res["documents"][0], res["distances"][0]):
    print(f"dist={dist:.3f}\n{doc}\n---")
```

## 4. 組 prompt 出 answer（限制「只依據資料」）
```python
# answer.py
SYSTEM = "你是知識庫問答器。只能依據【資料】回答；資料沒有就說『我不確定』，不要自創。"
def ask(chunks, q):
    ctx = "\n".join(f"<片段>{c}</片段>" for c in chunks)
    return client.chat.completions.create(
        model="gpt-4.1-mini", temperature=0,
        messages=[
          {"role":"system","content":SYSTEM},
          {"role":"user","content":f"【資料】\n{ctx}\n【問題】\n{q}"},
        ],
    ).choices[0].message.content
```
```bash
# 跑 3–5 個測試問題，人工核『只依據資料、沒有就說不確定』
```

## 5. 提交
```bash
git add build_index.py search.py answer.py corpus/ notes/c2.md
git commit -m "C2 檢索增強：切塊+Chroma 索引+檢索+限制 prompt"
```

## 驗證
- [ ] 索引塊數 >0；3–5 測試問題 top-3 至少 1 段命中文檔。
- [ ] 問「資料沒有」的問題時，answer 回「不確定」而非自創（faithfulness）。
- [ ] 存檢用同一套 embedding（都是 `text-embedding-3-small`）。
- [ ] 已 `git commit`。

## 證據提交
> C2 完成，2026-10-15。證據：檢索 top-3 截圖見 notes/c2.md；answer（含『不確定』一例）截圖附件 c2_answer.png；資料集 ≥10 段清單見 corpus/。
