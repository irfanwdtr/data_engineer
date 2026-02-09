# LOGIKA HDFS, HADOOP, DAN HIVE

---

## 1. LOGIKA HDFS (penyimpanan)

### Masalah klasik
- File 500 GB  
- 1 server:
  - Disk penuh
  - Kalau rusak → data hilang  

### Solusi HDFS
- File dipecah jadi blok (default ±128 MB)
- Setiap blok (potongan file):
  - Disimpan di node berbeda
  - Direplikasi (biasanya 3 kopi)

### Contoh file besar
File besar
├── Block 1 → Node A, B, C
├── Block 2 → Node B, C, D
└── Block 3 → Node A, C, D


### Istilah HDFS
1. **Block**  
   Block itu potongan file  

2. **NameNode**  
   Data Dictionary / System Catalog  
   Tau file A terdiri dari block apa,  
   Tau block itu ada di node mana  

   Contoh:
transaksi.csv
→ block 1 di A,B,C
→ block 2 di B,C,D


3. **DataNode**  
Simpan block data  
Layani baca/tulis data  

Block 1 → Node A
Block 2 → Node B
Block 3 → Node C


4. **Replication**  
Kalau 1 node mati → data tetap ada (replikasi data)

Block 1 → Node A, B, C
Block 2 → Node B, C, D


5. **Heartbeat**  
Cek node masih hidup atau mati  

---

## 2. LOGIKA HADOOP (pemrosesan)

### Masalah berikutnya
Data sudah tersebar, tapi:  
Gimana cara ngolahnya tanpa mindahin ke 1 mesin?

### Prinsip emas Hadoop
🔥 **Move computation to data, bukan data ke computation**

Artinya:
- Programnya yang dikirim ke node
- Data tetap di tempatnya  

---

## 2.1 MAPREDUCE (KONSEP INTI)

### MAP
- Ambil potongan data
- Proses sendiri-sendiri  

### REDUCE
- Gabung hasil MAP
- Hitung final result  

📌 Contoh WordCount  

File:
"big data is big"
MAP:
(big,1)
(data,1)
(is,1)
(big,1)


REDUCE:
(big,2)
(data,1)
(is,1)


---

## 2.2 YARN (manajer)

- Bagi CPU & RAM
- Atur siapa kerja apa
- Pastikan node nggak rebutan  

Analogi:  
**YARN = mandor proyek**

### Istilah Hadoop
1. **YARN**  
   Atur CPU & RAM  

2. **ResourceManager**  
   Otak YARN  
   Bagi CPU  

Node A → 2 core
Node B → 2 core
Node C → 2 core


3. **NodeManager**  
Jalankan task  
Laporkan resource  

4. **Container**  
Kotak resource  
Tempat task jalan  

5. **ApplicationMaster**  
Ngatur 1 job  
Monitor task  

---

## 3. LOGIKA HIVE (SQL di atas Hadoop)

### Masalah Hadoop
- MapReduce ribet
- Programmer doang yang kuat  

### Solusi Hive
- Pakai SQL-like language
- User fokus apa yang mau diambil, bukan caranya  

Contoh query:
```sql
SELECT product, SUM(price)
FROM sales
GROUP BY product; 

Di belakang layar
SQL Hive
 → Execution plan
 → MapReduce / Tez / Spark
 → Ambil data di HDFS
 ```
